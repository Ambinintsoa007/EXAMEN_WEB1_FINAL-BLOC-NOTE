const editor = document.getElementById("editor");
const textColorInput = document.getElementById("textColor");
const bgColorInput = document.getElementById("bgColor");
const menuBtn = document.getElementById("menuBtn");
const contextMenu = document.getElementById("contextMenu");
const bgColorBtn = document.getElementById("bgColorBtn");
const templatesMenu = document.getElementById("templatesMenu");
const bgColorsMenu = document.getElementById("bgColorsMenu");
const titleInput = document.querySelector('.title');
const fileInput = document.getElementById('fileInput');
const saveStatus = document.getElementById('saveStatus');
const categorySelect = document.getElementById('categorySelect');
const favoriteBtn = document.getElementById('favoriteBtn');

// Variables pour la gestion des notes
let currentNoteId = null;
let isFavorite = false;

// Vérifier si on édite une note existante
function checkExistingNote() {
    const urlParams = new URLSearchParams(window.location.search);
    const noteId = urlParams.get('id');
    
    if (noteId) {
        currentNoteId = parseInt(noteId);
        loadExistingNote(currentNoteId);
    }
}

// Charger une note existante
function loadExistingNote(noteId) {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const note = notes.find(n => n.id === noteId);
    
    if (note) {
        titleInput.value = note.title;
        editor.innerHTML = note.content;
        categorySelect.value = note.category;
        isFavorite = note.isFavorite;
        updateFavoriteButton();
        togglePlaceholder();
    }
}

// Sauvegarder la note
function saveNote() {
    const title = titleInput.value.trim() || 'Note sans titre';
    const content = editor.innerHTML;
    const category = categorySelect.value;
    
    if (!title && !content.trim()) {
        alert('Veuillez ajouter un titre ou du contenu à votre note.');
        return;
    }
    
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const now = new Date().toISOString();
    
    if (currentNoteId) {
        // Mettre à jour une note existante
        const noteIndex = notes.findIndex(n => n.id === currentNoteId);
        if (noteIndex !== -1) {
            notes[noteIndex] = {
                ...notes[noteIndex],
                title: title,
                content: content,
                category: category,
                isFavorite: isFavorite,
                updatedAt: now
            };
        }
    } else {
        // Créer une nouvelle note
        const newNote = {
            id: Date.now(),
            title: title,
            content: content,
            category: category,
            tags: [],
            createdAt: now,
            updatedAt: now,
            isFavorite: isFavorite,
            isInTrash: false
        };
        notes.unshift(newNote);
        currentNoteId = newNote.id;
        
        // Mettre à jour l'URL
        const newUrl = window.location.pathname + '?id=' + currentNoteId;
        window.history.replaceState({}, '', newUrl);
    }
    
    localStorage.setItem('notes', JSON.stringify(notes));
    showSaveStatus();
    
    // Nettoyer le localStorage temporaire après sauvegarde
    localStorage.removeItem('noteContent');
    
    // Notifier l'interface principale si elle est ouverte
    if (window.opener) {
        window.opener.postMessage({
            type: 'noteUpdated',
            noteId: currentNoteId
        }, '*');
    }
}

// Retour à l'accueil
function goBack() {
    // Sauvegarder automatiquement avant de quitter
    if (titleInput.value.trim() || editor.innerHTML.trim()) {
        saveNote();
    }
    
    // Nettoyer le localStorage temporaire
    localStorage.removeItem('noteContent');
    
    // Rediriger vers interface.html
    window.location.href = 'interface.html';
}

// Gestion des favoris
function toggleFavorite() {
    isFavorite = !isFavorite;
    updateFavoriteButton();
    
    // Sauvegarder automatiquement
    if (currentNoteId) {
        saveNote();
    }
}

function updateFavoriteButton() {
    favoriteBtn.textContent = isFavorite ? '⭐' : '☆';
    favoriteBtn.title = isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris';
}

