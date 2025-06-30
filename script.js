document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const menuBtn = document.getElementById('menu-btn');
    const menu = document.getElementById('menu');
    const createNoteBtn = document.getElementById('create-note-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const settings = document.getElementById('settings');
    const feedback = document.getElementById('feedback');
    const help = document.getElementById('help');

    // Gestion du menu
    menuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        menu.classList.toggle('hidden');
    });

    // Fermer le menu en cliquant à l'extérieur
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && e.target !== menuBtn) {
            menu.classList.add('hidden');
        }
    });

    // Gestion du thème
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-theme');
        body.classList.toggle('dark-theme');
        themeToggle.textContent = body.classList.contains('dark-theme') ? 'Thème clair' : 'Thème sombre';
    });

    // Créer une note
    createNoteBtn.addEventListener('click', () => {
        const title = prompt('Entrez le titre de la note :');
        const content = prompt('Entrez le contenu de la note :');
        if (title || content) {
            const noteGrid = document.getElementById('notes-grid');
            const note = document.createElement('div');
            note.classList.add('note', 'bg-white', 'p-4', 'rounded-lg', 'shadow');
            note.innerHTML = `<h3 class="font-bold">${title || 'Sans titre'}</h3><p>${content || ''}</p>`;
            noteGrid.appendChild(note);
        }
    });

    // Actualiser
    refreshBtn.addEventListener('click', () => {
        alert('Notes actualisées !');
    });

    // Actions du menu
    settings.addEventListener('click', () => alert('Paramètres ouverts !'));
    feedback.addEventListener('click', () => alert('Envoyer un avis !'));
    help.addEventListener('click', () => alert('Aide ouverte !'));
});