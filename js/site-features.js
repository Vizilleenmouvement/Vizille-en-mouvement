/**
 * Site Features - Vizille en Mouvement
 * Fonctionnalités interactives du site public
 */

(function() {
    'use strict';

    // ===== DARK MODE =====
    const darkModeToggle = {
        init() {
            // Créer le bouton toggle
            const toggle = document.createElement('button');
            toggle.className = 'dark-mode-toggle';
            toggle.innerHTML = '🌙';
            toggle.title = 'Basculer le mode sombre';
            toggle.setAttribute('aria-label', 'Basculer le mode sombre');
            document.body.appendChild(toggle);

            // Charger la préférence sauvegardée
            const savedTheme = localStorage.getItem('vizille-theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

            if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                document.documentElement.setAttribute('data-theme', 'dark');
                toggle.innerHTML = '☀️';
            }

            // Gérer le clic
            toggle.addEventListener('click', () => {
                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                if (isDark) {
                    document.documentElement.removeAttribute('data-theme');
                    localStorage.setItem('vizille-theme', 'light');
                    toggle.innerHTML = '🌙';
                } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    localStorage.setItem('vizille-theme', 'dark');
                    toggle.innerHTML = '☀️';
                }
            });
        }
    };

    // ===== SCROLL PROGRESS BAR =====
    const scrollProgress = {
        init() {
            const progressBar = document.createElement('div');
            progressBar.className = 'scroll-progress';
            document.body.appendChild(progressBar);

            window.addEventListener('scroll', () => {
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const progress = (scrollTop / docHeight) * 100;
                progressBar.style.width = progress + '%';
            });
        }
    };

    // ===== BACK TO TOP BUTTON =====
    const backToTop = {
        init() {
            const btn = document.createElement('button');
            btn.className = 'back-to-top';
            btn.innerHTML = '↑';
            btn.title = 'Retour en haut';
            btn.setAttribute('aria-label', 'Retour en haut de la page');
            document.body.appendChild(btn);

            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    btn.classList.add('visible');
                } else {
                    btn.classList.remove('visible');
                }
            });

            btn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    };

    // ===== SCROLL ANIMATIONS =====
    const scrollAnimations = {
        init() {
            // Ajouter la classe fade-in aux éléments à animer
            const animatedElements = document.querySelectorAll(
                '.card, .action-card, .projet-card, .candidat-card, .stat-card, ' +
                '.mot-container, .portrait-wrapper, .mot-texte, ' +
                '.section-header, .cards-grid > *, .team-grid > *'
            );

            animatedElements.forEach(el => {
                el.classList.add('animate-on-scroll');
            });

            // Observer les éléments
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animated');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            document.querySelectorAll('.animate-on-scroll').forEach(el => {
                observer.observe(el);
            });
        }
    };

    // ===== SOCIAL SHARING =====
    const socialSharing = {
        init() {
            // Trouver les articles ou contenus partageables
            const shareContainers = document.querySelectorAll('.article-card, .blog-article');

            shareContainers.forEach(container => {
                const title = container.querySelector('h2, h3, .titre')?.textContent || document.title;
                const shareButtons = this.createShareButtons(title, window.location.href);

                const footer = container.querySelector('.card-footer, .article-footer');
                if (footer) {
                    footer.appendChild(shareButtons);
                }
            });

            // Boutons de partage globaux (dans le footer ou header)
            this.addGlobalShareButtons();
        },

        createShareButtons(title, url) {
            const wrapper = document.createElement('div');
            wrapper.className = 'social-share-buttons';

            const encodedTitle = encodeURIComponent(title);
            const encodedUrl = encodeURIComponent(url);

            wrapper.innerHTML = `
                <span class="share-label">Partager :</span>
                <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}"
                   target="_blank" rel="noopener" class="share-btn share-facebook" title="Partager sur Facebook">
                    📘
                </a>
                <a href="https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}"
                   target="_blank" rel="noopener" class="share-btn share-twitter" title="Partager sur Twitter">
                    🐦
                </a>
                <a href="https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}"
                   target="_blank" rel="noopener" class="share-btn share-linkedin" title="Partager sur LinkedIn">
                    💼
                </a>
                <a href="https://wa.me/?text=${encodedTitle}%20${encodedUrl}"
                   target="_blank" rel="noopener" class="share-btn share-whatsapp" title="Partager sur WhatsApp">
                    💬
                </a>
                <button class="share-btn share-copy" title="Copier le lien" onclick="navigator.clipboard.writeText('${url}').then(() => alert('Lien copié !'))">
                    📋
                </button>
            `;

            return wrapper;
        },

        addGlobalShareButtons() {
            const footer = document.querySelector('footer .social-links');
            if (footer) {
                // Les liens sociaux sont déjà dans le footer
                return;
            }
        }
    };

    // ===== LAZY LOADING =====
    const lazyLoading = {
        init() {
            // Ajouter loading="lazy" aux images qui n'ont pas cet attribut
            document.querySelectorAll('img:not([loading])').forEach(img => {
                // Ne pas lazy load les images dans le hero ou header
                if (!img.closest('.hero-banner, .header, .hero-content')) {
                    img.setAttribute('loading', 'lazy');
                }
            });

            // Observer pour les images avec data-src (si utilisé)
            const lazyImages = document.querySelectorAll('img[data-src]');
            if (lazyImages.length === 0) return;

            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        }
    };

    // ===== STYLES CSS DYNAMIQUES =====
    const injectStyles = () => {
        const styles = document.createElement('style');
        styles.textContent = `
            /* Dark Mode Toggle */
            .dark-mode-toggle {
                position: fixed;
                bottom: 80px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: var(--bleu-vizille, #1a3a5c);
                border: none;
                cursor: pointer;
                font-size: 1.5rem;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 1000;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .dark-mode-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            }

            /* Scroll Progress Bar */
            .scroll-progress {
                position: fixed;
                top: 0;
                left: 0;
                height: 4px;
                background: linear-gradient(90deg, var(--or, #c9a227) 0%, var(--bleu-vizille, #1a3a5c) 100%);
                width: 0%;
                z-index: 9999;
                transition: width 0.1s ease-out;
            }

            /* Back to Top Button */
            .back-to-top {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: var(--or, #c9a227);
                color: white;
                border: none;
                cursor: pointer;
                font-size: 1.5rem;
                font-weight: bold;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transform: translateY(20px);
                transition: all 0.3s ease;
            }

            .back-to-top.visible {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .back-to-top:hover {
                background: var(--bleu-vizille, #1a3a5c);
                transform: translateY(-3px);
            }

            /* Scroll Animations */
            .animate-on-scroll {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }

            .animate-on-scroll.animated {
                opacity: 1;
                transform: translateY(0);
            }

            /* Stagger animation for grid items */
            .cards-grid .animate-on-scroll:nth-child(1) { transition-delay: 0s; }
            .cards-grid .animate-on-scroll:nth-child(2) { transition-delay: 0.1s; }
            .cards-grid .animate-on-scroll:nth-child(3) { transition-delay: 0.2s; }
            .cards-grid .animate-on-scroll:nth-child(4) { transition-delay: 0.3s; }
            .cards-grid .animate-on-scroll:nth-child(5) { transition-delay: 0.4s; }
            .cards-grid .animate-on-scroll:nth-child(6) { transition-delay: 0.5s; }

            /* Social Share Buttons */
            .social-share-buttons {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-top: 1rem;
            }

            .share-label {
                font-size: 0.85rem;
                color: var(--gris-texte, #666);
            }

            .share-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: var(--gris-doux, #f0f0f0);
                border: none;
                cursor: pointer;
                font-size: 1rem;
                text-decoration: none;
                transition: all 0.2s ease;
            }

            .share-btn:hover {
                transform: scale(1.1);
            }

            .share-facebook:hover { background: #1877f2; }
            .share-twitter:hover { background: #1da1f2; }
            .share-linkedin:hover { background: #0077b5; }
            .share-whatsapp:hover { background: #25d366; }
            .share-copy:hover { background: var(--or, #c9a227); }

            /* Responsive adjustments */
            @media (max-width: 768px) {
                .dark-mode-toggle,
                .back-to-top {
                    width: 44px;
                    height: 44px;
                    font-size: 1.2rem;
                }

                .dark-mode-toggle {
                    bottom: 70px;
                    right: 15px;
                }

                .back-to-top {
                    right: 15px;
                }
            }
        `;
        document.head.appendChild(styles);
    };

    // ===== INITIALISATION =====
    const init = () => {
        injectStyles();
        darkModeToggle.init();
        scrollProgress.init();
        backToTop.init();
        scrollAnimations.init();
        lazyLoading.init();
        // socialSharing.init(); // Désactivé par défaut, peut être activé si nécessaire
    };

    // Lancer au chargement du DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