// Event listeners
favoriteBtn.addEventListener('click', toggleFavorite);
categorySelect.addEventListener('change', () => {
    if (currentNoteId) {
        saveNote();
    }
});

// Navigation titre -> éditeur avec Enter
titleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        editor.focus();
    }
});

// Heure exacte
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById("current-time").textContent = timeString;
}
setInterval(updateTime, 1000);
updateTime();

// Format texte
function formatText(command, value = null) {
    document.execCommand(command, false, value);
    editor.focus();
    updateActiveButtons();
}

// Taille de police
function changeFontSize(change) {
    const fontSizeInput = document.getElementById("fontSize");
    let newSize = parseInt(fontSizeInput.value) + change;
    newSize = Math.max(8, Math.min(72, newSize));
    fontSizeInput.value = newSize;
    document.getElementById("fontSizeDisplay").textContent = newSize;
    
    // Applique la taille de police à l'éditeur
    editor.style.fontSize = newSize + 'px';
}

// Initialisation de la taille de police
document.getElementById("fontSizeDisplay").textContent = document.getElementById("fontSize").value;
editor.style.fontSize = document.getElementById("fontSize").value + 'px';

// Couleurs texte/fond
textColorInput.addEventListener("input", () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        formatText("foreColor", textColorInput.value);
    } else {
        // Si pas de sélection, applique à tout nouveau texte
        editor.style.color = textColorInput.value;
    }
});

bgColorInput.addEventListener("input", () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        // Essayer d'abord hiliteColor (Chrome/Firefox)
        try {
            formatText("hiliteColor", bgColorInput.value);
        } catch (e) {
            // Si hiliteColor ne fonctionne pas, essayer backColor (Safari/Edge)
            try {
                formatText("backColor", bgColorInput.value);
            } catch (e2) {
                // Méthode alternative avec des spans
                const range = selection.getRangeAt(0);
                const span = document.createElement('span');
                span.style.backgroundColor = bgColorInput.value;
                try {
                    range.surroundContents(span);
                } catch (e3) {
                    // Si le contenu ne peut pas être entouré, extraire et replacer
                    const content = range.extractContents();
                    span.appendChild(content);
                    range.insertNode(span);
                }
            }
        }
    }
});

// Placeholder dynamique
function togglePlaceholder() {
    editor.classList.toggle("empty", editor.innerText.trim() === "");
}
editor.addEventListener("input", () => {
    togglePlaceholder();
    updateActiveButtons();
});

// Undo/Redo
function undo() {
    document.execCommand("undo");
}
function redo() {
    document.execCommand("redo");
}

// Highlight des boutons actifs
function updateActiveButtons() {
    const commands = [
        { id: 'boldBtn', cmd: 'bold' },
        { id: 'italicBtn', cmd: 'italic' },
        { id: 'underlineBtn', cmd: 'underline' },
        { id: 'strikeBtn', cmd: 'strikeThrough' },
        { id: 'alignLeft', cmd: 'justifyLeft' },
        { id: 'alignCenter', cmd: 'justifyCenter' },
        { id: 'alignRight', cmd: 'justifyRight' }
    ];
    
    commands.forEach(btn => {
        const el = document.getElementById(btn.id);
        if (el) el.classList.toggle("active", document.queryCommandState(btn.cmd));
    });
}

// Mode sombre 
document.getElementById('darkModeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    
    // Réappliquer le fond personnalisé si il y en a un
    const savedBg = localStorage.getItem('noteBackground');
    if (savedBg) {
        applyBackgroundWithDarkMode(savedBg);
    }
    
    localStorage.setItem('darkMode', isDark);
});

// Mode lecture
let readMode = false;
document.getElementById('readModeToggle').addEventListener('click', () => {
    readMode = !readMode;
    document.body.classList.toggle('read-mode', readMode);
    document.getElementById('readModeToggle').textContent = readMode ? '✏️' : '📖';
    if (readMode) {
        editor.contentEditable = false;
        titleInput.readOnly = true;
    } else {
        editor.contentEditable = true;
        titleInput.readOnly = false;
    }
});

