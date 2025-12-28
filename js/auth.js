/**
 * Module d'authentification - Vizille en Mouvement
 * Protection par mot de passe côté client
 *
 * ATTENTION: Cette protection est côté client et n'est pas sécurisée.
 * Elle sert uniquement à limiter l'accès temporairement pendant le développement.
 * Pour une vraie protection, utilisez une authentification côté serveur.
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        PASSWORD: '@@@@',  // Mot de passe (à changer en production)
        MAX_ATTEMPTS: 3,
        SESSION_KEY: 'vizille_auth',
        REDIRECT_URL: 'about:blank'
    };

    /**
     * Vérifie si l'utilisateur est déjà authentifié
     */
    function isAuthenticated() {
        return sessionStorage.getItem(CONFIG.SESSION_KEY) === 'true';
    }

    /**
     * Authentifie l'utilisateur
     */
    function authenticate() {
        sessionStorage.setItem(CONFIG.SESSION_KEY, 'true');
    }

    /**
     * Bloque l'accès
     */
    function blockAccess() {
        document.body.innerHTML = '';
        window.location.href = CONFIG.REDIRECT_URL;
    }

    /**
     * Demande le mot de passe à l'utilisateur
     */
    function promptPassword() {
        if (isAuthenticated()) {
            return; // Déjà authentifié
        }

        let attempts = 0;
        let authenticated = false;

        while (!authenticated && attempts < CONFIG.MAX_ATTEMPTS) {
            const input = prompt('Mot de passe requis pour accéder au site :');

            if (input === null) {
                // L'utilisateur a annulé
                blockAccess();
                return;
            }

            if (input === CONFIG.PASSWORD) {
                authenticated = true;
                authenticate();
            } else {
                attempts++;
                if (attempts < CONFIG.MAX_ATTEMPTS) {
                    alert('Mot de passe incorrect. Tentative ' + attempts + '/' + CONFIG.MAX_ATTEMPTS);
                } else {
                    alert('Trop de tentatives. Accès refusé.');
                    blockAccess();
                }
            }
        }

        if (!authenticated) {
            blockAccess();
        }
    }

    /**
     * Déconnecte l'utilisateur
     */
    function logout() {
        sessionStorage.removeItem(CONFIG.SESSION_KEY);
        window.location.reload();
    }

    // Exécution immédiate
    promptPassword();

    // Expose les fonctions utiles globalement
    window.VizilleAuth = {
        logout: logout,
        isAuthenticated: isAuthenticated
    };
})();
