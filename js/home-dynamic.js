/**
 * Page d'accueil dynamique - Vizille en Mouvement
 * Charge les données et anime les éléments
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les animations au scroll
    initScrollAnimations();

    // Initialiser les compteurs animés
    initCounters();

    // Charger les données dynamiques
    loadALaUne();
    loadCarousel();
    loadActualites();
    loadGalerie();
    loadEquipePreview();

    // Scroll fluide pour les ancres
    initSmoothScroll();

    // Renouveler le carrousel toutes les 4 heures (14400000 ms)
    setInterval(loadCarousel, 14400000);
});

/**
 * Animations au scroll (Intersection Observer)
 */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optionnel : arrêter d'observer une fois animé
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observer tous les éléments avec la classe animate-on-scroll
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

/**
 * Compteurs animés
 */
function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
}

function animateCounter(element) {
    const target = parseInt(element.dataset.target);
    const duration = 2000; // 2 secondes
    const steps = 60;
    const stepDuration = duration / steps;
    const increment = target / steps;

    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
        step++;
        current = Math.min(Math.round(increment * step), target);

        // Formater le nombre avec séparateur de milliers
        element.textContent = current.toLocaleString('fr-FR');

        if (step >= steps) {
            clearInterval(timer);
            element.textContent = target.toLocaleString('fr-FR');
        }
    }, stepDuration);
}

/**
 * Charger le carrousel Bilan & Projet
 */
async function loadCarousel() {
    const track = document.getElementById('carousel-track');
    if (!track) return;

    try {
        // Charger les deux fichiers JSON en parallèle
        const [actionsRes, projetsRes] = await Promise.all([
            fetch('./actions.json'),
            fetch('./projets.json')
        ]);

        const actions = await actionsRes.json();
        const projets = await projetsRes.json();

        // Prendre TOUTES les actions et tous les projets
        let cards = [
            ...actions.map(a => ({ ...a, type: 'bilan' })),
            ...projets.map(p => ({ ...p, type: 'projet' }))
        ];

        // Mélanger aléatoirement
        shuffleArray(cards);

        // Sur mobile, limiter à 50 cards pour la performance
        if (window.innerWidth < 600) {
            cards = cards.slice(0, 50);
        }

        // Générer le HTML des cards
        const cardsHtml = cards.map(item => createCarouselCard(item)).join('');

        // Dupliquer pour boucle infinie
        track.innerHTML = cardsHtml + cardsHtml;

    } catch (error) {
        console.error('Erreur chargement carrousel:', error);
        track.innerHTML = '<p style="padding: 2rem; color: #888;">Chargement...</p>';
    }
}

/**
 * Créer une card du carrousel
 */
function createCarouselCard(item) {
    const theme = item.theme || item.categorie || 'Divers';
    const titre = item.titre || item.nom || 'Action';
    const icon = getThemeIcon(theme);
    const typeClass = item.type === 'bilan' ? 'bilan' : 'projet';
    const typeLabel = item.type === 'bilan' ? 'Bilan' : 'Projet';

    // Nettoyer et raccourcir le titre
    let shortTitle = titre.replace(/^Objectif \d+ - /, '').replace(/^Objectif - /, '');
    if (shortTitle.length > 40) {
        shortTitle = shortTitle.substring(0, 37) + '...';
    }

    return `
        <div class="carousel-card ${typeClass}">
            <div class="carousel-card-icon">${icon}</div>
            <div class="carousel-card-title">${shortTitle}</div>
            <div class="carousel-card-divider"></div>
            <div class="carousel-card-theme">${theme}</div>
            <span class="carousel-card-badge">${typeLabel}</span>
        </div>
    `;
}

/**
 * Obtenir l'icône d'un thème
 */