// Filtre lumière bleue
let blueFilter = false;
document.getElementById('blueFilterToggle').addEventListener('click', () => {
    blueFilter = !blueFilter;
    document.body.classList.toggle('blue-filter', blueFilter);
    document.getElementById('blueFilterToggle').textContent = blueFilter ? '🔶' : '🔵';
    localStorage.setItem('blueFilter', blueFilter);
});

// Gestion des menus
menuBtn.addEventListener("click", (e) => {
    contextMenu.style.display = "flex";
    templatesMenu.style.display = "none";
    bgColorsMenu.style.display = "none";
    positionMenu(contextMenu, e.target);
    e.stopPropagation();
});

bgColorBtn.addEventListener("click", (e) => {
    bgColorsMenu.style.display = "flex";
    contextMenu.style.display = "none";
    templatesMenu.style.display = "none";
    positionMenu(bgColorsMenu, e.target);
    e.stopPropagation();
});

function showTemplates() {
    templatesMenu.style.display = "flex";
    contextMenu.style.display = "none";
    positionMenu(templatesMenu, document.getElementById("menuBtn"));
}

function positionMenu(menu, button) {
    const rect = button.getBoundingClientRect();
    menu.style.top = `${rect.bottom + window.scrollY}px`;
    menu.style.right = `${window.innerWidth - rect.right}px`;
}

// Fermeture des menus
window.addEventListener("click", () => {
    contextMenu.style.display = "none";
    templatesMenu.style.display = "none";
    bgColorsMenu.style.display = "none";
});

// Application des templates
function applyTemplate(templateType) {
    const templateClasses = [
        'template-lined', 'template-grid', 'template-cornell', 'template-todo'
    ];
    
    templateClasses.forEach(cls => editor.classList.remove(cls));
    
    if (templateType !== 'blank') {
        editor.classList.add(`template-${templateType}`);
    }
    
    // Contenu pré-formaté
    if (templateType === 'cornell') {
        if (editor.innerHTML.trim() === '') {
            editor.innerHTML = `
                <div style="margin-bottom: 20px;">
                    <strong>Sujet:</strong> <span contenteditable="true">_________________</span><br>
                    <strong>Date:</strong> <span contenteditable="true">_________________</span>
                </div>
                <div style="display: flex; margin-bottom: 20px;">
                    <div style="width: 25%; border-right: 1px solid var(--border-color); padding-right: 10px;">
                        <strong>Questions/Mots-clés</strong>
                    </div>
                    <div style="width: 75%; padding-left: 10px;">
                        <strong>Notes principales</strong>
                    </div>
                </div>
                <div style="border-top: 2px solid var(--border-color); padding-top: 10px; margin-top: 20px;">
                    <strong>Résumé:</strong>
                </div>
            `;
        }
    } else if (templateType === 'todo') {
        if (editor.innerHTML.trim() === '') {
            editor.innerHTML = `
                <h3>Ma liste de tâches</h3>
                <div style="margin-bottom: 10px;">☐ Tâche 1</div>
                <div style="margin-bottom: 10px;">☐ Tâche 2</div>
                <div style="margin-bottom: 10px;">☐ Tâche 3</div>
            `;
        }
    }
    
    templatesMenu.style.display = "none";
}

// Fonction pour appliquer le fond en tenant compte du mode sombre
function applyBackgroundWithDarkMode(color) {
    const mainElement = document.querySelector("main");
    
    // Si on est en mode sombre, on adapte certaines couleurs
    if (document.body.classList.contains('dark-mode')) {
        // Pour les couleurs claires, on les assombrit
        if (color === '#ffffff' || color === '#fff8e1' || color === '#e8f5e9' || color === '#f3e5f5') {
            // Utiliser les couleurs sombres équivalentes
            const darkColors = {
                '#ffffff': '#2d2d2d',
                '#fff8e1': '#3d3d2d',
                '#e8f5e9': '#2d3d2d',
                '#f3e5f5': '#3d2d3d'
            };
            mainElement.style.background = darkColors[color] || color;
        } else {
            mainElement.style.background = color;
        }
    } else {
        mainElement.style.background = color;
    }
}

