#!/usr/bin/env node
/**
 * Génère une page-passerelle HTML par article du blog.
 *
 * À quoi ça sert :
 *   Quand on colle l'URL d'un article sur Facebook, Facebook lit le HTML brut
 *   mais ne fait pas tourner le JavaScript. Notre site est une SPA — donc le
 *   contenu d'article est chargé en JS depuis articles.json. Résultat : Facebook
 *   voit toujours les balises og: génériques de blog.html.
 *
 *   Solution : pour chaque article, on génère un fichier HTML statique
 *   articles/<slug>.html qui contient :
 *     - les BONNES balises Open Graph (titre, image, description de l'article)
 *     - une redirection JS vers /blog.html?article=ID pour les humains
 *
 *   Résultat : preview Facebook correct, et l'utilisateur qui clique se
 *   retrouve dans le blog habituel sans s'en apercevoir.
 *
 * Usage :
 *   node scripts/generer-pages-articles.js
 *
 * Effet :
 *   - Lit articles.json à la racine
 *   - Pour chaque article sans champ "slug", en génère un (kebab-case, 60 chars max)
 *   - Sauvegarde le slug dans articles.json (stable une fois écrit)
 *   - Écrit articles/<slug>.html
 *   - Affiche un récap
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ARTICLES_JSON = path.join(ROOT, 'articles.json');
const OUT_DIR = path.join(ROOT, 'articles');
const SITE = 'https://vizilleenmouvement.fr';
const DEFAULT_IMAGE = SITE + '/images/og-image.jpg';

// --- Slugify : titre → kebab-case sans accents ni caractères spéciaux ---
function slugify(s) {
  return (s || '')
    .toString()
    // Décompose les accents (NFD) puis enlève les marques diacritiques
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    // Remplace tout ce qui n'est pas a-z 0-9 par un tiret
    .replace(/[^a-z0-9]+/g, '-')
    // Enlève les tirets en début/fin
    .replace(/^-+|-+$/g, '')
    // Tronque à 60 caractères
    .slice(0, 60)
    .replace(/-+$/g, '');
}

// --- Échappement HTML pour les attributs ---
function esc(s) {
  return (s || '').toString()
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// --- Choisit la meilleure image pour og:image ---
//     - Si article.image existe → utilise (préfère .webp à côté si dispo)
//     - Sinon → image par défaut du site
function pickImage(article) {
  let img = article.image || (article.images && article.images[0]) || '';
  if (!img) return DEFAULT_IMAGE;
  // Si c'est déjà une URL absolue, on garde
  if (/^https?:\/\//.test(img)) return img;
  // Préfère .webp si présent à côté
  const webpPath = img.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  if (webpPath !== img && fs.existsSync(path.join(ROOT, webpPath))) {
    img = webpPath;
  }
  return SITE + '/' + img.replace(/^\/+/, '');
}

// --- Construit le HTML de la page-passerelle ---
function buildPage(article, slug) {
  const url = SITE + '/articles/' + slug + '.html';
  const title = (article.titre || 'Vizille en Mouvement').trim();
  const desc = (article.extrait || article.contenu || '').trim()
    .replace(/<[^>]+>/g, '')      // strip HTML
    .replace(/\s+/g, ' ')          // normalise les espaces
    .slice(0, 280);
  const image = pickImage(article);
  const date = article.date || '';
  const blogUrl = '/blog.html?article=' + article.id;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(title)} — Vizille en Mouvement</title>
    <meta name="description" content="${esc(desc)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${esc(url)}">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(desc)}">
    <meta property="og:image" content="${esc(image)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:locale" content="fr_FR">
    <meta property="og:site_name" content="Vizille en Mouvement">
${date ? `    <meta property="article:published_time" content="${esc(date)}">\n` : ''}    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(desc)}">
    <meta name="twitter:image" content="${esc(image)}">
    <link rel="canonical" href="${esc(SITE + blogUrl)}">
    <meta http-equiv="refresh" content="0; url=${esc(blogUrl)}">
    <style>body{font-family:-apple-system,sans-serif;text-align:center;padding:3rem 1rem;color:#333}a{color:#1a3a5c}</style>
</head>
<body>
    <p>Redirection vers l'article…</p>
    <p><a href="${esc(blogUrl)}">${esc(title)}</a></p>
    <script>window.location.replace(${JSON.stringify(blogUrl)});</script>
</body>
</html>
`;
}

// --- Main ---
function main() {
  const raw = fs.readFileSync(ARTICLES_JSON, 'utf8');
  const articles = JSON.parse(raw);
  if (!Array.isArray(articles)) {
    console.error('articles.json doit être un tableau');
    process.exit(1);
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const usedSlugs = new Set();
  let nbCrees = 0;
  let nbMisAJour = 0;
  let nbSlugsAjoutes = 0;

  for (const article of articles) {
    if (!article.id) continue;

    // Slug : on garde celui déjà stocké, sinon on en génère un nouveau
    let slug = article.slug;
    if (!slug) {
      slug = slugify(article.titre);
      if (!slug) slug = 'article-' + article.id;
      // Évite les collisions (deux articles avec même titre)
      let final = slug;
      let n = 2;
      while (usedSlugs.has(final)) {
        final = slug + '-' + n;
        n++;
      }
      slug = final;
      article.slug = slug;
      nbSlugsAjoutes++;
    }
    usedSlugs.add(slug);

    // Génère le HTML
    const html = buildPage(article, slug);
    const outPath = path.join(OUT_DIR, slug + '.html');
    const existed = fs.existsSync(outPath);
    let writeIt = true;
    if (existed) {
      const old = fs.readFileSync(outPath, 'utf8');
      if (old === html) writeIt = false;
    }
    if (writeIt) {
      fs.writeFileSync(outPath, html, 'utf8');
      if (existed) nbMisAJour++;
      else nbCrees++;
    }
  }

  // Sauvegarde articles.json si des slugs ont été ajoutés
  if (nbSlugsAjoutes > 0) {
    fs.writeFileSync(ARTICLES_JSON, JSON.stringify(articles, null, 2) + '\n', 'utf8');
  }

  console.log('=== generer-pages-articles ===');
  console.log('Articles traités  : ' + articles.length);
  console.log('Slugs ajoutés     : ' + nbSlugsAjoutes);
  console.log('Pages créées      : ' + nbCrees);
  console.log('Pages mises à jour: ' + nbMisAJour);
  console.log('Pages identiques  : ' + (articles.length - nbCrees - nbMisAJour));
  console.log('Dossier de sortie : ' + path.relative(ROOT, OUT_DIR) + '/');
}

main();