function getThemeIcon(theme) {
    const icons = {
        'Santé': '🏥',
        'Environnement': '🌳',
        'Transition écologique': '🌿',
        'Tranquillité publique': '🛡️',
        'Tranquillité': '🛡️',
        'Enfance': '👶',
        'Enfance/Jeunesse': '👶',
        'Jeunesse': '🧒',
        'Sport': '🎾',
        'Culture': '🎭',
        'Économie': '💼',
        'Urbanisme': '🏗️',
        'Mobilités': '🚴',
        'Mobilité': '🚴',
        'Solidarité': '❤️',
        'Social': '🤝',
        'Patrimoine': '🏛️',
        'Éducation': '📚',
        'Concertation citoyenne': '🗣️',
        'Métropole': '🏙️',
        'Tranquillité': '🔒'
    };
    return icons[theme] || '📌';
}

/**
 * Mélanger un tableau
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Utilitaire couleur pour les dégradés flip cards
 */
function adjustColor(hex, amount) {
    hex = hex.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

/**
 * Couleurs par catégorie d'article
 */
const CAT_COLORS = {
    'Communiqué': '#e67e22',
    'Événement': '#3498db',
    'Réunion de quartier': '#9b59b6',
    'Presse': '#27ae60'
};

/**
 * Construire une flip card article pour l'accueil
 */
function buildActuFlipCard(article, color) {
    const darkerColor = adjustColor(color, -25);
    const imageUrl = getImageUrl(article.image || article.images?.[0]);
    const hasImage = !!imageUrl;
    const title = (article.titre || '').replace(/^[📰📅📣🎯✊🤝📊🚀📝ℹ️🎬]\s*/, '');
    const date = formatDate(article.date);
    const category = article.categorie || 'Actualité';
    const extrait = truncate(article.extrait || (article.contenu || '').split('[prix-carburants]').join(''), 150);

    // Contenu verso
    const contenu = (article.contenu || '').split('[prix-carburants]').join(''); // repère de la carte des prix, jamais affiché tel quel
    const truncContenu = contenu.length > 300 ? contenu.substring(0, 300) + '...' : contenu;
    const contenuHtml = truncContenu.split('\n').filter(p => p.trim()).slice(0, 5).map(p => '<p style="margin:0.3rem 0;">' + p + '</p>').join('');

    const catBadge = `<span class="flip-front-category" style="background:${color};">${category}</span>`;
    const isPriority = article.priorite;
    const priorityBadge = isPriority ? '<span class="flip-front-priority">⭐ À la une</span>' : '';
    const priorityClass = isPriority ? ' flip-card--priority' : '';

    return `
        <div class="flip-card flip-card--blog${priorityClass} ${hasImage ? 'has-image' : ''}" data-id="${article.id}">
            <div class="flip-card-inner">
                <div class="flip-card-front">
                    ${hasImage ? `<div class="flip-front-image-container"><img src="${imageUrl}" alt="" loading="lazy"></div>` : ''}
                    <div class="flip-front-header" style="background: linear-gradient(135deg, ${isPriority ? '#c9a227' : color} 0%, ${isPriority ? '#a68520' : darkerColor} 100%);">
                        <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;margin-bottom:0.3rem;">
                            ${priorityBadge}
                            ${catBadge}
                            <span class="flip-front-date">${date}</span>
                        </div>
                        <h3 class="flip-front-title">${title}</h3>
                    </div>
                    <div class="flip-front-body">
                        <div class="flip-front-pourquoi">${extrait}</div>
                        <div class="flip-front-hint">
                            <span class="flip-icon">🔄</span> Retourner pour lire
                        </div>
                    </div>
                </div>
                <div class="flip-card-back">
                    <div class="flip-back-header" style="background: linear-gradient(135deg, ${color} 0%, ${darkerColor} 100%);">
                        <span class="flip-back-title">${title.length > 35 ? title.substring(0, 35) + '...' : title}</span>
                        <span class="flip-back-close">↩ Retour</span>
                    </div>
                    <div class="flip-back-body">
                        <div class="flip-back-section">
                            <h4 class="section-contenu">📝 Aperçu</h4>
                            <div style="font-size:0.85rem;line-height:1.6;color:#555;">${contenuHtml}</div>
                        </div>
                        ${article.auteur ? `<div class="flip-back-auteur">✍️ Par ${article.auteur}</div>` : ''}
                    </div>
                    <div class="flip-back-footer" onclick="event.stopPropagation(); window.location.href='blog.html?article=${article.id}';">
                        📰 Lire la suite
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Charger les dernières actualités (flip cards)
 */
async function loadActualites() {
    const grid = document.getElementById('actualites-grid');
    if (!grid) return;

    try {
        const response = await fetch('articles.json?v=' + Date.now());
        if (!response.ok) throw new Error('Erreur chargement articles');

        const articles = await response.json();

        // Trier : prioritaires d'abord, puis par date de modification (style blog)
        const recentArticles = articles
            .filter(a => !a.a_la_une)
            .sort((a, b) => {
                if (a.priorite && !b.priorite) return -1;
                if (!a.priorite && b.priorite) return 1;
                return new Date(b.modifie_le || b.date || 0) - new Date(a.modifie_le || a.date || 0);
            })
            .slice(0, 6);

        if (recentArticles.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: #888;">Aucune actualité pour le moment</p>';
            return;
        }

        grid.className = 'flip-grid';
        grid.innerHTML = recentArticles.map((article, i) => {
            const color = CAT_COLORS[article.categorie] || ['#e74c3c', '#3498db', '#27ae60'][i % 3];
            return buildActuFlipCard(article, color);
        }).join('');

        // Attacher les événements flip
        grid.querySelectorAll('.flip-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.flip-back-footer')) return;
                card.classList.toggle('flipped');
            });
        });

        // Réinitialiser les animations pour les nouveaux éléments
        initScrollAnimations();

    } catch (error) {
        console.error('Erreur chargement actualités:', error);
        grid.innerHTML = '<p style="text-align: center; color: #888;">Impossible de charger les actualités</p>';
    }
}

/**
 * Charger la galerie photos
 */
async function loadGalerie() {
    const mosaic = document.getElementById('galerie-mosaic');
    if (!mosaic) return;

    try {
        const response = await fetch('medias.json');
        if (!response.ok) throw new Error('Erreur chargement médias');

        const data = await response.json();
        const photos = data.photos || [];

        // Prendre les 5 premières photos (ou moins si pas assez)
        const displayPhotos = photos.slice(0, 5);

        if (displayPhotos.length === 0) {
            mosaic.innerHTML = '<p style="text-align: center; color: #888; grid-column: 1/-1;">Aucune photo pour le moment</p>';
            return;
        }

        mosaic.innerHTML = displayPhotos.map((photo, index) => {
            const imageUrl = getImageUrl(photo.src);
            return `
                <div class="galerie-item" onclick="window.location.href='medias.html'">
                    <img src="${imageUrl}" alt="${photo.titre || 'Photo'}" loading="lazy">
                    <div class="galerie-caption">${photo.titre || ''}</div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Erreur chargement galerie:', error);
        mosaic.innerHTML = '<p style="text-align: center; color: #888; grid-column: 1/-1;">Impossible de charger la galerie</p>';
    }
}