// Changement de couleur de fond
function changeBackground(color) {
    applyBackgroundWithDarkMode(color);
    bgColorsMenu.style.display = "none";
    localStorage.setItem('noteBackground', color);
}

// Sauvegarde automatique en localStorage 
function autoSave() {
    // Ne pas sauvegarder automatiquement si on édite une note existante
    // car cela pourrait écraser d'autres notes
    if (currentNoteId) {
        return; // On utilise saveNote() pour les notes existantes
    }
    
    // Seulement pour les nouvelles notes
    const content = {
        title: titleInput.value,
        body: editor.innerHTML,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('noteContent', JSON.stringify(content));
}

// Affichage du statut de sauvegarde
function showSaveStatus() {
    saveStatus.classList.add('show');
    setTimeout(() => {
        saveStatus.classList.remove('show');
    }, 2000);
}

// Sauvegarde en fichier .txt
function saveAsTxt() {
    try {
        const title = titleInput.value.trim() || 'Note sans titre';
        const content = editor.innerText || editor.textContent || '';
        
        if (!title && !content.trim()) {
            alert('Aucun contenu à télécharger');
            return;
        }
        
        const fullContent = `${title}\n${'='.repeat(title.length)}\n\n${content}`;
        
        const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
        
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`);
        } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
            a.style.display = 'none';
            
            document.body.appendChild(a);
            a.click();
            
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        }
        
        showSaveStatus();
        console.log('Téléchargement initié avec succès');
        
    } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
        alert('Erreur lors du téléchargement. Vérifiez la console pour plus de détails.');
    }
}

// Chargement depuis fichier
function loadFromFile() {
    fileInput.click();
}

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const lines = content.split('\n');
            
            if (lines.length > 0) {
                titleInput.value = lines[0];
                editor.innerHTML = lines.slice(2).join('\n').replace(/\n/g, '<br>');
                togglePlaceholder();
            }
        };
        reader.readAsText(file);
    }
    fileInput.value = '';
});

// Effacer la note
function clearNote() {
    if (confirm('Êtes-vous sûr de vouloir effacer toute la note ?')) {
        titleInput.value = '';
        editor.innerHTML = '';
        togglePlaceholder();
    }
}

// Raccourcis clavier
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'b':
                e.preventDefault();
                formatText('bold');
                break;
            case 'i':
                e.preventDefault();
                formatText('italic');
                break;
            case 'u':
                e.preventDefault();
                formatText('underline');
                break;
            case 's':
                e.preventDefault();
                saveNote(); 
                break;
        }
    }
});

// Chargement au démarrage 
window.addEventListener("load", () => {
    checkExistingNote();
    
    // Seulement charger le contenu temporaire si on ne charge pas une note existante
    if (!currentNoteId) {
        const saved = localStorage.getItem('noteContent');
        if (saved) {
            try {
                const content = JSON.parse(saved);
                titleInput.value = content.title || '';
                editor.innerHTML = content.body || '';
                togglePlaceholder();
            } catch (e) {
                console.error('Erreur lors du chargement:', e);
            }
        }
    }
    
    // Charger le mode sombre avant le fond
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark-mode');
    }
    
    // Charger le fond après le mode sombre
    const savedBg = localStorage.getItem('noteBackground');
    if (savedBg) {
        applyBackgroundWithDarkMode(savedBg);
    }

    // Charger le filtre bleu
    const savedBlueFilter = localStorage.getItem('blueFilter');
    if (savedBlueFilter === 'true') {
        blueFilter = true;
        document.body.classList.add('blue-filter');
        document.getElementById('blueFilterToggle').textContent = '🔶';
    }
    
    updateActiveButtons();
});

// Initialisation
togglePlaceholder();