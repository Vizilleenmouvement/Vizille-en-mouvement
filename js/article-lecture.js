/* Mise en page des articles (11/10/2026) : voir css/components/article-lecture.css.
   alRendre(article, imgHtml) renvoie le HTML complet de l'article ; blog.html l'appelle
   depuis showArticle(). Les articles existants n'ont rien à changer. */
(function () {
  var MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  var ETIQ = {'📅':'Date','🗓️':'Date','🗓':'Date','🕐':'Horaire','⏰':'Horaire','🕒':'Horaire','📍':'Lieu','👥':'Public','ℹ️':'À savoir','ℹ':'À savoir',
    '✉️':'Contact','✉':'Contact','📧':'Contact','📞':'Téléphone','☎️':'Téléphone','💶':'Tarif','💰':'Tarif','🎟️':'Entrée','⏳':'Durée','🔗':'Lien','👉':'À faire','🚗':'Accès','🚌':'Accès','♿':'Accessibilité'};

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  // Espaces insécables de la typographie française, seulement dans le texte (jamais dans les balises)
  function typo(html){
    return String(html || '').replace(/(^|>)([^<]+)/g, function(m, a, t){
      return a + t.replace(/ ([:;?!»])/g, '\u00a0$1').replace(/« /g, '«\u00a0');
    });
  }
  function texteSeul(html){ var d = document.createElement('div'); d.innerHTML = html || ''; return (d.textContent || '').replace(/\s+/g, ' ').trim(); }
  function premierEmoji(s){
    var m = String(s).match(/^\s*((?:\p{Extended_Pictographic}|\p{Emoji_Presentation})(?:\uFE0F)?(?:\u200D(?:\p{Extended_Pictographic})\uFE0F?)*)\s*/u);
    return m ? { e: m[1], reste: s.slice(m[0].length) } : null;
  }
  function dateFr(s){
    var m = String(s).toLowerCase().match(/(\d{1,2})(?:er)?\s+(janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre)\s+(\d{4})/);
    if (!m) return null;
    var nom = m[2].replace('fevrier','février').replace('aout','août').replace('decembre','décembre');
    return new Date(+m[3], MOIS.indexOf(nom), +m[1], 23, 59);
  }
  function rebours(lignes){
    var auj = new Date(); auj.setHours(0,0,0,0);
    for (var i = 0; i < lignes.length; i++){
      if (!/jusqu|avant|limite|date/i.test(texteSeul(lignes[i]))) continue;
      var d = dateFr(texteSeul(lignes[i])); if (!d) continue;
      var j = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - auj) / 86400000);
      if (j < 0) return '';
      if (j === 0) return 'Dernier jour aujourd’hui';
      if (j === 1) return 'Plus qu’un jour';
      return 'Plus que ' + j + ' jours';
    }
    return '';
  }

  // Sépare le contenu autour du bloc « Infos pratiques » (lignes qui suivent le titre, jusqu'à une ligne vide)
  function decouper(txt){
    txt = String(txt || '');
    var re = /(^|\n)\s*(?:<strong>|<b>)?\s*Infos? pratiques?\s*:?\s*(?:<\/strong>|<\/b>)?\s*:?\s*\n/i, m = re.exec(txt);
    if (!m) return { avant: txt, lignes: [], apres: '' };
    var avant = txt.slice(0, m.index), suite = txt.slice(m.index + m[0].length);
    var lignes = [], reste = suite.split('\n'), k = 0;
    for (; k < reste.length; k++){ var l = reste[k].trim(); if (!l){ if (lignes.length) break; else continue; } lignes.push(l); }
    return { avant: avant, lignes: lignes, apres: reste.slice(k).join('\n') };
  }

  function encadre(lignes){
    if (!lignes.length) return '';
    var cases = [], cta = null;
    lignes.forEach(function(l){
      var lien = l.match(/<a\s[^>]*href="(https?:[^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
      if (lien && !cta && !/mailto:/i.test(lien[1])){
        cta = { href: lien[1], txt: texteSeul(lien[2]) || 'En savoir plus' };
        var autour = texteSeul(l.replace(lien[0], '')).replace(/^[^\p{L}\p{N}]+/u, '').replace(/[:\s]+$/, '');
        if (!autour) return;
      }
      var p = premierEmoji(l), e = p ? p.e : '•', corps = p ? p.reste : l;
      var lab = ETIQ[e] || '';
      var mm = corps.match(/^([^:<]{2,28})\s:\s*([\s\S]+)$/); // « Une question : … » → étiquette « Une question »
      if (mm){ lab = mm[1]; corps = mm[2]; }
      cases.push('<div class="al-pr"><div class="ic">' + e + '</div>' + (lab ? '<b>' + esc(lab) + '</b>' : '') + '<span>' + typo(corps) + '</span></div>');
    });
    var rb = rebours(lignes);
    return '<section class="al-pratique"><div class="al-pratique-hd">Infos pratiques</div>'
      + (cases.length ? '<div class="al-pratique-c">' + cases.join('') + '</div>' : '')
      + ((cta || rb) ? '<div class="al-pratique-cta">' + (cta ? '<a class="al-cta" href="' + esc(cta.href) + '" target="_blank" rel="noopener">' + esc(cta.txt) + ' →</a>' : '<span></span>') + (rb ? '<span class="al-rebours">' + rb + '</span>' : '') + '</div>' : '')
      + '</section>';
  }

  function aLireAussi(a){
    var tous = (window.articlesData || []).filter(function(x){ return x.id !== a.id && x.titre; });
    tous.sort(function(x, y){
      var sx = (x.categorie === a.categorie ? 1 : 0), sy = (y.categorie === a.categorie ? 1 : 0);
      return (sy - sx) || String(y.date || '').localeCompare(String(x.date || ''));
    });
    var sel = tous.slice(0, 3); if (!sel.length) return '';
    return '<section class="al-aussi"><h2>À lire aussi</h2><div class="al-cartes">' + sel.map(function(x){
      var t = (typeof cleanTitle === 'function') ? cleanTitle(x.titre) : x.titre;
      return '<a class="al-carte" href="?article=' + x.id + '" onclick="showArticle(' + x.id + ');return false;">'
        + (x.image ? '<img loading="lazy" src="' + esc(x.image) + '" alt="">' : '')
        + '<div><small>' + esc(x.categorie || 'Actualité') + '</small><h3>' + typo(esc(t)) + '</h3></div></a>';
    }).join('') + '</div></section>';
  }

  window.alCopier = function(url){
    var fini = function(){ var t = document.getElementById('al-copie'); if (t){ t.classList.add('on'); setTimeout(function(){ t.classList.remove('on'); }, 1600); } };
    try { navigator.clipboard.writeText(url).then(fini, fini); } catch (e) { fini(); }
  };

  window.alRendre = function(a, imgHtml){
    var titre = (typeof cleanTitle === 'function') ? cleanTitle(a.titre) : a.titre;
    var url = (typeof shareUrlForArticle === 'function') ? shareUrlForArticle(a) : location.href;
    var date = a.a_preciser ? 'Date à préciser' : ((typeof fmtDate === 'function') ? fmtDate(a.date) : a.date);
    var mots = texteSeul(a.contenu).split(' ').length, minutes = Math.max(1, Math.ceil(mots / 200));
    var parts = decouper(a.contenu);
    var rendu = (typeof renderArticleContent === 'function') ? renderArticleContent : function(t){ return t; };
    var avant = rendu(parts.avant), apres = parts.apres.trim() ? rendu(parts.apres) : '';
    // Lettrine si le premier paragraphe commence par une lettre
    avant = avant.replace(/^<p>(?=[A-Za-zÀ-ÖØ-öø-ÿ«"])/, '<p class="lettrine">');
    // Chapeau : l'extrait, sauf s'il répète le début du texte
    var ext = (a.extrait || '').trim(), debut = texteSeul(a.contenu).slice(0, 60);
    var chapeau = (ext && ext.slice(0, 60) !== debut) ? ext.replace(/\s*(\.\.\.|…)$/, '…') : '';
    var wa = 'https://wa.me/?text=' + encodeURIComponent(titre + ' ' + url);
    var mail = 'mailto:?subject=' + encodeURIComponent(titre) + '&body=' + encodeURIComponent(titre + '\n\n' + url);
    var partage = '<div class="lab">Partager</div>'
      + '<button class="al-btn" onclick="shareOnFB(' + a.id + ')"><i>f</i>Facebook</button>'
      + '<a class="al-btn" href="' + wa + '" target="_blank" rel="noopener"><i>💬</i>WhatsApp</a>'
      + '<a class="al-btn" href="' + mail + '"><i>✉️</i>Par e-mail</a>'
      + '<button class="al-btn" onclick="alCopier(\'' + url + '\')"><i>🔗</i>Copier le lien</button>';
    return '<div class="al">'
      + '<div class="al-retour"><a href="blog.html" onclick="showList();return false;">← Toutes les actualités</a></div>'
      + '<header class="al-une' + (imgHtml ? '' : ' sans-image') + '"><div>'
      +   '<div class="al-fil">' + (a.categorie ? '<span class="al-cat">' + esc(a.categorie) + '</span>' : '') + '<span>' + esc(date) + '</span><span>·</span><span>' + minutes + ' min de lecture</span></div>'
      +   '<h1 class="al-titre">' + typo(esc(titre)) + '</h1>'
      +   (chapeau ? '<p class="al-chapeau">' + typo(esc(chapeau)) + '</p>' : '')
      +   ((a.auteur || a.source) ? '<div class="al-auteur">' + (a.auteur ? 'Par ' + esc(a.auteur) : '') + (a.auteur && a.source ? ' · ' : '') + (a.source ? 'Source : ' + esc(a.source) : '') + '</div>' : '')
      + '</div>' + (imgHtml ? '<div class="al-img">' + imgHtml + '</div>' : '') + '</header>'
      + '<div class="al-corps"><aside class="al-rail"><div class="al-signe"><div class="pastille"><span>VeM</span></div><div>L’équipe<br>Vizille en mouvement</div></div>' + partage + '</aside>'
      +   '<article><div class="al-texte">' + typo(avant) + '</div>' + encadre(parts.lignes) + (apres ? '<div class="al-texte">' + typo(apres) + '</div>' : '') + '</article><div></div></div>'
      + aLireAussi(a)
      + '<div class="al-contact"><b>Une question, une idée pour Vizille ?</b><a href="participation.html">Écrivez-nous</a></div>'
      + '<div class="al-partage-m"><button class="fb" onclick="shareOnFB(' + a.id + ')">Facebook</button><a href="' + wa + '" target="_blank" rel="noopener">WhatsApp</a><a href="' + mail + '">E-mail</a><button onclick="alCopier(\'' + url + '\')">Lien</button></div>'
      + '<div class="al-copie" id="al-copie">Lien copié</div>'
      + '</div>';
  };
})();
