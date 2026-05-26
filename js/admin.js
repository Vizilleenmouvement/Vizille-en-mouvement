// ===== CONFIGURATION =====
const GITHUB_CONFIG = {
    owner: 'Vizilleenmouvement',
    repo: 'Vizille-en-mouvement',
    branch: 'main'
};
// Mode de stockage
const storageMode = 'github'; // Mode unique (GitHub)

// Mot de passe par défaut: vizille2026
const DEFAULT_PASSWORD_HASH = 'YXQ0dml6aWxsZTIwMjY2NDczMTI5MDEx';

// ===== AUTHENTIFICATION =====
function simpleHash(str) {
    // Hash simple pour ne pas stocker en clair
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return btoa('at4' + str + hash + '1');
}

function checkPassword() {
    const input = document.getElementById('login-password').value;
    const storedHash = localStorage.getItem('vizille_admin_password') || DEFAULT_PASSWORD_HASH;
    const inputHash = simpleHash(input);
    
    if (inputHash === storedHash) {
        document.getElementById('login-overlay').classList.add('hidden');
        document.getElementById('login-error').textContent = '';
        loadAllData();
    } else {
        document.getElementById('login-error').textContent = '❌ Mot de passe incorrect';
        document.getElementById('login-password').value = '';
    }
}

function changePassword() {
    const oldPwd = document.getElementById('old-password').value;
    const newPwd = document.getElementById('new-password').value;
    const confirmPwd = document.getElementById('confirm-password').value;
    
    // Vérifier l'ancien mot de passe
    const storedHash = localStorage.getItem('vizille_admin_password') || DEFAULT_PASSWORD_HASH;
    if (simpleHash(oldPwd) !== storedHash) {
        showToast('❌ Ancien mot de passe incorrect', 'error');
        return;
    }
    
    // Vérifier la confirmation
    if (newPwd !== confirmPwd) {
        showToast('❌ Les mots de passe ne correspondent pas', 'error');
        return;
    }
    
    // Vérifier la longueur
    if (newPwd.length < 3) {
        showToast('❌ Mot de passe trop court (min 3 caractères)', 'error');
        return;
    }
    
    // Sauvegarder le nouveau mot de passe
    localStorage.setItem('vizille_admin_password', simpleHash(newPwd));
    
    // Vider les champs
    document.getElementById('old-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    
    showToast('✅ Mot de passe changé !', 'success');
}

const THEMES_PROJETS = [
    { value: 'urbanisme', label: '🏗️ Urbanisme' },
    { value: 'sante', label: '🏥 Santé' },
    { value: 'environnement', label: '🌱 Environnement' },
    { value: 'culture', label: '🎭 Culture' },
    { value: 'patrimoine', label: '🏛️ Patrimoine' },
    { value: 'enfance', label: '👶 Enfance' },
    { value: 'solidarite', label: '🤝 Solidarité' },
    { value: 'sport', label: '⚽ Sport' },
    { value: 'economie', label: '💼 Économie' },
    { value: 'intercommunalite', label: '🏛️ Intercommunalité' },
    { value: 'tranquillite', label: '🛡️ Tranquillité' },
    { value: 'mobilites', label: '🚲 Mobilités' },
    { value: 'finances', label: '💰 Finances' }
];

const THEMES_ACTIONS = [
    { value: 'Urbanisme', label: '🏗️ Urbanisme' },
    { value: 'Santé', label: '🏥 Santé' },
    { value: 'Environnement', label: '🌱 Environnement' },
    { value: 'Culture', label: '🎭 Culture' },
    { value: 'Patrimoine', label: '🏛️ Patrimoine' },
    { value: 'Enfance', label: '👶 Enfance' },
    { value: 'Solidarité', label: '🤝 Solidarité' },
    { value: 'Sport', label: '⚽ Sport' },
    { value: 'Économie', label: '💼 Économie' },
    { value: 'Intercommunalité', label: '🏙️ Intercommunalité' },
    { value: 'Tranquillité publique', label: '🛡️ Tranquillité publique' },
    { value: 'Mobilités', label: '🚲 Mobilités' },
    { value: 'Finance', label: '💰 Finance' },
    { value: 'Travaux', label: '🏗️ Travaux' },
    { value: 'Administration', label: '📋 Administration' },
    { value: 'Jumelages', label: '🌍 Jumelages' },
    { value: 'Personnel', label: '👥 Personnel' },
    { value: 'Plan Climat', label: '🌍 Plan Climat' },
    { value: 'Concertation Citoyenne', label: '🗳️ Concertation' }
];

// Configuration des 5 catégories principales
const CATEGORIES_ADMIN = [
    { id: 'cadre-vie', name: 'Cadre de vie', icon: '🌿', themes: ['Environnement', 'Plan Climat', 'Urbanisme', 'Travaux', 'Mobilités'] },
    { id: 'social', name: 'Social', icon: '🤝', themes: ['Solidarité', 'Enfance', 'Santé', 'Personnel'] },
    { id: 'culture', name: 'Culture & Patrimoine', icon: '🎭', themes: ['Culture', 'Patrimoine', 'Jumelages'] },
    { id: 'sport', name: 'Sport', icon: '⚽', themes: ['Sport'] },
    { id: 'municipal', name: 'Municipal', icon: '🏛️', themes: ['Administration', 'Finance', 'Intercommunalité', 'Concertation Citoyenne'] },
    { id: 'securite', name: 'Tranquillité', icon: '🛡️', themes: ['Tranquillité publique', 'Économie'] }
];

let currentCategoryFilter = null;

// ===== SÉCURITÉ : NETTOYAGE BASE64 =====
// Fonction pour détecter et supprimer les données base64 avant sauvegarde
function cleanBase64FromData(obj) {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
        // Supprimer toute chaîne qui ressemble à du base64 d'image
        if (obj.startsWith('data:image')) {
            console.warn('⚠️ Base64 détecté et supprimé:', obj.substring(0, 50) + '...');
            return ''; // Retourner une chaîne vide
        }
        // Détecter aussi les chemins file:// locaux
        if (obj.startsWith('file://')) {
            console.warn('⚠️ Chemin local détecté et supprimé:', obj);
            return '';
        }
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => cleanBase64FromData(item));
    }

    if (typeof obj === 'object') {
        const cleaned = {};
        for (const key in obj) {
            cleaned[key] = cleanBase64FromData(obj[key]);
        }
        return cleaned;
    }

    return obj;
}

// ===== COMPRESSION IMAGES =====
// Compresse et redimensionne les images avant upload.
// Les PNG restent en PNG (transparence préservée), tout autre format devient JPEG.
async function compressImage(file, maxWidth = 1920, quality = 0.85) {
    return new Promise((resolve, reject) => {
        // Si ce n'est pas une image, retourner tel quel
        if (!file.type.startsWith('image/')) {
            resolve(file);
            return;
        }

        // PNG : on garde le format pour préserver la transparence
        const isPng = file.type === 'image/png';
        const outputType = isPng ? 'image/png' : 'image/jpeg';
        const outputExt = isPng ? '.png' : '.jpg';

        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            let { width, height } = img;

            // Redimensionner si trop large
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            // Dessiner l'image redimensionnée
            ctx.drawImage(img, 0, 0, width, height);

            // Convertir en blob (PNG sans perte ou JPEG compressé selon le format d'origine)
            // Note : pour le PNG, le paramètre quality est ignoré par toBlob.
            canvas.toBlob((blob) => {
                if (blob) {
                    // Si la "compression" PNG a augmenté la taille (cas rare quand
                    // l'original était déjà optimisé et qu'on n'a pas redimensionné),
                    // on garde l'original.
                    if (isPng && width === img.naturalWidth && blob.size > file.size) {
                        console.log(`🗜️ PNG conservé tel quel (recompression défavorable: ${(file.size/1024).toFixed(0)} Ko → ${(blob.size/1024).toFixed(0)} Ko)`);
                        resolve(file);
                        return;
                    }
                    const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, outputExt), {
                        type: outputType,
                        lastModified: Date.now()
                    });
                    const fmt = isPng ? 'PNG' : 'JPEG';
                    console.log(`🗜️ Image compressée (${fmt}): ${(file.size/1024).toFixed(0)} Ko → ${(blob.size/1024).toFixed(0)} Ko (${Math.round((1-blob.size/file.size)*100)}% réduit)`);
                    resolve(compressedFile);
                } else {
                    resolve(file); // Fallback si échec
                }
            }, outputType, quality);
        };

        img.onerror = () => resolve(file); // Fallback si erreur

        // Charger l'image depuis le fichier
        const reader = new FileReader();
        reader.onload = (e) => { img.src = e.target.result; };
        reader.onerror = () => resolve(file);
        reader.readAsDataURL(file);
    });
}

// ===== DONNÉES =====
let data = {
    projets: [],
    themes: [],
    actions: [],
    candidats: [],
    faq: [],
    articles: [],
    abonnes: [],
    medias: {
        albums: [],
        photos: [],
        presse: [],
        videos: [],
        documents: [],
        categoriesAlbums: {
            campagne: [
                { id: "reunion", label: "Réunions", icon: "🎤" },
                { id: "marche", label: "Marchés", icon: "🛒" },
                { id: "porte-a-porte", label: "Porte-à-porte", icon: "🚪" },
                { id: "rencontre", label: "Rencontres", icon: "🤝" },
                { id: "evenement", label: "Événements", icon: "📅" },
                { id: "autre", label: "Autre", icon: "📷" }
            ],
            bilan: [
                { id: "environnement", label: "Environnement", icon: "🌿" },
                { id: "culture", label: "Culture", icon: "🎭" },
                { id: "sport", label: "Sport", icon: "⚽" },
                { id: "sante", label: "Santé", icon: "🏥" },
                { id: "solidarite", label: "Solidarité", icon: "🤝" },
                { id: "enfance", label: "Enfance", icon: "👶" },
                { id: "urbanisme", label: "Urbanisme", icon: "🏘️" },
                { id: "mobilites", label: "Mobilités", icon: "🚲" },
                { id: "patrimoine", label: "Patrimoine", icon: "🏛️" },
                { id: "securite", label: "Tranquillité", icon: "🛡️" },
                { id: "economie", label: "Économie", icon: "💼" }
            ],
            objectifs: [
                { id: "transition", label: "Transition écologique", icon: "🌱" },
                { id: "cadre-vie", label: "Cadre de vie", icon: "🏡" },
                { id: "services", label: "Services publics", icon: "🏛️" }
            ]
        }
    },
    config: {
        email: '',
        telephone: '',
        adresse: '',
        facebook: '',
        instagram: '',
        twitter: '',
        autre: '',
        permanences: '',
        slogan: 'Vos questions pour une ville dynamique et solidaire'
    }
};

let currentEdit = { type: null, index: null };
let pendingPhoto = null;
let currentPreviewType = null; // 'projet', 'article', 'action', etc.
// ===== PRÉVISUALISATION =====
function previewCurrentItem() {
    // Détecter le type d'élément en cours d'édition
    const modalTitle = document.getElementById('modal-title').textContent;

    if (modalTitle.includes('projet')) {
        previewProjet();
    } else if (modalTitle.includes('article')) {
        previewArticle();
    } else if (modalTitle.includes('action')) {
        previewAction();
    } else if (modalTitle.includes('candidat')) {
        previewCandidat();
    } else {
        showToast('Prévisualisation non disponible pour cet élément', 'info');
        return;
    }

    document.getElementById('modal-preview-overlay').classList.add('active');
}

function previewProjet() {
    currentPreviewType = 'projet';
    const titre = document.getElementById('edit-titre')?.value || 'Sans titre';
    const resume = document.getElementById('edit-resume')?.value || '';
    const description = document.getElementById('edit-description')?.value || '';
    const statut = document.getElementById('edit-statut')?.value || 'Programmé';
    const annee = document.getElementById('edit-annee')?.value || '';
    const budget = document.getElementById('edit-budget')?.value || '';
    const image = document.getElementById('edit-image')?.value || '';

    // Récupérer les thèmes sélectionnés
    const selectedThemes = [];
    document.querySelectorAll('.theme-badge-select.selected').forEach(badge => {
        selectedThemes.push({
            theme: badge.dataset.theme,
            color: badge.dataset.color
        });
    });

    const primaryTheme = selectedThemes[0] || { theme: 'Non défini', color: '#1a3a5c' };

    const statutColors = {
        'Prioritaire': '#e74c3c',
        'Court terme': '#f39c12',
        'Programmé': '#27ae60',
        'Étude': '#9b59b6',
        'En cours': '#3498db'
    };

    let themeBadgesHTML = selectedThemes.map(t =>
        `<span style="background: ${t.color}; color: white; padding: 4px 12px; border-radius: 15px; font-size: 0.85rem; margin-right: 5px;">${t.theme}</span>`
    ).join('');

    let imageHTML = '';
    if (image) {
        imageHTML = `
            <div style="margin-bottom: 1.5rem; text-align: center;">
                <img src="${image}" alt="${titre}" style="max-width: 100%; max-height: 300px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            </div>
        `;
    }

    document.getElementById('preview-body').innerHTML = `
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, ${primaryTheme.color} 0%, ${adjustColorPreview(primaryTheme.color, -30)} 100%); color: white; padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div>${themeBadgesHTML || '<span style="opacity: 0.7;">Aucun thème</span>'}</div>
                    <span style="background: ${statutColors[statut] || '#27ae60'}; padding: 6px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">${statut}</span>
                </div>
                <h2 style="font-size: 1.8rem; margin: 0; font-weight: 700;">${titre}</h2>
            </div>
            <div style="padding: 1.5rem;">
                ${imageHTML}
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 10px; text-align: center;">
                        <div style="color: #888; font-size: 0.85rem;">📅 Horizon</div>
                        <div style="font-size: 1.2rem; font-weight: 600; color: var(--bleu);">${annee || 'À définir'}</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 10px; text-align: center;">
                        <div style="color: #888; font-size: 0.85rem;">💰 Budget estimé</div>
                        <div style="font-size: 1.2rem; font-weight: 600; color: var(--bleu);">${budget ? budget.toLocaleString('fr-FR') + ' €' : 'En évaluation'}</div>
                    </div>
                </div>
                ${resume ? `<p style="font-size: 1.1rem; color: #333; line-height: 1.7; margin-bottom: 1rem; font-weight: 500;">${resume}</p>` : ''}
                ${description ? `<p style="color: #555; line-height: 1.7;">${description}</p>` : ''}
            </div>
        </div>
        <p style="text-align: center; margin-top: 1rem; color: #888; font-size: 0.9rem;">
            ℹ️ Aperçu de la fiche projet telle qu'elle apparaîtra sur le site
        </p>
    `;
}

function previewArticle() {
    currentPreviewType = 'article';
    const titre = document.getElementById('edit-titre')?.value || 'Sans titre';
    const contenu = document.getElementById('edit-contenu')?.value || '';
    const categorie = document.getElementById('edit-categorie')?.value || '';
    const date = document.getElementById('edit-date')?.value || new Date().toISOString().split('T')[0];
    const image = document.getElementById('edit-image')?.value || '';

    const dateFormatee = new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    let imageHTML = image ? `<img src="${image}" alt="${titre}" style="width: 100%; height: 200px; object-fit: cover;">` :
        `<div style="width: 100%; height: 200px; background: linear-gradient(135deg, var(--bleu) 0%, var(--bleu-clair) 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">📰</div>`;

    document.getElementById('preview-body').innerHTML = `
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto;">
            ${imageHTML}
            <div style="padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                    ${categorie ? `<span style="background: var(--or); color: var(--bleu); padding: 4px 12px; border-radius: 15px; font-size: 0.8rem; font-weight: 600;">${categorie}</span>` : '<span></span>'}
                    <span style="color: #888; font-size: 0.85rem;">${dateFormatee}</span>
                </div>
                <h3 style="font-size: 1.3rem; color: var(--bleu); margin-bottom: 0.75rem; font-weight: 700;">${titre}</h3>
                <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">${contenu.substring(0, 150)}${contenu.length > 150 ? '...' : ''}</p>
                <div style="margin-top: 1rem; text-align: right;">
                    <span style="color: var(--bleu); font-weight: 600; font-size: 0.9rem;">Lire la suite →</span>
                </div>
            </div>
        </div>
        <p style="text-align: center; margin-top: 1rem; color: #888; font-size: 0.9rem;">
            ℹ️ Aperçu de la carte article telle qu'elle apparaîtra sur le site
        </p>
    `;
}

function previewAction() {
    currentPreviewType = 'action';
    const titre = document.getElementById('edit-titre')?.value || 'Sans titre';
    const statut = document.getElementById('edit-statut')?.value || 'En cours';
    const theme = document.getElementById('edit-theme')?.value || '';

    const statutColors = {
        'Réalisé': '#27ae60',
        'En cours': '#f39c12',
        'Prévu': '#3498db'
    };

    document.getElementById('preview-body').innerHTML = `
        <div style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <span style="background: #e0e0e0; padding: 4px 12px; border-radius: 15px; font-size: 0.85rem;">${theme || 'Sans thème'}</span>
                <span style="background: ${statutColors[statut] || '#888'}; color: white; padding: 6px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">${statut}</span>
            </div>
            <h3 style="font-size: 1.2rem; color: var(--bleu); margin: 0;">${titre}</h3>
        </div>
        <p style="text-align: center; margin-top: 1rem; color: #888; font-size: 0.9rem;">
            ℹ️ Aperçu de l'action telle qu'elle apparaîtra dans le bilan
        </p>
    `;
}

function previewCandidat() {
    currentPreviewType = 'candidat';
    const nom = document.getElementById('edit-nom')?.value || 'Nom du candidat';
    const role = document.getElementById('edit-role')?.value || '';
    const delegation = document.getElementById('edit-delegation')?.value || '';
    const bio = document.getElementById('edit-bio')?.value || '';
    const pedigree = document.getElementById('edit-pedigree')?.value || '';
    const objectifs = document.getElementById('edit-objectifs')?.value || '';
    const citation = document.getElementById('edit-citation')?.value || '';
    const email = document.getElementById('edit-email')?.value || '';
    const facebook = document.getElementById('edit-facebook')?.value || '';
    const linkedin = document.getElementById('edit-linkedin')?.value || '';
    const twitter = document.getElementById('edit-twitter')?.value || '';

    // Récupérer la photo depuis la prévisualisation
    const photoPreviewImg = document.getElementById('photo-preview-img');
    const photoUrl = photoPreviewImg?.src || '';
    const hasPhoto = photoUrl && !photoUrl.includes('undefined') && photoPreviewImg?.parentElement?.classList?.contains('active');

    // Construire les liens sociaux
    let socialLinks = '';
    if (email) socialLinks += `<a href="mailto:${email}" style="color: var(--bleu); margin-right: 10px; font-size: 1.2rem;" title="Email">📧</a>`;
    if (facebook) socialLinks += `<a href="${facebook}" target="_blank" rel="noopener" style="color: #1877f2; margin-right: 10px; font-size: 1.2rem;" title="Facebook">📘</a>`;
    if (linkedin) socialLinks += `<a href="${linkedin}" target="_blank" rel="noopener" style="color: #0077b5; margin-right: 10px; font-size: 1.2rem;" title="LinkedIn">💼</a>`;
    if (twitter) socialLinks += `<a href="${twitter}" target="_blank" rel="noopener" style="color: #1da1f2; margin-right: 10px; font-size: 1.2rem;" title="Twitter">🐦</a>`;

    const photoHTML = hasPhoto
        ? `<img src="${photoUrl}" alt="${nom}" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 4px solid var(--or); box-shadow: 0 4px 15px rgba(0,0,0,0.2);">`
        : `<div style="width: 150px; height: 150px; border-radius: 50%; background: linear-gradient(135deg, var(--bleu) 0%, var(--bleu-clair) 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem; border: 4px solid var(--or);">👤</div>`;

    document.getElementById('preview-body').innerHTML = `
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, var(--bleu) 0%, var(--bleu-clair) 100%); padding: 2rem; text-align: center;">
                ${photoHTML}
                <h2 style="color: white; margin: 1rem 0 0.25rem; font-size: 1.5rem;">${nom}</h2>
                ${role ? `<p style="color: var(--or); font-weight: 600; margin: 0;">${role}</p>` : ''}
                ${delegation ? `<p style="color: rgba(255,255,255,0.8); font-size: 0.9rem; margin: 0.25rem 0 0;">${delegation}</p>` : ''}
            </div>
            <div style="padding: 1.5rem;">
                ${citation ? `
                    <blockquote style="border-left: 4px solid var(--or); padding-left: 1rem; margin: 0 0 1.5rem; font-style: italic; color: #555;">
                        "${citation}"
                    </blockquote>
                ` : ''}

                ${bio ? `
                    <div style="margin-bottom: 1rem;">
                        <h4 style="color: var(--bleu); margin-bottom: 0.5rem; font-size: 0.95rem;">📝 Présentation</h4>
                        <p style="color: #555; line-height: 1.6; font-size: 0.95rem; margin: 0;">${bio}</p>
                    </div>
                ` : ''}

                ${pedigree ? `
                    <div style="margin-bottom: 1rem;">
                        <h4 style="color: var(--bleu); margin-bottom: 0.5rem; font-size: 0.95rem;">🎓 Parcours</h4>
                        <p style="color: #555; line-height: 1.6; font-size: 0.95rem; margin: 0;">${pedigree}</p>
                    </div>
                ` : ''}

                ${objectifs ? `
                    <div style="margin-bottom: 1rem;">
                        <h4 style="color: var(--bleu); margin-bottom: 0.5rem; font-size: 0.95rem;">🎯 Mes priorités</h4>
                        <p style="color: #555; line-height: 1.6; font-size: 0.95rem; margin: 0;">${objectifs}</p>
                    </div>
                ` : ''}

                ${socialLinks ? `
                    <div style="border-top: 1px solid #eee; padding-top: 1rem; text-align: center;">
                        ${socialLinks}
                    </div>
                ` : ''}
            </div>
        </div>
        <p style="text-align: center; margin-top: 1rem; color: #888; font-size: 0.9rem;">
            ℹ️ Aperçu de la fiche candidat telle qu'elle apparaîtra sur le site
        </p>
    `;
}

function closePreview(event) {
    if (event.target.id === 'modal-preview-overlay') {
        closePreviewModal();
    }
}

function closePreviewModal() {
    document.getElementById('modal-preview-overlay').classList.remove('active');
}

function saveCurrentItem() {
    // Déclencher le clic sur le bouton Enregistrer
    document.getElementById('modal-save').click();
}

function adjustColorPreview(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// ===== MODE LOCAL =====
let localMode = false;

function toggleLocalMode() {
    localMode = !localMode;
    const btn = document.getElementById('mode-toggle');
    const icon = document.getElementById('mode-icon');
    const text = document.getElementById('mode-text');
    const downloadBtn = document.getElementById('download-btn');
    const tokenInput = document.getElementById('github-token');

    // En mode local, les boutons Publier utilisent l'API locale automatiquement
    // Plus besoin de masquer/afficher différents boutons
    document.querySelectorAll('.local-only').forEach(el => {
        el.style.display = 'none'; // On n'utilise plus les boutons local-only séparés
    });

    if (localMode) {
        btn.style.background = '#fd7e14';
        icon.textContent = '💻';
        text.textContent = 'Local';
        downloadBtn.style.display = 'inline-block';
        tokenInput.style.display = 'none';
        tokenInput.nextElementSibling.style.display = 'none'; // Bouton œil
        showToast('💻 Mode local activé - Chargement des fichiers locaux...', 'info');
        loadLocalData();
    } else {
        btn.style.background = '#17a2b8';
        icon.textContent = '🌐';
        text.textContent = 'GitHub';
        downloadBtn.style.display = 'none';
        tokenInput.style.display = 'block';
        tokenInput.nextElementSibling.style.display = 'inline-block'; // Bouton œil
        showToast('🌐 Mode GitHub activé - Chargement depuis GitHub...', 'info');
        loadAllData();
    }
}

async function loadLocalData() {
    showToast('⏳ Chargement des fichiers locaux...', 'info');

    // Réinitialiser les données
    data.projets = [];
    data.themes = [];
    data.actions = [];
    data.candidats = [];
    data.faq = [];
    data.articles = [];
    data.abonnes = [];
    data.medias = {
        albums: [],
        photos: [],
        presse: [],
        videos: [],
        documents: [],
        categoriesAlbums: {
            campagne: [
                { id: "reunion", label: "Réunions", icon: "🎤" },
                { id: "marche", label: "Marchés", icon: "🛒" },
                { id: "porte-a-porte", label: "Porte-à-porte", icon: "🚪" },
                { id: "rencontre", label: "Rencontres", icon: "🤝" },
                { id: "evenement", label: "Événements", icon: "📅" },
                { id: "autre", label: "Autre", icon: "📷" }
            ],
            bilan: [
                { id: "environnement", label: "Environnement", icon: "🌿" },
                { id: "culture", label: "Culture", icon: "🎭" },
                { id: "sport", label: "Sport", icon: "⚽" },
                { id: "sante", label: "Santé", icon: "🏥" },
                { id: "solidarite", label: "Solidarité", icon: "🤝" },
                { id: "enfance", label: "Enfance", icon: "👶" },
                { id: "urbanisme", label: "Urbanisme", icon: "🏘️" },
                { id: "mobilites", label: "Mobilités", icon: "🚲" },
                { id: "patrimoine", label: "Patrimoine", icon: "🏛️" },
                { id: "securite", label: "Tranquillité", icon: "🛡️" },
                { id: "economie", label: "Économie", icon: "💼" }
            ],
            objectifs: [
                { id: "transition", label: "Transition écologique", icon: "🌱" },
                { id: "cadre-vie", label: "Cadre de vie", icon: "🏡" },
                { id: "services", label: "Services publics", icon: "🏛️" }
            ]
        }
    };

    const files = {
        projets: 'projets.json',
        themes: 'themes.json',
        actions: 'actions.json',
        candidats: 'candidats.json',
        faq: 'faq.json',
        articles: 'articles.json',
        abonnes: 'abonnes.json',
        config: 'config.json',
        medias: 'medias.json'
    };

    // Charger TOUS les fichiers en parallèle
    const entries = Object.entries(files);
    entries.forEach(([key]) => setStatus(key, 'loading', '⏳...'));

    const results = await Promise.allSettled(
        entries.map(async ([key, file]) => {
            const response = await fetch(file + '?t=' + Date.now());
            if (!response.ok) throw new Error(`${response.status}`);
            return { key, file, loaded: await response.json() };
        })
    );

    results.forEach((result, i) => {
        const [key, file] = entries[i];
        if (result.status === 'fulfilled') {
            const { loaded } = result.value;
            if (key === 'config') {
                data.config = { ...data.config, ...loaded };
            } else if (key === 'themes') {
                data.themes = loaded;
                THEMES_CONFIG = [...loaded];
            } else {
                data[key] = loaded;
            }
            setStatus(key, 'saved', '✓ Local');
        } else {
            console.warn(`Fichier ${file} non trouvé localement`);
            setStatus(key, 'saved', '⚠️ Absent');
        }
    });

    renderAll();
    showToast('✅ Données locales chargées !', 'success');
}

async function downloadAllData() {
    const filesToSave = [
        { name: 'articles.json', data: data.articles },
        { name: 'projets.json', data: data.projets },
        { name: 'candidats.json', data: data.candidats },
        { name: 'faq.json', data: data.faq },
        { name: 'medias.json', data: data.medias },
        { name: 'abonnes.json', data: data.abonnes }
    ];

    // Si on est sur localhost, sauvegarder via l'API du serveur
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        showToast('⏳ Sauvegarde en cours...', 'info');
        let success = 0;
        let errors = [];

        for (const file of filesToSave) {
            try {
                const response = await fetch(`/api/save/${file.name}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(file.data)
                });
                if (response.ok) {
                    success++;
                } else {
                    const err = await response.json();
                    errors.push(`${file.name}: ${err.error}`);
                }
            } catch (err) {
                errors.push(`${file.name}: ${err.message}`);
            }
        }

        if (errors.length === 0) {
            showToast(`✅ ${success} fichiers publiés avec succès !`, 'success');
        } else {
            showToast(`⚠️ ${success} OK, ${errors.length} erreurs`, 'warning');
            console.error('Erreurs:', errors);
        }
        return;
    }

    // Fallback : téléchargement classique si pas en local
    filesToSave.forEach(file => {
        const blob = new Blob([JSON.stringify(file.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
    });

    showToast('💾 Fichiers JSON téléchargés !', 'success');
}

async function downloadSingleFile(filename, dataKey) {
    const content = dataKey === 'medias' ? data.medias : data[dataKey];

    // Si on est sur localhost avec le serveur de dev, sauvegarder directement
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        try {
            showToast(`⏳ Sauvegarde de ${filename}...`, 'info');
            const response = await fetch(`/api/save/${filename}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(content)
            });

            if (response.ok) {
                showToast(`✅ ${filename} publié !`, 'success');
                setStatus(dataKey, 'saved', '✓ À jour');
                return;
            } else {
                const err = await response.json();
                throw new Error(err.error || 'Erreur serveur');
            }
        } catch (err) {
            console.error('Erreur sauvegarde locale:', err);
            showToast(`⚠️ Serveur non disponible, téléchargement...`, 'warning');
            // Fallback vers téléchargement
        }
    }

    // Fallback : téléchargement classique
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`💾 ${filename} téléchargé !`, 'success');
}

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    loadToken();
    // Détecter si on est en local (file:// ou localhost)
    if (location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        // Activer automatiquement le mode local
        toggleLocalMode();
    } else {
        loadAllData();
    }
});

function setupTabs() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
            // Initialize visual editor when Pages tab is selected
            if (tab.dataset.tab === 'pages') {
                setupVisualEditor();
            }
        });
    });
}

// ===== TOKEN =====
function loadToken() {
    const saved = localStorage.getItem('vizille_github_token');
    if (saved) document.getElementById('github-token').value = saved;
}

function saveToken() {
    const token = document.getElementById('github-token').value;
    localStorage.setItem('vizille_github_token', token);
    showToast('🔐 Token sauvegardé', 'success');
}

function toggleToken() {
    const input = document.getElementById('github-token');
    input.type = input.type === 'password' ? 'text' : 'password';
}

function getToken() {
    return document.getElementById('github-token').value;
}

