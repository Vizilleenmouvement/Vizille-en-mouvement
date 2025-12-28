/**
 * Composants JavaScript partagés - Vizille en Mouvement
 */

(function() {
    'use strict';

    /**
     * Génère le HTML du header de navigation
     * @param {string} activePage - La page active ('accueil', 'bilan', 'projet', etc.)
     * @param {string} topText - Le texte affiché dans la barre supérieure
     * @returns {string} HTML du header
     */
    function generateHeader(activePage = '', topText = 'Vizille en Mouvement') {
        const pages = [
            { id: 'accueil', href: 'index.html', label: 'Accueil' },
            { id: 'bilan', href: 'bilan.html', label: 'Bilan' },
            { id: 'projet', href: 'projet.html', label: 'Projet' },
            { id: 'actualites', href: 'blog.html', label: 'Actualités' },
            { id: 'equipe', href: 'equipe.html', label: 'Équipe' },
            { id: 'contact', href: 'faq.html', label: 'Construisons ensemble' }
        ];

        const navItems = pages.map(page => {
            const isActive = page.id === activePage ? ' class="active"' : '';
            return `<li><a href="${page.href}"${isActive}>${page.label}</a></li>`;
        }).join('\n                    ');

        return `
    <header class="header">
        <div class="header-top">
            <p>${topText}</p>
        </div>

        <div class="header-main">
            <a href="index.html">
                <img src="images/logo.png" alt="Vizille en Mouvement" class="nav-header-logo">
            </a>
            <nav>
                <ul>
                    ${navItems}
                    <li><a href="admin.html" class="admin-link" title="Administration">⚙️</a></li>
                </ul>
            </nav>
        </div>
    </header>`;
    }

    /**
     * Génère le HTML du footer complet
     * @returns {string} HTML du footer
     */
    function generateFooter() {
        return `
    <footer>
        <div class="footer-grid">
            <div class="footer-brand">
                <img src="images/logo.png" alt="Vizille en Mouvement" style="height: 40px; filter: brightness(0) invert(1);">
                <p>Liste citoyenne pour les élections municipales 2026.<br>Ensemble pour une ville dynamique et solidaire.</p>
                <div class="social-links">
                    <a href="#" aria-label="Facebook">f</a>
                    <a href="#" aria-label="Instagram">◉</a>
                </div>
            </div>

            <div>
                <h4>Navigation</h4>
                <ul>
                    <li><a href="index.html">Accueil</a></li>
                    <li><a href="bilan.html">Bilan</a></li>
                    <li><a href="projet.html">Projet</a></li>
                    <li><a href="blog.html">Actualités</a></li>
                </ul>
            </div>

            <div>
                <h4>Informations</h4>
                <ul>
                    <li><a href="faq.html">Construisons ensemble</a></li>
                    <li><a href="equipe.html">L'Équipe</a></li>
                </ul>
            </div>

            <div>
                <h4>Liens</h4>
                <ul>
                    <li><a href="#">Mentions légales</a></li>
                    <li><a href="https://Vizilleenmouvement.github.io/test2/" target="_blank">Données ouvertes ↗</a></li>
                </ul>
            </div>
        </div>

        <div class="footer-bottom">
            <p>© 2025 Vizille en Mouvement – Campagne municipale 2026</p>
        </div>
    </footer>`;
    }

    /**
     * Génère le HTML du footer simplifié
     * @returns {string} HTML du footer simple
     */
    function generateSimpleFooter() {
        return `
    <footer class="footer">
        <p class="footer-slogan">« Ensemble pour une ville dynamique et solidaire »</p>
        <p>© 2025 Vizille en Mouvement</p>
    </footer>`;
    }

    /**
     * Injecte le header dans la page
     * @param {string} activePage - La page active
     * @param {string} topText - Le texte de la barre supérieure
     */
    function injectHeader(activePage, topText) {
        const placeholder = document.getElementById('header-placeholder');
        if (placeholder) {
            placeholder.outerHTML = generateHeader(activePage, topText);
        }
    }

    /**
     * Injecte le footer dans la page
     * @param {boolean} simple - Utiliser le footer simplifié
     */
    function injectFooter(simple = false) {
        const placeholder = document.getElementById('footer-placeholder');
        if (placeholder) {
            placeholder.outerHTML = simple ? generateSimpleFooter() : generateFooter();
        }
    }

    /**
     * Formate une date en français
     * @param {string} dateStr - Date au format ISO
     * @returns {string} Date formatée
     */
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    /**
     * Formate un montant en euros
     * @param {number} amount - Montant
     * @returns {string} Montant formaté
     */
    function formatCurrency(amount) {
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(1).replace('.', ',') + ' M€';
        } else if (amount >= 1000) {
            return (amount / 1000).toFixed(0) + ' k€';
        }
        return amount.toLocaleString('fr-FR') + ' €';
    }

    /**
     * Debounce une fonction
     * @param {Function} func - Fonction à debounce
     * @param {number} wait - Délai en ms
     * @returns {Function} Fonction debounced
     */
    function debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Expose les fonctions globalement
    window.VizilleComponents = {
        generateHeader,
        generateFooter,
        generateSimpleFooter,
        injectHeader,
        injectFooter,
        formatDate,
        formatCurrency,
        debounce
    };

})();
