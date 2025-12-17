// ===== VIZILLE EN MOUVEMENT - APP.JS =====
// Tableau de bord interactif des actions municipales

// État global
let allData = [];
let filteredData = [];
let currentView = 'themes';
let sortColumn = 'annee';
let sortDirection = 'desc';

// Configuration des thèmes
const themeConfig = {
    "Santé": { icon: "🏥", color: "#e91e63" },
    "Urbanisme": { icon: "🏘️", color: "#34495e" },
    "Environnement": { icon: "🌿", color: "#27ae60" },
    "Culture": { icon: "🎭", color: "#9b59b6" },
    "Patrimoine": { icon: "🏛️", color: "#8e44ad" },
    "Enfance": { icon: "👶", color: "#3498db" },
    "Solidarité": { icon: "🤝", color: "#e74c3c" },
    "Sport": { icon: "⚽", color: "#2ecc71" },
    "Économie": { icon: "💼", color: "#f39c12" },
    "Mobilités": { icon: "🚴", color: "#1abc9c" },
    "Sécurité": { icon: "🛡️", color: "#2c3e50" },
    "Travaux": { icon: "🏗️", color: "#e67e22" },
    "Intercommunalité": { icon: "🤝", color: "#607d8b" },
    "Finance": { icon: "💰", color: "#795548" },
    "Personnel": { icon: "👥", color: "#9e9e9e" }
};

// Instances de graphiques
let chartThemes, chartAnnees, chartStatuts;

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', init);

async function init() {
    try {
        await loadData();
        setupFilters();
        setupEventListeners();
        renderCharts();
        applyFilters();
        hideLoading();
    } catch (error) {
        console.error('Erreur initialisation:', error);
        showError();
    }
}

// ===== CHARGEMENT DES DONNÉES =====
async function loadData() {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('Impossible de charger les données');
    allData = await response.json();
    filteredData = [...allData];
    updateStats();
}

// ===== MISE À JOUR DES STATISTIQUES =====
function updateStats() {
    const total = allData.length;
    const realises = allData.filter(d => d.statut === 'Réalisé').length;
    const encours = allData.filter(d => d.statut === 'En cours').length;
    const budget = allData.reduce((sum, d) => sum + (d.budget || 0), 0);
    
    animateNumber('stat-total', total);
    animateNumber('stat-realises', realises);
    animateNumber('stat-encours', encours);
    document.getElementById('stat-budget').textContent = formatBudget(budget);
}

function animateNumber(elementId, target) {
    const el = document.getElementById(elementId);
    const duration = 1000;
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (target - start) * easeOut);
        el.textContent = current.toLocaleString('fr-FR');
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function formatBudget(amount) {
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1).replace('.', ',') + ' M€';
    } else if (amount >= 1000) {
        return Math.round(amount / 1000) + ' k€';
    } else if (amount > 0) {
        return amount.toLocaleString('fr-FR') + ' €';
    }
    return '—';
}

// ===== CONFIGURATION DES FILTRES =====
function setupFilters() {
    // Thèmes - Créer les boutons visuels
    const themes = [...new Set(allData.map(d => d.theme))].sort();
    const themeSelect = document.getElementById('filter-theme');
    const themeGrid = document.getElementById('theme-filters-grid');
    
    // Bouton "Tous les thèmes"
    const allBtn = document.createElement('button');
    allBtn.className = 'theme-filter-btn active';
    allBtn.dataset.theme = '';
    allBtn.innerHTML = `
        <span class="icon">🏷️</span>
        <span class="label">Tous</span>
    `;
    allBtn.addEventListener('click', () => selectThemeButton(''));
    themeGrid.appendChild(allBtn);
    
    themes.forEach(theme => {
        const config = themeConfig[theme] || { icon: '📋' };
        
        // Option pour le select caché (compatibilité)
        const option = document.createElement('option');
        option.value = theme;
        option.textContent = `${config.icon} ${theme}`;
        themeSelect.appendChild(option);
        
        // Bouton visuel
        const btn = document.createElement('button');
        btn.className = 'theme-filter-btn';
        btn.dataset.theme = theme;
        btn.innerHTML = `
            <span class="icon">${config.icon}</span>
            <span class="label">${theme}</span>
        `;
        btn.addEventListener('click', () => selectThemeButton(theme));
        themeGrid.appendChild(btn);
    });
    
    // Années
    const annees = [...new Set(allData.map(d => d.annee).filter(a => a))].sort();
    const anneeSelect = document.getElementById('filter-annee');
    annees.forEach(annee => {
        const option = document.createElement('option');
        option.value = annee;
        option.textContent = annee;
        anneeSelect.appendChild(option);
    });
}