// ===== CHARGEMENT DONNÉES =====
async function loadAllData() {
                showToast('⏳ Chargement des données depuis GitHub...', 'info');

    // Réinitialiser les données pour éviter les doublons
    data.projets = [];
    data.themes = [];
    data.actions = [];
    data.candidats = [];
    data.faq = [];
    data.articles = [];
    data.abonnes = [];
    data.medias = {
        albums: [],
        photos: [],
        presse: [],
        videos: [],
        documents: [],
        bobines: [],
        categoriesAlbums: {
            campagne: [
                { id: "reunion", label: "Réunions", icon: "🎤" },
                { id: "marche", label: "Marchés", icon: "🛒" },
                { id: "porte-a-porte", label: "Porte-à-porte", icon: "🚪" },
                { id: "rencontre", label: "Rencontres", icon: "🤝" },
                { id: "evenement", label: "Événements", icon: "📅" },
                { id: "autre", label: "Autre", icon: "📷" }
            ],
            bilan: [
                { id: "environnement", label: "Environnement", icon: "🌿" },
                { id: "culture", label: "Culture", icon: "🎭" },
                { id: "sport", label: "Sport", icon: "⚽" },
                { id: "sante", label: "Santé", icon: "🏥" },
                { id: "solidarite", label: "Solidarité", icon: "🤝" },
                { id: "enfance", label: "Enfance", icon: "👶" },
                { id: "urbanisme", label: "Urbanisme", icon: "🏘️" },
                { id: "mobilites", label: "Mobilités", icon: "🚲" },
                { id: "patrimoine", label: "Patrimoine", icon: "🏛️" },
                { id: "securite", label: "Tranquillité", icon: "🛡️" },
                { id: "economie", label: "Économie", icon: "💼" }
            ],
            objectifs: [
                { id: "transition", label: "Transition écologique", icon: "🌱" },
                { id: "cadre-vie", label: "Cadre de vie", icon: "🏡" },
                { id: "services", label: "Services publics", icon: "🏛️" }
            ]
        }
    };

    const files = {
        projets: 'projets.json',
        themes: 'themes.json',
        actions: 'actions.json',
        candidats: 'candidats.json',
        faq: 'faq.json',
        articles: 'articles.json',
        abonnes: 'abonnes.json',
        config: 'config.json',
        medias: 'medias.json'
    };

    // Charger TOUS les fichiers en parallèle via l'API GitHub
    const entries = Object.entries(files);
    const token = getToken();
    entries.forEach(([key]) => setStatus(key, 'loading', '⏳...'));

    const results = await Promise.allSettled(
        entries.map(async ([key, file]) => {
            const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${file}?ref=${GITHUB_CONFIG.branch}&t=${Date.now()}`;
            console.log(`Chargement de ${file}...`);
            const response = await fetch(url, {
                headers: token ? { 'Authorization': `token ${token}` } : {}
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const apiResponse = await response.json();
            // Décoder le contenu base64 de l'API GitHub avec support UTF-8
            const base64 = apiResponse.content.replace(/\n/g, '');
            const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
            const content = new TextDecoder('utf-8').decode(bytes);
            return { key, file, loaded: JSON.parse(content) };
        })
    );

    // Traiter les résultats
    results.forEach((result, i) => {
        const [key, file] = entries[i];
        if (result.status === 'fulfilled') {
            const { loaded } = result.value;
            if (key === 'config') {
                data.config = { ...data.config, ...loaded };
            } else if (key === 'themes') {
                data.themes = loaded;
                THEMES_CONFIG = [...loaded];
            } else {
                data[key] = loaded;
            }
            console.log(`✅ ${file} chargé:`, loaded.length !== undefined ? `${loaded.length} éléments` : 'OK');
            setStatus(key, 'saved', '✓ À jour');
        } else {
            console.error(`❌ ${file} - Erreur:`, result.reason?.message);
            setStatus(key, 'modified', '❌ Erreur');
        }
    });

    renderAll();
    showToast('✅ Données chargées depuis GitHub !', 'success');
}

// ===== STATUS =====
function setStatus(section, state, text) {
    const el = document.getElementById('status-' + section);
    if (el) {
        el.textContent = text;
        el.className = 'status ' + state;
    }
}

function markModified(section) {
    setStatus(section, 'modified', '⚠️ Modifié');
}

// ===== RENDER ALL =====
function renderAll() {
    renderProjets();
    renderThemesList();
    renderActions();
    renderCandidats();
    renderFaq();
    renderArticles();
    renderAbonnes();
    renderMedias();
    renderFacebookSelect();
    renderConfig();
    initNewsletterDate();
    updateDashboard();
    // New CMS features
    initNewFeatures();
}

// ===== DASHBOARD =====
function updateDashboard() {
    // Mise à jour des statistiques
    const el = (id) => document.getElementById(id);
    if (el('stat-projets')) el('stat-projets').textContent = data.projets.length;
    if (el('stat-actions')) el('stat-actions').textContent = data.actions.length;
    if (el('stat-candidats')) el('stat-candidats').textContent = data.candidats.length;
    if (el('stat-articles')) el('stat-articles').textContent = data.articles.length;
    if (el('stat-themes')) el('stat-themes').textContent = data.themes.length;
    if (el('stat-abonnes')) el('stat-abonnes').textContent = data.abonnes.filter(a => a.actif !== false).length;

    // Derniers articles
    const recentArticles = [...data.articles]
        .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
        .slice(0, 3);

    const articlesHtml = recentArticles.length === 0
        ? '<p style="color: #888;">Aucun article</p>'
        : recentArticles.map(a => `
            <div style="padding: 0.5rem 0; border-bottom: 1px solid #eee; cursor: pointer;" onclick="switchTab('articles')">
                <div style="font-weight: 500; color: var(--bleu);">${a.titre || 'Sans titre'}</div>
                <div style="font-size: 0.8rem; color: #888;">${a.date || 'Sans date'} ${a.categorie ? '• ' + a.categorie : ''}</div>
            </div>
        `).join('');

    if (el('dashboard-recent-articles')) {
        el('dashboard-recent-articles').innerHTML = articlesHtml;
    }

    // Répartition des actions par statut
    const actionsStats = {
        realise: data.actions.filter(a => a.statut === 'Réalisé' || a.statut === 'realise').length,
        encours: data.actions.filter(a => a.statut === 'En cours' || a.statut === 'encours').length,
        prevu: data.actions.filter(a => a.statut === 'Prévu' || a.statut === 'prevu').length
    };

    const total = data.actions.length || 1;
    const actionsStatsHtml = `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <div style="flex: 1; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${(actionsStats.realise / total * 100).toFixed(0)}%; height: 100%; background: #27ae60;"></div>
                </div>
                <span style="font-size: 0.8rem; min-width: 70px;">✅ ${actionsStats.realise} réalisées</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <div style="flex: 1; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${(actionsStats.encours / total * 100).toFixed(0)}%; height: 100%; background: #f39c12;"></div>
                </div>
                <span style="font-size: 0.8rem; min-width: 70px;">🔄 ${actionsStats.encours} en cours</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <div style="flex: 1; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${(actionsStats.prevu / total * 100).toFixed(0)}%; height: 100%; background: #3498db;"></div>
                </div>
                <span style="font-size: 0.8rem; min-width: 70px;">📋 ${actionsStats.prevu} prévues</span>
            </div>
        </div>
    `;

    if (el('dashboard-actions-stats')) {
        el('dashboard-actions-stats').innerHTML = actionsStatsHtml;
    }
}

function switchTab(tabName) {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === 'tab-' + tabName);
    });
    // Initialize visual editor when switching to Pages tab
    if (tabName === 'pages') {
        setupVisualEditor();
    }
}

// ===== RECHERCHE GLOBALE =====
function handleGlobalSearch(query) {
    const resultsContainer = document.getElementById('global-search-results');

    if (!query || query.length < 2) {
        resultsContainer.classList.remove('active');
        return;
    }

    const q = query.toLowerCase();
    const results = {
        projets: [],
        actions: [],
        candidats: [],
        articles: [],
        faq: []
    };

    // Recherche dans les projets
    data.projets.forEach((p, i) => {
        if ((p.titre || '').toLowerCase().includes(q) ||
            (p.description || '').toLowerCase().includes(q)) {
            results.projets.push({ ...p, index: i });
        }
    });

    // Recherche dans les actions
    data.actions.forEach((a, i) => {
        if ((a.titre || '').toLowerCase().includes(q) ||
            (a.description || '').toLowerCase().includes(q)) {
            results.actions.push({ ...a, index: i });
        }
    });

    // Recherche dans les candidats
    data.candidats.forEach((c, i) => {
        if ((c.prenom || '').toLowerCase().includes(q) ||
            (c.nom || '').toLowerCase().includes(q) ||
            (c.role || '').toLowerCase().includes(q) ||
            (c.bio || '').toLowerCase().includes(q)) {
            results.candidats.push({ ...c, index: i });
        }
    });

    // Recherche dans les articles
    data.articles.forEach((a, i) => {
        if ((a.titre || '').toLowerCase().includes(q) ||
            (a.extrait || '').toLowerCase().includes(q) ||
            (a.contenu || '').toLowerCase().includes(q)) {
            results.articles.push({ ...a, index: i });
        }
    });

    // Recherche dans la FAQ
    data.faq.forEach((f, i) => {
        if ((f.question || '').toLowerCase().includes(q) ||
            (f.reponse || '').toLowerCase().includes(q)) {
            results.faq.push({ ...f, index: i });
        }
    });

    // Générer le HTML des résultats
    let html = '';
    const hasResults = Object.values(results).some(arr => arr.length > 0);

    if (!hasResults) {
        html = '<div style="padding: 1rem; text-align: center; color: #888;">Aucun résultat pour "' + query + '"</div>';
    } else {
        if (results.projets.length > 0) {
            html += `<div class="search-result-group">
                <div class="search-result-group-title">🚀 Projets (${results.projets.length})</div>
                ${results.projets.slice(0, 3).map(p => `
                    <div class="search-result-item" onclick="goToResult('projets', ${p.index})">
                        <span class="icon">🚀</span>
                        <div>
                            <div class="title">${p.titre || 'Sans titre'}</div>
                            <div class="subtitle">${p.theme || ''}</div>
                        </div>
                    </div>
                `).join('')}
            </div>`;
        }

        if (results.actions.length > 0) {
            html += `<div class="search-result-group">
                <div class="search-result-group-title">📊 Actions (${results.actions.length})</div>
                ${results.actions.slice(0, 3).map(a => `
                    <div class="search-result-item" onclick="goToResult('actions', ${a.index})">
                        <span class="icon">📊</span>
                        <div>
                            <div class="title">${a.titre || 'Sans titre'}</div>
                            <div class="subtitle">${a.theme || ''} ${a.statut ? '• ' + a.statut : ''}</div>
                        </div>
                    </div>
                `).join('')}
            </div>`;
        }

        if (results.candidats.length > 0) {
            html += `<div class="search-result-group">
                <div class="search-result-group-title">👥 Candidats (${results.candidats.length})</div>
                ${results.candidats.slice(0, 3).map(c => `
                    <div class="search-result-item" onclick="goToResult('candidats', ${c.index})">
                        <span class="icon">👤</span>
                        <div>
                            <div class="title">${c.prenom || ''} ${c.nom || 'Sans nom'}</div>
                            <div class="subtitle">${c.role || ''}</div>
                        </div>
                    </div>
                `).join('')}
            </div>`;
        }

        if (results.articles.length > 0) {
            html += `<div class="search-result-group">
                <div class="search-result-group-title">📰 Articles (${results.articles.length})</div>
                ${results.articles.slice(0, 3).map(a => `
                    <div class="search-result-item" onclick="goToResult('articles', ${a.index})">
                        <span class="icon">📰</span>
                        <div>
                            <div class="title">${a.titre || 'Sans titre'}</div>
                            <div class="subtitle">${a.date || ''} ${a.categorie ? '• ' + a.categorie : ''}</div>
                        </div>
                    </div>
                `).join('')}
            </div>`;
        }

        if (results.faq.length > 0) {
            html += `<div class="search-result-group">
                <div class="search-result-group-title">❓ FAQ (${results.faq.length})</div>
                ${results.faq.slice(0, 3).map(f => `
                    <div class="search-result-item" onclick="goToResult('faq', ${f.index})">
                        <span class="icon">❓</span>
                        <div>
                            <div class="title">${f.question || 'Sans question'}</div>
                        </div>
                    </div>
                `).join('')}
            </div>`;
        }
    }

    resultsContainer.innerHTML = html;
    resultsContainer.classList.add('active');
}

function goToResult(type, index) {
    // Fermer les résultats
    document.getElementById('global-search-results').classList.remove('active');
    document.getElementById('global-search').value = '';

    // Aller à l'onglet approprié
    switchTab(type);

    // Ouvrir l'éditeur selon le type
    setTimeout(() => {
        switch (type) {
            case 'projets':
                openEditProjet(index);
                break;
            case 'actions':
                openEditAction(index);
                break;
            case 'candidats':
                openEditCandidat(index);
                break;
            case 'articles':
                openEditArticle(index);
                break;
            case 'faq':
                openEditFaq(index);
                break;
        }
    }, 100);
}

// Fermer les résultats quand on clique ailleurs
document.addEventListener('click', function(e) {
    const searchContainer = document.querySelector('.global-search-container');
    if (searchContainer && !searchContainer.contains(e.target)) {
        document.getElementById('global-search-results').classList.remove('active');
    }
});

function getThemeLabel(themes, value) {
    const t = themes.find(t => t.value === value);
    return t ? t.label : value;
}

// ===== PROJETS =====
let currentProjetFilter = '';

function filterProjets(theme) {
    currentProjetFilter = theme;
    // Mettre à jour les boutons actifs
    document.querySelectorAll('#projet-theme-filters .theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    renderProjets();
}

function updateProjetCounts() {
    // Compter les projets par thème (directement depuis les données)
    const counts = {};
    data.projets.forEach(p => {
        const theme = (p.theme || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        counts[theme] = (counts[theme] || 0) + 1;
    });
    
    // Mettre à jour le compteur total
    const allEl = document.getElementById('pcount-all');
    if (allEl) allEl.textContent = data.projets.length;
    
    // Mettre à jour les compteurs par thème
    document.querySelectorAll('[id^="pcount-"]').forEach(el => {
        const theme = el.id.replace('pcount-', '');
        if (theme !== 'all') {
            el.textContent = counts[theme] || 0;
        }
    });
}

// Variable pour suivre le thème actuellement affiché en détail
let currentProjetThemeDetail = null;

function renderProjets() {
    updateProjetCounts();

    const search = (document.getElementById('search-projets')?.value || '').toLowerCase();

    // Si recherche active ou filtre thème via boutons, afficher directement les cartes
    if (search || currentProjetFilter) {
        showProjetsCards(search);
        return;
    }

    // Si un thème est sélectionné en détail, afficher ses projets
    if (currentProjetThemeDetail) {
        showProjetThemeDetail(currentProjetThemeDetail);
        return;
    }

    // Sinon, afficher la vue par thèmes
    showProjetsThemesView();
}

function showProjetsThemesView() {
    document.getElementById('projets-themes-view').style.display = 'grid';
    document.getElementById('projets-detail-view').style.display = 'none';

    // Grouper les projets par thème principal
    const themeGroups = {};
    data.projets.forEach(p => {
        const themes = getProjetThemes(p);
        const primaryTheme = themes[0] || 'Non défini';
        if (!themeGroups[primaryTheme]) {
            themeGroups[primaryTheme] = [];
        }
        themeGroups[primaryTheme].push(p);
    });

    document.getElementById('projets-count').textContent = data.projets.length;

    // Trier les thèmes par nombre de projets
    const sortedThemes = Object.entries(themeGroups).sort((a, b) => b[1].length - a[1].length);

    document.getElementById('projets-themes-view').innerHTML = sortedThemes.length === 0
        ? '<div class="empty-state" style="grid-column: 1/-1;"><div class="icon">📭</div><p>Aucun projet</p></div>'
        : sortedThemes.map(([themeName, projets]) => {
            const themeConf = THEMES_CONFIG.find(t => t.theme === themeName) || { icon: '📋', color: '#1a3a5c' };
            const prioritaires = projets.filter(p => p.statut === 'Prioritaire').length;

            return `
            <div class="theme-card" onclick="showProjetThemeDetail('${themeName}')">
                <div class="theme-card-header" style="background: ${themeConf.color}">
                    <span class="theme-card-icon">${themeConf.icon}</span>
                    <div class="theme-card-info">
                        <h3>${themeName}</h3>
                        <span class="count">${projets.length} projet${projets.length > 1 ? 's' : ''}</span>
                    </div>
                </div>
                <div class="theme-card-stats">
                    <span>${prioritaires > 0 ? '🔴 ' + prioritaires + ' prioritaire(s)' : 'Cliquer pour voir'}</span>
                    <span class="theme-card-arrow">→</span>
                </div>
            </div>
        `}).join('');
}

function showProjetThemeDetail(themeName) {
    currentProjetThemeDetail = themeName;
    document.getElementById('projets-themes-view').style.display = 'none';
    document.getElementById('projets-detail-view').style.display = 'block';

    const themeConf = THEMES_CONFIG.find(t => t.theme === themeName) || { icon: '📋', color: '#1a3a5c' };

    // Filtrer les projets de ce thème
    const projets = data.projets.filter(p => {
        const themes = getProjetThemes(p);
        return themes.includes(themeName);
    });

    document.getElementById('projets-count').textContent = projets.length;

    document.getElementById('projets-detail-view').innerHTML = `
        <div class="theme-detail">
            <div class="theme-detail-header">
                <div class="theme-detail-title">
                    <span style="font-size: 1.5rem;">${themeConf.icon}</span>
                    <span>${themeName}</span>
                    <span style="color: #888; font-weight: normal; font-size: 1rem;">(${projets.length} projet${projets.length > 1 ? 's' : ''})</span>
                </div>
                <button class="btn-back-theme" onclick="backToProjetsThemes()">← Retour aux thèmes</button>
            </div>
            <div class="cards-grid">
                ${projets.map(p => renderProjetCard(p)).join('')}
            </div>
        </div>
    `;
}

function backToProjetsThemes() {
    currentProjetThemeDetail = null;
    currentProjetFilter = '';
    document.querySelectorAll('#tab-projets .theme-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('#tab-projets .theme-btn')?.classList.add('active');
    renderProjets();
}

function showProjetsCards(search) {
    document.getElementById('projets-themes-view').style.display = 'none';
    document.getElementById('projets-detail-view').style.display = 'block';

    let filtered = data.projets;

    // Filtre par thème
    if (currentProjetFilter) {
        filtered = filtered.filter(p => {
            const themes = getProjetThemes(p);
            return themes.some(t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(currentProjetFilter.toLowerCase()));
        });
    }

    // Filtre par recherche
    if (search) {
        filtered = filtered.filter(p => {
            const themesStr = getProjetThemes(p).join(' ').toLowerCase();
            return (p.titre || '').toLowerCase().includes(search) ||
                themesStr.includes(search) ||
                (p.resume || '').toLowerCase().includes(search) ||
                (p.description || '').toLowerCase().includes(search);
        });
    }

    document.getElementById('projets-count').textContent = filtered.length;

    document.getElementById('projets-detail-view').innerHTML = `
        <div class="theme-detail">
            <div class="theme-detail-header">
                <div class="theme-detail-title">
                    <span>🔍 Résultats</span>
                    <span style="color: #888; font-weight: normal; font-size: 1rem;">(${filtered.length} projet${filtered.length > 1 ? 's' : ''})</span>
                </div>
                <button class="btn-back-theme" onclick="backToProjetsThemes()">← Retour aux thèmes</button>
            </div>
            <div class="cards-grid">
                ${filtered.length === 0
                    ? '<div class="empty-state" style="grid-column: 1/-1;"><div class="icon">📭</div><p>Aucun projet trouvé</p></div>'
                    : filtered.map(p => renderProjetCard(p)).join('')}
            </div>
        </div>
    `;
}

function renderProjetCard(p) {
    const themes = getProjetThemes(p);
    const primaryTheme = themes[0] || 'Non défini';
    const themeConf = THEMES_CONFIG.find(t => t.theme === primaryTheme) || { icon: '📋', color: '#1a3a5c' };
    const statutClass = (p.statut || '').toLowerCase().replace(/\s+/g, '-').replace('é', 'e');

    return `
        <div class="admin-card">
            <div class="admin-card-header">
                <span class="admin-card-theme" style="background: ${themeConf.color}">
                    ${themeConf.icon} ${primaryTheme}
                </span>
                <span class="admin-card-statut statut-${statutClass}">${p.statut || 'Non défini'}</span>
            </div>
            <div class="admin-card-body">
                <div class="admin-card-title">${p.titre || 'Sans titre'}</div>
                <div class="admin-card-desc">${p.resume || p.description || ''}</div>
                <div class="admin-card-footer">
                    <span class="admin-card-meta">${p.annee || ''}</span>
                    <div class="admin-card-actions">
                        <button class="btn btn-sm" style="background: #1877f2; color: white;" onclick="shareOnFBAdmin('projet', ${data.projets.indexOf(p)})" title="Partager sur Facebook">📘</button>
                        <button class="btn btn-sm btn-primary" onclick="openEditProjet(${data.projets.indexOf(p)})">✏️ Modifier</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteProjet(${data.projets.indexOf(p)})">🗑️</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function openAddProjet() {
    currentEdit = { type: 'projet', index: -1 };
    showProjetModal({});
}

function openEditProjet(index) {
    currentEdit = { type: 'projet', index };
    showProjetModal(data.projets[index]);
}

// Configuration des thèmes par défaut (sera remplacée par themes.json au chargement)
let THEMES_CONFIG = [
    { theme: 'Urbanisme', icon: '🏘️', color: '#34495e' },
    { theme: 'Environnement', icon: '🌿', color: '#27ae60' },
    { theme: 'Solidarité', icon: '🤝', color: '#e74c3c' },
    { theme: 'Santé', icon: '🏥', color: '#e91e63' },
    { theme: 'Enfance', icon: '👶', color: '#3498db' },
    { theme: 'Culture', icon: '🎭', color: '#9b59b6' },
    { theme: 'Sport', icon: '⚽', color: '#4caf50' },
    { theme: 'Économie', icon: '💼', color: '#f39c12' },
    { theme: 'Intercommunalité', icon: '🏛️', color: '#607d8b' },
    { theme: 'Tranquillité publique', icon: '🛡️', color: '#2c3e50' },
    { theme: 'Mobilités', icon: '🚴', color: '#1abc9c' },
    { theme: 'Seniors', icon: '👴', color: '#795548' },
    { theme: 'Démocratie locale', icon: '🗣️', color: '#607d8b' },
    { theme: 'Métropole', icon: '🏛️', color: '#00bcd4' }
];

// ===== GESTION DES THÈMES =====
function renderThemesList() {
    // Compter les projets par thème
    const themeCounts = {};
    (data.projets || []).forEach(p => {
        const themes = getProjetThemes(p);
        themes.forEach(t => {
            themeCounts[t] = (themeCounts[t] || 0) + 1;
        });
    });
    
    // Compter les actions par thème
    const actionCounts = {};
    (data.actions || []).forEach(a => {
        const theme = a.theme || 'Non classé';
        actionCounts[theme] = (actionCounts[theme] || 0) + 1;
    });
    
    document.getElementById('themes-count').textContent = THEMES_CONFIG.length;

    // Trier par nombre de projets + actions décroissant
    const sortedThemes = [...THEMES_CONFIG].map((t, originalIndex) => ({
        ...t,
        originalIndex,
        count: themeCounts[t.theme] || 0,
        actionCount: actionCounts[t.theme] || 0
    })).sort((a, b) => (b.count + b.actionCount) - (a.count + a.actionCount));

    const container = document.getElementById('themes-list');
    container.innerHTML = sortedThemes.length === 0
        ? '<div class="empty-state" style="grid-column: 1/-1;"><div class="icon">🎨</div><p>Aucun thème</p></div>'
        : sortedThemes.map((t) => {
            const hasContent = t.count > 0 || t.actionCount > 0;
            return `
            <div class="theme-card" style="cursor: default;">
                <div class="theme-card-header" style="background: ${t.color}">
                    <span class="theme-card-icon">${t.icon}</span>
                    <div class="theme-card-info">
                        <h3>${t.theme}</h3>
                        <span class="count">${t.actionCount} action${t.actionCount > 1 ? 's' : ''} · ${t.count} projet${t.count > 1 ? 's' : ''}</span>
                    </div>
                </div>
                <div class="theme-card-stats" style="justify-content: flex-end;">
                    <button class="btn btn-sm btn-danger"
                            onclick="deleteTheme(${t.originalIndex})"
                            title="${hasContent ? 'Supprimer et réassigner le contenu' : 'Supprimer ce thème'}">
                        🗑️ Supprimer
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function addNewTheme() {
    const nameInput = document.getElementById('new-theme-name');
    const iconSelect = document.getElementById('new-theme-icon');
    const colorInput = document.getElementById('new-theme-color');
    
    const name = nameInput.value.trim();
    const icon = iconSelect.value;
    const color = colorInput.value;
    
    if (!name) {
        showToast('⚠️ Veuillez entrer un nom de thème', 'warning');
        return;
    }
    
    if (THEMES_CONFIG.some(t => t.theme.toLowerCase() === name.toLowerCase())) {
        showToast('⚠️ Ce thème existe déjà', 'warning');
        return;
    }
    
    THEMES_CONFIG.push({ theme: name, icon, color });
    THEMES_CONFIG.sort((a, b) => a.theme.localeCompare(b.theme));
    data.themes = [...THEMES_CONFIG];
    markModified('themes');
    
    // Réinitialiser le formulaire
    nameInput.value = '';
    iconSelect.value = '📌';
    colorInput.value = '#1a3a5c';
    
    renderThemesList();
    showToast('✅ Thème ajouté : ' + name + ' (pensez à publier)', 'success');
}

function deleteTheme(index) {
    const theme = THEMES_CONFIG[index];
    
    // Compter les projets qui utilisent ce thème
    const projetsWithTheme = (data.projets || []).filter(p => {
        const themes = getProjetThemes(p);
        return themes.includes(theme.theme);
    });
    
    if (projetsWithTheme.length > 0) {
        // Afficher la modal de réassignation
        showReassignModal(index, theme, projetsWithTheme.length);
        return;
    }
    
    // Pas de projets, suppression directe
    if (!confirm(`Supprimer le thème "${theme.theme}" ?`)) {
        return;
    }
    
    THEMES_CONFIG.splice(index, 1);
    data.themes = [...THEMES_CONFIG];
    markModified('themes');
    
    renderThemesList();
    showToast('✅ Thème supprimé (pensez à publier)', 'success');
}

function showReassignModal(themeIndex, theme, projetCount) {
    // Créer les options pour le select (tous les thèmes sauf celui à supprimer)
    const otherThemes = THEMES_CONFIG.filter((t, i) => i !== themeIndex);
    const options = otherThemes.map(t => 
        `<option value="${t.theme}">${t.icon} ${t.theme}</option>`
    ).join('');
    
    // Créer la modal
    const modalHTML = `
        <div id="reassign-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999;">
            <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 450px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <h3 style="color: var(--bleu); margin-bottom: 1rem;">🔄 Réassigner les projets</h3>
                <p style="color: #666; margin-bottom: 1.5rem;">
                    <strong>${projetCount} projet${projetCount > 1 ? 's' : ''}</strong> utilise${projetCount > 1 ? 'nt' : ''} le thème <strong style="color: ${theme.color};">${theme.icon} ${theme.theme}</strong>.
                </p>
                <p style="color: #666; margin-bottom: 1rem;">Vers quel thème souhaitez-vous les déplacer ?</p>
                <select id="reassign-target" style="width: 100%; padding: 10px; border: 2px solid var(--gris-border); border-radius: 8px; font-size: 1rem; margin-bottom: 1.5rem;">
                    ${options}
                </select>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button class="btn" onclick="closeReassignModal()" style="background: #e0e0e0; color: #666;">Annuler</button>
                    <button class="btn btn-primary" onclick="confirmReassign(${themeIndex}, '${theme.theme}')">Réassigner et supprimer</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeReassignModal() {
    const modal = document.getElementById('reassign-modal');
    if (modal) modal.remove();
}

function confirmReassign(themeIndex, oldThemeName) {
    const newTheme = document.getElementById('reassign-target').value;
    
    // Réassigner tous les projets
    let reassigned = 0;
    (data.projets || []).forEach(p => {
        const themes = getProjetThemes(p);
        const idx = themes.indexOf(oldThemeName);
        if (idx !== -1) {
            // Remplacer l'ancien thème par le nouveau
            themes[idx] = newTheme;
            // Supprimer les doublons si le nouveau thème était déjà présent
            p.themes = [...new Set(themes)];
            p.theme = p.themes[0]; // Rétrocompatibilité
            reassigned++;
        }
    });
    
    // Supprimer le thème
    THEMES_CONFIG.splice(themeIndex, 1);
    data.themes = [...THEMES_CONFIG];
    
    // Marquer comme modifié
    markModified('themes');
    markModified('projets');
    
    closeReassignModal();
    renderThemesList();
    renderProjets();
    
    showToast(`✅ ${reassigned} projet${reassigned > 1 ? 's' : ''} réassigné${reassigned > 1 ? 's' : ''} vers "${newTheme}" (pensez à publier)`, 'success');
}

// Helper pour obtenir les thèmes d'un projet (supporte theme ou themes)
function getProjetThemes(p) {
    if (p.themes && Array.isArray(p.themes)) {
        return p.themes;
    }
    return p.theme ? [p.theme] : [];
}

// Toggle un badge de thème (sélection/désélection)
function toggleThemeBadge(el) {
    const isSelected = el.classList.contains('selected');
    const color = el.dataset.color;
    
    if (isSelected) {
        el.classList.remove('selected');
        el.style.background = '#e0e0e0';
        el.style.color = '#666';
        el.style.borderColor = 'transparent';
    } else {
        el.classList.add('selected');
        el.style.background = color;
        el.style.color = 'white';
        el.style.borderColor = color;
    }
}

function showProjetModal(p) {
    document.getElementById('modal-title').textContent = currentEdit.index === -1 ? '➕ Ajouter un projet' : '✏️ Modifier le projet';
    
    const currentThemes = getProjetThemes(p);
    const themeBadges = THEMES_CONFIG.map(t => {
        const isSelected = currentThemes.includes(t.theme);
        return `<span class="theme-badge-select ${isSelected ? 'selected' : ''}" 
                      data-theme="${t.theme}" 
                      data-color="${t.color}"
                      onclick="toggleThemeBadge(this)"
                      style="background: ${isSelected ? t.color : '#e0e0e0'}; 
                             color: ${isSelected ? 'white' : '#666'}; 
                             padding: 6px 12px; 
                             border-radius: 20px; 
                             font-size: 0.85rem; 
                             cursor: pointer; 
                             margin: 4px;
                             display: inline-block;
                             transition: all 0.2s ease;
                             border: 2px solid ${isSelected ? t.color : 'transparent'};">
                ${t.icon} ${t.theme}
               </span>`;
    }).join('');
    
    const statutOptions = ['Programmé', 'En cours', 'Prioritaire', 'Étude'].map(s =>
        `<option value="${s}" ${p.statut === s ? 'selected' : ''}>${s}</option>`
    ).join('');
    
    // Préparer les chiffres existants
    const chiffresHTML = (p.chiffres || []).map((c, i) => `
        <div class="chiffre-row" style="display: grid; grid-template-columns: 1fr 2fr auto; gap: 0.5rem; margin-bottom: 0.5rem;">
            <input type="text" class="chiffre-valeur" value="${c.valeur || ''}" placeholder="Ex: 150 000 €">
            <input type="text" class="chiffre-label" value="${c.label || ''}" placeholder="Ex: Budget total">
            <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">🗑️</button>
        </div>
    `).join('');
    
    // Préparer la chronologie existante
    const chronoHTML = (p.chronologie || []).map((c, i) => `
        <div class="chrono-row" style="display: grid; grid-template-columns: 120px 1fr auto; gap: 0.5rem; margin-bottom: 0.5rem;">
            <input type="text" class="chrono-date" value="${c.date || ''}" placeholder="Ex: 2027">
            <input type="text" class="chrono-event" value="${c.evenement || ''}" placeholder="Ex: Lancement des travaux">
            <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">🗑️</button>
        </div>
    `).join('');
    
    // Préparer les documents existants
    const docsHTML = (p.documents || []).map((d, i) => `
        <div class="doc-row" style="display: grid; grid-template-columns: 1fr 2fr auto; gap: 0.5rem; margin-bottom: 0.5rem;">
            <input type="text" class="doc-nom" value="${d.nom || ''}" placeholder="Nom du document">
            <input type="text" class="doc-url" value="${d.url || ''}" placeholder="URL ou chemin">
            <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">🗑️</button>
        </div>
    `).join('');
    
    // Préparer les images existantes
    const imagesHTML = (p.images || []).map((img, i) => `
        <div class="img-row" style="display: grid; grid-template-columns: 2fr 1fr auto; gap: 0.5rem; margin-bottom: 0.5rem;">
            <input type="text" class="img-url" value="${img.url || ''}" placeholder="URL de l'image">
            <input type="text" class="img-alt" value="${img.alt || ''}" placeholder="Description">
            <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">🗑️</button>
        </div>
    `).join('');
    
    document.getElementById('modal-body').innerHTML = `
        <div class="form-group">
            <label>Titre du projet *</label>
            <input type="text" id="edit-titre" value="${p.titre || ''}" placeholder="Ex: Création d'une maison de santé">
        </div>
        <div class="form-group">
            <label>Thème(s) * <small style="color: #888; font-weight: normal;">(cliquer pour sélectionner)</small></label>
            <div id="themes-badges" style="display: flex; flex-wrap: wrap; padding: 10px; background: #f8f9fa; border-radius: 8px; border: 1px solid var(--gris-border);">
                ${themeBadges}
            </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
                <label>Statut</label>
                <select id="edit-statut">
                    ${statutOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Année prévue</label>
                <select id="edit-annee">
                    <option value="">--</option>
                    ${[2026, 2027, 2028, 2029, 2030, 2031, 2032].map(a => 
                        `<option value="${a}" ${p.annee == a ? 'selected' : ''}>${a}</option>`
                    ).join('')}
                </select>
            </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
                <label>Importance (1-3)</label>
                <select id="edit-importance">
                    <option value="1" ${p.importance == 1 ? 'selected' : ''}>1 - Normal</option>
                    <option value="2" ${p.importance == 2 ? 'selected' : ''}>2 - Important</option>
                    <option value="3" ${p.importance == 3 ? 'selected' : ''}>3 - Prioritaire</option>
                </select>
            </div>
            <div class="form-group">
                <label>Budget estimé (€)</label>
                <input type="number" id="edit-budget" value="${p.budget || 0}" placeholder="0">
            </div>
        </div>
        <div class="form-group">
            <label>Résumé court</label>
            <input type="text" id="edit-resume" value="${p.resume || ''}" placeholder="Ex: Accès aux soins pour tous">
        </div>
        <div class="form-group">
            <label>Description détaillée</label>
            <textarea id="edit-description" rows="4" placeholder="Description complète du projet...">${p.description || ''}</textarea>
        </div>
        
        <hr style="margin: 1.5rem 0; border: none; border-top: 2px solid var(--or);">
        <h4 style="color: var(--bleu); margin-bottom: 1rem;">🖼️ Illustration</h4>

        <div class="form-group">
            <label>Image principale</label>
            <div id="projet-image-dropzone" style="border: 2px dashed var(--gris-border); border-radius: 8px; padding: 1rem; text-align: center; cursor: pointer; transition: all 0.2s;" onclick="document.getElementById('import-image').click()">
                <input type="file" id="import-image" accept="image/*" onchange="handleImageImport(this)" style="display: none;">
                <div style="font-size: 1.5rem;">📁</div>
                <p style="margin: 0.5rem 0 0; font-size: 0.85rem; color: #666;">Cliquez ou glissez-déposez une image</p>
                <input type="text" id="edit-image" value="${p.image || ''}" placeholder="Ou entrez le chemin" style="margin-top: 0.5rem; width: 100%;" onclick="event.stopPropagation()">
            </div>
            <div id="image-preview" style="margin-top: 0.5rem; ${p.image ? '' : 'display: none;'}">
                <img src="${p.image || ''}" style="max-width: 150px; max-height: 100px; border-radius: 8px; border: 1px solid var(--gris-border);">
            </div>
        </div>

        <div class="form-group">
            <label>Galerie d'images</label>
            <div id="projet-gallery-dropzone" style="border: 2px dashed var(--gris-border); border-radius: 8px; padding: 1rem; text-align: center; cursor: pointer; transition: all 0.2s; margin-bottom: 0.5rem;" onclick="document.getElementById('import-projet-gallery').click()">
                <input type="file" id="import-projet-gallery" accept="image/*" multiple onchange="handleProjetGalleryImport(this)" style="display: none;">
                <div style="font-size: 1.2rem;">📷</div>
                <p style="margin: 0.25rem 0 0; font-size: 0.8rem; color: #666;">Glissez-déposez plusieurs images</p>
            </div>
            <div id="images-container">${imagesHTML}</div>
            <button type="button" class="btn btn-outline btn-sm" onclick="addImageRow()" style="margin-top: 0.5rem;">+ Ajouter manuellement</button>
        </div>
        
        <hr style="margin: 1.5rem 0; border: none; border-top: 2px solid var(--or);">
        <h4 style="color: var(--bleu); margin-bottom: 1rem;">📊 Objectifs chiffrés</h4>
        
        <div class="form-group">
            <label>Chiffres clés</label>
            <div id="chiffres-container">${chiffresHTML}</div>
            <button type="button" class="btn btn-outline btn-sm" onclick="addChiffreRow()" style="margin-top: 0.5rem;">+ Ajouter un chiffre</button>
        </div>
        
        <hr style="margin: 1.5rem 0; border: none; border-top: 2px solid var(--or);">
        <h4 style="color: var(--bleu); margin-bottom: 1rem;">📅 Calendrier prévisionnel</h4>
        
        <div class="form-group">
            <label>Étapes du projet</label>
            <div id="chrono-container">${chronoHTML}</div>
            <button type="button" class="btn btn-outline btn-sm" onclick="addChronoRow()" style="margin-top: 0.5rem;">+ Ajouter une étape</button>
        </div>
        
        <hr style="margin: 1.5rem 0; border: none; border-top: 2px solid var(--or);">
        <h4 style="color: var(--bleu); margin-bottom: 1rem;">📎 Documents joints</h4>
        
        <div class="form-group">
            <label>Documents (PDF, études, plans...)</label>
            <div id="docs-container">${docsHTML}</div>
            <button type="button" class="btn btn-outline btn-sm" onclick="addDocRow()" style="margin-top: 0.5rem;">+ Ajouter un document</button>
        </div>
        
        <hr style="margin: 1.5rem 0; border: none; border-top: 2px solid var(--or);">
        <h4 style="color: var(--bleu); margin-bottom: 1rem;">🎯 Fiche Objectif (Mobilités)</h4>

        <div class="form-group">
            <label>Slogan <small style="color: #888;">(ex: Relier • Diversifier • Anticiper)</small></label>
            <input type="text" id="edit-slogan" value="${p.slogan || ''}" placeholder="Ex: Protéger • Faciliter • Rassurer">
        </div>

        <div class="form-group">
            <label>Numéro d'objectif <small style="color: #888;">(ex: 1/7)</small></label>
            <input type="text" id="edit-numero" value="${p.numero || ''}" placeholder="Ex: 1/7">
        </div>

        <div class="form-group">
            <label>Tags <small style="color: #888;">(séparés par des virgules)</small></label>
            <input type="text" id="edit-tags" value="${(p.tags || []).join(', ')}" placeholder="Ex: Tranquillité, Accessibilité, Confort">
        </div>

        <div class="form-group">
            <label>Enjeux <small style="color: #888;">(un par ligne)</small></label>
            <textarea id="edit-enjeux" rows="3" placeholder="Réduire la dépendance à la voiture&#10;Offrir des alternatives crédibles&#10;Anticiper les besoins futurs">${(p.enjeux || []).join('\n')}</textarea>
        </div>

        <div class="form-group">
            <label>Axes d'action <small style="color: #888;">(un par ligne)</small></label>
            <textarea id="edit-axes" rows="4" placeholder="Navettes adaptées aux horaires&#10;Covoiturage et parkings relais&#10;Scénarios transport par câble">${(p.axes_action || []).join('\n')}</textarea>
        </div>

        <div class="form-group">
            <label>Indicateurs <small style="color: #888;">(séparés par des virgules)</small></label>
            <input type="text" id="edit-indicateurs" value="${(p.indicateurs || []).join(', ')}" placeholder="Ex: Études engagées, Partenaires mobilisés, Usage des alternatives">
        </div>

        <div class="form-group">
            <label>Vision</label>
            <textarea id="edit-vision" rows="2" placeholder="Ex: Aucune hypothèse n'est écartée pour connecter Vizille au territoire.">${p.vision || ''}</textarea>
        </div>

        <hr style="margin: 1.5rem 0; border: none; border-top: 2px solid var(--or);">
        <h4 style="color: var(--bleu); margin-bottom: 1rem;">🏗️ Informations projet (Urbanisme/Travaux)</h4>

        <div class="form-group">
            <label>🤝 Partenaires</label>
            <input type="text" id="edit-partenaires" value="${p.partenaires || ''}" placeholder="Ex: État (ANCT), Métropole, ANAH, Banque des Territoires">
        </div>

        <div class="form-group">
            <label>💰 Budget / Financement</label>
            <input type="text" id="edit-financement" value="${p.financement || ''}" placeholder="Ex: Subventions ANAH jusqu'à 50%, aides Métropole">
        </div>

        <div class="form-group">
            <label>📅 Échéance</label>
            <input type="text" id="edit-echeance" value="${p.echeance || ''}" placeholder="Ex: Mise en œuvre 2025-2030">
        </div>

        <div class="form-group">
            <label>📍 Périmètre / Localisation</label>
            <input type="text" id="edit-perimetre" value="${p.perimetre || ''}" placeholder="Ex: Rue République → rue Jean Jaurès">
        </div>

        <hr style="margin: 1.5rem 0; border: none; border-top: 2px solid var(--or);">
        <h4 style="color: var(--bleu); margin-bottom: 1rem;">📝 Informations complémentaires</h4>

        <div class="form-group">
            <label>Détails supplémentaires</label>
            <textarea id="edit-details" rows="3" placeholder="Informations complémentaires, contexte...">${p.details || ''}</textarea>
        </div>
    `;
    document.getElementById('modal-save').onclick = saveProjet;
    document.getElementById('modal-edit').classList.add('active');

    // Activer le drag & drop pour l'image principale
    setupDropzone('projet-image-dropzone', (files) => {
        if (files.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('edit-image').value = e.target.result;
                const preview = document.getElementById('image-preview');
                preview.innerHTML = `<img src="${e.target.result}" style="max-width: 150px; max-height: 100px; border-radius: 8px; border: 1px solid var(--gris-border);">`;
                preview.style.display = 'block';
                showToast('✅ Image ajoutée', 'success');
            };
            reader.readAsDataURL(files[0]);
        }
    });

    // Activer le drag & drop pour la galerie
    setupDropzone('projet-gallery-dropzone', (files) => {
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                addImageRowWithUrl(e.target.result);
            };
            reader.readAsDataURL(file);
        });
        showToast(`✅ ${files.length} image(s) ajoutée(s)`, 'success');
    });

    // Activer le copier-coller (Ctrl+V / Cmd+V) pour les projets
    enablePasteForModal((files) => {
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => addImageRowWithUrl(e.target.result);
            reader.readAsDataURL(file);
        });
    });
}