/**
 * Construire une flip card candidat pour l'accueil
 */
function buildEquipePreviewFlipCard(candidat, index, isLeader) {
    const color = isLeader ? '#c9a227' : '#1a3a5c';
    const darkerColor = adjustColor(color, -25);
    const pos = candidat.photoPosition || 'center 30%';
    const vidPos = candidat.videoPosition || 'center 25%';
    const fullName = candidat.prenom ? (candidat.prenom + ' ' + (candidat.nom || '')) : (candidat.nom || '');
    const prenom = candidat.prenom || (candidat.nom || '').split(' ')[0] || '';
    const nom = candidat.prenom ? (candidat.nom || '') : (candidat.nom || '').split(' ').slice(1).join(' ') || '';

    // Media
    let mediaHtml = '';
    if (candidat.video) {
        mediaHtml = `<video src="${candidat.video}" autoplay muted loop playsinline style="object-position:${vidPos};"></video>`;
        if (candidat.photo) {
            mediaHtml += `<img src="${getImageUrl(candidat.photo)}" alt="${fullName}" loading="lazy" style="object-position:${pos};" class="video-fallback-photo">`;
        }
    } else if (candidat.photo) {
        mediaHtml = `<img src="${getImageUrl(candidat.photo)}" alt="${fullName}" loading="lazy" style="object-position:${pos};">`;
    } else {
        mediaHtml = `<div class="placeholder">👤</div>`;
    }

    // Statut
    const feminin = ['Adjointe','Conseillère','Conseillère déléguée'].some(r => (candidat.role||'').startsWith(r));
    let statutText = '';
    if (candidat.nouveau) {
        statutText = feminin ? 'Nouvelle candidate' : 'Nouveau candidat';
    } else if (candidat.role) {
        statutText = candidat.role;
    }

    // Bio courte pour le verso
    const bio = candidat.bio || '';
    const truncBio = bio.length > 150 ? bio.substring(0, 150) + '...' : bio;

    return `
        <div class="flip-card flip-card--equipe ${isLeader ? 'flip-card--leader' : ''}" data-index="${index}">
            <div class="flip-card-inner">
                <div class="flip-card-front">
                    <div class="flip-front-media">${mediaHtml}</div>
                    <div class="flip-front-header" style="background: linear-gradient(135deg, ${color} 0%, ${darkerColor} 100%);">
                        <h3 class="flip-front-title">${isLeader ? '⭐ ' : ''}${prenom} ${nom}</h3>
                        ${statutText ? `<div class="flip-front-subtitle">${statutText}</div>` : ''}
                    </div>
                    <div class="flip-front-body" style="padding:0.75rem 1.25rem;">
                        <div class="flip-front-hint">
                            <span class="flip-icon">🔄</span> Retourner pour découvrir
                        </div>
                    </div>
                </div>
                <div class="flip-card-back">
                    <div class="flip-back-header" style="background: linear-gradient(135deg, ${color} 0%, ${darkerColor} 100%);">
                        <span class="flip-back-title">${prenom} ${nom}</span>
                        <span class="flip-back-close">↩ Retour</span>
                    </div>
                    <div class="flip-back-body">
                        ${candidat.delegation ? `<span class="flip-back-delegation">${candidat.delegation}</span>` : ''}
                        ${bio ? `<div class="flip-back-section"><h4 class="section-bio">👤 Présentation</h4><p style="font-size:0.85rem;line-height:1.6;color:#555;">${truncBio}</p></div>` : ''}
                        ${candidat.citation ? `<div class="flip-back-citation">« ${candidat.citation} »</div>` : ''}
                    </div>
                    <div class="flip-back-footer" onclick="event.stopPropagation(); window.location.href='equipe.html';">
                        👤 Voir le profil complet
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Charger l'aperçu de l'équipe (miniatures rondes)
 */
async function loadEquipePreview() {
    const grid = document.getElementById('equipe-preview');
    if (!grid) return;

    try {
        const response = await fetch('candidats.json');
        if (!response.ok) throw new Error('Erreur chargement candidats');

        const candidats = await response.json();

        // Séparer élus et non-élus
        const displayCandidats = candidats
            .filter(c => c.actif !== false && c.elu === true && (c.photo || c.video))
            .sort((a, b) => (a.ordre || 999) - (b.ordre || 999));

        const soutiens = candidats
            .filter(c => c.elu === false && c.actif !== false && c.photo)
            .sort((a, b) => (a.ordre || 999) - (b.ordre || 999));

        if (displayCandidats.length === 0) {
            grid.innerHTML = Array(6).fill(`
                <div style="width: 100px; height: 100px; border-radius: 50%; background: rgba(255,255,255,0.2);"></div>
            `).join('');
            return;
        }

        grid.className = 'equipe-preview-grid';
        grid.innerHTML = displayCandidats.map(candidat => {
            const fullName = candidat.prenom ? (candidat.prenom + ' ' + (candidat.nom || '')) : (candidat.nom || '');
            const photoSrc = candidat.photo ? getImageUrl(candidat.photo) : '';
            const pos = candidat.photoPosition || 'center 30%';
            const vidPos = candidat.videoPosition || 'center 25%';

            if (candidat.video && photoSrc) {
                // Vidéo + photo fallback (transition après 10s)
                return `<a href="equipe.html" title="${fullName}" class="equipe-avatar-container">
                    <video src="${candidat.video}" class="equipe-avatar" autoplay muted loop playsinline style="object-position:${vidPos};"></video>
                    <img src="${photoSrc}" alt="${fullName}" class="equipe-avatar equipe-avatar-fallback" loading="lazy" style="object-position:${pos};">
                </a>`;
            } else if (photoSrc) {
                return `<a href="equipe.html" title="${fullName}" class="equipe-avatar-container">
                    <img src="${photoSrc}" alt="${fullName}" class="equipe-avatar" loading="lazy" style="object-position:${pos};">
                </a>`;
            }
            return '';
        }).join('');

        // Soutiens (non-élus)
        const soutiensWrap = document.getElementById('equipe-soutiens-wrap');
        const soutiensGrid = document.getElementById('equipe-soutiens-grid');
        if (soutiensGrid && soutiens.length) {
            soutiensGrid.innerHTML = soutiens.map(c => {
                const nom = c.prenom ? (c.prenom + ' ' + (c.nom || '')) : (c.nom || '');
                const pos = c.photoPosition || 'center 20%';
                return `<a href="equipe.html" title="${nom}" style="text-align:center;text-decoration:none;">
                    <div style="width:80px;height:80px;border-radius:50%;overflow:hidden;margin:0 auto 0.4rem;border:2px solid #c9a84c;opacity:0.8;">
                        <img src="${c.photo}" alt="${nom}" style="width:100%;height:100%;object-fit:cover;object-position:${pos};filter:grayscale(30%);">
                    </div>
                    <p style="font-size:0.72rem;color:#888;margin:0;font-family:'Source Sans 3',sans-serif;">${nom}</p>
                </a>`;
            }).join('');
            if (soutiensWrap) soutiensWrap.style.display = '';
        }

        // Transition vidéo → photo après 10 secondes
        function transitionToPhoto() {
            grid.querySelectorAll('.equipe-avatar-container video').forEach(video => {
                const photo = video.parentElement.querySelector('.equipe-avatar-fallback');
                if (photo) {
                    video.style.transition = 'opacity 1s ease';
                    video.style.opacity = '0';
                    photo.style.opacity = '1';
                    setTimeout(() => { video.pause(); }, 1000);
                } else {
                    video.pause();
                }
            });
        }

        // Forcer lecture vidéos
        function playAllVideos() {
            grid.querySelectorAll('video').forEach(v => {
                v.muted = true;
                v.play().catch(() => {});
            });
        }

        playAllVideos();

        // iOS : relancer au premier touch
        const startVideos = () => {
            playAllVideos();
            setTimeout(transitionToPhoto, 10000);
        };
        document.addEventListener('touchstart', startVideos, { once: true });
        document.addEventListener('scroll', startVideos, { once: true });

        // Desktop : transition après 10 secondes
        setTimeout(transitionToPhoto, 10000);

    } catch (error) {
        console.error('Erreur chargement équipe:', error);
        grid.innerHTML = Array(6).fill(`
            <div style="width: 100px; height: 100px; border-radius: 50%; background: rgba(255,255,255,0.2);"></div>
        `).join('');
    }
}

/**
 * Bloc "À la une" — injecté dynamiquement après le hero
 * Déclenché par a_la_une:true dans articles.json
 */
async function loadALaUne() { return; // géré directement dans index.html avec carousel
    try {
        const response = await fetch('articles.json?v=' + Date.now());
        if (!response.ok) return;
        const articles = await response.json();
        const art = articles.find(a => a.a_la_une === true);
        if (!art) return;

        const img = art.image || (art.images && art.images[0]) || '';
        const section = document.createElement('section');
        section.id = 'bloc-a-la-une';
        section.style.cssText = 'background:#f7f4ef;border-bottom:3px solid #c9a84c;padding:0;';
        section.innerHTML = `
            <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:${img ? '1fr 1fr' : '1fr'};min-height:280px;">
                ${img ? `<div style="overflow:hidden;max-height:360px;"><img src="${img}" alt="${art.titre}" style="width:100%;height:100%;object-fit:cover;object-position:center 30%;display:block;"></div>` : ''}
                <div style="padding:2rem 2.5rem;display:flex;flex-direction:column;justify-content:center;">
                    <p style="font-size:0.62rem;letter-spacing:0.22em;text-transform:uppercase;color:#c9a84c;font-weight:700;margin:0 0 0.5rem;">${formatDate(art.date)} · ${art.categorie || 'Actualité'}</p>
                    <h2 style="font-family:'Playfair Display',serif;font-size:clamp(1.1rem,2.5vw,1.6rem);font-weight:600;color:#1a3a6b;margin:0 0 0.8rem;line-height:1.3;">${art.titre}</h2>
                    <p style="font-size:0.88rem;color:#555;line-height:1.75;margin:0 0 1.2rem;">${art.extrait || ''}</p>
                    <div style="display:flex;flex-wrap:wrap;gap:0.8rem;align-items:center;">
                        <a href="blog.html" style="display:inline-block;background:#1a3a6b;color:#fff;padding:0.6rem 1.3rem;border-radius:3px;text-decoration:none;font-size:0.8rem;letter-spacing:0.04em;">📰 Lire le compte rendu complet →</a>
                        <a href="equipe.html" style="color:#1a3a6b;font-size:0.78rem;text-decoration:underline;letter-spacing:0.03em;">👥 Découvrir le conseil municipal →</a>
                    </div>
                </div>
            </div>
            <style>@media(max-width:700px){#bloc-a-la-une{grid-template-columns:1fr!important;}}</style>
        `;
        // Injecter dans le container dédié juste après le hero
        const container = document.getElementById('bloc-a-la-une-container');
        if (container) {
            container.appendChild(section);
        } else {
            const hero = document.querySelector('.hero-dynamic');
            hero ? hero.insertAdjacentElement('afterend', section) : document.body.appendChild(section);
        }
    } catch(e) {
        console.warn('loadALaUne:', e);
    }
}

/**
 * Scroll fluide pour les ancres
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Utilitaires
 */
function getImageUrl(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    if (path.startsWith('data:')) return path;
    // Construire l'URL relative
    return path;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr + 'T12:00:00');
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch {
        return dateStr;
    }
}

function truncate(text, maxLength) {
    if (!text) return '';
    // Nettoyer le HTML
    const clean = text.replace(/<[^>]*>/g, '');
    if (clean.length <= maxLength) return clean;
    return clean.substring(0, maxLength).trim() + '...';
}

function getCategoryIcon(category) {
    const icons = {
        'Campagne': '📢',
        'Culture': '🎭',
        'Sport': '⚽',
        'Environnement': '🌿',
        'Social': '🤝',
        'Économie': '💼',
        'Éducation': '📚',
        'Tranquillité': '🛡️',
        'Urbanisme': '🏗️',
        'Actualité': '📰'
    };
    return icons[category] || '📰';
}

/**
 * Parallax effect pour le hero (optionnel)
 */
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero-dynamic');
    if (!hero) return;

    const scrolled = window.pageYOffset;
    const heroBg = hero.querySelector('.hero-bg');

    if (heroBg && scrolled < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});