// Fonction pour sélectionner un bouton de thème
function selectThemeButton(theme) {
    // Mettre à jour l'état actif des boutons
    document.querySelectorAll('.theme-filter-btn').forEach(btn => {
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Synchroniser avec le select caché
    document.getElementById('filter-theme').value = theme;
    
    // Appliquer les filtres
    applyFilters();
    
    // Afficher/masquer la barre thématique
    if (theme && window.showThemeNav) {
        window.showThemeNav(theme);
    } else if (window.hideThemeNav) {
        window.hideThemeNav();
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Filtres
    document.getElementById('filter-search').addEventListener('input', debounce(applyFilters, 300));
    document.getElementById('filter-theme').addEventListener('change', applyFilters);
    document.getElementById('filter-statut').addEventListener('change', applyFilters);
    document.getElementById('filter-annee').addEventListener('change', applyFilters);
    document.getElementById('btn-reset').addEventListener('click', resetFilters);
    
    // Vue toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            renderCurrentView();
        });
    });
    
    // Tri tableau
    document.querySelectorAll('.data-table th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.sort;
            if (sortColumn === column) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortColumn = column;
                sortDirection = 'asc';
            }
            renderCurrentView();
        });
    });
}

function debounce(fn, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}

// ===== FILTRAGE =====
function applyFilters() {
    const search = document.getElementById('filter-search').value.toLowerCase();
    const theme = document.getElementById('filter-theme').value;
    const statut = document.getElementById('filter-statut').value;
    const annee = document.getElementById('filter-annee').value;
    
    filteredData = allData.filter(item => {
        if (search) {
            const searchLower = search.toLowerCase();
            const inTitre = item.titre && item.titre.toLowerCase().includes(searchLower);
            const inResume = item.resume && item.resume.toLowerCase().includes(searchLower);
            const inDetails = item.details && item.details.toLowerCase().includes(searchLower);
            const inTheme = item.theme && item.theme.toLowerCase().includes(searchLower);
            const inDescription = item.description && item.description.toLowerCase().includes(searchLower);
            if (!inTitre && !inResume && !inDetails && !inTheme && !inDescription) return false;
        }
        if (theme && item.theme !== theme) return false;
        if (statut && item.statut !== statut) return false;
        if (annee && item.annee !== annee) return false;
        return true;
    });
    
    document.getElementById('results-count').textContent = filteredData.length;
    renderCurrentView();
}