// Fonction utilitaire pour configurer le drag & drop + copier-coller
function setupDropzone(id, onDrop) {
    const dropzone = document.getElementById(id);
    if (!dropzone) return;

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--vert)';
        dropzone.style.background = '#e8f5e9';
    });
    dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--gris-border)';
        dropzone.style.background = 'transparent';
    });
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--gris-border)';
        dropzone.style.background = 'transparent';
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (files.length > 0) onDrop(files);
    });

    // Support du copier-coller (Ctrl+V / Cmd+V)
    dropzone.setAttribute('tabindex', '0'); // Rendre focusable
    dropzone.addEventListener('paste', (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        const imageFiles = [];
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) imageFiles.push(file);
            }
        }

        if (imageFiles.length > 0) {
            e.preventDefault();
            onDrop(imageFiles);
            showToast(`📋 ${imageFiles.length} image(s) collée(s)`, 'success');
        }
    });

    // Indicateur visuel au focus
    dropzone.addEventListener('focus', () => {
        dropzone.style.outline = '2px solid var(--bleu)';
    });
    dropzone.addEventListener('blur', () => {
        dropzone.style.outline = 'none';
    });
}

// Gestionnaire global de copier-coller quand un modal est ouvert
let currentPasteHandler = null;

function enablePasteForModal(onPaste) {
    // Supprimer l'ancien handler
    if (currentPasteHandler) {
        document.removeEventListener('paste', currentPasteHandler);
    }

    currentPasteHandler = (e) => {
        // Ignorer si on est dans un champ texte
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const items = e.clipboardData?.items;
        if (!items) return;

        const imageFiles = [];
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) imageFiles.push(file);
            }
        }

        if (imageFiles.length > 0) {
            e.preventDefault();
            onPaste(imageFiles);
            showToast(`📋 ${imageFiles.length} image(s) collée(s)`, 'success');
        }
    };

    document.addEventListener('paste', currentPasteHandler);
}

function disablePasteForModal() {
    if (currentPasteHandler) {
        document.removeEventListener('paste', currentPasteHandler);
        currentPasteHandler = null;
    }
}

// Ajouter une image à la galerie avec une URL
function addImageRowWithUrl(url) {
    const container = document.getElementById('images-container');
    const row = document.createElement('div');
    row.className = 'img-row';
    row.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr auto; gap: 0.5rem; margin-bottom: 0.5rem;';
    row.innerHTML = `
        <input type="text" class="img-url" value="${url}" placeholder="URL de l'image">
        <input type="text" class="img-alt" value="" placeholder="Description">
        <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">🗑️</button>
    `;
    container.appendChild(row);
}

// Import de la galerie de projet
function handleProjetGalleryImport(input) {
    const files = Array.from(input.files);
    if (!files.length) return;

    showToast(`📷 Import de ${files.length} image(s)...`, 'info');
    files.forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
            showToast(`⚠️ ${file.name} trop grande`, 'warning');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => addImageRowWithUrl(e.target.result);
        reader.readAsDataURL(file);
    });
    showToast(`✅ Images ajoutées`, 'success');
    input.value = '';
}

// Fonctions pour ajouter des lignes dynamiquement
function addChiffreRow() {
    const container = document.getElementById('chiffres-container');
    const row = document.createElement('div');
    row.className = 'chiffre-row';
    row.style.cssText = 'display: grid; grid-template-columns: 1fr 2fr auto; gap: 0.5rem; margin-bottom: 0.5rem;';
    row.innerHTML = `
        <input type="text" class="chiffre-valeur" placeholder="Ex: 150 000 €">
        <input type="text" class="chiffre-label" placeholder="Ex: Budget total">
        <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">🗑️</button>
    `;
    container.appendChild(row);
}

function addChronoRow() {
    const container = document.getElementById('chrono-container');
    const row = document.createElement('div');
    row.className = 'chrono-row';
    row.style.cssText = 'display: grid; grid-template-columns: 120px 1fr auto; gap: 0.5rem; margin-bottom: 0.5rem;';
    row.innerHTML = `
        <input type="text" class="chrono-date" placeholder="Ex: 2027">
        <input type="text" class="chrono-event" placeholder="Ex: Lancement des travaux">
        <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">🗑️</button>
    `;
    container.appendChild(row);
}

function addDocRow() {
    const container = document.getElementById('docs-container');
    const row = document.createElement('div');
    row.className = 'doc-row';
    row.style.cssText = 'display: grid; grid-template-columns: 1fr 2fr auto; gap: 0.5rem; margin-bottom: 0.5rem;';
    row.innerHTML = `
        <input type="text" class="doc-nom" placeholder="Nom du document">
        <input type="text" class="doc-url" placeholder="URL ou chemin">
        <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">🗑️</button>
    `;
    container.appendChild(row);
}

// Gestion de l'import d'image
async function handleImageImport(input) {
    const file = input.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        showToast('Image trop grande (max 2 Mo)', 'warning');
        return;
    }

    // Générer un nom de fichier propre
    const fileName = file.name.replace(/\s+/g, '_').toLowerCase();
    const imagePath = 'images/objectifs/' + fileName;

    // Afficher la prévisualisation
    const preview = document.getElementById('image-preview');
    const reader = new FileReader();
    reader.onload = async function(e) {
        preview.innerHTML = `<img src="${e.target.result}" style="max-width: 150px; max-height: 100px; border-radius: 8px; border: 1px solid var(--gris-border);">`;
        preview.style.display = 'block';

        // Upload automatique sur GitHub
        const token = getToken();
        if (token) {
            showToast('Upload de l\'image en cours...', 'info');
            const base64Content = e.target.result.split(',')[1];

            try {
                // Vérifier si le fichier existe déjà
                let sha = null;
                const getResponse = await fetch(
                    `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${imagePath}?ref=${GITHUB_CONFIG.branch}`,
                    { headers: { 'Authorization': `token ${token}` } }
                );
                if (getResponse.ok) {
                    sha = (await getResponse.json()).sha;
                }

                const body = {
                    message: `Upload image ${fileName}`,
                    content: base64Content,
                    branch: GITHUB_CONFIG.branch
                };
                if (sha) body.sha = sha;

                const response = await fetch(
                    `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${imagePath}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Authorization': `token ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(body)
                    }
                );

                if (response.ok) {
                    showToast('Image uploadée sur GitHub !', 'success');
                    document.getElementById('edit-image').value = imagePath;
                } else {
                    const error = await response.json();
                    throw new Error(error.message);
                }
            } catch (err) {
                showToast('Erreur upload: ' + err.message, 'error');
                // Mettre quand même le chemin pour usage local
                document.getElementById('edit-image').value = imagePath;
            }
        } else {
            // Pas de token = usage local uniquement
            document.getElementById('edit-image').value = imagePath;
            showToast('Image sélectionnée (local)', 'info');
        }
    };
    reader.readAsDataURL(file);
}

// Import d'image pour les articles (dossier images/articles/)
async function handleArticleImageImport(input) {
    const files = Array.from(input.files);
    if (!files.length) return;

    const token = getToken();
    if (!token) {
        showToast(`❌ Token GitHub requis pour uploader des images. Connectez-vous d'abord.`, 'error');
        input.value = '';
        return;
    }

    showToast(`📷 Compression et upload de ${files.length} image(s)...`, 'info');

    for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
            showToast(`⚠️ ${file.name} trop grande (max 10 Mo)`, 'warning');
            continue;
        }

        try {
            // Compresser l'image avant upload
            const compressedFile = await compressImage(file, 1920, 0.85);
            const originalSize = (file.size / 1024).toFixed(0);
            const newSize = (compressedFile.size / 1024).toFixed(0);

            // Générer un nom unique
            const timestamp = Date.now();
            const fileName = `article_${timestamp}_${compressedFile.name.replace(/\s+/g, '_').toLowerCase()}`;
            const imagePath = `images/articles/${fileName}`;

            // Lire en base64 pour l'upload GitHub
            const dataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(compressedFile);
            });

            showToast(`⏳ Upload ${file.name}...`, 'info');
            const base64Content = dataUrl.split(',')[1];

            // Vérifier si le fichier existe déjà
            let sha = null;
            const getResponse = await fetch(
                `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${imagePath}?ref=${GITHUB_CONFIG.branch}`,
                { headers: { 'Authorization': `token ${token}` } }
            );
            if (getResponse.ok) {
                sha = (await getResponse.json()).sha;
            }

            const body = {
                message: `Upload image article ${fileName}`,
                content: base64Content,
                branch: GITHUB_CONFIG.branch
            };
            if (sha) body.sha = sha;

            const response = await fetch(
                `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${imagePath}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                }
            );

            if (response.ok) {
                // Stocker le CHEMIN (jamais le base64!)
                const images = getArticleImages();
                images.push(imagePath);
                setArticleImages(images);
                showToast(`✅ ${file.name} uploadée (${originalSize} → ${newSize} Ko)`, 'success');
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Erreur upload');
            }
        } catch (err) {
            console.error('Erreur upload image article:', err);
            showToast(`❌ Échec ${file.name}: ${err.message}`, 'error');
        }
    }

    input.value = '';
}

function addImageRow() {
    const container = document.getElementById('images-container');
    const row = document.createElement('div');
    row.className = 'img-row';
    row.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr auto; gap: 0.5rem; margin-bottom: 0.5rem;';
    row.innerHTML = `
        <input type="text" class="img-url" placeholder="URL de l'image">
        <input type="text" class="img-alt" placeholder="Description">
        <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">🗑️</button>
    `;
    container.appendChild(row);
}

function updateThemePreview() {
    // Plus nécessaire avec le nouveau formulaire
}

function saveProjet() {
    const titre = document.getElementById('edit-titre').value.trim();
    
    // Récupérer les thèmes sélectionnés (badges)
    const themes = [];
    document.querySelectorAll('#themes-badges .theme-badge-select.selected').forEach(badge => {
        themes.push(badge.dataset.theme);
    });
    
    const statut = document.getElementById('edit-statut').value;
    const annee = parseInt(document.getElementById('edit-annee').value) || null;
    const importance = parseInt(document.getElementById('edit-importance').value) || 1;
    const resume = document.getElementById('edit-resume').value.trim();
    const description = document.getElementById('edit-description').value.trim();
    const budget = parseInt(document.getElementById('edit-budget').value) || 0;
    
    // Nouveaux champs
    const image = document.getElementById('edit-image').value.trim();
    const details = document.getElementById('edit-details').value.trim();
    
    // Récupérer les chiffres
    const chiffres = [];
    document.querySelectorAll('#chiffres-container .chiffre-row').forEach(row => {
        const valeur = row.querySelector('.chiffre-valeur').value.trim();
        const label = row.querySelector('.chiffre-label').value.trim();
        if (valeur || label) {
            chiffres.push({ valeur, label });
        }
    });
    
    // Récupérer la chronologie
    const chronologie = [];
    document.querySelectorAll('#chrono-container .chrono-row').forEach(row => {
        const date = row.querySelector('.chrono-date').value.trim();
        const evenement = row.querySelector('.chrono-event').value.trim();
        if (date || evenement) {
            chronologie.push({ date, evenement });
        }
    });
    
    // Récupérer les documents
    const documents = [];
    document.querySelectorAll('#docs-container .doc-row').forEach(row => {
        const nom = row.querySelector('.doc-nom').value.trim();
        const url = row.querySelector('.doc-url').value.trim();
        if (nom || url) {
            documents.push({ nom, url });
        }
    });
    
    // Récupérer les images de la galerie
    const images = [];
    document.querySelectorAll('#images-container .img-row').forEach(row => {
        const url = row.querySelector('.img-url').value.trim();
        const alt = row.querySelector('.img-alt').value.trim();
        if (url) {
            images.push({ url, alt });
        }
    });

    // Récupérer les champs Fiche Objectif
    const slogan = document.getElementById('edit-slogan').value.trim();
    const numero = document.getElementById('edit-numero').value.trim();
    const tagsInput = document.getElementById('edit-tags').value.trim();
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
    const enjeuxInput = document.getElementById('edit-enjeux').value.trim();
    const enjeux = enjeuxInput ? enjeuxInput.split('\n').map(e => e.trim()).filter(e => e) : [];
    const axesInput = document.getElementById('edit-axes').value.trim();
    const axes_action = axesInput ? axesInput.split('\n').map(a => a.trim()).filter(a => a) : [];
    const indicateursInput = document.getElementById('edit-indicateurs').value.trim();
    const indicateurs = indicateursInput ? indicateursInput.split(',').map(i => i.trim()).filter(i => i) : [];
    const vision = document.getElementById('edit-vision').value.trim();

    // Champs Urbanisme/Travaux
    const partenaires = document.getElementById('edit-partenaires').value.trim();
    const financement = document.getElementById('edit-financement').value.trim();
    const echeance = document.getElementById('edit-echeance').value.trim();
    const perimetre = document.getElementById('edit-perimetre').value.trim();

    if (!titre || themes.length === 0) {
        showToast('⚠️ Titre et au moins un thème obligatoires', 'warning');
        return;
    }

    const projet = {
        id: currentEdit.index === -1 ? Date.now() : data.projets[currentEdit.index].id,
        titre,
        themes,  // tableau de thèmes
        theme: themes[0],  // rétrocompatibilité : premier thème
        statut,
        annee,
        budget,
        resume,
        description,
        importance,
        image,
        images,
        chiffres,
        chronologie,
        documents,
        details,
        // Champs Fiche Objectif
        slogan,
        numero,
        tags,
        enjeux,
        axes_action,
        indicateurs,
        vision,
        // Champs Urbanisme/Travaux
        partenaires,
        financement,
        echeance,
        perimetre,
        // Conserver les sources existantes si modification
        sources: currentEdit.index === -1 ? [] : (data.projets[currentEdit.index].sources || []),
        lien_source: currentEdit.index === -1 ? [] : (data.projets[currentEdit.index].lien_source || [])
    };

    if (currentEdit.index === -1) {
        data.projets.push(projet);
    } else {
        data.projets[currentEdit.index] = projet;
    }
    
    markModified('projets');
    renderProjets();
    closeModal();
    showToast('✅ Projet enregistré', 'success');
}


function deleteProjet(index) {
    if (confirm('Supprimer ce projet ?')) {
        data.projets.splice(index, 1);
        markModified('projets');
        renderProjets();
        showToast('🗑️ Projet supprimé', 'success');
    }
}

// ===== ACTIONS =====
let currentActionFilter = '';

function renderCategoryFilters() {
    const container = document.getElementById('category-filters');
    if (!container) return;

    // Bouton "Tous"
    let html = '<button class="theme-btn ' + (!currentActionFilter && !currentCategoryFilter ? 'active' : '') + '" onclick="clearFilters()">📋 Tous (' + data.actions.length + ')</button>';

    // Boutons catégories
    CATEGORIES_ADMIN.forEach(cat => {
        const count = cat.themes.reduce((sum, t) => sum + data.actions.filter(a => a.theme === t).length, 0);
        const isActive = currentCategoryFilter === cat.id;
        html += '<button class="theme-btn ' + (isActive ? 'active' : '') + '" onclick="selectCategory(\'' + cat.id + '\')">' + cat.icon + ' ' + cat.name + ' (' + count + ')</button>';
    });

    container.innerHTML = html;
    renderThemeSubFilters();
}

function selectCategory(catId) {
    currentCategoryFilter = catId;
    currentActionFilter = '';
    renderCategoryFilters();
    renderActions();
}

function renderThemeSubFilters() {
    const container = document.getElementById('theme-filters-sub');
    if (!container) return;

    if (!currentCategoryFilter) {
        container.style.display = 'none';
        return;
    }

    const cat = CATEGORIES_ADMIN.find(c => c.id === currentCategoryFilter);
    if (!cat) return;

    container.style.display = 'block';
    let html = '<small style="color: var(--gris-texte);">Thèmes : </small>';
    cat.themes.forEach(theme => {
        const count = data.actions.filter(a => a.theme === theme).length;
        if (count === 0) return;
        const config = THEMES_ACTIONS_CONFIG[theme] || {};
        const isActive = currentActionFilter === theme;
        html += '<button class="theme-btn small ' + (isActive ? 'active' : '') + '" onclick="filterByTheme(\'' + theme + '\')">' + (config.icon || '📌') + ' ' + theme + ' (' + count + ')</button>';
    });
    container.innerHTML = html;
}

function filterByTheme(theme) {
    currentActionFilter = theme;
    renderCategoryFilters();
    renderActions();
}

function clearFilters() {
    currentCategoryFilter = null;
    currentActionFilter = '';
    renderCategoryFilters();
    renderActions();
}

function filterActions(theme) {
    currentActionFilter = theme;
    currentCategoryFilter = null;
    renderCategoryFilters();
    renderActions();
}

// Configuration des thèmes pour les actions (bilan)
const THEMES_ACTIONS_CONFIG = {
    'Urbanisme': { icon: '🏘️', color: '#34495e' },
    'Santé': { icon: '🏥', color: '#e91e63' },
    'Environnement': { icon: '🌿', color: '#27ae60' },
    'Culture': { icon: '🎭', color: '#9b59b6' },
    'Patrimoine': { icon: '🏛️', color: '#8e44ad' },
    'Enfance': { icon: '👶', color: '#3498db' },
    'Solidarité': { icon: '🤝', color: '#e74c3c' },
    'Sport': { icon: '⚽', color: '#2ecc71' },
    'Économie': { icon: '💼', color: '#f39c12' },
    'Intercommunalité': { icon: '🏙️', color: '#607d8b' },
    'Mobilités': { icon: '🚴', color: '#1abc9c' },
    'Tranquillité publique': { icon: '🛡️', color: '#2c3e50' },
    'Finance': { icon: '💰', color: '#795548' },
    'Travaux': { icon: '🏗️', color: '#ff5722' },
    'Administration': { icon: '📋', color: '#455a64' },
    'Jumelages': { icon: '🌍', color: '#00bcd4' },
    'Personnel': { icon: '👥', color: '#9c27b0' },
    'Plan Climat': { icon: '🌍', color: '#4caf50' }
};

// Variable pour suivre le thème actuellement affiché en détail pour les actions
let currentActionThemeDetail = null;

function renderActions() {
    renderCategoryFilters();

    const search = (document.getElementById('search-actions')?.value || '').toLowerCase();

    // Si recherche active, filtre thème ou filtre catégorie, afficher directement les cartes
    if (search || currentActionFilter || currentCategoryFilter) {
        showActionsCards(search);
        return;
    }

    // Si un thème est sélectionné en détail, afficher ses actions
    if (currentActionThemeDetail) {
        showActionThemeDetail(currentActionThemeDetail);
        return;
    }

    // Sinon, afficher la vue par thèmes
    showActionsThemesView();
}

function showActionsThemesView() {
    document.getElementById('actions-themes-view').style.display = 'grid';
    document.getElementById('actions-detail-view').style.display = 'none';

    // Grouper les actions par thème
    const themeGroups = {};
    data.actions.forEach(a => {
        const theme = a.theme || 'Non défini';
        if (!themeGroups[theme]) {
            themeGroups[theme] = [];
        }
        themeGroups[theme].push(a);
    });

    document.getElementById('actions-count').textContent = data.actions.length;

    // Trier les thèmes par nombre d'actions
    const sortedThemes = Object.entries(themeGroups).sort((a, b) => b[1].length - a[1].length);

    document.getElementById('actions-themes-view').innerHTML = sortedThemes.length === 0
        ? '<div class="empty-state" style="grid-column: 1/-1;"><div class="icon">📭</div><p>Aucune action</p></div>'
        : sortedThemes.map(([themeName, actions]) => {
            const themeConf = THEMES_ACTIONS_CONFIG[themeName] || { icon: '📋', color: '#1a3a5c' };
            const realises = actions.filter(a => a.statut === 'Réalisé').length;
            const encours = actions.filter(a => a.statut === 'En cours').length;

            return `
            <div class="theme-card" onclick="showActionThemeDetail('${themeName}')">
                <div class="theme-card-header" style="background: ${themeConf.color}">
                    <span class="theme-card-icon">${themeConf.icon}</span>
                    <div class="theme-card-info">
                        <h3>${themeName}</h3>
                        <span class="count">${actions.length} action${actions.length > 1 ? 's' : ''}</span>
                    </div>
                </div>
                <div class="theme-card-stats">
                    <span>✅ ${realises} réalisée(s)${encours > 0 ? ' • 🔄 ' + encours + ' en cours' : ''}</span>
                    <span class="theme-card-arrow">→</span>
                </div>
            </div>
        `}).join('');
}

function showActionThemeDetail(themeName) {
    currentActionThemeDetail = themeName;
    document.getElementById('actions-themes-view').style.display = 'none';
    document.getElementById('actions-detail-view').style.display = 'block';

    const themeConf = THEMES_ACTIONS_CONFIG[themeName] || { icon: '📋', color: '#1a3a5c' };

    // Filtrer les actions de ce thème et trier comme dans bilan.html
    const actions = data.actions.filter(a => a.theme === themeName)
        .sort((a, b) => (a.titre || '').localeCompare(b.titre || '', 'fr'));

    document.getElementById('actions-count').textContent = actions.length;

    document.getElementById('actions-detail-view').innerHTML = `
        <div class="theme-detail">
            <div class="theme-detail-header">
                <div class="theme-detail-title">
                    <span style="font-size: 1.5rem;">${themeConf.icon}</span>
                    <span>${themeName}</span>
                    <span style="color: #888; font-weight: normal; font-size: 1rem;">(${actions.length} action${actions.length > 1 ? 's' : ''})</span>
                </div>
                <button class="btn-back-theme" onclick="backToActionsThemes()">← Retour aux thèmes</button>
            </div>
            <div class="cards-grid">
                ${actions.map(a => renderActionCard(a)).join('')}
            </div>
        </div>
    `;
}

function backToActionsThemes() {
    currentActionThemeDetail = null;
    currentActionFilter = '';
    document.querySelectorAll('#tab-actions .theme-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('#tab-actions .theme-btn')?.classList.add('active');
    renderActions();
}

function showActionsCards(search) {
    document.getElementById('actions-themes-view').style.display = 'none';
    document.getElementById('actions-detail-view').style.display = 'block';

    let filtered = data.actions;

    // Filtre par catégorie (si pas de thème spécifique sélectionné)
    if (currentCategoryFilter && !currentActionFilter) {
        const cat = CATEGORIES_ADMIN.find(c => c.id === currentCategoryFilter);
        if (cat) {
            filtered = filtered.filter(a => cat.themes.includes(a.theme));
        }
    }

    // Filtre par thème
    if (currentActionFilter) {
        filtered = filtered.filter(a => a.theme === currentActionFilter);
    }

    // Filtre par recherche
    if (search) {
        filtered = filtered.filter(a =>
            (a.titre || '').toLowerCase().includes(search) ||
            (a.description || '').toLowerCase().includes(search)
        );
    }

    // Trier comme dans bilan.html (importance croissante, année décroissante)
    filtered.sort((a, b) => (a.titre || '').localeCompare(b.titre || '', 'fr'));

    document.getElementById('actions-count').textContent = filtered.length;

    document.getElementById('actions-detail-view').innerHTML = `
        <div class="theme-detail">
            <div class="theme-detail-header">
                <div class="theme-detail-title">
                    <span>🔍 Résultats</span>
                    <span style="color: #888; font-weight: normal; font-size: 1rem;">(${filtered.length} action${filtered.length > 1 ? 's' : ''})</span>
                </div>
                <button class="btn-back-theme" onclick="backToActionsThemes()">← Retour aux thèmes</button>
            </div>
            <div class="cards-grid">
                ${filtered.length === 0
                    ? '<div class="empty-state" style="grid-column: 1/-1;"><div class="icon">📭</div><p>Aucune action trouvée</p></div>'
                    : filtered.map(a => renderActionCard(a)).join('')}
            </div>
        </div>
    `;
}

function renderActionCard(a) {
    const themeConf = THEMES_ACTIONS_CONFIG[a.theme] || { icon: '📋', color: '#1a3a5c' };
    const statut = a.statut || 'Réalisé';
    const statutClass = statut.toLowerCase().replace(/\s+/g, '-').replace('é', 'e');
    const hasImages = a.images && a.images.length > 0;
    const coverImage = hasImages ? a.images[0] : (a.image || '');

    return `
        <div class="admin-card">
            ${coverImage ? `
                <div class="admin-card-image" style="position: relative;">
                    <img src="${coverImage}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px 8px 0 0;">
                    ${hasImages && a.images.length > 1 ? `<span style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.7); color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem;">📷 ${a.images.length}</span>` : ''}
                </div>
            ` : ''}
            <div class="admin-card-header">
                <span class="admin-card-theme" style="background: ${themeConf.color}">
                    ${themeConf.icon} ${a.theme}
                </span>
                <span class="admin-card-statut statut-${statutClass}">${statut}</span>
            </div>
            <div class="admin-card-body">
                <div class="admin-card-title">${a.titre}</div>
                <div class="admin-card-desc">${a.description || ''}</div>
                <div class="admin-card-footer">
                    <span class="admin-card-meta">${a.annee || ''}</span>
                    <div class="admin-card-actions">
                        <button class="btn btn-sm" style="background: #1877f2; color: white;" onclick="shareOnFBAdmin('action', ${data.actions.indexOf(a)})" title="Partager sur Facebook">📘</button>
                        <button class="btn btn-sm btn-primary" onclick="openEditAction(${data.actions.indexOf(a)})">✏️ Modifier</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteAction(${data.actions.indexOf(a)})">🗑️</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function openAddAction() {
    currentEdit = { type: 'action', index: -1 };
    showActionModal({});
}

function openEditAction(index) {
    currentEdit = { type: 'action', index };
    showActionModal(data.actions[index]);
}

function showActionModal(a) {
    document.getElementById('modal-title').textContent = currentEdit.index === -1 ? '➕ Ajouter une action' : '✏️ Modifier l\'action';
    document.getElementById('modal-body').innerHTML = `
        <div class="form-group">
            <label>Titre *</label>
            <input type="text" id="edit-titre" value="${a.titre || ''}">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Thème *</label>
                <select id="edit-theme">
                    <option value="">-- Choisir --</option>
                    ${THEMES_ACTIONS.map(t => `<option value="${t.value}" ${a.theme === t.value ? 'selected' : ''}>${t.label}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Statut</label>
                <select id="edit-statut">
                    <option value="Réalisé" ${a.statut === 'Réalisé' ? 'selected' : ''}>✅ Réalisé</option>
                    <option value="En cours" ${a.statut === 'En cours' ? 'selected' : ''}>🔄 En cours</option>
                    <option value="Prévu" ${a.statut === 'Prévu' ? 'selected' : ''}>📅 Prévu</option>
                </select>
            </div>
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea id="edit-description" rows="3">${a.description || ''}</textarea>
        </div>

        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
            <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: var(--bleu);">📷 Images de l'action</label>
            <div id="action-dropzone" class="photo-upload" onclick="document.getElementById('import-action-images').click()" style="padding: 1rem; text-align: center; border: 2px dashed var(--gris-border); border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                <input type="file" id="import-action-images" accept="image/*" multiple onchange="handleActionImageImport(this)" style="display: none;">
                <div style="font-size: 1.5rem;">📁</div>
                <p style="margin: 0.5rem 0 0; font-size: 0.85rem; color: #666;">Cliquez ou glissez-déposez des images</p>
            </div>
            <input type="hidden" id="edit-action-images" value='${JSON.stringify(a.images || [])}'>
            <div id="action-images-gallery" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem;">
                ${(a.images || []).map((img, idx) => `
                    <div style="position: relative;">
                        <img src="${img}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px;">
                        <button type="button" onclick="removeActionImage(${idx})" style="position: absolute; top: -6px; right: -6px; background: var(--rouge); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 0.7rem;">✕</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    document.getElementById('modal-save').onclick = saveAction;
    document.getElementById('modal-edit').classList.add('active');

    // Activer le drag & drop
    const dropzone = document.getElementById('action-dropzone');
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--vert)';
        dropzone.style.background = '#e8f5e9';
    });
    dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--gris-border)';
        dropzone.style.background = 'transparent';
    });
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--gris-border)';
        dropzone.style.background = 'transparent';
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (files.length > 0) {
            processActionDroppedFiles(files);
        }
    });

    // Activer le copier-coller (Ctrl+V / Cmd+V)
    enablePasteForModal((files) => processActionDroppedFiles(files));
}

