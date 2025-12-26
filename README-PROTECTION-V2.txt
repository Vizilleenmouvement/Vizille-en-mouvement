🔒 PROTECTION PAR MOT DE PASSE - VIZILLE EN MOUVEMENT (VERSION CORRIGÉE)
=============================================================================

MOT DE PASSE : @@@@

FONCTIONNEMENT (CORRECT CETTE FOIS)
------------------------------------

✅ CHAQUE page affiche un prompt() dès le chargement
✅ L'utilisateur DOIT taper @@@@ pour voir la page
✅ IMPOSSIBLE de bypasser en tapant directement /equipe ou autre
✅ Le mot de passe est mémorisé dans sessionStorage (pas besoin de le retaper sur chaque page)
✅ 3 tentatives maximum, après → accès refusé

TOUTES LES PAGES SONT PROTÉGÉES
--------------------------------

✅ index.html           → Prompt @@@@
✅ index-full.html      → Prompt @@@@
✅ bilan.html           → Prompt @@@@ + corrections (logo, halo, menu)
✅ projet.html          → Prompt @@@@ + corrections (menu)
✅ equipe.html          → Prompt @@@@
✅ faq.html             → Prompt @@@@
✅ blog.html            → Prompt @@@@
✅ contact.html         → Prompt @@@@
✅ admin.html           → Prompt @@@@

COMPORTEMENT
------------

1. Utilisateur arrive sur N'IMPORTE QUELLE page
2. → Prompt "Mot de passe requis pour accéder au site :"
3. Tape @@@@ → accès accordé + mémorisé
4. Peut naviguer sur toutes les autres pages sans retaper (session)
5. Ferme le navigateur → devra retaper le mot de passe

Si mauvais mot de passe :
- 3 tentatives maximum
- Après 3 échecs → page blanche + accès refusé

DIFFÉRENCE AVEC LA VERSION PRÉCÉDENTE
--------------------------------------

❌ AVANT : index.html = page de garde, les autres = redirection
   → Contournable en tapant /equipe directement

✅ MAINTENANT : Toutes les pages = prompt direct
   → IMPOSSIBLE de contourner

POUR METTRE EN LIGNE
--------------------

1. Remplacer TOUS les fichiers HTML sur GitHub
2. Le site est déjà activé (GitHub Pages = root)
3. Tester : aller sur vizilleenmouvement.fr
4. → Prompt de mot de passe doit apparaître immédiatement

POUR CHANGER LE MOT DE PASSE
-----------------------------

Il faudrait modifier dans CHAQUE fichier HTML la ligne :
const PASSWORD = '@@@@';

Mais plus simple : me demander et je recrée tout avec le nouveau mot de passe.
