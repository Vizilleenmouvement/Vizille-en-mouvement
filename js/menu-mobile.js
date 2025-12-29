// ===== MENU MOBILE - Vizille en Mouvement =====

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav ul');

    if (menuToggle && nav) {
        // Créer le bouton fermer
        const closeBtn = document.createElement('button');
        closeBtn.className = 'menu-close';
        closeBtn.innerHTML = '✕';
        closeBtn.setAttribute('aria-label', 'Fermer le menu');

        // Ouvrir le menu
        menuToggle.addEventListener('click', function() {
            nav.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Ajouter le bouton fermer si pas déjà présent
            if (!nav.querySelector('.menu-close')) {
                nav.insertBefore(closeBtn, nav.firstChild);
            }
        });

        // Fermer le menu
        closeBtn.addEventListener('click', function() {
            nav.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Fermer le menu quand on clique sur un lien
        nav.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                nav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Fermer avec Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && nav.classList.contains('active')) {
                nav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});