async function processActionDroppedFiles(files) {
    const token = document.getElementById('github-token')?.value?.trim();
    if (!token) {
        showToast('❌ Token GitHub requis pour uploader des images', 'error');
        return;
    }

    showToast(`📷 Upload de ${files.length} image(s)...`, 'info');

    for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
            showToast(`⚠️ ${file.name} trop grande (max 5 Mo)`, 'warning');
            continue;
        }

        try {
            // Compresser l'image
            const compressedFile = await compressImage(file, 1920, 0.85);
            const originalSize = (file.size / 1024).toFixed(0);
            const newSize = (compressedFile.size / 1024).toFixed(0);

            // Lire le fichier compressé
            const dataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(compressedFile);
            });

            const base64Content = dataUrl.split(',')[1];
            const timestamp = Date.now();
            const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_').toLowerCase();
            const fileName = `action_${timestamp}_${cleanName}`.replace(/\.[^.]+$/, '.jpg');
            const imagePath = `images/actions/${fileName}`;

            showToast(`⏳ Upload ${file.name} (${originalSize}→${newSize} Ko)...`, 'info');

            // Vérifier si le fichier existe
            let sha = null;
            const getResponse = await fetch(
                `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${imagePath}?ref=${GITHUB_CONFIG.branch}`,
                { headers: { 'Authorization': `token ${token}` } }
            );
            if (getResponse.ok) {
                sha = (await getResponse.json()).sha;
            }

            const body = {
                message: `Upload image action ${fileName}`,
                content: base64Content,
                branch: GITHUB_CONFIG.branch
            };
            if (sha) body.sha = sha;

            const response = await fetch(
                `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${imagePath}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                }
            );

            if (response.ok) {
                // Stocker le CHEMIN (pas le base64!)
                const images = getActionImages();
                images.push(imagePath);
                setActionImages(images);
                showToast(`✅ ${file.name} uploadée !`, 'success');
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Upload failed');
            }
        } catch (err) {
            console.error('Erreur upload image action:', err);
            showToast(`❌ Échec ${file.name}: ${err.message}`, 'error');
        }
    }
}

// Gestion des images pour les actions
function getActionImages() {
    try {
        return JSON.parse(document.getElementById('edit-action-images').value || '[]');
    } catch (e) {
        return [];
    }
}

function setActionImages(images) {
    document.getElementById('edit-action-images').value = JSON.stringify(images);
    renderActionImagesGallery();
}

function renderActionImagesGallery() {
    const images = getActionImages();
    const gallery = document.getElementById('action-images-gallery');
    gallery.innerHTML = images.map((img, idx) => {
        // Convertir chemin relatif en URL GitHub si nécessaire
        let imgSrc = img;
        if (img && !img.startsWith('data:') && !img.startsWith('http')) {
            imgSrc = `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${img}`;
        }
        return `
        <div style="position: relative;">
            <img src="${imgSrc}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px;" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22><rect fill=%22%23eee%22 width=%2280%22 height=%2280%22/><text x=%2240%22 y=%2245%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2210%22>Erreur</text></svg>'">
            <button type="button" onclick="removeActionImage(${idx})" style="position: absolute; top: -6px; right: -6px; background: var(--rouge); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 0.7rem;">✕</button>
        </div>
    `}).join('');
}

function removeActionImage(index) {
    const images = getActionImages();
    images.splice(index, 1);
    setActionImages(images);
}

async function handleActionImageImport(input) {
    const files = Array.from(input.files);
    if (!files.length) return;

    const token = getToken();
    if (!token) {
        showToast(`❌ Token GitHub requis pour uploader des images. Connectez-vous d'abord.`, 'error');
        input.value = '';
        return;
    }

    showToast(`📷 Compression et upload de ${files.length} image(s)...`, 'info');

    for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
            showToast(`⚠️ ${file.name} trop grande (max 10 Mo)`, 'warning');
            continue;
        }

        try {
            // Compresser l'image (max 1200px pour les actions, qualité 80%)
            const compressedFile = await compressImage(file, 1200, 0.80);
            const originalSize = (file.size / 1024).toFixed(0);
            const newSize = (compressedFile.size / 1024).toFixed(0);

            // Générer un nom de fichier unique
            const timestamp = Date.now();
            const fileName = `action_${timestamp}_${compressedFile.name.replace(/\s+/g, '_').toLowerCase()}`;
            const imagePath = `images/actions/${fileName}`;

            // Lire le fichier en base64 pour l'upload
            const dataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(compressedFile);
            });

            // Upload vers GitHub (obligatoire)
            showToast(`⏳ Upload ${file.name}...`, 'info');
            const base64Content = dataUrl.split(',')[1];

            const response = await fetch(
                `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${imagePath}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Upload image action ${fileName}`,
                        content: base64Content,
                        branch: GITHUB_CONFIG.branch
                    })
                }
            );

            if (response.ok) {
                // Stocker le chemin relatif (JAMAIS le base64!)
                const images = getActionImages();
                images.push(imagePath);
                setActionImages(images);
                showToast(`✅ ${file.name} uploadée (${originalSize} → ${newSize} Ko)`, 'success');
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Erreur upload GitHub');
            }
        } catch (err) {
            console.error('Erreur upload image action:', err);
            showToast(`❌ Échec upload ${file.name}: ${err.message}`, 'error');
            // NE PAS stocker en base64 en cas d'erreur!
        }
    }

    input.value = '';
}

function saveAction() {
    const titre = document.getElementById('edit-titre').value.trim();
    const theme = document.getElementById('edit-theme').value;
    const statut = document.getElementById('edit-statut').value;
    const description = document.getElementById('edit-description').value.trim();
    let images = getActionImages();

    if (!titre || !theme) {
        showToast('⚠️ Titre et thème obligatoires', 'warning');
        return;
    }

    // SÉCURITÉ : Filtrer les images base64 (ne garder que les chemins)
    images = images.filter(img => !img.startsWith('data:') && !img.startsWith('file://'));
    if (images.length !== getActionImages().length) {
        showToast('⚠️ Images non uploadées ignorées', 'warning');
    }

    const actionData = { titre, theme, statut, description };
    if (images.length > 0) {
        actionData.images = images;
        actionData.image = images[0]; // Première image comme couverture
    }

    if (currentEdit.index === -1) {
        actionData.id = Date.now();
        data.actions.push(actionData);
    } else {
        Object.assign(data.actions[currentEdit.index], actionData);
    }

    markModified('actions');
    renderActions();
    closeModal();
    showToast('✅ Action enregistrée', 'success');
}

function deleteAction(index) {
    if (confirm('Supprimer cette action ?')) {
        data.actions.splice(index, 1);
        markModified('actions');
        renderActions();
        showToast('🗑️ Action supprimée', 'success');
    }
}

// ===== CANDIDATS =====
function getPhotoUrl(photo) {
    if (!photo) return null;
    // Ignorer les chemins locaux
    if (photo.startsWith('file://')) return null;
    // Si c'est déjà une URL complète
    if (photo.startsWith('http')) return photo;
    // Si c'est un chemin relatif, construire l'URL GitHub
    return `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${photo}`;
}

function renderCandidats() {
    const search = (document.getElementById('search-candidats')?.value || '').toLowerCase();
    const sorted = [...data.candidats].sort((a, b) => {
        const aOrdre = a.ordre != null ? a.ordre : Infinity;
        const bOrdre = b.ordre != null ? b.ordre : Infinity;
        if (aOrdre !== bOrdre) return aOrdre - bOrdre;
        return (a.nom || '').localeCompare(b.nom || '', 'fr');
    });

    const filtered = sorted.filter(c => {
        if (!search) return true;
        return (c.prenom || '').toLowerCase().includes(search) ||
               (c.nom || '').toLowerCase().includes(search) ||
               (c.role || '').toLowerCase().includes(search) ||
               (c.delegation || '').toLowerCase().includes(search) ||
               (c.bio || '').toLowerCase().includes(search);
    });

    document.getElementById('candidats-count').textContent = filtered.length;

    document.getElementById('candidats-list').innerHTML = filtered.length === 0
        ? '<div class="empty-state"><div class="icon">👥</div><p>Aucun candidat' + (search ? ' trouvé' : '') + '</p></div>'
        : filtered.map((c, i) => {
            const realIndex = data.candidats.indexOf(c);
            const photoUrl = getPhotoUrl(c.photo);

            let socialsHtml = '';
            if (c.email || c.facebook || c.linkedin || c.twitter) {
                socialsHtml = '<div class="candidat-card-socials">';
                if (c.email) socialsHtml += `<span title="${c.email}">📧</span>`;
                if (c.facebook) socialsHtml += `<span title="Facebook">📘</span>`;
                if (c.linkedin) socialsHtml += `<span title="LinkedIn">💼</span>`;
                if (c.twitter) socialsHtml += `<span title="Twitter">🐦</span>`;
                socialsHtml += '</div>';
            }

            return `
                <div class="candidat-card">
                    <div class="candidat-card-photo">
                        ${photoUrl
                            ? `<img src="${photoUrl}" alt="${c.prenom} ${c.nom}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                               <span class="no-photo" style="display:none;">👤</span>`
                            : '<span class="no-photo">👤</span>'}
                        ${c.ordre != null ? `<span class="candidat-card-ordre">${c.ordre}</span>` : ''}
                    </div>
                    <div class="candidat-card-body">
                        <div class="candidat-card-name">${c.prenom || ''} ${c.nom || 'Sans nom'} ${c.nouveau ? '<span style="background:var(--or);color:white;font-size:0.7rem;padding:0.1rem 0.4rem;border-radius:8px;margin-left:0.3rem;">Nouveau</span>' : ''}</div>
                        ${c.role ? `<div class="candidat-card-role">${c.role}</div>` : ''}
                        ${c.delegation ? `<div class="candidat-card-delegation">${c.delegation}</div>` : ''}
                        ${c.bio ? `<div class="candidat-card-bio">${c.bio}</div>` : ''}
                        ${c.citation ? `<div class="candidat-card-citation">« ${c.citation} »</div>` : ''}
                        ${socialsHtml}
                        <div class="candidat-card-footer">
                            <button class="btn btn-sm" style="background: #25D366; color: white;" onclick="copyForWhatsApp('candidat', ${realIndex})" title="WhatsApp">💬</button>
                            <button class="btn btn-sm" style="background: #1877f2; color: white;" onclick="shareOnFBAdmin('candidat', ${realIndex})" title="Partager sur Facebook">📘</button>
                            <button class="btn btn-sm btn-primary" onclick="openEditCandidat(${realIndex})">✏️ Modifier</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteCandidat(${realIndex})">🗑️</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
}

function openAddCandidat() {
    currentEdit = { type: 'candidat', index: -1 };
    pendingPhoto = null;
    pendingVideo = null;
    showCandidatModal({});
}

function openEditCandidat(index) {
    currentEdit = { type: 'candidat', index };
    pendingPhoto = null;
    pendingVideo = null;
    showCandidatModal(data.candidats[index]);
}

function showCandidatModal(c) {
    const photoUrl = getPhotoUrl(c.photo);
    document.getElementById('modal-title').textContent = currentEdit.index === -1 ? '➕ Ajouter un candidat' : '✏️ Modifier le candidat';
    document.getElementById('modal-body').innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Prénom *</label>
                <input type="text" id="edit-prenom" value="${c.prenom || ''}">
            </div>
            <div class="form-group">
                <label>Nom *</label>
                <input type="text" id="edit-nom" value="${c.nom || ''}">
            </div>
            <div class="form-group">
                <label>N° liste <small style="color:#888;">(vide = alpha)</small></label>
                <input type="number" id="edit-ordre" value="${c.ordre != null ? c.ordre : ''}" min="1" placeholder="Auto">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Rôle / Fonction</label>
                <input type="text" id="edit-role" value="${c.role || ''}" placeholder="Ex: Adjoint aux finances">
            </div>
            <div class="form-group">
                <label>Délégation / Domaine</label>
                <input type="text" id="edit-delegation" value="${c.delegation || ''}" placeholder="Ex: Urbanisme, Environnement">
            </div>
        </div>
        <div class="form-group" style="margin-bottom:0.5rem;">
            <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
                <input type="checkbox" id="edit-nouveau" ${c.nouveau ? 'checked' : ''} style="width:auto;">
                <span>Nouveau candidat <small style="color:#888;">(ne fait pas partie de l'équipe municipale actuelle)</small></span>
            </label>
        </div>
        <div class="form-group">
            <label>Biographie</label>
            <textarea id="edit-bio" rows="3" placeholder="Courte présentation...">${c.bio || ''}</textarea>
        </div>
        <div class="form-group">
            <label>🎓 Parcours</label>
            <textarea id="edit-pedigree" rows="3" placeholder="Formation, expériences professionnelles, engagements passés...">${c.pedigree || ''}</textarea>
        </div>
        <div class="form-group">
            <label>🎯 Objectifs de campagne</label>
            <textarea id="edit-objectifs" rows="3" placeholder="Mes priorités pour Vizille...">${c.objectifs || ''}</textarea>
        </div>
        <div class="form-group">
            <label>💬 Citation / Engagement personnel</label>
            <input type="text" id="edit-citation" value="${c.citation || ''}" placeholder="Ex: Mon engagement pour Vizille...">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>📧 Email (optionnel)</label>
                <input type="email" id="edit-email" value="${c.email || ''}" placeholder="prenom.nom@email.com">
            </div>
            <div class="form-group">
                <label>📘 Facebook (URL)</label>
                <input type="url" id="edit-facebook" value="${c.facebook || ''}" placeholder="https://facebook.com/...">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>💼 LinkedIn (URL)</label>
                <input type="url" id="edit-linkedin" value="${c.linkedin || ''}" placeholder="https://linkedin.com/in/...">
            </div>
            <div class="form-group">
                <label>🐦 Twitter (URL)</label>
                <input type="url" id="edit-twitter" value="${c.twitter || ''}" placeholder="https://twitter.com/...">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Photo</label>
                <div class="photo-upload" onclick="document.getElementById('photo-input').click()"
                     ondragover="event.preventDefault(); this.classList.add('dragover')"
                     ondragleave="this.classList.remove('dragover')"
                     ondrop="handlePhotoDrop(event)">
                    <input type="file" id="photo-input" accept="image/*" onchange="handlePhotoSelect(event)">
                    <div class="icon">📷</div>
                    <p>Cliquez, glissez ou collez (Ctrl+V) une photo</p>
                    <p style="font-size: 0.8rem; opacity: 0.7;">Max 1 Mo • JPG, PNG</p>
                </div>
                <div class="photo-preview ${photoUrl ? 'active' : ''}" id="photo-preview">
                    <button class="photo-remove-btn" onclick="removePhoto()" title="Retirer la photo">✕</button>
                    <img src="${photoUrl || ''}" id="photo-preview-img" onerror="this.parentElement.classList.remove('active');">
                </div>
            </div>
            <div class="form-group">
                <label>🎬 Portrait vidéo (optionnel)</label>
                <div class="photo-upload" onclick="document.getElementById('video-input').click()"
                     ondragover="event.preventDefault(); this.classList.add('dragover')"
                     ondragleave="this.classList.remove('dragover')"
                     ondrop="handleVideoDrop(event)">
                    <input type="file" id="video-input" accept="video/mp4" onchange="handleVideoSelect(event)">
                    <div class="icon">🎬</div>
                    <p>Vidéo portrait (sans son)</p>
                    <p style="font-size: 0.8rem; opacity: 0.7;">Max 2 Mo • MP4 • 3-7 sec</p>
                </div>
                <div class="photo-preview ${c.video ? 'active' : ''}" id="video-preview">
                    <button class="photo-remove-btn" onclick="removeVideo()" title="Retirer la vidéo">✕</button>
                    ${c.video ? `<video src="${c.video}" style="max-width:200px;border-radius:8px;" autoplay muted loop playsinline></video>` : ''}
                </div>
            </div>
        </div>
    `;
    document.getElementById('modal-save').onclick = saveCandidat;
    document.getElementById('modal-edit').classList.add('active');

    // Activer le copier-coller photo (Ctrl+V / Cmd+V)
    enablePasteForModal(async (imageFiles) => {
        if (imageFiles.length > 0) {
            await processPhoto(imageFiles[0]);
        }
    });

    // Brouillon : proposer la restauration si un brouillon existe (uniquement pour un nouveau candidat)
    if (currentEdit.index === -1) {
        const draft = getDraft();
        if (draft) {
            const restore = confirm('📝 Un brouillon a été trouvé. Voulez-vous le restaurer ?');
            if (restore) {
                restoreDraft(draft);
                showToast('📝 Brouillon restauré', 'info');
            } else {
                clearDraft();
            }
        }
    }

    // Brouillon : auto-save toutes les 5 secondes
    if (window._draftInterval) clearInterval(window._draftInterval);
    window._draftInterval = setInterval(() => {
        if (document.getElementById('modal-edit').classList.contains('active')) {
            saveDraft();
        }
    }, 5000);
}

// ===== BROUILLON AUTO-SAVE (localStorage) =====
const DRAFT_KEY = 'vizille_draft_candidat';

function saveDraft() {
    const fields = ['edit-prenom', 'edit-nom', 'edit-role', 'edit-delegation', 'edit-bio',
                   'edit-pedigree', 'edit-objectifs', 'edit-citation', 'edit-email',
                   'edit-facebook', 'edit-linkedin', 'edit-twitter', 'edit-ordre'];
    const draft = {};
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) draft[id] = el.value;
    });
    const nouveau = document.getElementById('edit-nouveau');
    if (nouveau) draft['edit-nouveau'] = nouveau.checked;
    draft._timestamp = Date.now();
    try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch(e) { /* localStorage plein ou indisponible */ }
}

function getDraft() {
    try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return null;
        const draft = JSON.parse(raw);
        // Ignorer les brouillons de plus de 24h
        if (draft._timestamp && (Date.now() - draft._timestamp) > 24 * 60 * 60 * 1000) {
            clearDraft();
            return null;
        }
        // Vérifier qu'il y a du contenu utile
        const hasContent = ['edit-prenom', 'edit-nom', 'edit-bio', 'edit-role'].some(k => draft[k] && draft[k].trim());
        return hasContent ? draft : null;
    } catch(e) { return null; }
}

function restoreDraft(draft) {
    Object.keys(draft).forEach(id => {
        if (id.startsWith('_')) return;
        const el = document.getElementById(id);
        if (!el) return;
        if (id === 'edit-nouveau') {
            el.checked = !!draft[id];
        } else {
            el.value = draft[id] || '';
        }
    });
}

function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch(e) {}
    if (window._draftInterval) {
        clearInterval(window._draftInterval);
        window._draftInterval = null;
    }
}

let pendingVideo = null;

function handleVideoSelect(event) {
    const file = event.target.files[0];
    if (file) processVideo(file);
}

function handleVideoDrop(event) {
    event.preventDefault();
    event.target.classList.remove('dragover');
    const file = event.dataTransfer.files[0];
    if (file) processVideo(file);
}

function processVideo(file) {
    if (file.size > 2 * 1024 * 1024) {
        showToast('⚠️ Vidéo trop grande (max 2 Mo). Compressez avec HandBrake.', 'warning');
        return;
    }
    if (!file.type.startsWith('video/')) {
        showToast('⚠️ Format non valide (MP4 requis)', 'warning');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        pendingVideo = {
            data: e.target.result,
            name: file.name,
            type: 'video/mp4'
        };
        const preview = document.getElementById('video-preview');
        preview.innerHTML = `
            <video src="${e.target.result}" style="max-width:200px;border-radius:8px;" autoplay muted loop playsinline></video>
            <button class="btn btn-sm btn-danger" style="margin-top: 0.5rem;" onclick="removeVideo()">🗑️ Supprimer</button>
        `;
        preview.classList.add('active');
        showToast(`🎬 Vidéo prête (${(file.size/1024).toFixed(0)} Ko)`, 'success');
    };
    reader.readAsDataURL(file);
}

function removeVideo() {
    pendingVideo = { remove: true };
    const preview = document.getElementById('video-preview');
    preview.innerHTML = '';
    preview.classList.remove('active');
    showToast('🗑️ Vidéo supprimée', 'info');
}

async function handlePhotoSelect(event) {
    const file = event.target.files[0];
    if (file) await processPhoto(file);
}

async function handlePhotoDrop(event) {
    event.preventDefault();
    event.target.classList.remove('dragover');
    const file = event.dataTransfer.files[0];
    if (file) await processPhoto(file);
}

async function processPhoto(file) {
    if (file.size > 5 * 1024 * 1024) {
        showToast('⚠️ Image trop grande (max 5 Mo)', 'warning');
        return;
    }

    if (!file.type.startsWith('image/')) {
        showToast('⚠️ Fichier non valide', 'warning');
        return;
    }

    // Compresser la photo (max 800px pour les portraits, qualité 85%)
    const compressedFile = await compressImage(file, 800, 0.85);
    const originalSize = (file.size / 1024).toFixed(0);
    const newSize = (compressedFile.size / 1024).toFixed(0);
    if (compressedFile.size < file.size) {
        showToast(`🗜️ Photo: ${originalSize} Ko → ${newSize} Ko`, 'info');
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        pendingPhoto = {
            data: e.target.result,
            name: compressedFile.name,
            type: 'image/jpeg'
        };
        
        document.getElementById('photo-preview-img').src = e.target.result;
        document.getElementById('photo-preview').classList.add('active');
        showToast('✅ Photo prête', 'success');
    };
    reader.readAsDataURL(file);
}

function removePhoto() {
    pendingPhoto = { remove: true };
    document.getElementById('photo-preview').classList.remove('active');
    document.getElementById('photo-preview-img').src = '';
}

async function saveCandidat() {
    const prenom = document.getElementById('edit-prenom').value.trim();
    const nom = document.getElementById('edit-nom').value.trim();
    const role = document.getElementById('edit-role').value.trim();
    const delegation = document.getElementById('edit-delegation').value.trim();
    const bio = document.getElementById('edit-bio').value.trim();
    const pedigree = document.getElementById('edit-pedigree').value.trim();
    const objectifs = document.getElementById('edit-objectifs').value.trim();
    const citation = document.getElementById('edit-citation').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    const facebook = document.getElementById('edit-facebook').value.trim();
    const linkedin = document.getElementById('edit-linkedin').value.trim();
    const twitter = document.getElementById('edit-twitter').value.trim();
    const ordreVal = document.getElementById('edit-ordre').value.trim();
    const ordre = ordreVal !== '' ? parseInt(ordreVal) : null;
    const nouveau = document.getElementById('edit-nouveau').checked;
    
    if (!prenom || !nom) {
        showToast('⚠️ Prénom et nom obligatoires', 'warning');
        return;
    }

    let photo = currentEdit.index >= 0 ? data.candidats[currentEdit.index].photo : null;
    let video = currentEdit.index >= 0 ? data.candidats[currentEdit.index].video : null;

    // Upload photo si nouvelle
    if (pendingPhoto && !pendingPhoto.remove) {
        showToast('⏳ Upload de la photo...', 'info');
        const photoUrl = await uploadPhoto(pendingPhoto, prenom + ' ' + nom);
        if (photoUrl) {
            photo = photoUrl;
        }
    } else if (pendingPhoto && pendingPhoto.remove) {
        photo = null;
    }

    // Upload vidéo si nouvelle
    if (pendingVideo && !pendingVideo.remove) {
        showToast('⏳ Upload de la vidéo...', 'info');
        const videoUrl = await uploadVideo(pendingVideo, prenom + ' ' + nom);
        if (videoUrl) {
            video = videoUrl;
        }
    } else if (pendingVideo && pendingVideo.remove) {
        video = null;
    }

    const candidatData = {
        id: currentEdit.index >= 0 ? data.candidats[currentEdit.index].id : Date.now(),
        prenom, nom, role, delegation, bio, pedigree, objectifs, citation, email, facebook, linkedin, twitter, ordre, nouveau, photo, video, actif: true
    };

    if (currentEdit.index === -1) {
        data.candidats.push(candidatData);
    } else {
        data.candidats[currentEdit.index] = candidatData;
    }
    
    markModified('candidats');
    renderCandidats();
    clearDraft(); // Supprimer le brouillon après sauvegarde réussie
    closeModal();
    showToast('✅ Candidat enregistré', 'success');
}

async function uploadPhoto(photoData, nom, retryCount = 0) {
    const token = getToken();
    if (!token) {
        showToast('⚠️ Token requis pour l\'upload', 'warning');
        return null;
    }

    // Nom de fichier propre
    const ext = photoData.name.split('.').pop().toLowerCase();
    const cleanName = nom.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Enlever accents
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-');
    const filename = `images/${cleanName}.${ext}`;
    
    // Extraire le base64 pur (sans le préfixe data:image/...)
    const base64Content = photoData.data.split(',')[1];

    try {
        // Récupérer le SHA si le fichier existe
        let sha = null;
        const getResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filename}?ref=${GITHUB_CONFIG.branch}`,
            { headers: { 'Authorization': `token ${token}` } }
        );
        if (getResponse.ok) {
            sha = (await getResponse.json()).sha;
        }

        const body = {
            message: `Upload photo ${nom}`,
            content: base64Content,
            branch: GITHUB_CONFIG.branch
        };
        if (sha) body.sha = sha;

        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filename}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            }
        );

        if (response.ok) {
            showToast('✅ Photo uploadée', 'success');
            return filename;
        } else if (response.status === 409 && retryCount < 3) {
            // Conflit - réessayer
            showToast('🔄 Conflit, nouvelle tentative...', 'warning');
            await new Promise(r => setTimeout(r, 1000));
            return uploadPhoto(photoData, nom, retryCount + 1);
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Upload failed');
        }
    } catch (err) {
        showToast('❌ Erreur upload: ' + err.message, 'error');
        return null;
    }
}

