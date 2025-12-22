# Mise à jour "Construisons ensemble" - Vizille en Mouvement

## Résumé des modifications

### 1. Fusion des pages
- **faq.html** = ancienne page "Vos questions" + contenu de "Contact"
- **contact.html** → À SUPPRIMER (n'est plus nécessaire)

### 2. Nouvelle structure de faq.html
La page "Construisons ensemble" contient maintenant :
1. Formulaire de participation (avec sélecteur de sujet)
2. Questions & Réponses (alimentées par faq.json)
3. Section "Nous contacter" avec :
   - Infos pratiques (adresse, téléphone, email)
   - Permanences
   - Réseaux sociaux (Facebook, Instagram)
4. Boutons d'engagement :
   - 🤝 Rejoindre l'équipe
   - 📅 Demander une rencontre
   - 💡 Proposer une idée

### 3. Menu mis à jour
**Avant :**
Accueil | Bilan | Projet | Actualités | Équipe | Vos questions | Contact | ⚙️

**Après :**
Accueil | Bilan | Projet | Actualités | Équipe | Construisons ensemble | ⚙️

### 4. Fichiers modifiés
- ✅ index.html
- ✅ bilan.html
- ✅ projet.html
- ✅ blog.html
- ✅ equipe.html
- ✅ faq.html (refait entièrement)
- ✅ admin.html (onglet et descriptions mis à jour)

### 5. À faire après déploiement

1. **Supprimer contact.html** de ton repo GitHub

2. **Ajouter les URLs des réseaux sociaux** dans config.json :
```json
{
  "facebook": "https://facebook.com/...",
  "instagram": "https://instagram.com/..."
}
```

### 6. Notes techniques
- Les réseaux sociaux sont chargés dynamiquement depuis config.json
- Les boutons "Rejoindre l'équipe", etc. pré-sélectionnent le sujet dans le formulaire
- Le formulaire envoie toujours vers Formspree (même endpoint)

---
Généré le 22 décembre 2025