function resetFilters() {
    document.getElementById('filter-search').value = '';
    document.getElementById('filter-theme').value = '';
    document.getElementById('filter-statut').value = '';
    document.getElementById('filter-annee').value = '';
    
    // Réinitialiser les boutons de thèmes
    document.querySelectorAll('.theme-filter-btn').forEach(btn => {
        if (btn.dataset.theme === '') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    applyFilters();
}

// ===== RENDU DES VUES =====
function renderCurrentView() {
    document.getElementById('view-themes').classList.add('hidden');
    document.getElementById('view-cards').classList.add('hidden');
    document.getElementById('view-table').classList.add('hidden');
    document.getElementById('empty-state').classList.add('hidden');
    
    if (filteredData.length === 0) {
        document.getElementById('empty-state').classList.remove('hidden');
        return;
    }
    
    switch (currentView) {
        case 'themes':
            renderThemesView();
            break;
        case 'cards':
            renderCardsView();
            break;
        case 'table':
            renderTableView();
            break;
    }
}

// Vue Thèmes
function renderThemesView() {
    const container = document.getElementById('view-themes');
    container.innerHTML = '';
    container.classList.remove('hidden');
    
    // Grouper par thème
    const themes = {};
    filteredData.forEach(item => {
        if (!themes[item.theme]) {
            themes[item.theme] = { items: [], budget: 0, realises: 0, encours: 0, projets: 0 };
        }
        themes[item.theme].items.push(item);
        themes[item.theme].budget += item.budget || 0;
        if (item.statut === 'Réalisé') themes[item.theme].realises++;
        else if (item.statut === 'En cours') themes[item.theme].encours++;
        else themes[item.theme].projets++;
    });
    
    // Trier par nombre d'actions
    const sortedThemes = Object.entries(themes).sort((a, b) => b[1].items.length - a[1].items.length);
    
    sortedThemes.forEach(([themeName, data], index) => {
        const config = themeConfig[themeName] || { icon: '📋', color: '#607d8b' };
        const card = document.createElement('div');
        card.className = 'theme-card';
        card.style.animationDelay = `${index * 0.05}s`;
        card.innerHTML = `
            <div class="theme-header" style="background: ${config.color}">
                <span class="theme-icon">${config.icon}</span>
                <div class="theme-info">
                    <h3>${themeName}</h3>
                    <span class="count">${data.items.length} action${data.items.length > 1 ? 's' : ''}</span>
                </div>
            </div>
            <div class="theme-stats">
                <span class="theme-budget">${formatBudget(data.budget)}</span>
                <div class="theme-progress">
                    ${data.realises > 0 ? `<span class="progress-dot realise" title="${data.realises} réalisé(s)"></span>` : ''}
                    ${data.encours > 0 ? `<span class="progress-dot encours" title="${data.encours} en cours"></span>` : ''}
                    ${data.projets > 0 ? `<span class="progress-dot projet" title="${data.projets} projet(s)"></span>` : ''}
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            document.getElementById('filter-theme').value = themeName;
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('.view-btn[data-view="cards"]').classList.add('active');
            currentView = 'cards';
            applyFilters();
            // Afficher la barre thématique
            if (window.showThemeNav) {
                window.showThemeNav(themeName);
            }
            // Scroll vers le contenu
            setTimeout(() => {
                document.querySelector('.main-content').scrollIntoView({ behavior: 'smooth' });
            }, 100);
        });
        
        container.appendChild(card);
    });
}

// Vue Cartes
function renderCardsView() {
    const container = document.getElementById('view-cards');
    container.innerHTML = '';
    container.classList.remove('hidden');
    
    // Trier
    const sorted = [...filteredData].sort((a, b) => {
        let valA = a[sortColumn] || '';
        let valB = b[sortColumn] || '';
        if (sortColumn === 'budget') {
            valA = a.budget || 0;
            valB = b.budget || 0;
        }
        if (sortColumn === 'importance') {
            valA = a.importance || 1;
            valB = b.importance || 1;
        }
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    sorted.forEach((item, index) => {
        const config = themeConfig[item.theme] || { icon: '📋', color: '#607d8b' };
        const statutClass = getStatutClass(item.statut);
        const hasDetails = item.importance > 1 || (item.chiffres && item.chiffres.length > 1);
        
        const card = document.createElement('div');
        card.className = 'action-card' + (hasDetails ? ' has-details' : '');
        card.style.animationDelay = `${Math.min(index * 0.03, 0.5)}s`;
        card.dataset.projectId = item.id;
        
        card.innerHTML = `
            <div class="card-header">
                <span class="card-theme" style="background: ${config.color}">
                    ${config.icon} ${item.theme}
                </span>
                <span class="card-statut ${statutClass}">${item.statut}</span>
            </div>
            <div class="card-body">
                <h3 class="card-title">${item.titre}</h3>
                <p class="card-description">${item.description || ''}</p>
                <div class="card-footer">
                    <span class="card-budget">${formatBudget(item.budget)}</span>
                    <span class="card-year">${formatYear(item)}</span>
                </div>
                ${hasDetails ? '<div class="card-detail-hint">Cliquez pour les détails →</div>' : ''}
            </div>
        `;
        
        card.addEventListener('click', () => openProjectModal(item.id));
        
        container.appendChild(card);
    });
}

// Vue Tableau
function renderTableView() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';
    document.getElementById('view-table').classList.remove('hidden');
    
    // Trier
    const sorted = [...filteredData].sort((a, b) => {
        let valA = a[sortColumn] || '';
        let valB = b[sortColumn] || '';
        if (sortColumn === 'budget') {
            valA = a.budget || 0;
            valB = b.budget || 0;
        }
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    sorted.forEach(item => {
        const config = themeConfig[item.theme] || { icon: '📋', color: '#607d8b' };
        const statutClass = getStatutClass(item.statut);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <span class="table-theme">
                    <span style="color: ${config.color}">${config.icon}</span>
                    ${item.theme}
                </span>
            </td>
            <td>
                <strong>${item.titre}</strong>
                ${item.description ? `<br><small style="color: #888">${item.description}</small>` : ''}
            </td>
            <td><span class="table-statut ${statutClass}">${item.statut}</span></td>
            <td>${formatYear(item)}</td>
            <td style="font-weight: 600; color: var(--or)">${formatBudget(item.budget)}</td>
        `;
        tbody.appendChild(row);
    });
}

function getStatutClass(statut) {
    switch (statut) {
        case 'Réalisé': return 'statut-realise';
        case 'En cours': return 'statut-encours';
        case 'Décidé': return 'statut-decide';
        case 'Programmé': return 'statut-programme';
        default: return '';
    }
}

function formatYear(item) {
    if (item.annee && item.annee_fin && item.annee !== item.annee_fin) {
        return `${item.annee} → ${item.annee_fin}`;
    }
    return item.annee || '—';
}

// ===== GRAPHIQUES =====
function renderCharts() {
    renderThemesChart();
    renderAnneesChart();
    renderStatutsChart();
}

function renderThemesChart() {
    const ctx = document.getElementById('chart-themes').getContext('2d');
    
    // Agréger par thème
    const themesData = {};
    allData.forEach(item => {
        if (!themesData[item.theme]) themesData[item.theme] = 0;
        themesData[item.theme]++;
    });
    
    const sorted = Object.entries(themesData).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const labels = sorted.map(([theme]) => theme);
    const data = sorted.map(([, count]) => count);
    const colors = labels.map(theme => themeConfig[theme]?.color || '#607d8b');
    
    chartThemes = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 12,
                        usePointStyle: true,
                        font: { size: 11 }
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const themeName = labels[index];
                    // Filtrer par ce thème
                    document.getElementById('filter-theme').value = themeName;
                    applyFilters();
                    // Basculer vers la vue cartes
                    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                    document.querySelector('.view-btn[data-view="cards"]').classList.add('active');
                    currentView = 'cards';
                    renderCurrentView();
                    // Scroller vers les résultats
                    document.getElementById('view-cards').scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    });
}