async function uploadVideo(videoData, nom, retryCount = 0) {
    const token = getToken();
    if (!token) {
        showToast('⚠️ Token requis pour l\'upload', 'warning');
        return null;
    }

    const cleanName = nom.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-');
    const filename = `images/candidats/${cleanName}.mp4`;

    const base64Content = videoData.data.split(',')[1];

    try {
        let sha = null;
        const getResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filename}?ref=${GITHUB_CONFIG.branch}`,
            { headers: { 'Authorization': `token ${token}` } }
        );
        if (getResponse.ok) {
            sha = (await getResponse.json()).sha;
        }

        const body = {
            message: `Upload vidéo portrait ${nom}`,
            content: base64Content,
            branch: GITHUB_CONFIG.branch
        };
        if (sha) body.sha = sha;

        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filename}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            }
        );

        if (response.ok) {
            showToast('✅ Vidéo uploadée', 'success');
            return filename;
        } else if (response.status === 409 && retryCount < 3) {
            showToast('🔄 Conflit, nouvelle tentative...', 'warning');
            await new Promise(r => setTimeout(r, 1000));
            return uploadVideo(videoData, nom, retryCount + 1);
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Upload failed');
        }
    } catch (err) {
        showToast('❌ Erreur upload vidéo: ' + err.message, 'error');
        return null;
    }
}

function deleteCandidat(index) {
    if (confirm('Supprimer ce candidat ?')) {
        data.candidats.splice(index, 1);
        markModified('candidats');
        renderCandidats();
        showToast('🗑️ Candidat supprimé', 'success');
    }
}

// ===== FAQ =====
let currentFaqCategoryFilter = '';

function filterFaq(category) {
    currentFaqCategoryFilter = category;
    document.querySelectorAll('#faq-category-filters .theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.faqCategory === category);
    });
    renderFaq();
}

function renderFaq() {
    const origineIcons = {
        'Site web': '🌐',
        'Facebook': '📘',
        'WhatsApp': '💬',
        'Permanence': '🏛️',
        'Email': '📧',
        'Porte-à-porte': '🚪',
        'Réunion publique': '🎤',
        'Marché': '🛒',
        'Terrain': '👣',
        'Autre': '📝'
    };

    // Compteurs par catégorie
    const catCounts = {};
    data.faq.forEach(f => {
        const cat = f.categorie || '';
        if (cat) catCounts[cat] = (catCounts[cat] || 0) + 1;
    });

    // Générer les boutons de filtre
    const filtersContainer = document.getElementById('faq-category-filters');
    document.getElementById('fcount-all').textContent = data.faq.length;
    const existingDynamic = filtersContainer.querySelectorAll('.dynamic-filter');
    existingDynamic.forEach(el => el.remove());

    Object.keys(catCounts).sort().forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'theme-btn dynamic-filter' + (currentFaqCategoryFilter === cat ? ' active' : '');
        btn.dataset.faqCategory = cat;
        btn.onclick = () => filterFaq(cat);
        btn.textContent = `${cat} (${catCounts[cat]})`;
        filtersContainer.appendChild(btn);
    });

    // Recherche texte
    const searchQuery = (document.getElementById('search-faq')?.value || '').toLowerCase();

    // Filtrer et trier
    let filtered = [...data.faq].map((f, originalIndex) => ({...f, originalIndex}));

    if (currentFaqCategoryFilter) {
        filtered = filtered.filter(f => f.categorie === currentFaqCategoryFilter);
    }
    if (searchQuery) {
        filtered = filtered.filter(f =>
            (f.question || '').toLowerCase().includes(searchQuery) ||
            (f.reponse || '').toLowerCase().includes(searchQuery) ||
            (f.pseudo || '').toLowerCase().includes(searchQuery)
        );
    }

    filtered.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date) - new Date(a.date);
    });

    document.getElementById('faq-count').textContent = data.faq.length;

    document.getElementById('faq-list').innerHTML = filtered.length === 0
        ? '<div class="empty-state"><div class="icon">❓</div><p>Aucune question</p></div>'
        : filtered.map((f) => {
            const i = f.originalIndex;
            const origineIcon = origineIcons[f.origine] || '❓';
            return `
            <div class="item-card">
                <div class="item-info">
                    <div class="item-text">
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.25rem;">
                            ${f.categorie ? `<span class="item-badge">${f.categorie}</span>` : ''}
                            ${f.origine ? `<span class="item-badge" style="background: #e8f4fc; color: var(--bleu);">${origineIcon} ${f.origine}</span>` : ''}
                            ${f.pseudo ? `<span class="item-badge" style="background: #f0f0f0; color: #666;">👤 ${f.pseudo}</span>` : ''}
                        </div>
                        <div class="item-title">${f.question}</div>
                        <div class="item-desc">${(f.reponse || '').substring(0, 100)}${f.reponse && f.reponse.length > 100 ? '...' : ''}</div>
                        ${f.date ? `<div class="item-desc" style="font-size: 0.8rem; opacity: 0.6;">📅 ${f.date}</div>` : ''}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm" style="background: #1877f2; color: white;" onclick="shareOnFBAdmin('faq', ${i})" title="Partager sur Facebook">📘</button>
                    <button class="btn btn-sm" style="background: #25D366; color: white;" onclick="copyForWhatsApp('faq', ${i})" title="Copier pour WhatsApp">💬</button>
                    <button class="btn btn-sm btn-primary" onclick="openEditFaq(${i})">✏️</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteFaq(${i})">🗑️</button>
                </div>
            </div>
        `}).join('');
}

function copyForWhatsApp(type, index) {
    let text = '';
    
    if (type === 'faq') {
        const f = data.faq[index];
        text = `❓ *QUESTION D'UN VIZILLOIS*\n\n`;
        if (f.pseudo) text += `👤 _${f.pseudo}_\n`;
        if (f.categorie) text += `🏷️ ${f.categorie}\n`;
        text += `\n📝 *${f.question}*\n\n`;
        text += `✅ *Notre réponse :*\n${f.reponse}\n\n`;
        text += `━━━━━━━━━━━━━━━\n`;
        text += `🗳️ *Vizille en Mouvement*\n`;
        text += `🌐 https://Vizilleenmouvement.github.io/Vizille-en-mouvement/`;
    } 
    else if (type === 'article') {
        const a = data.articles[index];
        text = `📰 *${a.titre}*\n\n`;
        if (a.date) text += `📅 ${a.date}\n\n`;
        text += `${a.resume || a.contenu?.substring(0, 200) || ''}\n\n`;
        text += `👉 Lire la suite sur notre site\n`;
        text += `━━━━━━━━━━━━━━━\n`;
        text += `🗳️ *Vizille en Mouvement*\n`;
        text += `🌐 https://Vizilleenmouvement.github.io/Vizille-en-mouvement/blog.html`;
    }
    else if (type === 'candidat') {
        const c = data.candidats[index];
        text = `👤 *${c.prenom} ${c.nom}*\n`;
        if (c.role) text += `_${c.role}_`;
        if (c.delegation) text += ` — _${c.delegation}_`;
        text += `\n\n`;
        if (c.bio) text += `${c.bio}\n\n`;
        if (c.objectifs) text += `🎯 *Objectifs :* ${c.objectifs}\n\n`;
        text += `━━━━━━━━━━━━━━━\n`;
        text += `🗳️ *Vizille en Mouvement*\n`;
        text += `🌐 https://vizilleenmouvement.fr/equipe.html`;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('✅ Copié ! Collez dans WhatsApp', 'success');
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('✅ Copié ! Collez dans WhatsApp', 'success');
    });
}

function openAddFaq() {
    currentEdit = { type: 'faq', index: -1 };
    showFaqModal({});
}

function openEditFaq(index) {
    currentEdit = { type: 'faq', index };
    showFaqModal(data.faq[index]);
}

function showFaqModal(f) {
    document.getElementById('modal-title').textContent = currentEdit.index === -1 ? '➕ Ajouter une question / message' : '✏️ Modifier';
    document.getElementById('modal-body').innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>📍 Origine *</label>
                <select id="edit-origine">
                    <option value="">-- Source --</option>
                    <option value="Site web" ${f.origine === 'Site web' ? 'selected' : ''}>🌐 Site web</option>
                    <option value="Facebook" ${f.origine === 'Facebook' ? 'selected' : ''}>📘 Facebook</option>
                    <option value="WhatsApp" ${f.origine === 'WhatsApp' ? 'selected' : ''}>💬 WhatsApp</option>
                    <option value="Permanence" ${f.origine === 'Permanence' ? 'selected' : ''}>🏛️ Permanence</option>
                    <option value="Email" ${f.origine === 'Email' ? 'selected' : ''}>📧 Email</option>
                    <option value="Porte-à-porte" ${f.origine === 'Porte-à-porte' ? 'selected' : ''}>🚪 Porte-à-porte</option>
                    <option value="Réunion publique" ${f.origine === 'Réunion publique' ? 'selected' : ''}>🎤 Réunion publique</option>
                    <option value="Marché" ${f.origine === 'Marché' ? 'selected' : ''}>🛒 Marché</option>
                    <option value="Terrain" ${f.origine === 'Terrain' ? 'selected' : ''}>👣 Terrain</option>
                    <option value="Autre" ${f.origine === 'Autre' ? 'selected' : ''}>📝 Autre</option>
                </select>
            </div>
            <div class="form-group">
                <label>👤 Pseudo / Nom</label>
                <input type="text" id="edit-pseudo" value="${f.pseudo || ''}" placeholder="Ex: Marie D., Anonyme...">
            </div>
            <div class="form-group">
                <label>📅 Date</label>
                <input type="date" id="edit-date" value="${f.date || ''}">
            </div>
        </div>
        <div class="form-group">
            <label>Question ou message de soutien *</label>
            <textarea id="edit-question" rows="4">${f.question || ''}</textarea>
        </div>
        <div class="form-group">
            <label>Réponse (optionnelle)</label>
            <textarea id="edit-reponse" rows="5" placeholder="Laissez vide pour un message de soutien sans réponse">${f.reponse || ''}</textarea>
        </div>
        <div class="form-group">
            <label>Catégorie / Thème</label>
            <select id="edit-categorie">
                <option value="">-- Choisir un thème --</option>
                <option value="Urbanisme" ${f.categorie === 'Urbanisme' ? 'selected' : ''}>🏗️ Urbanisme</option>
                <option value="Vie quotidienne" ${f.categorie === 'Vie quotidienne' ? 'selected' : ''}>🏡 Vie quotidienne</option>
                <option value="Culture" ${f.categorie === 'Culture' ? 'selected' : ''}>🎭 Culture</option>
                <option value="Sport" ${f.categorie === 'Sport' ? 'selected' : ''}>⚽ Sport</option>
                <option value="Social & Solidarité" ${f.categorie === 'Social & Solidarité' ? 'selected' : ''}>🤝 Social & Solidarité</option>
                <option value="Environnement" ${f.categorie === 'Environnement' ? 'selected' : ''}>🌿 Environnement</option>
                <option value="Tranquillité" ${f.categorie === 'Tranquillité' ? 'selected' : ''}>🛡️ Tranquillité</option>
                <option value="Finances" ${f.categorie === 'Finances' ? 'selected' : ''}>💰 Finances</option>
                <option value="Éducation" ${f.categorie === 'Éducation' ? 'selected' : ''}>📚 Éducation</option>
                <option value="Élections" ${f.categorie === 'Élections' ? 'selected' : ''}>🗳️ Élections</option>
                <option value="Participation" ${f.categorie === 'Participation' ? 'selected' : ''}>💬 Participation</option>
                <option value="Transports" ${f.categorie === 'Transports' ? 'selected' : ''}>🚌 Transports</option>
            </select>
        </div>
    `;
    document.getElementById('modal-save').onclick = saveFaq;
    document.getElementById('modal-edit').classList.add('active');
}

function saveFaq() {
    const question = document.getElementById('edit-question').value.trim();
    const reponse = document.getElementById('edit-reponse').value.trim();
    const categorie = document.getElementById('edit-categorie').value.trim();
    const origine = document.getElementById('edit-origine').value;
    const pseudo = document.getElementById('edit-pseudo').value.trim();
    const date = document.getElementById('edit-date').value;
    
    if (!question) {
        showToast('⚠️ Question ou message obligatoire', 'warning');
        return;
    }

    if (currentEdit.index === -1) {
        data.faq.push({ id: Date.now(), question, reponse, categorie, origine, pseudo, date });
    } else {
        Object.assign(data.faq[currentEdit.index], { question, reponse, categorie, origine, pseudo, date });
    }
    
    markModified('faq');
    renderFaq();
    closeModal();
    showToast('✅ Enregistré', 'success');
}

function deleteFaq(index) {
    if (confirm('Supprimer cet élément ?')) {
        data.faq.splice(index, 1);
        markModified('faq');
        renderFaq();
        showToast('🗑️ Supprimé', 'success');
    }
}

// ===== ARTICLES =====
let currentArticleFilter = '';

function filterArticles(category) {
    currentArticleFilter = category;
    // Mise à jour des boutons de filtre
    document.querySelectorAll('#article-category-filters .theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    renderArticles();
}

function updateArticleCategoryCounts() {
    const counts = { all: data.articles.length };
    const categories = ['Événement', 'Communiqué', 'Réunion', 'Action', 'Bilan', 'Projet', 'Tribune', 'Info'];
    categories.forEach(cat => {
        counts[cat] = data.articles.filter(a => a.categorie === cat).length;
    });

    const el = (id) => document.getElementById(id);
    if (el('acount-all')) el('acount-all').textContent = counts.all;
    if (el('acount-evenement')) el('acount-evenement').textContent = counts['Événement'] || 0;
    if (el('acount-communique')) el('acount-communique').textContent = counts['Communiqué'] || 0;
    if (el('acount-reunion')) el('acount-reunion').textContent = counts['Réunion'] || 0;
    if (el('acount-action')) el('acount-action').textContent = counts['Action'] || 0;
    if (el('acount-bilan')) el('acount-bilan').textContent = counts['Bilan'] || 0;
    if (el('acount-projet')) el('acount-projet').textContent = counts['Projet'] || 0;
    if (el('acount-tribune')) el('acount-tribune').textContent = counts['Tribune'] || 0;
    if (el('acount-info')) el('acount-info').textContent = counts['Info'] || 0;
}

function getCategoryClass(categorie) {
    if (!categorie) return '';
    const map = {
        'Événement': 'evenement',
        'Communiqué': 'communique',
        'Réunion': 'reunion',
        'Action': 'action',
        'Bilan': 'bilan',
        'Projet': 'projet',
        'Tribune': 'tribune',
        'Info': 'info'
    };
    return map[categorie] || '';
}

function getCategoryIcon(categorie) {
    const icons = {
        'Événement': '📅',
        'Communiqué': '📣',
        'Réunion': '🤝',
        'Action': '✊',
        'Bilan': '📊',
        'Projet': '🚀',
        'Tribune': '📝',
        'Info': 'ℹ️'
    };
    return icons[categorie] || '📰';
}

function formatDate(dateStr) {
    if (!dateStr) return 'Sans date';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function renderArticles() {
    updateArticleCategoryCounts();

    const search = (document.getElementById('search-articles')?.value || '').toLowerCase();
    let filtered = [...data.articles];

    // Filtre par catégorie
    if (currentArticleFilter) {
        filtered = filtered.filter(a => a.categorie === currentArticleFilter);
    }

    // Filtre par recherche
    if (search) {
        filtered = filtered.filter(a =>
            (a.titre || '').toLowerCase().includes(search) ||
            (a.extrait || '').toLowerCase().includes(search) ||
            (a.contenu || '').toLowerCase().includes(search) ||
            (a.categorie || '').toLowerCase().includes(search)
        );
    }

    document.getElementById('articles-count').textContent = filtered.length;

    // Séparer : à préciser, à venir, passés
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const aPreciser = filtered.filter(a => a.a_preciser);
    const aVenir = filtered.filter(a => !a.a_preciser && a.date && new Date(a.date) >= today)
        .sort((a, b) => {
            if (a.priorite && !b.priorite) return -1;
            if (!a.priorite && b.priorite) return 1;
            return new Date(a.date) - new Date(b.date);
        }); // Prioritaires d'abord, puis plus proche en premier
    const passes = filtered.filter(a => !a.a_preciser && (!a.date || new Date(a.date) < today))
        .sort((a, b) => {
            if (a.priorite && !b.priorite) return -1;
            if (!a.priorite && b.priorite) return 1;
            return new Date(b.date || 0) - new Date(a.date || 0);
        }); // Prioritaires d'abord, puis plus récent en premier

    function renderArticleCard(a) {
        const realIndex = data.articles.indexOf(a);
        const categoryClass = getCategoryClass(a.categorie);
        const categoryIcon = getCategoryIcon(a.categorie);
        const isUpcoming = !a.a_preciser && a.date && new Date(a.date) >= today;
        const isPreciser = a.a_preciser;
        const isPriority = a.priorite;

        return `
            <div class="article-card" style="${isPriority ? 'border: 2px solid #c9a227; box-shadow: 0 4px 16px rgba(201,162,39,0.3);' : isPreciser ? 'opacity: 0.7; border: 2px dashed #f39c12;' : isUpcoming ? 'border: 2px solid #27ae60;' : ''}">
                <div class="article-card-image">
                    ${a.image
                        ? `<img src="${a.image}" alt="${a.titre}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                           <span class="no-image" style="display:none;">📰</span>`
                        : '<span class="no-image">📰</span>'}
                    ${a.categorie ? `<span class="article-card-category ${categoryClass}">${categoryIcon} ${a.categorie}</span>` : ''}
                    ${isPriority ? '<span style="position:absolute;top:8px;right:8px;background:#c9a227;color:white;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:bold;">⭐ Prioritaire</span>' : ''}
                    ${isPreciser && !isPriority ? '<span style="position:absolute;top:8px;right:8px;background:#f39c12;color:white;padding:2px 8px;border-radius:4px;font-size:0.75rem;">⏳ À préciser</span>' : ''}
                    ${isUpcoming && !isPriority ? '<span style="position:absolute;top:8px;right:8px;background:#27ae60;color:white;padding:2px 8px;border-radius:4px;font-size:0.75rem;">📅 À venir</span>' : ''}
                </div>
                <div class="article-card-body">
                    <div class="article-card-date">📅 ${formatDate(a.date)}</div>
                    <div class="article-card-title">${a.titre || 'Sans titre'}</div>
                    <div class="article-card-extrait">${a.extrait || a.contenu?.substring(0, 150) || 'Aucun extrait'}</div>
                    <div class="article-card-footer">
                        <div class="article-card-share">
                            <button class="btn btn-sm" style="background: #25D366; color: white;" onclick="copyForWhatsApp('article', ${realIndex})" title="WhatsApp">💬</button>
                            <button class="btn btn-sm" style="background: #1877f2; color: white;" onclick="copyForFacebook(${realIndex})" title="Facebook">📘</button>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-sm btn-primary" onclick="openEditArticle(${realIndex})">✏️</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteArticle(${realIndex})">🗑️</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    let html = '';

    if (filtered.length === 0) {
        html = '<div class="empty-state"><div class="icon">📰</div><p>Aucun article' + (search || currentArticleFilter ? ' trouvé' : '') + '</p></div>';
    } else {
        // Section : À préciser
        if (aPreciser.length > 0) {
            html += `
                <div style="grid-column: 1 / -1; margin-bottom: 0.5rem;">
                    <h4 style="color: #f39c12; border-bottom: 2px solid #f39c12; padding-bottom: 0.5rem; margin-bottom: 1rem;">
                        ⏳ À préciser (${aPreciser.length})
                    </h4>
                </div>
                ${aPreciser.map(renderArticleCard).join('')}
            `;
        }

        // Section : À venir
        if (aVenir.length > 0) {
            html += `
                <div style="grid-column: 1 / -1; margin-bottom: 0.5rem; ${aPreciser.length > 0 ? 'margin-top: 1.5rem;' : ''}">
                    <h4 style="color: #27ae60; border-bottom: 2px solid #27ae60; padding-bottom: 0.5rem; margin-bottom: 1rem;">
                        📅 À venir (${aVenir.length})
                    </h4>
                </div>
                ${aVenir.map(renderArticleCard).join('')}
            `;
        }

        // Section : Passés
        if (passes.length > 0) {
            html += `
                <div style="grid-column: 1 / -1; margin-bottom: 0.5rem; ${(aPreciser.length > 0 || aVenir.length > 0) ? 'margin-top: 1.5rem;' : ''}">
                    <h4 style="color: #888; border-bottom: 2px solid #ddd; padding-bottom: 0.5rem; margin-bottom: 1rem;">
                        📰 Articles & événements passés (${passes.length})
                    </h4>
                </div>
                ${passes.map(renderArticleCard).join('')}
            `;
        }
    }

    document.getElementById('articles-list').innerHTML = html;

    // Mettre à jour la liste pour le partage Facebook
    updateFacebookArticleSelect();
}

function copyForFacebook(index) {
    shareOnFBAdmin('article', index);
}

// ====== PARTAGE FACEBOOK UNIVERSEL ======
function shareOnFBAdmin(type, index) {
    const SITE = 'https://vizilleenmouvement.fr';
    let text = '';
    let url = SITE;
    let photoInfo = '';

    if (type === 'article') {
        const a = data.articles[index];
        url = SITE + '/blog.html?article=' + a.id;
        text = '📰 ' + a.titre + '\n\n' + (a.extrait || (a.contenu || '').substring(0, 200)) + '\n\n👉 ' + url + '\n\n#Vizille #Municipales2026 #VizilleEnMouvement';
        if (a.image) photoInfo = '\n\n📷 Image à joindre : ' + SITE + '/' + a.image;
    } else if (type === 'projet') {
        const p = data.projets[index];
        url = SITE + '/projet.html';
        text = '🎯 ' + p.titre + '\n\n' + (p.resume || p.description || '').substring(0, 200) + '\n\n👉 Découvrez notre projet : ' + url + '\n\n#Vizille #Municipales2026 #VizilleEnMouvement';
    } else if (type === 'action') {
        const a = data.actions[index];
        url = SITE + '/bilan.html';
        text = '✅ ' + a.titre + '\n\n' + (a.description || '').substring(0, 200) + '\n\n👉 Voir notre bilan : ' + url + '\n\n#Vizille #Municipales2026 #VizilleEnMouvement';
    } else if (type === 'faq') {
        const f = data.faq[index];
        url = SITE + '/faq.html';
        text = '❓ ' + f.question + '\n\n💬 ' + (f.reponse || '').substring(0, 200) + '\n\n👉 ' + url + '\n\n#Vizille #Municipales2026 #VizilleEnMouvement';
    } else if (type === 'candidat') {
        const c = data.candidats[index];
        url = SITE + '/equipe.html';
        text = '👤 Découvrez ' + (c.prenom || '') + ' ' + c.nom;
        if (c.role) text += ' — ' + c.role;
        if (c.delegation) text += ' (' + c.delegation + ')';
        text += '\n\n';
        if (c.bio) text += c.bio.substring(0, 250) + '\n\n';
        if (c.objectifs) text += '🎯 ' + c.objectifs.substring(0, 200) + '\n\n';
        text += '👉 Découvrez toute l\'équipe : ' + url + '\n\n#Vizille #Municipales2026 #VizilleEnMouvement';
        if (c.photo) photoInfo = '\n\n📷 Photo à joindre : ' + SITE + '/' + c.photo;
        if (c.video) photoInfo += '\n🎬 Vidéo portrait : ' + SITE + '/' + c.video;
    }

    navigator.clipboard.writeText(text).then(function() {
        window.open('https://www.facebook.com/', '_blank');
        if (photoInfo) {
            showToast('📋 Texte copié ! Collez dans Facebook + ajoutez la photo/vidéo', 'success');
        } else {
            showToast('📋 Texte copié ! Collez dans Facebook', 'success');
        }
    }).catch(function() {
        window.open('https://www.facebook.com/', '_blank');
        showToast('Facebook ouvert !', 'success');
    });
}

function openAddArticle() {
    currentEdit = { type: 'article', index: -1 };
    showArticleModal({ date: new Date().toISOString().split('T')[0] });
}

function openEditArticle(index) {
    currentEdit = { type: 'article', index };
    showArticleModal(data.articles[index]);
}

function showArticleModal(a) {
    document.getElementById('modal-title').textContent = currentEdit.index === -1 ? '➕ Ajouter un article' : '✏️ Modifier l\'article';
    document.getElementById('modal-body').innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Titre *</label>
                <input type="text" id="edit-titre" value="${a.titre || ''}">
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" id="edit-date" value="${a.date || ''}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Catégorie</label>
                <select id="edit-categorie">
                    <option value="">-- Sans catégorie --</option>
                    <option value="Événement" ${a.categorie === 'Événement' ? 'selected' : ''}>📅 Événement</option>
                    <option value="Communiqué" ${a.categorie === 'Communiqué' ? 'selected' : ''}>📣 Communiqué</option>
                    <option value="Presse" ${a.categorie === 'Presse' ? 'selected' : ''}>📰 Presse</option>
                    <option value="Réunion" ${a.categorie === 'Réunion' ? 'selected' : ''}>🤝 Réunion</option>
                    <option value="Réunion de quartier" ${a.categorie === 'Réunion de quartier' ? 'selected' : ''}>🏘️ Réunion de quartier</option>
                    <option value="Action" ${a.categorie === 'Action' ? 'selected' : ''}>✊ Action</option>
                    <option value="Bilan" ${a.categorie === 'Bilan' ? 'selected' : ''}>📊 Bilan</option>
                    <option value="Projet" ${a.categorie === 'Projet' ? 'selected' : ''}>🚀 Projet</option>
                    <option value="Tribune" ${a.categorie === 'Tribune' ? 'selected' : ''}>📝 Tribune</option>
                    <option value="Vidéo" ${a.categorie === 'Vidéo' ? 'selected' : ''}>🎬 Vidéo</option>
                    <option value="Info" ${a.categorie === 'Info' ? 'selected' : ''}>ℹ️ Info</option>
                </select>
            </div>
            <div class="form-group">
                <label>À préciser ?</label>
                <select id="edit-a-preciser">
                    <option value="false" ${!a.a_preciser ? 'selected' : ''}>Non - Article visible</option>
                    <option value="true" ${a.a_preciser ? 'selected' : ''}>Oui - Masqué (date à préciser)</option>
                </select>
            </div>
            <div class="form-group">
                <label>⭐ Mise en avant</label>
                <select id="edit-priorite">
                    <option value="false" ${!a.priorite ? 'selected' : ''}>Normal</option>
                    <option value="true" ${a.priorite ? 'selected' : ''}>⭐ Prioritaire — mis en avant</option>
                </select>
            </div>
            <div class="form-group">
                <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
                    <input type="checkbox" id="edit-a-la-une" ${a.a_la_une ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--bleu);">
                    <span>🏠 À la une — bloc affiché sur la page d'accueil après le hero</span>
                </label>
                <p style="font-size:0.78rem;color:#888;margin-top:0.25rem;margin-left:1.6rem;">Un seul article à la fois. Cocher ici décoche automatiquement les autres.</p>
            </div>
        </div>

        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: var(--bleu);">📷 Images de l'article (galerie)</label>
            <div class="photo-upload" id="article-image-dropzone" onclick="document.getElementById('import-image-article').click()">
                <input type="file" id="import-image-article" accept="image/*" multiple onchange="handleArticleImageImport(this)" style="display: none;">
                <div class="icon">📁</div>
                <p><strong>Cliquez ou glissez-déposez</strong> une ou plusieurs images</p>
                <p style="font-size: 0.8rem; color: #888;">JPG, PNG, WebP • Max 5 Mo par image</p>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center; margin-top: 0.75rem;">
                <span style="color: #888; font-size: 0.85rem;">ou URL :</span>
                <input type="text" id="add-image-url" placeholder="https://... ou images/nom.jpg" style="flex: 1;">
                <button type="button" class="btn btn-sm btn-primary" onclick="addArticleImageUrl()">+ Ajouter</button>
            </div>
            <input type="hidden" id="edit-images" value='${JSON.stringify(a.images || (a.image ? [a.image] : []))}'>
            <div id="images-gallery" style="display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1rem;">
                ${(a.images || (a.image ? [a.image] : [])).map((img, idx) => `
                    <div class="gallery-thumb" data-index="${idx}" style="position: relative;">
                        <img src="${img}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 2px solid ${idx === 0 ? 'var(--vert)' : 'var(--gris-border)'};">
                        ${idx === 0 ? '<span style="position: absolute; top: -8px; left: -8px; background: var(--vert); color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 10px;">Couverture</span>' : ''}
                        <button type="button" onclick="removeArticleImage(${idx})" style="position: absolute; top: -8px; right: -8px; background: var(--rouge); color: white; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; font-size: 0.8rem;">✕</button>
                    </div>
                `).join('')}
            </div>
            <p style="font-size: 0.8rem; color: #888; margin-top: 0.5rem;">La première image sera utilisée comme couverture sur les cartes.</p>
        </div>

        <div style="background: #fff3e0; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: #e65100;">🎬 Vidéo YouTube (optionnel)</label>
            <input type="text" id="edit-youtube" value="${a.youtube || ''}" placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/...">
            <p style="font-size: 0.8rem; color: #888; margin-top: 0.5rem;">Collez l'URL complète de la vidéo YouTube</p>
            <div id="youtube-preview" style="margin-top: 0.75rem; display: ${a.youtube ? 'block' : 'none'};">
                <iframe id="youtube-iframe" width="280" height="157" src="${a.youtube ? getYoutubeEmbed(a.youtube) : ''}" frameborder="0" allowfullscreen style="border-radius: 8px;"></iframe>
            </div>
        </div>

        <div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: #1565c0;">📄 Lier un document (optionnel)</label>
            <select id="edit-document" style="width: 100%; padding: 0.5rem;">
                <option value="">-- Aucun document lié --</option>
                ${(data.medias?.documents || []).map(d => `
                    <option value="${d.id}" ${a.document_id == d.id ? 'selected' : ''}>${d.titre}</option>
                `).join('')}
            </select>
            <p style="font-size: 0.8rem; color: #666; margin-top: 0.5rem;">
                Un bouton "📄 Voir le document" apparaîtra dans l'article avec lien direct vers la page Médias.
            </p>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Source (si article de presse)</label>
                <input type="text" id="edit-source" value="${a.source || ''}" placeholder="Ex: Le Dauphiné Libéré">
            </div>
            <div class="form-group">
                <label>Auteur</label>
                <input type="text" id="edit-auteur" value="${a.auteur || ''}" placeholder="Ex: Jean Dupont">
            </div>
        </div>

        <div class="form-group">
            <label>Extrait (aperçu court)</label>
            <textarea id="edit-extrait" rows="2" placeholder="Court résumé affiché dans la liste des actualités...">${a.extrait || ''}</textarea>
        </div>
        <div class="form-group">
            <label>Contenu complet</label>
            <div class="rich-text-toolbar">
                <button type="button" onclick="insertRichText('edit-contenu','bold')" title="Gras (Ctrl+B)"><strong>B</strong></button>
                <button type="button" onclick="insertRichText('edit-contenu','italic')" title="Italique (Ctrl+I)"><em>I</em></button>
                <button type="button" onclick="insertRichText('edit-contenu','link')" title="Lien">🔗</button>
                <button type="button" onclick="insertRichText('edit-contenu','list')" title="Liste à puces">•</button>
                <button type="button" onclick="insertRichText('edit-contenu','h3')" title="Titre H3">H3</button>
            </div>
            <textarea id="edit-contenu" class="rich-text-content" rows="8" placeholder="Le texte complet de l'article..." oninput="updateRichTextPreview('edit-contenu')">${a.contenu || ''}</textarea>
            <div style="margin-top:0.75rem;">
                <label style="font-size:0.85rem;color:#888;margin-bottom:0.25rem;display:block;">Aperçu :</label>
                <div id="edit-contenu-preview" class="rich-text-preview"><em style="color:#888;">Aperçu du contenu...</em></div>
            </div>
        </div>
    `;

    // Plus besoin de listener pour edit-image car on utilise maintenant la galerie

    // Prévisualiser YouTube quand l'URL change
    document.getElementById('edit-youtube').addEventListener('input', function() {
        const preview = document.getElementById('youtube-preview');
        const iframe = document.getElementById('youtube-iframe');
        const embedUrl = getYoutubeEmbed(this.value);
        if (embedUrl) {
            iframe.src = embedUrl;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    });

    // Drag & drop pour l'image
    const dropzone = document.getElementById('article-image-dropzone');
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        files.forEach(file => processArticleImage(file));
    });

    // Activer le copier-coller (Ctrl+V / Cmd+V) pour les articles
    enablePasteForModal((files) => {
        files.forEach(file => processArticleImage(file));
    });

    document.getElementById('modal-save').onclick = saveArticle;
    document.getElementById('modal-edit').classList.add('active');

    // Initialize rich text preview
    setTimeout(() => updateRichTextPreview('edit-contenu'), 100);

    // Brouillon : proposer la restauration uniquement si on crée un NOUVEL article
    if (currentEdit.index === -1) {
        const draft = getArticleDraft();
        if (draft) {
            const restore = confirm("📝 Un brouillon d'article a été trouvé (sauvegardé le " + new Date(draft._timestamp).toLocaleString('fr-FR') + "). Voulez-vous le restaurer ?");
            if (restore) {
                restoreArticleDraft(draft);
                showToast('📝 Brouillon restauré', 'info');
            } else {
                clearArticleDraft();
            }
        }
    }
    // Auto-save toutes les 5 secondes pendant que le modal est ouvert
    if (window._articleDraftInterval) clearInterval(window._articleDraftInterval);
    window._articleDraftInterval = setInterval(() => {
        if (document.getElementById('modal-edit').classList.contains('active')
            && currentEdit && currentEdit.type === 'article') {
            saveArticleDraft();
        }
    }, 5000);
}

// ===== BROUILLON ARTICLE (localStorage) =====
const ARTICLE_DRAFT_KEY = 'vizille_draft_article';

function saveArticleDraft() {
    const fields = ['edit-titre', 'edit-date', 'edit-categorie', 'edit-a-preciser',
                    'edit-priorite', 'edit-extrait', 'edit-contenu', 'edit-youtube',
                    'edit-images', 'edit-source', 'edit-auteur', 'edit-url-source'];
    const draft = {};
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) draft[id] = el.value;
    });
    const aLaUne = document.getElementById('edit-a-la-une');
    if (aLaUne) draft['edit-a-la-une'] = aLaUne.checked;
    draft._timestamp = Date.now();
    // Considère vide si ni titre ni contenu : on évite de polluer le storage
    const hasContent = (draft['edit-titre'] || '').trim() || (draft['edit-contenu'] || '').trim();
    if (!hasContent) return;
    try {
        localStorage.setItem(ARTICLE_DRAFT_KEY, JSON.stringify(draft));
    } catch(e) { /* localStorage plein ou indisponible */ }
}

function getArticleDraft() {
    try {
        const raw = localStorage.getItem(ARTICLE_DRAFT_KEY);
        if (!raw) return null;
        const draft = JSON.parse(raw);
        // Ignorer les brouillons de plus de 7 jours
        if (draft._timestamp && (Date.now() - draft._timestamp) > 7 * 24 * 60 * 60 * 1000) {
            clearArticleDraft();
            return null;
        }
        const hasContent = (draft['edit-titre'] || '').trim() || (draft['edit-contenu'] || '').trim();
        return hasContent ? draft : null;
    } catch(e) { return null; }
}

function restoreArticleDraft(draft) {
    Object.keys(draft).forEach(id => {
        if (id.startsWith('_')) return;
        const el = document.getElementById(id);
        if (!el) return;
        if (id === 'edit-a-la-une') {
            el.checked = !!draft[id];
        } else {
            el.value = draft[id] || '';
        }
    });
    // Ré-afficher la galerie d'images depuis edit-images
    try {
        const imgs = JSON.parse(document.getElementById('edit-images').value || '[]');
        if (typeof setArticleImages === 'function') setArticleImages(imgs);
    } catch(e) {}
    // Mettre à jour le preview du texte riche
    if (typeof updateRichTextPreview === 'function') updateRichTextPreview('edit-contenu');
}

function clearArticleDraft() {
    try { localStorage.removeItem(ARTICLE_DRAFT_KEY); } catch(e) {}
    if (window._articleDraftInterval) {
        clearInterval(window._articleDraftInterval);
        window._articleDraftInterval = null;
    }
}

function getYoutubeEmbed(url) {
    if (!url) return '';
    // Extraire l'ID YouTube de différents formats d'URL
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return `https://www.youtube.com/embed/${match[1]}`;
    }
    return '';
}

function getArticleImages() {
    try {
        return JSON.parse(document.getElementById('edit-images').value || '[]');
    } catch (e) {
        return [];
    }
}

function setArticleImages(images) {
    document.getElementById('edit-images').value = JSON.stringify(images);
    renderImagesGallery();
}

function renderImagesGallery() {
    const images = getArticleImages();
    const gallery = document.getElementById('images-gallery');
    gallery.innerHTML = images.map((img, idx) => {
        // Convertir chemin relatif en URL GitHub si nécessaire
        let imgSrc = img;
        if (img && !img.startsWith('data:') && !img.startsWith('http')) {
            imgSrc = `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${img}`;
        }
        return `
        <div class="gallery-thumb" data-index="${idx}" style="position: relative;">
            <img src="${imgSrc}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 2px solid ${idx === 0 ? 'var(--vert)' : 'var(--gris-border)'};" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect fill=%22%23eee%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23999%22>Erreur</text></svg>'">
            ${idx === 0 ? '<span style="position: absolute; top: -8px; left: -8px; background: var(--vert); color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 10px;">Couverture</span>' : ''}
            <button type="button" onclick="removeArticleImage(${idx})" style="position: absolute; top: -8px; right: -8px; background: var(--rouge); color: white; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; font-size: 0.8rem;">✕</button>
        </div>
    `}).join('');
}

function addArticleImageUrl() {
    const urlInput = document.getElementById('add-image-url');
    const url = urlInput.value.trim();
    if (!url) {
        showToast('⚠️ Entrez une URL', 'warning');
        return;
    }
    const images = getArticleImages();
    images.push(url);
    setArticleImages(images);
    urlInput.value = '';
    showToast('✅ Image ajoutée', 'success');
}

function removeArticleImage(index) {
    const images = getArticleImages();
    images.splice(index, 1);
    setArticleImages(images);
    showToast('🗑️ Image supprimée', 'info');
}

async function processArticleImage(file) {
    if (file.size > 5 * 1024 * 1024) {
        showToast('⚠️ Image trop volumineuse (max 5 Mo)', 'warning');
        return;
    }

    const token = document.getElementById('github-token')?.value?.trim();
    if (!token) {
        showToast('❌ Token GitHub requis pour uploader des images', 'error');
        return;
    }

    showToast('🗜️ Compression en cours...', 'info');

    try {
        // Compresser l'image
        const compressedFile = await compressImage(file, 1920, 0.85);
        const originalSize = (file.size / 1024).toFixed(0);
        const newSize = (compressedFile.size / 1024).toFixed(0);

        // Lire le fichier compressé
        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(compressedFile);
        });

        const base64Content = dataUrl.split(',')[1];
        const timestamp = Date.now();
        const fileName = `article_${timestamp}.jpg`;
        const imagePath = `images/articles/${fileName}`;

        showToast(`⏳ Upload vers GitHub (${originalSize}→${newSize} Ko)...`, 'info');

        // Vérifier si le fichier existe
        let sha = null;
        const getResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${imagePath}?ref=${GITHUB_CONFIG.branch}`,
            { headers: { 'Authorization': `token ${token}` } }
        );
        if (getResponse.ok) {
            sha = (await getResponse.json()).sha;
        }

        const body = {
            message: `Upload image article ${fileName}`,
            content: base64Content,
            branch: GITHUB_CONFIG.branch
        };
        if (sha) body.sha = sha;

        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${imagePath}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            }
        );

        if (response.ok) {
            // Stocker le CHEMIN (pas le base64!)
            const images = getArticleImages();
            images.push(imagePath);
            setArticleImages(images);
            showToast(`✅ Image uploadée !`, 'success');
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Upload failed');
        }
    } catch (err) {
        console.error('Erreur upload image article:', err);
        showToast('❌ Échec upload: ' + err.message, 'error');
    }
}

function saveArticle() {
    const titre = document.getElementById('edit-titre').value.trim();
    const date = document.getElementById('edit-date').value;
    const categorie = document.getElementById('edit-categorie').value;
    let images = getArticleImages();
    const youtube = document.getElementById('edit-youtube').value.trim();
    const source = document.getElementById('edit-source').value.trim();
    const auteur = document.getElementById('edit-auteur').value.trim();
    const extrait = document.getElementById('edit-extrait').value.trim();
    const contenu = document.getElementById('edit-contenu').value.trim();
    const aPreciser = document.getElementById('edit-a-preciser').value === 'true';
    const priorite = document.getElementById('edit-priorite').value === 'true';
    const aLaUne = document.getElementById('edit-a-la-une')?.checked || false;
    const documentId = document.getElementById('edit-document').value;

    if (!titre) {
        showToast('⚠️ Titre obligatoire', 'warning');
        return;
    }

    // SÉCURITÉ : Filtrer les images base64 (ne garder que les chemins)
    const originalCount = images.length;
    images = images.filter(img => !img.startsWith('data:') && !img.startsWith('file://'));
    if (images.length !== originalCount) {
        showToast('⚠️ Images non uploadées ignorées', 'warning');
    }

    const articleData = {
        id: currentEdit.index === -1 ? Date.now() : data.articles[currentEdit.index].id,
        titre,
        date,
        categorie,
        extrait,
        contenu
    };

    // Gérer les images : garder compatibilité avec ancien format
    if (images.length > 0) {
        articleData.images = images;
        articleData.image = images[0]; // Première image = couverture (rétrocompatibilité)
    }

    // Ajouter les champs optionnels seulement s'ils sont remplis
    if (youtube) articleData.youtube = youtube;
    if (source) articleData.source = source;
    if (auteur) articleData.auteur = auteur;
    if (aPreciser) articleData.a_preciser = true;
    articleData.priorite = priorite;
    // À la une : un seul à la fois
    if (aLaUne) {
        data.articles.forEach(a => { delete a.a_la_une; });
        articleData.a_la_une = true;
    } else {
        delete articleData.a_la_une;
    }
    if (documentId) articleData.document_id = parseInt(documentId);

    // Ajouter la date de modification (pour le mettre en tête de gondole)
    articleData.modifie_le = new Date().toISOString();

    if (currentEdit.index === -1) {
        data.articles.push(articleData);
    } else {
        data.articles[currentEdit.index] = articleData;
    }

    markModified('articles');
    renderArticles();
    updateFacebookArticleSelect();
    // Effacer le brouillon : l'article est maintenant enregistré
    if (typeof clearArticleDraft === 'function') clearArticleDraft();
    closeModal();
    showToast('✅ Article enregistré', 'success');
}

function deleteArticle(index) {
    if (confirm('Supprimer cet article ?')) {
        data.articles.splice(index, 1);
        markModified('articles');
        renderArticles();
        showToast('🗑️ Article supprimé', 'success');
    }
}


// ===== ABONNÉS NEWSLETTER =====
function renderAbonnes() {
    const search = (document.getElementById('search-abonnes')?.value || '').toLowerCase();
    const abonnesActifs = data.abonnes.filter(a => a.actif !== false);
    
    const filtered = data.abonnes.filter(a => {
        if (!search) return true;
        return (a.email || '').toLowerCase().includes(search) || 
               (a.nom || '').toLowerCase().includes(search);
    });
    
    document.getElementById('abonnes-count').textContent = filtered.length;
    document.getElementById('stats-abonnes').textContent = `${abonnesActifs.length} abonnés actifs`;
    
    const container = document.getElementById('abonnes-list');
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">📧</div>
                <p>Aucun abonné${search ? ' trouvé' : ''}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filtered.map((a, i) => {
        const realIndex = data.abonnes.indexOf(a);
        const statusClass = a.actif === false ? 'style="opacity: 0.5;"' : '';
        const statusBadge = a.actif === false ? 
            '<span style="background: #fee; color: #c00; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; margin-left: 8px;">Désabonné</span>' : '';
        return `
            <div class="item-card" ${statusClass}>
                <div class="item-info">
                    <div class="item-photo-placeholder">📧</div>
                    <div class="item-text">
                        <div class="item-title">${a.email}${statusBadge}</div>
                        <div class="item-desc">${a.nom || 'Sans nom'} • Inscrit le ${a.date || 'N/A'}</div>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-primary" onclick="openEditAbonne(${realIndex})">✏️</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAbonne(${realIndex})">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function openAddAbonne() {
    currentEdit = { type: 'abonne', index: -1 };
    showAbonneModal({ date: new Date().toISOString().split('T')[0], actif: true });
}

function openEditAbonne(index) {
    currentEdit = { type: 'abonne', index };
    showAbonneModal(data.abonnes[index]);
}

function showAbonneModal(a) {
    document.getElementById('modal-title').textContent = currentEdit.index === -1 ? '➕ Ajouter un abonné' : '✏️ Modifier l\'abonné';
    document.getElementById('modal-body').innerHTML = `
        <div class="form-group">
            <label>Email *</label>
            <input type="email" id="edit-abonne-email" value="${a.email || ''}">
        </div>
        <div class="form-group">
            <label>Nom (optionnel)</label>
            <input type="text" id="edit-abonne-nom" value="${a.nom || ''}">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Date d'inscription</label>
                <input type="date" id="edit-abonne-date" value="${a.date || ''}">
            </div>
            <div class="form-group">
                <label>Statut</label>
                <select id="edit-abonne-actif">
                    <option value="true" ${a.actif !== false ? 'selected' : ''}>✅ Actif</option>
                    <option value="false" ${a.actif === false ? 'selected' : ''}>❌ Désabonné</option>
                </select>
            </div>
        </div>
    `;
    document.getElementById('modal-save').onclick = saveAbonne;
    document.getElementById('modal-edit').classList.add('active');
}

function saveAbonne() {
    const email = document.getElementById('edit-abonne-email').value.trim();
    const nom = document.getElementById('edit-abonne-nom').value.trim();
    const date = document.getElementById('edit-abonne-date').value;
    const actif = document.getElementById('edit-abonne-actif').value === 'true';
    
    if (!email || !email.includes('@')) {
        showToast('⚠️ Email invalide', 'warning');
        return;
    }

    // Vérifier si l'email existe déjà (sauf en édition du même)
    const existant = data.abonnes.findIndex(a => a.email.toLowerCase() === email.toLowerCase());
    if (existant !== -1 && existant !== currentEdit.index) {
        showToast('⚠️ Cet email existe déjà', 'warning');
        return;
    }

    if (currentEdit.index === -1) {
        data.abonnes.push({ id: Date.now(), email, nom, date, actif });
    } else {
        Object.assign(data.abonnes[currentEdit.index], { email, nom, date, actif });
    }
    
    markModified('abonnes');
    renderAbonnes();
    closeModal();
    showToast('✅ Abonné enregistré', 'success');
}

function deleteAbonne(index) {
    if (confirm('Supprimer cet abonné ?')) {
        data.abonnes.splice(index, 1);
        markModified('abonnes');
        renderAbonnes();
        showToast('🗑️ Abonné supprimé', 'success');
    }
}

function exportAbonnes() {
    const actifs = data.abonnes.filter(a => a.actif !== false);
    const csv = 'Email,Nom,Date\n' + actifs.map(a => `${a.email},"${a.nom || ''}",${a.date || ''}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abonnes-vizille-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥 Export CSV téléchargé', 'success');
}

function importAbonnes(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(l => l.trim());
        let count = 0;
        
        lines.forEach((line, i) => {
            if (i === 0 && line.toLowerCase().includes('email')) return; // Skip header
            
            const parts = line.split(',');
            const email = parts[0]?.trim().replace(/"/g, '');
            
            if (email && email.includes('@')) {
                const existe = data.abonnes.find(a => a.email.toLowerCase() === email.toLowerCase());
                if (!existe) {
                    data.abonnes.push({
                        id: Date.now() + count,
                        email,
                        nom: parts[1]?.trim().replace(/"/g, '') || '',
                        date: new Date().toISOString().split('T')[0],
                        actif: true
                    });
                    count++;
                }
            }
        });
        
        if (count > 0) {
            markModified('abonnes');
            renderAbonnes();
            showToast(`✅ ${count} abonnés importés`, 'success');
        } else {
            showToast('⚠️ Aucun nouvel email trouvé', 'warning');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// ===== PARTAGE FACEBOOK =====
function updateFacebookArticleSelect() {
    renderFacebookSelect();
}

function renderFacebookSelect() {
    const select = document.getElementById('fb-article-select');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Sélectionnez un article --</option>' +
        data.articles.map((a, i) => `<option value="${i}">${a.date || 'Sans date'} - ${a.titre}</option>`).join('');
}

function previewFacebookPost() {
    const select = document.getElementById('fb-article-select');
    const index = select.value;
    const previewZone = document.getElementById('fb-preview-zone');
    
    if (index === '') {
        previewZone.style.display = 'none';
        return;
    }
    
    const article = data.articles[index];
    const siteUrl = `https://Vizilleenmouvement.github.io/Vizille-en-mouvement/blog.html`;
    
    const postText = `📰 ${article.titre}

${article.extrait || article.resume || article.contenu?.substring(0, 200) + '...' || ''}

👉 Lire l'article complet sur notre site :
${siteUrl}

#Vizille #Municipales2026 #VizilleEnMouvement`;
    
    document.getElementById('fb-post-text').value = postText;
    previewZone.style.display = 'block';
}

function copyFacebookPost() {
    const text = document.getElementById('fb-post-text').value;
    navigator.clipboard.writeText(text).then(() => {
        showToast('📋 Texte copié ! Collez-le sur Facebook', 'success');
    }).catch(() => {
        showToast('❌ Erreur de copie', 'error');
    });
}

// ===== NEWSLETTER =====
function initNewsletterDate() {
    const dateInput = document.getElementById('nl-date');
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
}

function generateNewsletter() {
    const objet = document.getElementById('nl-objet').value.trim();
    const date = document.getElementById('nl-date').value;
    const intro = document.getElementById('nl-intro').value.trim();
    const contenu = document.getElementById('nl-contenu').value.trim();
    const cta = document.getElementById('nl-cta').value.trim();
    
    if (!objet || !contenu) {
        showToast('⚠️ Objet et contenu requis', 'warning');
        return;
    }
    
    const dateFormatted = date ? new Date(date).toLocaleDateString('fr-FR', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    }) : '';
    
    let newsletter = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏛️ VIZILLE EN MOUVEMENT
Vos questions pour une ville dynamique et solidaire
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 ${dateFormatted}

`;
    
    if (intro) {
        newsletter += `${intro}\n\n`;
    }
    
    newsletter += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📰 ACTUALITÉS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${contenu}

`;
    
    if (cta) {
        newsletter += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📢 À NE PAS MANQUER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${cta}

`;
    }
    
    newsletter += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 SUIVEZ-NOUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 Site : https://Vizilleenmouvement.github.io/Vizille-en-mouvement/
📘 Facebook : ${data.config.facebook || 'https://facebook.com/Vizilleenmouvement'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pour vous désabonner, répondez à cet email.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    
    document.getElementById('nl-output').value = newsletter;
    document.getElementById('nl-result').style.display = 'block';
    showToast('✨ Newsletter générée !', 'success');
}

function clearNewsletter() {
    document.getElementById('nl-objet').value = '';
    document.getElementById('nl-intro').value = '';
    document.getElementById('nl-contenu').value = '';
    document.getElementById('nl-cta').value = '';
    document.getElementById('nl-output').value = '';
    document.getElementById('nl-result').style.display = 'none';
    showToast('🗑️ Formulaire effacé', 'info');
}

function copyNewsletter() {
    const text = document.getElementById('nl-output').value;
    navigator.clipboard.writeText(text).then(() => {
        showToast('📋 Newsletter copiée !', 'success');
    }).catch(() => {
        showToast('❌ Erreur de copie', 'error');
    });
}

function copyAbonnesEmails() {
    const actifs = data.abonnes.filter(a => a.actif !== false);
    const emails = actifs.map(a => a.email).join('; ');
    
    if (!emails) {
        showToast('⚠️ Aucun abonné actif', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(emails).then(() => {
        showToast(`📧 ${actifs.length} emails copiés !`, 'success');
    }).catch(() => {
        showToast('❌ Erreur de copie', 'error');
    });
}

// ===== CONFIG =====
function renderConfig() {
    document.getElementById('config-email').value = data.config.email || '';
    document.getElementById('config-telephone').value = data.config.telephone || '';
    document.getElementById('config-adresse').value = data.config.adresse || '';
    document.getElementById('config-facebook').value = data.config.facebook || '';
    document.getElementById('config-instagram').value = data.config.instagram || '';
    document.getElementById('config-twitter').value = data.config.twitter || '';
    document.getElementById('config-autre').value = data.config.autre || '';
    document.getElementById('config-permanences').value = data.config.permanences || '';
    document.getElementById('config-slogan').value = data.config.slogan || 'Vos questions pour une ville dynamique et solidaire';
}

// ===== PUBLICATION =====
// Flag pour éviter les publications multiples simultanées
const publishingInProgress = {};

async function publish(section, retryCount = 0) {
    // Éviter les clics multiples
    if (publishingInProgress[section]) {
        showToast('⏳ Publication déjà en cours...', 'info');
        return;
    }

    // Si on est en mode local ou sur localhost, utiliser l'API locale
    if (localMode || location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        const files = {
            projets: 'projets.json',
            themes: 'themes.json',
            actions: 'actions.json',
            candidats: 'candidats.json',
            faq: 'faq.json',
            articles: 'articles.json',
            abonnes: 'abonnes.json',
            config: 'config.json',
            medias: 'medias.json'
        };
        downloadSingleFile(files[section], section);
        return;
    }

    const token = getToken();
    if (!token) {
        showToast('⚠️ Configurez votre token GitHub', 'warning');
        return;
    }

    const files = {
        projets: 'projets.json',
        themes: 'themes.json',
        actions: 'actions.json',
        candidats: 'candidats.json',
        faq: 'faq.json',
        articles: 'articles.json',
        abonnes: 'abonnes.json',
        config: 'config.json',
        medias: 'medias.json'
    };

    const filename = files[section];
    publishingInProgress[section] = true;
    
    // Pour themes, synchroniser avec THEMES_CONFIG
    if (section === 'themes') {
        data.themes = [...THEMES_CONFIG];
    }
    
    // Pour config, on doit d'abord lire les valeurs des champs
    if (section === 'config') {
        data.config = {
            email: document.getElementById('config-email').value,
            telephone: document.getElementById('config-telephone').value,
            adresse: document.getElementById('config-adresse').value,
            facebook: document.getElementById('config-facebook').value,
            instagram: document.getElementById('config-instagram').value,
            twitter: document.getElementById('config-twitter').value,
            autre: document.getElementById('config-autre').value,
            permanences: document.getElementById('config-permanences').value,
            slogan: document.getElementById('config-slogan').value
        };
    }
    
    // Pour candidats, nettoyer les chemins de photos locaux
    if (section === 'candidats') {
        data.candidats = data.candidats.map(c => ({
            ...c,
            photo: c.photo && c.photo.startsWith('file://') ? '' : c.photo
        }));
    }

    // SÉCURITÉ GLOBALE : Nettoyer tout base64 avant publication
    const cleanedData = cleanBase64FromData(data[section]);
    const content = JSON.stringify(cleanedData, null, 2);

    // Vérification taille (GitHub limite à 1 Mo pour l'API)
    const sizeKB = (content.length / 1024).toFixed(0);
    if (content.length > 900000) {
        showToast(`⚠️ Fichier trop volumineux (${sizeKB} Ko) - vérifiez les images base64`, 'error');
        publishingInProgress[section] = false;
        return;
    }
    console.log(`📦 Taille ${filename}: ${sizeKB} Ko`);

    setStatus(section, 'loading', '⏳ Publication...');

    try {
        // Récupérer le SHA actuel (avec cache-buster pour éviter le cache)
        let sha = null;
        const timestamp = Date.now();
        const getResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filename}?ref=${GITHUB_CONFIG.branch}&_=${timestamp}`,
            { 
                headers: { 
                    'Authorization': `token ${token}`
                } 
            }
        );
        if (getResponse.ok) {
            const fileData = await getResponse.json();
            sha = fileData.sha;
            console.log(`📄 SHA récupéré pour ${filename}: ${sha.substring(0, 7)}...`);
        }

        const body = {
            message: `Mise à jour ${filename} via Admin`,
            content: btoa(unescape(encodeURIComponent(content))),
            branch: GITHUB_CONFIG.branch
        };
        if (sha) body.sha = sha;

        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filename}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            }
        );

        if (response.ok) {
            setStatus(section, 'saved', '✓ À jour');
            showToast(`✅ ${filename} publié !`, 'success');
            publishingInProgress[section] = false;
        } else if (response.status === 409 && retryCount < 5) {
            // Conflit - attendre un peu plus longtemps et réessayer
            const delay = 1000 * (retryCount + 1); // 1s, 2s, 3s, 4s, 5s
            console.log(`🔄 Conflit 409 sur ${filename}, retry ${retryCount + 1}/5 dans ${delay}ms...`);
            showToast(`🔄 Conflit, nouvelle tentative (${retryCount + 1}/5)...`, 'warning');
            await new Promise(r => setTimeout(r, delay));
            publishingInProgress[section] = false;
            return publish(section, retryCount + 1);
        } else {
            const error = await response.json();
            throw new Error(error.message || `Erreur ${response.status}`);
        }
    } catch (err) {
        setStatus(section, 'modified', '⚠️ Erreur');
        publishingInProgress[section] = false;
        showToast('❌ Erreur: ' + err.message, 'error');
    }
}

// ===== MODAL =====
function closeModal() {
    document.getElementById('modal-edit').classList.remove('active');
    pendingPhoto = null;
    disablePasteForModal(); // Désactiver le copier-coller
    // Arrêter l'auto-save du brouillon (le brouillon reste en localStorage)
    if (window._draftInterval) {
        clearInterval(window._draftInterval);
        window._draftInterval = null;
    }
}

// Fermer modal avec Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// ===== TOAST =====
function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    setTimeout(() => toast.className = 'toast', 3000);
}

// ===== MÉDIAS =====
let currentMediaTab = 'photos';

function switchMediaTab(tab) {
    currentMediaTab = tab;
    document.querySelectorAll('[data-media-tab]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mediaTab === tab);
    });
    document.querySelectorAll('.media-tab-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById('media-' + tab).style.display = 'block';
}

function renderMedias() {
    renderAlbumsAdmin();
    renderPhotos();
    renderPresse();
    renderVideos();
    renderDocuments();
    renderBobinesAdmin();
    showLatestMedia();
}

// === ALBUMS ===
let currentAlbumTypeFilter = 'all';