function renderAnneesChart() {
    const ctx = document.getElementById('chart-annees').getContext('2d');
    
    // Agréger par année
    const anneesData = {};
    allData.forEach(item => {
        if (item.annee) {
            if (!anneesData[item.annee]) anneesData[item.annee] = { count: 0, budget: 0 };
            anneesData[item.annee].count++;
            anneesData[item.annee].budget += item.budget || 0;
        }
    });
    
    const years = Object.keys(anneesData).sort();
    const counts = years.map(y => anneesData[y].count);
    const budgets = years.map(y => anneesData[y].budget / 1000000);
    
    chartAnnees = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Actions',
                    data: counts,
                    backgroundColor: 'rgba(26, 58, 92, 0.8)',
                    borderRadius: 6,
                    yAxisID: 'y'
                },
                {
                    label: 'Budget (M€)',
                    data: budgets,
                    type: 'line',
                    borderColor: '#c9a227',
                    backgroundColor: 'rgba(201, 162, 39, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: { usePointStyle: true }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    title: { display: true, text: 'Actions' }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    title: { display: true, text: 'Budget (M€)' },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

function renderStatutsChart() {
    const ctx = document.getElementById('chart-statuts').getContext('2d');
    
    const statuts = {
        'Réalisé': { count: 0, color: '#27ae60' },
        'En cours': { count: 0, color: '#f39c12' },
        'Décidé': { count: 0, color: '#3498db' },
        'Programmé': { count: 0, color: '#9b59b6' }
    };
    
    allData.forEach(item => {
        if (statuts[item.statut]) {
            statuts[item.statut].count++;
        }
    });
    
    const labels = Object.keys(statuts);
    const data = labels.map(s => statuts[s].count);
    const colors = labels.map(s => statuts[s].color);
    
    chartStatuts = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.map(c => c + '99'),
                borderColor: colors,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 12,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// ===== UTILITAIRES =====
function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showError() {
    document.getElementById('loading').innerHTML = '❌ Erreur de chargement des données';
}

// ===== MODAL DÉTAIL PROJET =====
let currentProjectIndex = 0;

function openProjectModal(projectId) {
    const project = filteredData.find(p => p.id === projectId);
    if (!project) return;
    
    currentProjectIndex = filteredData.findIndex(p => p.id === projectId);
    
    const config = themeConfig[project.theme] || { icon: '📋', color: '#607d8b' };
    const modal = document.getElementById('modal-overlay');
    const header = document.getElementById('modal-header');
    
    // Header
    header.style.background = `linear-gradient(135deg, ${config.color} 0%, ${adjustColor(config.color, -20)} 100%)`;
    document.getElementById('modal-icon').textContent = config.icon;
    document.getElementById('modal-theme').textContent = project.theme;
    document.getElementById('modal-title').textContent = project.titre;
    document.getElementById('modal-statut').textContent = project.statut;
    document.getElementById('modal-statut').className = 'modal-statut ' + getStatutClass(project.statut);
    
    // Résumé
    document.getElementById('modal-description').textContent = project.resume || project.description || 'Pas de description disponible.';
    
    // Chiffres clés
    const chiffresSection = document.getElementById('section-chiffres');
    const chiffresContainer = document.getElementById('modal-chiffres');
    if (project.chiffres && project.chiffres.length > 0) {
        chiffresSection.classList.remove('hidden');
        chiffresContainer.innerHTML = project.chiffres.map(c => `
            <div class="chiffre-item">
                <div class="chiffre-value">${c.valeur}</div>
                <div class="chiffre-label">${c.label}</div>
            </div>
        `).join('');
    } else {
        chiffresSection.classList.add('hidden');
    }
    
    // Chronologie
    const chronoSection = document.getElementById('section-chronologie');
    const timelineContainer = document.getElementById('modal-timeline');
    if (project.chronologie && project.chronologie.length > 0) {
        chronoSection.classList.remove('hidden');
        timelineContainer.innerHTML = project.chronologie.map(c => `
            <div class="timeline-item">
                <div class="timeline-date">${c.date}</div>
                <div class="timeline-event">${c.evenement}</div>
            </div>
        `).join('');
    } else {
        chronoSection.classList.add('hidden');
    }
    
    // Détails
    const detailsSection = document.getElementById('section-details');
    const detailsContainer = document.getElementById('modal-details');
    if (project.details) {
        detailsSection.classList.remove('hidden');
        detailsContainer.innerHTML = `<p>${project.details}</p>`;
    } else {
        detailsSection.classList.add('hidden');
    }
    
    // Sources
    const sourcesContainer = document.getElementById('modal-sources');
    let sourcesHTML = '';
    
    // Afficher les sources textuelles
    if (project.sources && project.sources.length > 0) {
        sourcesHTML += project.sources.map(s => {
            const icon = s.type === 'delib' ? '📋' : s.type === 'magazine' ? '📰' : '📄';
            return `
                <div class="source-item">
                    <span class="source-icon">${icon}</span>
                    <span><strong>${s.ref}</strong>${s.desc ? ' - ' + s.desc : ''}</span>
                </div>
            `;
        }).join('');
    }
    
    // Afficher les liens sources cliquables
    if (project.lien_source && project.lien_source.length > 0) {
        sourcesHTML += '<div class="source-links">';
        sourcesHTML += project.lien_source.map(ls => {
            const icon = ls.type === 'Délibération' ? '📋' : 
                        ls.type === 'Magazine' || ls.type === 'Magazine PDF' ? '📰' : 
                        ls.type === 'Page dédiée' ? '🔗' : '📄';
            return `
                <a href="${ls.url}" target="_blank" rel="noopener" class="source-link">
                    <span class="source-icon">${icon}</span>
                    <span>${ls.label}</span>
                    <span class="external-icon">↗</span>
                </a>
            `;
        }).join('');
        sourcesHTML += '</div>';
    }
    
    if (!sourcesHTML) {
        sourcesHTML = '<div class="source-item"><span class="source-icon">📄</span><span>Documentation municipale</span></div>';
    }
    
    sourcesContainer.innerHTML = sourcesHTML;
    
    // Navigation
    updateModalNavigation();
    
    // Afficher
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    document.body.style.overflow = '';
}

function navigateProject(direction) {
    currentProjectIndex += direction;
    if (currentProjectIndex < 0) currentProjectIndex = filteredData.length - 1;
    if (currentProjectIndex >= filteredData.length) currentProjectIndex = 0;
    openProjectModal(filteredData[currentProjectIndex].id);
}

function updateModalNavigation() {
    const prevBtn = document.getElementById('btn-prev-projet');
    const nextBtn = document.getElementById('btn-next-projet');
    prevBtn.disabled = filteredData.length <= 1;
    nextBtn.disabled = filteredData.length <= 1;
}

function adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Event listeners pour la modal
document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) closeProjectModal();
});
document.getElementById('modal-close').addEventListener('click', closeProjectModal);
document.getElementById('btn-prev-projet').addEventListener('click', () => navigateProject(-1));
document.getElementById('btn-next-projet').addEventListener('click', () => navigateProject(1));
document.addEventListener('keydown', (e) => {
    if (!document.getElementById('modal-overlay').classList.contains('active')) return;
    if (e.key === 'Escape') closeProjectModal();
    if (e.key === 'ArrowLeft') navigateProject(-1);
    if (e.key === 'ArrowRight') navigateProject(1);
});