function filterAlbumsAdmin(type) {
    currentAlbumTypeFilter = type;
    document.querySelectorAll('.album-type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });
    renderAlbumsAdmin();
}

function renderAlbumsAdmin() {
    if (!data.medias.albums) data.medias.albums = [];
    let albums = data.medias.albums || [];

    // Filtrer par type
    if (currentAlbumTypeFilter !== 'all') {
        albums = albums.filter(a => a.type === currentAlbumTypeFilter);
    }

    // Trier par date décroissante
    albums = [...albums].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    document.getElementById('albums-count').textContent = (data.medias.albums || []).length;

    if (albums.length === 0) {
        document.getElementById('albums-list').innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #888; grid-column: 1/-1;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📁</div>
                <p>Aucun album ${currentAlbumTypeFilter !== 'all' ? 'de ce type' : ''}</p>
                <button class="btn btn-primary" style="margin-top: 1rem;" onclick="openAddAlbum()">+ Créer un album</button>
            </div>
        `;
        return;
    }

    const typeLabels = { campagne: '🎤 Campagne', bilan: '📊 Bilan', objectifs: '🎯 Objectifs' };

    document.getElementById('albums-list').innerHTML = albums.map((album, idx) => {
        const realIndex = data.medias.albums.findIndex(a => a.id === album.id);
        const photos = (album.photos || []).map(id => data.medias.photos.find(p => p.id === id)).filter(p => p);
        const videos = (album.videos || []).map(id => data.medias.videos.find(v => v.id === id)).filter(v => v);
        const photoCount = photos.length;
        const videoCount = videos.length;
        const coverUrl = album.cover || (photos[0]?.src) || 'images/logo.png';
        const cats = data.medias.categoriesAlbums?.[album.type] || [];
        const cat = cats.find(c => c.id === album.categorie);

        return `
            <div class="item-card" style="position: relative;">
                <img src="${coverUrl}" alt="${album.titre}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 0.5rem;" onerror="this.src='images/logo.png'">
                <div style="position: absolute; top: 8px; right: 8px; background: ${album.type === 'campagne' ? '#E91E63' : album.type === 'bilan' ? '#2196F3' : '#4CAF50'}; color: white; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.7rem;">
                    ${typeLabels[album.type] || album.type}
                </div>
                <h4 style="margin: 0 0 0.25rem; font-size: 0.95rem; color: var(--bleu);">${album.titre}</h4>
                <p style="font-size: 0.8rem; color: #888; margin: 0;">
                    ${cat ? `${cat.icon} ${cat.label} • ` : ''}${album.date || ''}
                </p>
                <p style="font-size: 0.75rem; color: #666; margin: 0.25rem 0 0;">
                    ${photoCount > 0 ? `📷 ${photoCount}` : ''} ${videoCount > 0 ? `🎬 ${videoCount}` : ''}
                </p>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                    <button class="btn btn-sm btn-outline" onclick="openEditAlbum(${realIndex})">✏️ Modifier</button>
                    <button class="btn btn-sm" style="background: #e74c3c; color: white;" onclick="deleteAlbum(${realIndex})">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function openAddAlbum() {
    currentEdit = { type: 'album', index: null };
    document.getElementById('modal-title').textContent = '📁 Créer un album';
    document.getElementById('modal-body').innerHTML = getAlbumForm({});
    document.getElementById('modal-save').onclick = saveAlbum;
    document.getElementById('modal-edit').classList.add('active');
}

function openEditAlbum(index) {
    currentEdit = { type: 'album', index };
    const album = data.medias.albums[index];
    document.getElementById('modal-title').textContent = '📁 Modifier l\'album';
    document.getElementById('modal-body').innerHTML = getAlbumForm(album);
    document.getElementById('modal-save').onclick = saveAlbum;
    document.getElementById('modal-edit').classList.add('active');
}

function getAlbumForm(album) {
    const today = new Date().toISOString().split('T')[0];
    const cats = data.medias.categoriesAlbums || { campagne: [], bilan: [], objectifs: [] };
    const selectedPhotos = album.photos || [];
    const selectedVideos = album.videos || [];
    const allPhotos = data.medias.photos || [];
    const allVideos = data.medias.videos || [];

    return `
        <div class="form-group">
            <label>Titre de l'album *</label>
            <input type="text" id="album-titre" value="${album.titre || ''}" placeholder="Ex: Réunion publique - Quartier Nord" required>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Type d'album *</label>
                <select id="album-type" onchange="updateAlbumCategories()">
                    <option value="campagne" ${album.type === 'campagne' ? 'selected' : ''}>🎤 Campagne</option>
                    <option value="bilan" ${album.type === 'bilan' ? 'selected' : ''}>📊 Bilan</option>
                    <option value="objectifs" ${album.type === 'objectifs' ? 'selected' : ''}>🎯 Objectifs</option>
                </select>
            </div>
            <div class="form-group">
                <label>Catégorie</label>
                <select id="album-categorie">
                    ${getCategoriesOptions(album.type || 'campagne', album.categorie)}
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Date *</label>
                <input type="date" id="album-date" value="${album.date || today}" required>
            </div>
            <div class="form-group">
                <label>Lieu (optionnel)</label>
                <input type="text" id="album-lieu" value="${album.lieu || ''}" placeholder="Ex: Salle des fêtes">
            </div>
        </div>
        <div class="form-group">
            <label>Description (optionnel)</label>
            <textarea id="album-description" rows="2" placeholder="Description de l'album...">${album.description || ''}</textarea>
        </div>
        <div class="form-group">
            <label>Image de couverture (URL)</label>
            <input type="text" id="album-cover" value="${album.cover || ''}" placeholder="images/medias/cover.jpg (laissez vide pour utiliser la 1ère photo)">
        </div>

        <!-- PHOTOS -->
        <div class="form-group">
            <label>📷 Photos de l'album (${selectedPhotos.length} sélectionnées)</label>
            <div style="max-height: 200px; overflow-y: auto; border: 1px solid var(--gris-border); border-radius: 8px; padding: 0.5rem;">
                ${allPhotos.length === 0 ? '<p style="text-align:center; color:#888; padding:1rem;">Aucune photo disponible.</p>' : ''}
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 0.5rem;">
                    ${allPhotos.map(photo => `
                        <label style="cursor: pointer; position: relative;">
                            <input type="checkbox" name="album-photos" value="${photo.id}" ${selectedPhotos.includes(photo.id) ? 'checked' : ''} style="position: absolute; top: 5px; left: 5px; z-index: 1;">
                            <img src="${photo.thumbnail || photo.src}" alt="${photo.titre}" style="width: 100%; height: 60px; object-fit: cover; border-radius: 6px; opacity: ${selectedPhotos.includes(photo.id) ? '1' : '0.6'}; border: ${selectedPhotos.includes(photo.id) ? '3px solid #4CAF50' : '1px solid #ddd'};">
                            <div style="font-size: 0.65rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${photo.titre}</div>
                        </label>
                    `).join('')}
                </div>
            </div>
        </div>

        <!-- VIDEOS -->
        <div class="form-group">
            <label>🎬 Vidéos de l'album (${selectedVideos.length} sélectionnées)</label>
            <div style="max-height: 200px; overflow-y: auto; border: 1px solid var(--gris-border); border-radius: 8px; padding: 0.5rem;">
                ${allVideos.length === 0 ? '<p style="text-align:center; color:#888; padding:1rem;">Aucune vidéo disponible.</p>' : ''}
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.5rem;">
                    ${allVideos.map(video => {
                        const ytId = video.videoId || video.id;
                        const thumb = video.thumbnail || 'https://img.youtube.com/vi/' + ytId + '/mqdefault.jpg';
                        const isSelected = selectedVideos.includes(video.id);
                        return `
                        <label style="cursor: pointer; position: relative;">
                            <input type="checkbox" name="album-videos" value="${video.id}" ${isSelected ? 'checked' : ''} style="position: absolute; top: 5px; left: 5px; z-index: 1;">
                            <div style="position: relative;">
                                <img src="${thumb}" alt="${video.titre}" style="width: 100%; height: 70px; object-fit: cover; border-radius: 6px; opacity: ${isSelected ? '1' : '0.6'}; border: ${isSelected ? '3px solid #E91E63' : '1px solid #ddd'};">
                                <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(233,30,99,0.8); color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem;">▶</span>
                            </div>
                            <div style="font-size: 0.65rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${video.titre}</div>
                        </label>
                    `}).join('')}
                </div>
            </div>
        </div>
    `;
}

function getCategoriesOptions(type, selected) {
    const cats = data.medias.categoriesAlbums?.[type] || [];
    return `<option value="">-- Choisir --</option>` + cats.map(c =>
        `<option value="${c.id}" ${selected === c.id ? 'selected' : ''}>${c.icon} ${c.label}</option>`
    ).join('');
}

function updateAlbumCategories() {
    const type = document.getElementById('album-type').value;
    document.getElementById('album-categorie').innerHTML = getCategoriesOptions(type, '');
}

function saveAlbum() {
    const titre = document.getElementById('album-titre').value.trim();
    const type = document.getElementById('album-type').value;
    const categorie = document.getElementById('album-categorie').value;
    const date = document.getElementById('album-date').value;
    const lieu = document.getElementById('album-lieu').value.trim();
    const description = document.getElementById('album-description').value.trim();
    const cover = document.getElementById('album-cover').value.trim();

    // Récupérer les photos sélectionnées
    const photoCheckboxes = document.querySelectorAll('input[name="album-photos"]:checked');
    const photos = Array.from(photoCheckboxes).map(cb => parseFloat(cb.value) || cb.value);

    // Récupérer les vidéos sélectionnées
    const videoCheckboxes = document.querySelectorAll('input[name="album-videos"]:checked');
    const videos = Array.from(videoCheckboxes).map(cb => parseFloat(cb.value) || cb.value);

    if (!titre) {
        showToast('⚠️ Le titre est requis', 'warning');
        return;
    }

    const album = {
        id: currentEdit.index !== null ? data.medias.albums[currentEdit.index].id : 'album_' + Date.now(),
        titre,
        type,
        categorie,
        date,
        lieu,
        description,
        cover,
        photos,
        videos
    };

    if (!data.medias.albums) data.medias.albums = [];

    if (currentEdit.index !== null) {
        data.medias.albums[currentEdit.index] = album;
        showToast('✅ Album modifié', 'success');
    } else {
        data.medias.albums.push(album);
        showToast('✅ Album créé', 'success');
    }

    closeModal();
    renderAlbumsAdmin();
    markModified('medias');
}

function deleteAlbum(index) {
    if (confirm('Supprimer cet album ? Les photos ne seront pas supprimées.')) {
        data.medias.albums.splice(index, 1);
        renderAlbumsAdmin();
        markModified('medias');
        showToast('🗑️ Album supprimé', 'success');
    }
}

// === PHOTOS ===
function renderPhotos() {
    const photos = data.medias?.photos || [];
    document.getElementById('photos-count').textContent = photos.length;

    if (photos.length === 0) {
        document.getElementById('photos-list').innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #888;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📷</div>
                <p>Aucune photo pour le moment</p>
            </div>
        `;
        return;
    }

    document.getElementById('photos-list').innerHTML = photos.map((photo, index) => `
        <div class="item-card" style="position: relative;">
            <img src="${photo.thumbnail || photo.src}" alt="${photo.titre}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 0.5rem;">
            <h4 style="margin: 0 0 0.25rem; font-size: 0.95rem; color: var(--bleu);">${photo.titre}</h4>
            <p style="font-size: 0.8rem; color: #888; margin: 0;">${photo.categorie || ''} ${photo.date ? '• ' + photo.date : ''}</p>
            <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                <button class="btn btn-sm btn-outline" onclick="openEditPhoto(${index})">✏️ Modifier</button>
                <button class="btn btn-sm" style="background: #e74c3c; color: white;" onclick="deletePhoto(${index})">🗑️</button>
            </div>
        </div>
    `).join('');
}

function openAddPhoto() {
    currentEdit = { type: 'photo', index: null };
    document.getElementById('modal-title').textContent = '📷 Ajouter une photo';
    document.getElementById('modal-body').innerHTML = getPhotoForm({});
    document.getElementById('modal-save').onclick = savePhoto;
    document.getElementById('modal-edit').classList.add('active');
}

function openEditPhoto(index) {
    currentEdit = { type: 'photo', index };
    const photo = data.medias.photos[index];
    document.getElementById('modal-title').textContent = '📷 Modifier la photo';
    document.getElementById('modal-body').innerHTML = getPhotoForm(photo);
    document.getElementById('modal-save').onclick = savePhoto;
    document.getElementById('modal-edit').classList.add('active');
}

function getPhotoForm(photo) {
    const today = new Date().toISOString().split('T')[0];
    return `
        <div class="form-group">
            <label>Titre *</label>
            <input type="text" id="photo-titre" value="${photo.titre || ''}" placeholder="Ex: Réunion publique quartier Nord" required>
        </div>
        <div class="form-group">
            <label>Importer une image</label>
            <div class="photo-upload" onclick="document.getElementById('media-photo-file').click()"
                 ondragover="event.preventDefault(); this.classList.add('dragover')"
                 ondragleave="this.classList.remove('dragover')"
                 ondrop="handleMediaPhotoDrop(event)"
                 style="padding: 1.5rem; text-align: center; border: 2px dashed var(--gris-border); border-radius: 8px; cursor: pointer;">
                <input type="file" id="media-photo-file" accept="image/*" onchange="handleMediaPhotoSelect(event)" style="display: none;">
                <div id="media-photo-preview" style="display: ${photo.src ? 'block' : 'none'};">
                    ${photo.src ? `<img src="${photo.src}" style="max-width: 200px; max-height: 150px; border-radius: 8px;">` : ''}
                </div>
                <div id="media-photo-placeholder" style="display: ${photo.src ? 'none' : 'block'};">
                    <span style="font-size: 2rem;">📷</span>
                    <p style="margin: 0.5rem 0 0 0; color: var(--gris-texte);">Cliquez ou glissez une image</p>
                </div>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>URL de l'image *</label>
                <input type="text" id="photo-src" value="${photo.src || ''}" placeholder="images/photo.jpg">
            </div>
            <div class="form-group">
                <label>URL miniature (optionnel)</label>
                <input type="text" id="photo-thumbnail" value="${photo.thumbnail || ''}" placeholder="images/thumb-photo.jpg">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Catégorie</label>
                <select id="photo-categorie">
                    <option value="">-- Choisir --</option>
                    <option value="Réunions" ${photo.categorie === 'Réunions' ? 'selected' : ''}>Réunions</option>
                    <option value="Équipe" ${photo.categorie === 'Équipe' ? 'selected' : ''}>Équipe</option>
                    <option value="Ville" ${photo.categorie === 'Ville' ? 'selected' : ''}>Ville</option>
                    <option value="Événements" ${photo.categorie === 'Événements' ? 'selected' : ''}>Événements</option>
                    <option value="Terrain" ${photo.categorie === 'Terrain' ? 'selected' : ''}>Terrain</option>
                </select>
            </div>
            <div class="form-group">
                <label>Date *</label>
                <input type="date" id="photo-date" value="${photo.date || today}" required>
            </div>
        </div>
        <div class="form-group">
            <label>Description (optionnel)</label>
            <textarea id="photo-description" rows="2" placeholder="Description de la photo...">${photo.description || ''}</textarea>
        </div>
    `;
}

// Upload de photo pour la section Médias
async function handleMediaPhotoSelect(event) {
    const file = event.target.files[0];
    if (file) await processMediaPhoto(file);
}

async function handleMediaPhotoDrop(event) {
    event.preventDefault();
    event.target.classList.remove('dragover');
    const file = event.dataTransfer.files[0];
    if (file) await processMediaPhoto(file);
}

async function processMediaPhoto(file) {
    if (file.size > 10 * 1024 * 1024) {
        showToast('⚠️ Image trop grande (max 10 Mo)', 'warning');
        return;
    }

    if (!file.type.startsWith('image/')) {
        showToast('⚠️ Fichier non valide', 'warning');
        return;
    }

    showToast('🗜️ Compression en cours...', 'info');

    // Compresser l'image (max 1920px pour les médias, qualité 85%)
    const compressedFile = await compressImage(file, 1920, 0.85);
    const originalSize = (file.size / 1024).toFixed(0);
    const newSize = (compressedFile.size / 1024).toFixed(0);
    if (compressedFile.size < file.size) {
        showToast(`🗜️ ${originalSize} Ko → ${newSize} Ko`, 'info');
    }

    const reader = new FileReader();
    reader.onload = async function(e) {
        const base64Content = e.target.result.split(',')[1];
        const fileName = compressedFile.name.replace(/\s+/g, '_').toLowerCase();
        const imagePath = `images/medias/${fileName}`;

        // Mode local : upload vers le serveur local
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            try {
                const response = await fetch(`/api/upload/${imagePath}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: base64Content })
                });

                if (response.ok) {
                    document.getElementById('photo-src').value = imagePath;
                    document.getElementById('media-photo-preview').innerHTML = `<img src="${e.target.result}" style="max-width: 200px; max-height: 150px; border-radius: 8px;">`;
                    document.getElementById('media-photo-preview').style.display = 'block';
                    document.getElementById('media-photo-placeholder').style.display = 'none';

                    // Suggérer un titre depuis le nom de fichier si vide
                    const titreInput = document.getElementById('photo-titre');
                    if (!titreInput.value) {
                        const suggestedTitle = fileName
                            .replace(/\.[^/.]+$/, '') // enlever extension
                            .replace(/[-_]/g, ' ')    // remplacer - et _ par espaces
                            .replace(/\b\w/g, c => c.toUpperCase()); // capitaliser
                        titreInput.value = suggestedTitle;
                    }

                    showToast('✅ Image uploadée !', 'success');
                } else {
                    const error = await response.json();
                    throw new Error(error.error || 'Upload failed');
                }
            } catch (err) {
                showToast('❌ Erreur upload: ' + err.message, 'error');
            }
        } else {
            // Mode GitHub Pages : upload obligatoire vers GitHub
            const token = document.getElementById('github-token')?.value?.trim();
            if (!token) {
                showToast('❌ Token GitHub requis pour uploader des images', 'error');
                return;
            }

            showToast('⏳ Upload vers GitHub...', 'info');

            try {
                // Vérifier si le fichier existe déjà
                let sha = null;
                const getResponse = await fetch(
                    `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${imagePath}?ref=${GITHUB_CONFIG.branch}`,
                    { headers: { 'Authorization': `token ${token}` } }
                );
                if (getResponse.ok) {
                    sha = (await getResponse.json()).sha;
                }

                const body = {
                    message: `Upload media photo ${fileName}`,
                    content: base64Content,
                    branch: GITHUB_CONFIG.branch
                };
                if (sha) body.sha = sha;

                const response = await fetch(
                    `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${imagePath}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Authorization': `token ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(body)
                    }
                );

                if (response.ok) {
                    document.getElementById('photo-src').value = imagePath;
                    document.getElementById('media-photo-preview').innerHTML = `<img src="${e.target.result}" style="max-width: 200px; max-height: 150px; border-radius: 8px;">`;
                    document.getElementById('media-photo-preview').style.display = 'block';
                    document.getElementById('media-photo-placeholder').style.display = 'none';

                    // Suggérer un titre depuis le nom de fichier si vide
                    const titreInput = document.getElementById('photo-titre');
                    if (!titreInput.value) {
                        const suggestedTitle = fileName
                            .replace(/\.[^/.]+$/, '')
                            .replace(/[-_]/g, ' ')
                            .replace(/\b\w/g, c => c.toUpperCase());
                        titreInput.value = suggestedTitle;
                    }

                    showToast('✅ Image uploadée sur GitHub !', 'success');
                } else {
                    const error = await response.json();
                    throw new Error(error.message || 'Upload GitHub failed');
                }
            } catch (err) {
                console.error('Erreur upload GitHub:', err);
                showToast('❌ Échec upload GitHub: ' + err.message, 'error');
                // NE PAS mettre le chemin dans l'input si l'upload a échoué
            }
        }
    };
    reader.readAsDataURL(file);
}

function savePhoto() {
    const photo = {
        id: currentEdit.index !== null ? data.medias.photos[currentEdit.index].id : Date.now(),
        titre: document.getElementById('photo-titre').value.trim(),
        src: document.getElementById('photo-src').value.trim(),
        thumbnail: document.getElementById('photo-thumbnail').value.trim() || null,
        categorie: document.getElementById('photo-categorie').value,
        date: document.getElementById('photo-date').value,
        description: document.getElementById('photo-description').value.trim()
    };

    if (!photo.titre || !photo.src) {
        showToast('Veuillez remplir le titre et l\'URL de l\'image', 'error');
        return;
    }

    // SÉCURITÉ : Bloquer le stockage de base64
    if (photo.src.startsWith('data:')) {
        showToast('❌ Image non uploadée ! Veuillez d\'abord uploader l\'image.', 'error');
        return;
    }
    if (photo.thumbnail && photo.thumbnail.startsWith('data:')) {
        photo.thumbnail = null; // Ignorer les thumbnails base64
    }

    if (currentEdit.index !== null) {
        data.medias.photos[currentEdit.index] = photo;
    } else {
        data.medias.photos.push(photo);
    }

    closeModal();
    renderPhotos();
    markModified('medias');
    showToast('📷 Photo enregistrée', 'success');
}

function deletePhoto(index) {
    if (confirm('Supprimer cette photo ?')) {
        data.medias.photos.splice(index, 1);
        renderPhotos();
        markModified('medias');
        showToast('Photo supprimée', 'success');
    }
}

// === PRESSE ===
function renderPresse() {
    const articles = data.medias?.presse || [];
    document.getElementById('presse-count').textContent = articles.length;

    if (articles.length === 0) {
        document.getElementById('presse-list').innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #888;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📰</div>
                <p>Aucun article de presse pour le moment</p>
            </div>
        `;
        return;
    }

    document.getElementById('presse-list').innerHTML = articles.map((article, index) => `
        <div class="item-row" style="display: flex; gap: 1rem; align-items: center; padding: 1rem; background: white; border-radius: 8px; margin-bottom: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            ${article.image ? `<img src="${article.image}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 6px;">` : '<div style="width: 80px; height: 60px; background: #f0f0f0; border-radius: 6px; display: flex; align-items: center; justify-content: center;">📰</div>'}
            <div style="flex: 1;">
                <div style="font-weight: 600; color: var(--bleu);">${article.titre}</div>
                <div style="font-size: 0.85rem; color: #888;">${article.source} • ${article.date}</div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-sm btn-outline" onclick="openEditPresse(${index})">✏️</button>
                <button class="btn btn-sm" style="background: #e74c3c; color: white;" onclick="deletePresse(${index})">🗑️</button>
            </div>
        </div>
    `).join('');
}

function openAddPresse() {
    currentEdit = { type: 'presse', index: null };
    document.getElementById('modal-title').textContent = '📰 Ajouter un article de presse';
    document.getElementById('modal-body').innerHTML = getPresseForm({});
    document.getElementById('modal-save').onclick = savePresse;
    document.getElementById('modal-edit').classList.add('active');
}

function openEditPresse(index) {
    currentEdit = { type: 'presse', index };
    const article = data.medias.presse[index];
    document.getElementById('modal-title').textContent = '📰 Modifier l\'article de presse';
    document.getElementById('modal-body').innerHTML = getPresseForm(article);
    document.getElementById('modal-save').onclick = savePresse;
    document.getElementById('modal-edit').classList.add('active');
}

function getPresseForm(article) {
    return `
        <div class="form-group">
            <label>Titre de l'article *</label>
            <input type="text" id="presse-titre" value="${article.titre || ''}" placeholder="Ex: Municipales : Catherine Troton candidate">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Source / Média *</label>
                <input type="text" id="presse-source" value="${article.source || ''}" placeholder="Ex: Le Dauphiné Libéré">
            </div>
            <div class="form-group">
                <label>Date de publication</label>
                <input type="date" id="presse-date" value="${article.date || ''}">
            </div>
        </div>
        <div class="form-group">
            <label>Extrait / Résumé</label>
            <textarea id="presse-extrait" rows="3" placeholder="Court résumé de l'article...">${article.extrait || ''}</textarea>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Lien vers l'article (optionnel)</label>
                <input type="url" id="presse-lien" value="${article.lien || ''}" placeholder="https://...">
            </div>
            <div class="form-group">
                <label>Image (optionnel)</label>
                <input type="text" id="presse-image" value="${article.image || ''}" placeholder="images/article.jpg">
            </div>
        </div>
    `;
}

function savePresse() {
    const article = {
        id: currentEdit.index !== null ? data.medias.presse[currentEdit.index].id : Date.now(),
        titre: document.getElementById('presse-titre').value.trim(),
        source: document.getElementById('presse-source').value.trim(),
        date: document.getElementById('presse-date').value,
        extrait: document.getElementById('presse-extrait').value.trim(),
        lien: document.getElementById('presse-lien').value.trim(),
        image: document.getElementById('presse-image').value.trim()
    };

    if (!article.titre || !article.source) {
        showToast('Veuillez remplir le titre et la source', 'error');
        return;
    }

    if (currentEdit.index !== null) {
        data.medias.presse[currentEdit.index] = article;
    } else {
        data.medias.presse.push(article);
    }

    closeModal();
    renderPresse();
    markModified('medias');
    showToast('📰 Article de presse enregistré', 'success');
}

function deletePresse(index) {
    if (confirm('Supprimer cet article de presse ?')) {
        data.medias.presse.splice(index, 1);
        renderPresse();
        markModified('medias');
        showToast('Article supprimé', 'success');
    }
}

// === VIDEOS ===
function renderVideos() {
    const videos = data.medias?.videos || [];
    document.getElementById('videos-count').textContent = videos.length;

    if (videos.length === 0) {
        document.getElementById('videos-list').innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #888;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🎬</div>
                <p>Aucune vidéo pour le moment</p>
            </div>
        `;
        return;
    }

    document.getElementById('videos-list').innerHTML = videos.map((video, index) => `
        <div class="item-card">
            <div style="position: relative; aspect-ratio: 16/9; background: #000; border-radius: 8px; overflow: hidden; margin-bottom: 0.75rem;">
                <img src="${video.thumbnail || (video.type === 'youtube' ? `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg` : '')}"
                     style="width: 100%; height: 100%; object-fit: cover;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.7); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">▶</div>
            </div>
            <h4 style="margin: 0 0 0.25rem; font-size: 0.95rem; color: var(--bleu);">${video.titre}</h4>
            <p style="font-size: 0.8rem; color: #888; margin: 0;">${video.type === 'youtube' ? 'YouTube' : 'Facebook'} ${video.date ? '• ' + video.date : ''}</p>
            <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                <button class="btn btn-sm btn-outline" onclick="openEditVideo(${index})">✏️ Modifier</button>
                <button class="btn btn-sm" style="background: #e74c3c; color: white;" onclick="deleteVideo(${index})">🗑️</button>
            </div>
        </div>
    `).join('');
}

function openAddVideo() {
    currentEdit = { type: 'video', index: null };
    document.getElementById('modal-title').textContent = '🎬 Ajouter une vidéo';
    document.getElementById('modal-body').innerHTML = getVideoForm({});
    document.getElementById('modal-save').onclick = saveVideo;
    document.getElementById('modal-edit').classList.add('active');
}

function openEditVideo(index) {
    currentEdit = { type: 'video', index };
    const video = data.medias.videos[index];
    document.getElementById('modal-title').textContent = '🎬 Modifier la vidéo';
    document.getElementById('modal-body').innerHTML = getVideoForm(video);
    document.getElementById('modal-save').onclick = saveVideo;
    document.getElementById('modal-edit').classList.add('active');
}

function getVideoForm(video) {
    return `
        <div class="form-group">
            <label>🔗 Coller l'URL de la vidéo (YouTube ou Facebook)</label>
            <input type="text" id="video-url" value="" placeholder="https://www.youtube.com/watch?v=... ou https://www.facebook.com/watch?v=..."
                   oninput="parseVideoUrl(this.value)" style="font-size: 0.95rem;">
            <small style="color: var(--vert);">Collez l'URL complète - le type et l'ID seront extraits automatiquement</small>
        </div>
        <div class="form-group">
            <label>Titre de la vidéo *</label>
            <input type="text" id="video-titre" value="${video.titre || ''}" placeholder="Ex: Interview de Catherine Troton">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Type de vidéo</label>
                <select id="video-type">
                    <option value="youtube" ${video.type === 'youtube' || !video.type ? 'selected' : ''}>YouTube</option>
                    <option value="facebook" ${video.type === 'facebook' ? 'selected' : ''}>Facebook</option>
                </select>
            </div>
            <div class="form-group">
                <label>ID de la vidéo</label>
                <input type="text" id="video-id" value="${video.videoId || ''}" placeholder="Extrait automatiquement de l'URL">
            </div>
        </div>
        <div id="video-preview" style="margin: 1rem 0; display: ${video.videoId ? 'block' : 'none'};">
            <label style="display: block; margin-bottom: 0.5rem;">Aperçu :</label>
            <div style="position: relative; aspect-ratio: 16/9; max-width: 300px; background: #000; border-radius: 8px; overflow: hidden;">
                <img id="video-preview-img" src="${video.videoId ? `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg` : ''}"
                     style="width: 100%; height: 100%; object-fit: cover;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255,0,0,0.8); color: white; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">▶</div>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Date</label>
                <input type="date" id="video-date" value="${video.date || new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
                <label>Miniature personnalisée (optionnel)</label>
                <input type="text" id="video-thumbnail" value="${video.thumbnail || ''}" placeholder="images/video-thumb.jpg">
            </div>
        </div>
        <div class="form-group">
            <label>Description (optionnel)</label>
            <textarea id="video-description" rows="2" placeholder="Description de la vidéo...">${video.description || ''}</textarea>
        </div>
    `;
}

// Parser automatique d'URL vidéo
function parseVideoUrl(url) {
    if (!url) return;

    let videoId = '';
    let type = 'youtube';

    // YouTube formats
    // https://www.youtube.com/watch?v=VIDEO_ID
    // https://youtu.be/VIDEO_ID
    // https://www.youtube.com/embed/VIDEO_ID
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
        videoId = youtubeMatch[1];
        type = 'youtube';
    }

    // Facebook formats
    // https://www.facebook.com/watch?v=VIDEO_ID
    // https://fb.watch/VIDEO_ID
    const facebookMatch = url.match(/(?:facebook\.com\/.*\/videos\/|facebook\.com\/watch\?v=|fb\.watch\/)(\d+)/);
    if (facebookMatch) {
        videoId = facebookMatch[1];
        type = 'facebook';
    }

    if (videoId) {
        document.getElementById('video-id').value = videoId;
        document.getElementById('video-type').value = type;

        // Afficher l'aperçu
        const preview = document.getElementById('video-preview');
        const previewImg = document.getElementById('video-preview-img');
        preview.style.display = 'block';

        if (type === 'youtube') {
            previewImg.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        } else {
            previewImg.src = ''; // Facebook n'a pas d'API simple pour les miniatures
        }

        showToast('✅ Vidéo détectée : ' + type.charAt(0).toUpperCase() + type.slice(1), 'success');
    }
}

function saveVideo() {
    const video = {
        id: currentEdit.index !== null ? data.medias.videos[currentEdit.index].id : Date.now(),
        titre: document.getElementById('video-titre').value.trim(),
        type: document.getElementById('video-type').value,
        videoId: document.getElementById('video-id').value.trim(),
        date: document.getElementById('video-date').value,
        thumbnail: document.getElementById('video-thumbnail').value.trim() || null,
        description: document.getElementById('video-description').value.trim()
    };

    if (!video.titre || !video.videoId) {
        showToast('Veuillez remplir le titre et l\'ID de la vidéo', 'error');
        return;
    }

    if (currentEdit.index !== null) {
        data.medias.videos[currentEdit.index] = video;
    } else {
        data.medias.videos.push(video);
    }

    closeModal();
    renderVideos();
    markModified('medias');
    showToast('🎬 Vidéo enregistrée', 'success');
}

function deleteVideo(index) {
    if (confirm('Supprimer cette vidéo ?')) {
        data.medias.videos.splice(index, 1);
        renderVideos();
        markModified('medias');
        showToast('Vidéo supprimée', 'success');
    }
}

// === DOCUMENTS ===
function renderDocuments() {
    const docs = data.medias?.documents || [];
    document.getElementById('documents-count').textContent = docs.length;

    if (docs.length === 0) {
        document.getElementById('documents-list').innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #888;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📄</div>
                <p>Aucun document pour le moment</p>
            </div>
        `;
        return;
    }

    const icons = { pdf: '📕', doc: '📘', docx: '📘', jpg: '🖼️', jpeg: '🖼️', png: '🖼️', zip: '📦' };

    document.getElementById('documents-list').innerHTML = docs.map((doc, index) => `
        <div class="item-row" style="display: flex; gap: 1rem; align-items: center; padding: 1rem; background: white; border-radius: 8px; margin-bottom: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="font-size: 2rem;">${icons[doc.type?.toLowerCase()] || '📄'}</div>
            <div style="flex: 1;">
                <div style="font-weight: 600; color: var(--bleu);">${doc.titre}</div>
                <div style="font-size: 0.85rem; color: #888;">${doc.type?.toUpperCase() || 'Fichier'} ${doc.taille ? '• ' + doc.taille : ''}</div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <a href="${doc.fichier}" target="_blank" rel="noopener" class="btn btn-sm btn-outline">👁️ Voir</a>
                <button class="btn btn-sm btn-outline" onclick="openEditDocument(${index})">✏️</button>
                <button class="btn btn-sm" style="background: #e74c3c; color: white;" onclick="deleteDocument(${index})">🗑️</button>
            </div>
        </div>
    `).join('');
}

function openAddDocument() {
    currentEdit = { type: 'document', index: null };
    document.getElementById('modal-title').textContent = '📄 Ajouter un document';
    document.getElementById('modal-body').innerHTML = getDocumentForm({});
    document.getElementById('modal-save').onclick = saveDocument;
    document.getElementById('modal-edit').classList.add('active');
}

function openEditDocument(index) {
    currentEdit = { type: 'document', index };
    const doc = data.medias.documents[index];
    document.getElementById('modal-title').textContent = '📄 Modifier le document';
    document.getElementById('modal-body').innerHTML = getDocumentForm(doc);
    document.getElementById('modal-save').onclick = saveDocument;
    document.getElementById('modal-edit').classList.add('active');
}

function getDocumentForm(doc) {
    return `
        <div class="form-group">
            <label>Titre du document *</label>
            <input type="text" id="doc-titre" value="${doc.titre || ''}" placeholder="Ex: Programme municipal 2026">
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea id="doc-description" rows="2" placeholder="Description du document...">${doc.description || ''}</textarea>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Chemin du fichier *</label>
                <input type="text" id="doc-fichier" value="${doc.fichier || ''}" placeholder="documents/programme.pdf">
            </div>
            <div class="form-group">
                <label>Type de fichier</label>
                <select id="doc-type">
                    <option value="pdf" ${doc.type === 'pdf' ? 'selected' : ''}>PDF</option>
                    <option value="doc" ${doc.type === 'doc' ? 'selected' : ''}>Word (.doc)</option>
                    <option value="docx" ${doc.type === 'docx' ? 'selected' : ''}>Word (.docx)</option>
                    <option value="jpg" ${doc.type === 'jpg' ? 'selected' : ''}>Image (JPG)</option>
                    <option value="png" ${doc.type === 'png' ? 'selected' : ''}>Image (PNG)</option>
                    <option value="zip" ${doc.type === 'zip' ? 'selected' : ''}>Archive (ZIP)</option>
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Taille du fichier</label>
                <input type="text" id="doc-taille" value="${doc.taille || ''}" placeholder="Ex: 2.5 Mo">
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" id="doc-date" value="${doc.date || ''}">
            </div>
        </div>
    `;
}

function saveDocument() {
    const doc = {
        id: currentEdit.index !== null ? data.medias.documents[currentEdit.index].id : Date.now(),
        titre: document.getElementById('doc-titre').value.trim(),
        description: document.getElementById('doc-description').value.trim(),
        fichier: document.getElementById('doc-fichier').value.trim(),
        type: document.getElementById('doc-type').value,
        taille: document.getElementById('doc-taille').value.trim(),
        date: document.getElementById('doc-date').value
    };

    if (!doc.titre || !doc.fichier) {
        showToast('Veuillez remplir le titre et le chemin du fichier', 'error');
        return;
    }

    if (currentEdit.index !== null) {
        data.medias.documents[currentEdit.index] = doc;
    } else {
        data.medias.documents.push(doc);
    }

    closeModal();
    renderDocuments();
    markModified('medias');
    showToast('📄 Document enregistré', 'success');
}

function deleteDocument(index) {
    if (confirm('Supprimer ce document ?')) {
        data.medias.documents.splice(index, 1);
        renderDocuments();
        markModified('medias');
        showToast('Document supprimé', 'success');
    }
}

// === BOBINES (vidéos thématiques) ===
function renderBobinesAdmin() {
    const bobines = data.medias?.bobines || [];
    document.getElementById('bobines-count').textContent = bobines.length;

    if (bobines.length === 0) {
        document.getElementById('bobines-list').innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #888;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🎞️</div>
                <p>Aucune bobine pour le moment</p>
                <p style="font-size: 0.85rem;">Les bobines sont des vidéos thématiques courtes affichées dans le Blog</p>
            </div>
        `;
        return;
    }

    document.getElementById('bobines-list').innerHTML = bobines.map((b, index) => {
        const themeData = data.themes?.find(t => t.theme === b.theme);
        const themeColor = themeData?.color || '#1a3a5c';
        const themeIcon = themeData?.icon || '🎞️';
        const thumbnail = b.thumbnail || `https://img.youtube.com/vi/${b.videoId}/mqdefault.jpg`;

        return `
        <div class="media-card" style="position: relative;">
            <div style="position: relative;">
                <img src="${thumbnail}" alt="${b.titre}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 8px 8px 0 0;" onerror="this.src='https://img.youtube.com/vi/${b.videoId}/hqdefault.jpg'">
                <span style="position: absolute; top: 8px; left: 8px; background: ${themeColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;">${themeIcon} ${b.theme || 'Sans thème'}</span>
                <a href="https://www.youtube.com/watch?v=${b.videoId}" target="_blank" rel="noopener" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(229,57,53,0.9); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; text-decoration: none;">▶</a>
            </div>
            <div style="padding: 1rem;">
                <div style="font-weight: 600; color: var(--bleu); margin-bottom: 0.5rem;">${b.titre}</div>
                ${b.description ? `<div style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem;">${b.description.substring(0, 80)}${b.description.length > 80 ? '...' : ''}</div>` : ''}
                <div style="font-size: 0.8rem; color: #888;">${b.date ? new Date(b.date).toLocaleDateString('fr-FR') : ''}</div>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                    <button class="btn btn-sm btn-outline" onclick="openEditBobine(${index})">✏️ Modifier</button>
                    <button class="btn btn-sm" style="background: #e74c3c; color: white;" onclick="deleteBobine(${index})">🗑️</button>
                </div>
            </div>
        </div>
    `}).join('');
}

function openAddBobine() {
    currentEdit = { type: 'bobine', index: null };
    document.getElementById('modal-title').textContent = '🎞️ Ajouter une bobine';
    document.getElementById('modal-body').innerHTML = getBobineForm({});
    document.getElementById('modal-save').onclick = saveBobine;
    document.getElementById('modal-edit').classList.add('active');
}

function openEditBobine(index) {
    currentEdit = { type: 'bobine', index };
    const bobine = data.medias.bobines[index];
    document.getElementById('modal-title').textContent = '🎞️ Modifier la bobine';
    document.getElementById('modal-body').innerHTML = getBobineForm(bobine);
    document.getElementById('modal-save').onclick = saveBobine;
    document.getElementById('modal-edit').classList.add('active');
}

function getBobineForm(b) {
    const themesOptions = (data.themes || []).map(t =>
        `<option value="${t.theme}" ${b.theme === t.theme ? 'selected' : ''}>${t.icon} ${t.theme}</option>`
    ).join('');

    return `
        <div class="form-group">
            <label>Titre de la bobine *</label>
            <input type="text" id="bobine-titre" value="${b.titre || ''}" placeholder="Ex: La transition écologique à Vizille">
        </div>
        <div class="form-group">
            <label>Thème *</label>
            <select id="bobine-theme">
                <option value="">-- Choisir un thème --</option>
                ${themesOptions}
            </select>
        </div>
        <div class="form-group">
            <label>URL YouTube ou ID de la vidéo *</label>
            <input type="text" id="bobine-url" value="${b.videoId || ''}" placeholder="Ex: https://www.youtube.com/watch?v=XXXXX ou juste l'ID" onpaste="setTimeout(() => parseBobineUrl(), 100)" oninput="parseBobineUrl()">
            <small style="color: #888;">Collez l'URL YouTube, l'ID sera extrait automatiquement</small>
        </div>
        <div class="form-group">
            <label>ID YouTube (extrait automatiquement)</label>
            <input type="text" id="bobine-videoid" value="${b.videoId || ''}" readonly style="background: #f5f5f5;">
        </div>
        <div id="bobine-preview" style="display: ${b.videoId ? 'block' : 'none'}; margin-bottom: 1rem;">
            <img id="bobine-preview-img" src="${b.videoId ? `https://img.youtube.com/vi/${b.videoId}/mqdefault.jpg` : ''}" style="width: 100%; max-width: 320px; border-radius: 8px;">
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea id="bobine-description" rows="3" placeholder="Description de la bobine...">${b.description || ''}</textarea>
        </div>
        <div class="form-group">
            <label>Date</label>
            <input type="date" id="bobine-date" value="${b.date || new Date().toISOString().split('T')[0]}">
        </div>
        <div class="form-group">
            <label>Miniature personnalisée (optionnel)</label>
            <input type="text" id="bobine-thumbnail" value="${b.thumbnail || ''}" placeholder="URL de l'image ou laisser vide pour YouTube">
        </div>
    `;
}

function parseBobineUrl() {
    const input = document.getElementById('bobine-url').value;
    let videoId = input;

    // Extraire l'ID YouTube de différents formats d'URL
    const youtubeMatch = input.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
        videoId = youtubeMatch[1];
    } else if (input.length === 11 && /^[a-zA-Z0-9_-]+$/.test(input)) {
        // C'est déjà un ID
        videoId = input;
    }

    if (videoId && videoId.length === 11) {
        document.getElementById('bobine-videoid').value = videoId;
        document.getElementById('bobine-preview').style.display = 'block';
        document.getElementById('bobine-preview-img').src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    }
}

function saveBobine() {
    const bobine = {
        id: currentEdit.index !== null ? data.medias.bobines[currentEdit.index].id : Date.now(),
        titre: document.getElementById('bobine-titre').value.trim(),
        theme: document.getElementById('bobine-theme').value,
        videoId: document.getElementById('bobine-videoid').value.trim(),
        description: document.getElementById('bobine-description').value.trim(),
        date: document.getElementById('bobine-date').value,
        thumbnail: document.getElementById('bobine-thumbnail').value.trim() || null
    };

    if (!bobine.titre || !bobine.videoId || !bobine.theme) {
        showToast('Veuillez remplir le titre, le thème et l\'ID YouTube', 'error');
        return;
    }

    // Initialiser le tableau si nécessaire
    if (!data.medias.bobines) {
        data.medias.bobines = [];
    }

    if (currentEdit.index !== null) {
        data.medias.bobines[currentEdit.index] = bobine;
    } else {
        data.medias.bobines.push(bobine);
    }

    closeModal();
    renderBobinesAdmin();
    markModified('medias');
    showToast('🎞️ Bobine enregistrée', 'success');
}

function deleteBobine(index) {
    if (confirm('Supprimer cette bobine ?')) {
        data.medias.bobines.splice(index, 1);
        renderBobinesAdmin();
        markModified('medias');
        showToast('Bobine supprimée', 'success');
    }
}

// === COLLECTE AUTOMATIQUE DES MÉDIAS ===
function collectAllMedia() {
    let photosAdded = 0;
    let videosAdded = 0;
    const existingPhotoSrcs = new Set((data.medias?.photos || []).map(p => p.src));
    const existingVideoIds = new Set((data.medias?.videos || []).map(v => v.videoId));

    // Collecter depuis les ARTICLES / ACTUALITÉS
    (data.articles || []).forEach(article => {
        // Déterminer la catégorie (Événement, Rencontre, Communiqué, etc.)
        const categorie = article.categorie || 'Actualités';

        // Images des articles
        if (article.images && article.images.length > 0) {
            article.images.forEach(img => {
                if (img && !img.startsWith('data:') && !existingPhotoSrcs.has(img)) {
                    data.medias.photos.push({
                        id: Date.now() + Math.random(),
                        titre: article.titre || 'Image actualité',
                        src: img,
                        thumbnail: img,
                        categorie: categorie,
                        date: article.date || new Date().toISOString().split('T')[0],
                        description: article.titre || ''
                    });
                    existingPhotoSrcs.add(img);
                    photosAdded++;
                }
            });
        }
        // Vidéos YouTube des articles
        if (article.youtube) {
            const videoId = article.youtube.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] || article.youtube;
            if (!existingVideoIds.has(videoId)) {
                data.medias.videos.push({
                    id: Date.now() + Math.random(),
                    titre: article.titre || 'Vidéo actualité',
                    type: 'youtube',
                    videoId: videoId,
                    date: article.date || new Date().toISOString().split('T')[0],
                    categorie: categorie,
                    description: article.titre || ''
                });
                existingVideoIds.add(videoId);
                videosAdded++;
            }
        }
    });

    // NOTE: Les projets ne sont PAS collectés automatiquement
    // Leurs médias doivent être ajoutés manuellement par le gestionnaire

    // Mettre à jour l'affichage
    renderPhotos();
    renderVideos();
    showLatestMedia();

    if (photosAdded > 0 || videosAdded > 0) {
        markModified('medias');
        showToast(`✅ Collecte terminée : ${photosAdded} photos, ${videosAdded} vidéos ajoutées`, 'success');
    } else {
        showToast('ℹ️ Aucun nouveau média trouvé', 'info');
    }
}

// Afficher le dernier média ajouté
function showLatestMedia() {
    const allMedia = [];

    // Collecter tous les médias avec leur date
    (data.medias?.photos || []).forEach(p => {
        allMedia.push({ type: 'photo', data: p, date: p.date || '1900-01-01' });
    });
    (data.medias?.videos || []).forEach(v => {
        allMedia.push({ type: 'video', data: v, date: v.date || '1900-01-01' });
    });

    if (allMedia.length === 0) {
        document.getElementById('latest-media-zone').style.display = 'none';
        return;
    }

    // Trier par date décroissante
    allMedia.sort((a, b) => b.date.localeCompare(a.date));
    const latest = allMedia[0];

    const zone = document.getElementById('latest-media-zone');
    const content = document.getElementById('latest-media-content');
    zone.style.display = 'block';

    if (latest.type === 'photo') {
        content.innerHTML = `
            <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                <img src="${latest.data.src}" style="width: 150px; height: 100px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                <div>
                    <div style="font-weight: 600; color: var(--bleu);">📷 ${latest.data.titre}</div>
                    <div style="font-size: 0.85rem; color: #666;">${latest.data.categorie || ''} • ${latest.data.date || ''}</div>
                </div>
            </div>
        `;
    } else if (latest.type === 'video') {
        const thumb = latest.data.thumbnail || (latest.data.type === 'youtube' ? `https://img.youtube.com/vi/${latest.data.videoId}/mqdefault.jpg` : '');
        content.innerHTML = `
            <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                <div style="position: relative; width: 150px; height: 85px; background: #000; border-radius: 8px; overflow: hidden;">
                    <img src="${thumb}" style="width: 100%; height: 100%; object-fit: cover;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255,0,0,0.8); color: white; width: 30px; height: 30px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">▶</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--bleu);">🎬 ${latest.data.titre}</div>
                    <div style="font-size: 0.85rem; color: #666;">${latest.data.type === 'youtube' ? 'YouTube' : 'Facebook'} • ${latest.data.date || ''}</div>
                </div>
            </div>
        `;
    }
}


// ===== PAGE-SECTIONS DATA =====
let pageSectionsData = null;

async function loadPageSections() {
    const token = getToken();
    try {
        const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/page-sections.json?ref=${GITHUB_CONFIG.branch}&t=${Date.now()}`;
        const response = await fetch(url, {
            headers: token ? { 'Authorization': `token ${token}` } : {}
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const apiResponse = await response.json();
        const base64 = apiResponse.content.replace(/\n/g, '');
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const content = new TextDecoder('utf-8').decode(bytes);
        pageSectionsData = JSON.parse(content);
        console.log('✅ page-sections.json chargé');
        renderPageEditor();
        renderPagesTabLegacy();
    } catch(e) {
        console.error('❌ Erreur chargement page-sections.json:', e);
        showToast('❌ Erreur chargement page-sections.json', 'error');
    }
}

// Legacy render stub — no longer needed with visual editor, 
// but kept as a no-op so existing callers don't break
function renderPagesTabLegacy() {
    // Visual editor fields are populated via renderVEFields() instead.
    // pageSectionsData is now the single source of truth.
}

// Save page-sections.json via GitHub API
async function publishPageSections() {
    const token = getToken();
    if (!token) {
        showToast('⚠️ Configurez votre token GitHub', 'warning');
        return;
    }

    // Ensure pageSectionsData exists
    if (!pageSectionsData) pageSectionsData = {};
    
    // Visual editor writes directly to pageSectionsData.pages via updateVEField(),
    // so we also read any current visual editor fields into pageSectionsData
    if (!pageSectionsData.pages) pageSectionsData.pages = {};
    const veFields = document.querySelectorAll('[data-ve-key]');
    if (veFields.length > 0 && currentEditPage) {
        if (!pageSectionsData.pages[currentEditPage]) pageSectionsData.pages[currentEditPage] = {};
        veFields.forEach(field => {
            const key = field.dataset.veKey;
            if (key) pageSectionsData.pages[currentEditPage][key] = field.value;
        });
    }

    const content = JSON.stringify(pageSectionsData, null, 2);
    const saveMsg = document.getElementById('pages-save-msg');
    
    try {
        // Get SHA
        const getResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/page-sections.json?ref=${GITHUB_CONFIG.branch}&_=${Date.now()}`,
            { headers: { 'Authorization': `token ${token}` } }
        );
        let sha = null;
        if (getResponse.ok) {
            sha = (await getResponse.json()).sha;
        }

        const body = {
            message: 'Mise à jour page-sections.json via Admin CMS',
            content: btoa(unescape(encodeURIComponent(content))),
            branch: GITHUB_CONFIG.branch
        };
        if (sha) body.sha = sha;

        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/page-sections.json`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            }
        );

        if (response.ok) {
            showToast('✅ page-sections.json publié !', 'success');
            if (saveMsg) {
                saveMsg.style.display = 'block';
                saveMsg.style.background = '#d4edda';
                saveMsg.style.color = '#155724';
                saveMsg.textContent = '✅ Publié avec succès !';
            }
            
            // Also update HTML pages
            await updateHtmlPages();
        } else {
            const err = await response.json();
            throw new Error(err.message || `Erreur ${response.status}`);
        }
    } catch(err) {
        showToast('❌ Erreur: ' + err.message, 'error');
        if (saveMsg) {
            saveMsg.style.display = 'block';
            saveMsg.style.background = '#f8d7da';
            saveMsg.style.color = '#721c24';
            saveMsg.textContent = '❌ Erreur: ' + err.message;
        }
    }
}

// Update HTML page files with new content from page editor
async function updateHtmlPages() {
    if (!pageSectionsData?.pages) return;
    const token = getToken();
    if (!token) return;
    
    const pageFiles = {
        index: 'index.html',
        bilan: 'bilan.html',
        projet: 'projet.html',
        equipe: 'equipe.html',
        blog: 'blog.html',
        faq: 'faq.html',
        medias: 'medias.html'
    };
    
    // We update pages one by one to avoid conflicts
    for (const [pageName, filename] of Object.entries(pageFiles)) {
        const pageData = pageSectionsData.pages[pageName];
        if (!pageData) continue;
        
        try {
            // Get current file content
            const getResp = await fetch(
                `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filename}?ref=${GITHUB_CONFIG.branch}&_=${Date.now()}`,
                { headers: { 'Authorization': `token ${token}` } }
            );
            if (!getResp.ok) continue;
            
            const fileInfo = await getResp.json();
            const base64 = fileInfo.content.replace(/\n/g, '');
            const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
            let htmlContent = new TextDecoder('utf-8').decode(bytes);
            
            let modified = false;
            
            // Apply replacements based on data-cms-field markers or known patterns
            // For hero titles, we use regex to find and replace in hero sections
            if (pageData.hero_titre) {
                // Replace h1 content in hero sections
                const h1Regex = /(<h1[^>]*class="[^"]*"[^>]*>)(.*?)(<\/h1>)/s;
                const simpleH1 = /(<section[^>]*class="[^"]*hero[^"]*"[^>]*>[\s\S]*?<h1[^>]*>)(.*?)(<\/h1>)/;
                if (simpleH1.test(htmlContent)) {
                    htmlContent = htmlContent.replace(simpleH1, `$1${pageData.hero_titre}$3`);
                    modified = true;
                }
            }
            
            if (modified) {
                const body = {
                    message: `Mise à jour contenu ${filename} via Admin CMS`,
                    content: btoa(unescape(encodeURIComponent(htmlContent))),
                    branch: GITHUB_CONFIG.branch,
                    sha: fileInfo.sha
                };
                
                await fetch(
                    `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filename}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Authorization': `token ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(body)
                    }
                );
                console.log(`✅ ${filename} mis à jour`);
            }
        } catch(e) {
            console.error(`⚠️ Erreur mise à jour ${filename}:`, e);
        }
    }
}

// ===== VISUAL EDITOR =====

const VE_PAGE_FIELDS = {
  index: [
    { key: 'hero_titre', label: 'Titre principal', type: 'text' },
    { key: 'hero_soustitre', label: 'Sous-titre', type: 'text' },
    { key: 'hero_axes', label: 'Axes prioritaires', type: 'textarea' },
    { key: 'hero_appel', label: "Phrase d'appel", type: 'text' },
    { key: 'candidate_nom', label: 'Nom de la candidate', type: 'text' },
    { key: 'candidate_titre', label: 'Titre', type: 'text' },
    { key: 'candidate_role', label: 'Rôle / Mandat', type: 'text' },
    { key: 'slogan', label: 'Slogan', type: 'text' },
    { key: 'citation', label: 'Citation', type: 'textarea' }
  ],
  bilan: [
    { key: 'hero_titre', label: 'Titre hero', type: 'text' }
  ],
  projet: [
    { key: 'hero_titre', label: 'Titre hero', type: 'text' }
  ],
  equipe: [
    { key: 'hero_titre', label: 'Titre hero', type: 'text' },
    { key: 'hero_soustitre', label: 'Sous-titre', type: 'textarea' }
  ],
  blog: [
    { key: 'hero_titre', label: 'Titre hero', type: 'text' }
  ],
  faq: [
    { key: 'hero_titre', label: 'Titre hero', type: 'text' },
    { key: 'hero_soustitre', label: 'Sous-titre', type: 'textarea' }
  ],
  medias: [
    { key: 'hero_titre', label: 'Titre hero', type: 'text' }
  ]
};

const VE_PAGE_LABELS = {
  index: '\ud83c\udfe0 Accueil',
  bilan: '\ud83d\udcca Bilan',
  projet: '\ud83d\ude80 Projet',
  equipe: '\ud83d\udc65 \u00c9quipe',
  blog: '\ud83d\udcf0 Blog',
  faq: '\ud83e\udd1d FAQ',
  medias: '\ud83d\uddbc\ufe0f M\u00e9dias'
};

let currentEditPage = 'index';
let _visualEditorInitialized = false;

function setupVisualEditor() {
  if (_visualEditorInitialized) return;
  _visualEditorInitialized = true;

  // Page selection — event delegation on the list for robustness
  const pageList = document.querySelector('.ve-page-list');
  if (pageList) {
    pageList.addEventListener('click', (e) => {
      const item = e.target.closest('.ve-page-item');
      if (!item) return;
      document.querySelectorAll('.ve-page-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      currentEditPage = item.dataset.page;
      loadPageInEditor(currentEditPage);
    });
  }

  // Device switching — event delegation
  const previewActions = document.querySelector('.ve-preview-actions');
  if (previewActions) {
    previewActions.addEventListener('click', (e) => {
      const btn = e.target.closest('.ve-device-btn');
      if (!btn) return;
      document.querySelectorAll('.ve-device-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const iframe = document.getElementById('ve-iframe');
      if (iframe) iframe.style.maxWidth = btn.dataset.width;
    });
  }

  // Load first page
  loadPageInEditor('index');
}

// Inline onclick fallback — always works even if setupVisualEditor hasn't run
function selectVEPage(el) {
  document.querySelectorAll('.ve-page-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
  currentEditPage = el.dataset.page;
  loadPageInEditor(currentEditPage);
}

function loadPageInEditor(pageName) {
  const iframe = document.getElementById('ve-iframe');
  const titleEl = document.getElementById('ve-current-page');
  
  if (titleEl) titleEl.textContent = VE_PAGE_LABELS[pageName] || pageName;
  if (iframe) iframe.src = pageName === 'index' ? 'index.html' : pageName + '.html';
  
  renderVEFields(pageName);
}

function renderVEFields(pageName) {
  const container = document.getElementById('ve-fields');
  if (!container) return;
  const fields = VE_PAGE_FIELDS[pageName] || [];
  
  // Get current values from pageSectionsData
  const pageData = (pageSectionsData && pageSectionsData.pages && pageSectionsData.pages[pageName]) || {};
  
  let html = '';
  fields.forEach(field => {
    const value = pageData[field.key] || '';
    if (field.type === 'textarea') {
      html += `<div class="ve-field">
        <label>${field.label}</label>
        <textarea data-ve-key="${field.key}" oninput="updateVEField('${pageName}', '${field.key}', this.value)">${value}</textarea>
      </div>`;
    } else {
      html += `<div class="ve-field">
        <label>${field.label}</label>
        <input type="text" data-ve-key="${field.key}" value="${value.replace(/"/g, '&quot;')}" oninput="updateVEField('${pageName}', '${field.key}', this.value)">
      </div>`;
    }
  });
  
  if (fields.length === 0) {
    html = '<p style="color:#999;font-size:0.9rem;">Aucun champ modifiable pour cette page.</p>';
  }
  
  container.innerHTML = html;
}

function updateVEField(pageName, key, value) {
  // Ensure structure exists
  if (!pageSectionsData) pageSectionsData = {};
  if (!pageSectionsData.pages) pageSectionsData.pages = {};
  if (!pageSectionsData.pages[pageName]) pageSectionsData.pages[pageName] = {};
  
  pageSectionsData.pages[pageName][key] = value;
  markModified('pages');
  
  // Live update iframe via postMessage
  try {
    const iframe = document.getElementById('ve-iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'VEM_UPDATE_FIELD',
        page: pageName,
        key: key,
        value: value
      }, '*');
    }
  } catch(e) { /* cross-origin, ignore */ }
}

function refreshPreview() {
  const iframe = document.getElementById('ve-iframe');
  if (iframe) iframe.src = iframe.src;
}

// Kept for backward compatibility — renderPageEditor now triggers the visual editor
function renderPageEditor() {
  // The old page-editor-container no longer exists.
  // Instead refresh the visual editor fields for the current page.
  renderVEFields(currentEditPage);
}

function switchPageEditor(pageName) {
  // Legacy stub — now handled by visual editor sidebar clicks
  loadPageInEditor(pageName);
}

// ===== RICH TEXT TOOLBAR =====
function insertRichText(textareaId, tag) {
    const textarea = document.getElementById(textareaId);
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    
    let insertion = '';
    switch(tag) {
        case 'bold':
            insertion = `<strong>${selected || 'texte en gras'}</strong>`;
            break;
        case 'italic':
            insertion = `<em>${selected || 'texte en italique'}</em>`;
            break;
        case 'link':
            const url = prompt('URL du lien :', 'https://');
            if (url) insertion = `<a href="${url}">${selected || 'texte du lien'}</a>`;
            else return;
            break;
        case 'list':
            insertion = `<ul>\n<li>${selected || 'élément'}</li>\n<li>élément</li>\n</ul>`;
            break;
        case 'h3':
            insertion = `<h3>${selected || 'Titre'}</h3>`;
            break;
    }
    
    textarea.value = textarea.value.substring(0, start) + insertion + textarea.value.substring(end);
    textarea.focus();
    textarea.selectionStart = start;
    textarea.selectionEnd = start + insertion.length;
    
    // Update preview
    updateRichTextPreview(textareaId);
}

function updateRichTextPreview(textareaId) {
    const textarea = document.getElementById(textareaId);
    const preview = document.getElementById(textareaId + '-preview');
    if (textarea && preview) {
        preview.innerHTML = textarea.value || '<em style="color:#888;">Aperçu du contenu...</em>';
    }
}

// ===== IMAGE LIBRARY =====
let imageLibraryCache = [];

async function loadImageLibrary() {
    const token = getToken();
    if (!token) {
        showToast('⚠️ Token requis pour charger la bibliothèque', 'warning');
        return;
    }
    
    const container = document.getElementById('image-library-content');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align:center;padding:2rem;"><div style="font-size:2rem;">⏳</div><p>Chargement des images...</p></div>';
    
    try {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/images?ref=${GITHUB_CONFIG.branch}`,
            { headers: { 'Authorization': `token ${token}` } }
        );
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const files = await response.json();
        
        const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.name));
        imageLibraryCache = imageFiles;
        
        renderImageLibrary(imageFiles);
    } catch(e) {
        container.innerHTML = `<div style="text-align:center;padding:2rem;color:#e74c3c;"><div style="font-size:2rem;">❌</div><p>Erreur: ${e.message}</p></div>`;
    }
}

function renderImageLibrary(images) {
    const container = document.getElementById('image-library-content');
    if (!container) return;
    
    if (images.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:2rem;color:#888;"><div style="font-size:2rem;">📂</div><p>Aucune image trouvée</p></div>';
        return;
    }
    
    const count = document.getElementById('image-library-count');
    if (count) count.textContent = images.length;
    
    container.innerHTML = `<div class="image-library-grid">${images.map(img => `
        <div class="image-library-item">
            <div class="image-actions">
                <button class="btn-copy" onclick="copyImagePath('${img.path}')" title="Copier le chemin">📋</button>
                <button class="btn-delete-img" onclick="deleteImageFromRepo('${img.path}', '${img.sha}')" title="Supprimer">🗑️</button>
            </div>
            <img src="https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${img.path}" 
                 alt="${img.name}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%2250%25%22 x=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2240%22>🖼️</text></svg>'">
            <div class="image-info">
                <div class="image-name" title="${img.name}">${img.name}</div>
                <div class="image-size">${img.size ? (img.size / 1024).toFixed(1) + ' Ko' : ''}</div>
            </div>
        </div>
    `).join('')}</div>`;
}

function copyImagePath(path) {
    navigator.clipboard.writeText(path).then(() => {
        showToast('📋 Chemin copié : ' + path, 'success');
    });
}

async function deleteImageFromRepo(path, sha) {
    if (!confirm(`Supprimer l'image ${path} du dépôt ?\n\nCette action est irréversible !`)) return;
    
    const token = getToken();
    if (!token) return;
    
    try {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Suppression image ${path} via Admin CMS`,
                    sha: sha,
                    branch: GITHUB_CONFIG.branch
                })
            }
        );
        
        if (response.ok) {
            showToast('✅ Image supprimée', 'success');
            loadImageLibrary(); // Refresh
        } else {
            const err = await response.json();
            throw new Error(err.message);
        }
    } catch(e) {
        showToast('❌ Erreur: ' + e.message, 'error');
    }
}

// Drag & drop upload
function setupDropZone() {
    const dropZone = document.getElementById('image-drop-zone');
    if (!dropZone) return;
    
    ['dragenter', 'dragover'].forEach(event => {
        dropZone.addEventListener(event, (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
    });
    
    ['dragleave', 'drop'].forEach(event => {
        dropZone.addEventListener(event, (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
        });
    });
    
    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        handleImageUpload(files);
    });
    
    dropZone.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*';
        input.onchange = (e) => handleImageUpload(e.target.files);
        input.click();
    });
}

async function handleImageUpload(files) {
    const token = getToken();
    if (!token) {
        showToast('⚠️ Token requis pour l\'upload', 'warning');
        return;
    }
    
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
        showToast('⚠️ Aucune image sélectionnée', 'warning');
        return;
    }
    
    showToast(`⏳ Upload de ${imageFiles.length} image(s)...`, 'info');
    
    let uploaded = 0;
    for (const file of imageFiles) {
        try {
            // Read file as base64
            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            
            const path = `images/${file.name}`;
            
            // Check if file exists
            let sha = null;
            try {
                const getResp = await fetch(
                    `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}?ref=${GITHUB_CONFIG.branch}`,
                    { headers: { 'Authorization': `token ${token}` } }
                );
                if (getResp.ok) sha = (await getResp.json()).sha;
            } catch(e) {}
            
            const body = {
                message: `Upload image ${file.name} via Admin CMS`,
                content: base64,
                branch: GITHUB_CONFIG.branch
            };
            if (sha) body.sha = sha;
            
            const response = await fetch(
                `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                }
            );
            
            if (response.ok) uploaded++;
        } catch(e) {
            console.error(`Erreur upload ${file.name}:`, e);
        }
    }
    
    showToast(`✅ ${uploaded}/${imageFiles.length} image(s) uploadée(s)`, uploaded > 0 ? 'success' : 'error');
    if (uploaded > 0) loadImageLibrary();
}

// ===== GITHUB CONNECTION CHECK =====
async function checkGitHubConnection() {
    const dot = document.getElementById('github-status-dot');
    if (!dot) return;
    
    const token = getToken();
    if (!token) {
        dot.className = 'github-status-dot disconnected';
        dot.title = 'Pas de token GitHub';
        return;
    }
    
    dot.className = 'github-status-dot checking';
    dot.title = 'Vérification...';
    
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: { 'Authorization': `token ${token}` }
        });
        
        if (response.ok) {
            const user = await response.json();
            dot.className = 'github-status-dot connected';
            dot.title = `Connecté: ${user.login}`;
        } else {
            dot.className = 'github-status-dot disconnected';
            dot.title = 'Token invalide';
        }
    } catch(e) {
        dot.className = 'github-status-dot disconnected';
        dot.title = 'Erreur connexion';
    }
}

// ===== AUTO-SAVE DRAFT (GLOBAL) =====
const GLOBAL_DRAFT_KEY = 'vizille_admin_global_draft';
let globalAutoSaveInterval = null;

function startGlobalAutoSave() {
    if (globalAutoSaveInterval) clearInterval(globalAutoSaveInterval);
    
    globalAutoSaveInterval = setInterval(() => {
        saveGlobalDraft();
    }, 30000); // Every 30 seconds
}

function saveGlobalDraft() {
    try {
        const draft = {
            timestamp: Date.now(),
            data: JSON.parse(JSON.stringify(data)),
            pageSections: pageSectionsData ? JSON.parse(JSON.stringify(pageSectionsData)) : null
        };
        
        // Only save if there's actual data
        if (data.projets.length > 0 || data.articles.length > 0) {
            localStorage.setItem(GLOBAL_DRAFT_KEY, JSON.stringify(draft));
            
            const indicator = document.getElementById('autosave-indicator');
            if (indicator) {
                indicator.className = 'autosave-indicator saved';
                indicator.innerHTML = '💾 Brouillon sauvé ' + new Date().toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'});
                setTimeout(() => {
                    indicator.className = 'autosave-indicator';
                }, 3000);
            }
        }
    } catch(e) {
        console.warn('Auto-save échoué:', e);
    }
}

function loadGlobalDraft() {
    try {
        const raw = localStorage.getItem(GLOBAL_DRAFT_KEY);
        if (!raw) return null;
        const draft = JSON.parse(raw);
        // Ignore drafts older than 24h
        if (draft.timestamp && (Date.now() - draft.timestamp) > 24 * 60 * 60 * 1000) {
            localStorage.removeItem(GLOBAL_DRAFT_KEY);
            return null;
        }
        return draft;
    } catch(e) { return null; }
}

// ===== PUBLISH ALL =====
async function publishAll() {
    const modifiedSections = getModifiedSections();
    if (modifiedSections.length === 0) {
        showToast('ℹ️ Aucune section modifiée', 'info');
        return;
    }
    
    const btn = document.getElementById('btn-publish-all');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '⏳ Publication en cours...';
    }
    
    showToast(`⏳ Publication de ${modifiedSections.length} section(s)...`, 'info');
    
    let success = 0;
    for (const section of modifiedSections) {
        try {
            await publish(section);
            success++;
            // Wait a bit between publishes to avoid conflicts
            await new Promise(r => setTimeout(r, 1500));
        } catch(e) {
            console.error(`Erreur publication ${section}:`, e);
        }
    }
    
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '🚀 Tout publier';
    }
    
    showToast(`✅ ${success}/${modifiedSections.length} section(s) publiée(s)`, success > 0 ? 'success' : 'error');
    updateDashboardImproved();
}

function getModifiedSections() {
    const sections = ['projets', 'themes', 'actions', 'candidats', 'faq', 'articles', 'abonnes', 'config', 'medias'];
    return sections.filter(s => {
        const statusEl = document.getElementById('status-' + s);
        return statusEl && statusEl.classList.contains('modified');
    });
}

// ===== KEYBOARD SHORTCUTS =====
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+S = Save draft
        if ((e.ctrlKey || e.metaKey) && e.key === 's' && !e.shiftKey) {
            e.preventDefault();
            saveGlobalDraft();
            showToast('💾 Brouillon sauvé', 'success');
        }
        
        // Ctrl+Shift+P = Publish active section
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
            e.preventDefault();
            publishActiveSection();
        }
    });
}

function publishActiveSection() {
    const activeTab = document.querySelector('.nav-tab.active');
    if (!activeTab) return;
    
    const tabName = activeTab.dataset.tab;
    const sectionMap = {
        projets: 'projets',
        themes: 'themes',
        actions: 'actions',
        candidats: 'candidats',
        faq: 'faq',
        articles: 'articles',
        communication: 'abonnes',
        config: 'config',
        medias: 'medias',
        pages: 'pageSections'
    };
    
    const section = sectionMap[tabName];
    if (section === 'pageSections') {
        publishPageSections();
    } else if (section) {
        publish(section);
    } else {
        showToast('ℹ️ Pas de publication pour cet onglet', 'info');
    }
}

// ===== IMPROVED DASHBOARD =====
async function updateDashboardImproved() {
    // Basic counters (extend existing updateDashboard)
    updateDashboard();
    
    const el = (id) => document.getElementById(id);
    
    // FAQ count
    if (el('stat-faq')) el('stat-faq').textContent = data.faq.length;
    
    // Status breakdowns for projets
    if (el('dashboard-projets-status')) {
        const projStats = {};
        data.projets.forEach(p => {
            const s = p.statut || 'Non défini';
            projStats[s] = (projStats[s] || 0) + 1;
        });
        
        const statusColors = {
            'Réalisé': '#27ae60', 'En cours': '#f39c12', 'Programmé': '#3498db',
            'À l\'étude': '#9b59b6', 'Non défini': '#95a5a6'
        };
        
        el('dashboard-projets-status').innerHTML = Object.entries(projStats).map(([status, count]) => 
            `<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem;">
                <span style="width:10px;height:10px;border-radius:50%;background:${statusColors[status] || '#95a5a6'};display:inline-block;"></span>
                <span style="font-size:0.85rem;">${status}: <strong>${count}</strong></span>
            </div>`
        ).join('');
    }
    
    // Status breakdown for actions
    if (el('dashboard-actions-breakdown')) {
        const actStats = {};
        data.actions.forEach(a => {
            const s = a.statut || 'Non défini';
            actStats[s] = (actStats[s] || 0) + 1;
        });
        
        el('dashboard-actions-breakdown').innerHTML = Object.entries(actStats).map(([status, count]) => {
            const pct = data.actions.length > 0 ? (count / data.actions.length * 100).toFixed(1) : 0;
            return `<div style="font-size:0.85rem;margin-bottom:0.25rem;">${status}: <strong>${count}</strong> (${pct}%)</div>`;
        }).join('');
    }
    
    // Last publish date
    if (el('last-publish-date')) {
        try {
            const token = getToken();
            if (token) {
                const resp = await fetch(
                    `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/commits?sha=${GITHUB_CONFIG.branch}&per_page=1`,
                    { headers: { 'Authorization': `token ${token}` } }
                );
                if (resp.ok) {
                    const commits = await resp.json();
                    if (commits.length > 0) {
                        const date = new Date(commits[0].commit.author.date);
                        el('last-publish-date').innerHTML = `🕐 Dernière publication : <strong>${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</strong>`;
                    }
                }
            }
        } catch(e) { /* ignore */ }
    }
    
    // Modified sections list
    if (el('modified-sections-container')) {
        const modified = getModifiedSections();
        if (modified.length > 0) {
            el('modified-sections-container').innerHTML = 
                '<strong style="color:var(--orange);display:block;margin-bottom:0.5rem;">⚠️ Sections modifiées non publiées :</strong>' +
                '<div class="modified-sections-list">' +
                modified.map(s => `<span class="modified-badge">${s}</span>`).join('') +
                '</div>' +
                '<button class="btn-publish-all" onclick="publishAll()" style="margin-top:0.5rem;">🚀 Tout publier</button>';
        } else {
            el('modified-sections-container').innerHTML = '<div style="color:var(--vert);font-size:0.9rem;">✅ Toutes les sections sont à jour</div>';
        }
    }
}

// ===== ENHANCED INITIALIZATION =====
let _newFeaturesInitialized = false;
function initNewFeatures() {
    if (_newFeaturesInitialized) {
        // Only re-run dashboard updates on subsequent calls
        updateDashboardImproved();
        return;
    }
    _newFeaturesInitialized = true;
    
    // Check GitHub connection
    checkGitHubConnection();
    
    // Load page sections
    loadPageSections();
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Start auto-save
    startGlobalAutoSave();
    
    // Setup image drop zone
    setTimeout(setupDropZone, 500);
    
    // Visual editor publish button is wired via onclick in HTML.
    // Setup visual editor if Pages tab is already active (unlikely but safe)
    if (document.getElementById('tab-pages')?.classList.contains('active')) {
        setupVisualEditor();
    }
    
    // Check connection when token changes
    const tokenInput = document.getElementById('github-token');
    if (tokenInput) {
        const originalOnchange = tokenInput.onchange;
        tokenInput.onchange = function() {
            if (originalOnchange) originalOnchange.call(this);
            setTimeout(checkGitHubConnection, 500);
        };
    }
}

// Note: initNewFeatures() is called from renderAll() which runs after loadAllData() completes

// ===== MEDIA SUBTABS =====
function switchMediaSubTab(tab) {
    document.querySelectorAll('.media-sub-tab').forEach(t => t.classList.toggle('active', t.dataset.subtab === tab));
    document.querySelectorAll('.media-sub-content').forEach(c => c.style.display = c.id === 'media-sub-' + tab ? 'block' : 'none');
    
    if (tab === 'library') {
        loadImageLibrary();
    }
}
