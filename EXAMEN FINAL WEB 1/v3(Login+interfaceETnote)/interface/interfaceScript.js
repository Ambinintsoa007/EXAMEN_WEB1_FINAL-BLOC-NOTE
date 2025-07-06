// Système de gestion des notes
class NotesManager {
    updateNote(id, noteData) {
        const noteIndex = this.notes.findIndex(n => n.id === id);
        if (noteIndex !== -1) {
            this.notes[noteIndex] = {
                ...this.notes[noteIndex],
                ...noteData,
                updatedAt: new Date().toISOString()
            };
            this.saveNotes();
            return this.notes[noteIndex];
        }
        return null;
    }

    constructor() {
        this.notes = this.loadNotes();
        this.currentFilter = 'all';
        this.currentView = 'grid';
        this.searchQuery = '';
        this.init();
    }

    init() {
        this.displayNotes();
        this.updateCounts();
        this.setupEventListeners();
    }

    loadNotes() {
        try {
            const savedNotes = localStorage.getItem('notes');
            return savedNotes ? JSON.parse(savedNotes) : [];
        } catch (error) {
            console.warn('Erreur lors du chargement des notes:', error);
            return [];
        }
    }

    saveNotes() {
        try {
            localStorage.setItem('notes', JSON.stringify(this.notes));
        } catch (error) {
            console.warn('Erreur lors de la sauvegarde des notes:', error);
        }
    }

    createNote() {
        window.location.href = 'blocNote.html';
    }

    addNote(noteData) {
        const note = {
            id: Date.now(),
            title: noteData.title || 'Note sans titre',
            content: noteData.content || '',
            category: noteData.category || 'personal',
            tags: noteData.tags || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isFavorite: false,
            isInTrash: false
        };
        
        this.notes.unshift(note);
        this.saveNotes();
        this.displayNotes();
        this.updateCounts();
        return note;
    }

    editNote(id) {
        // Redirection vers la page d'édition avec l'ID de la note
        window.location.href = `blocNote.html?id=${id}`;
    }

    deleteNote(id) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            note.isInTrash = true;
            note.updatedAt = new Date().toISOString();
            this.saveNotes();
            this.displayNotes();
            this.updateCounts();
        }
    }

    toggleFavorite(id) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            note.isFavorite = !note.isFavorite;
            note.updatedAt = new Date().toISOString();
            this.saveNotes();
            this.displayNotes();
            this.updateCounts();
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Aujourd\'hui';
        if (diffDays === 2) return 'Hier';
        if (diffDays < 7) return `Il y a ${diffDays} jours`;
        if (diffDays < 30) return `Il y a ${Math.ceil(diffDays / 7)} semaines`;
        return `Il y a ${Math.ceil(diffDays / 30)} mois`;
    }

    getFilteredNotes() {
        let filtered = this.notes.filter(note => {
            // Filtre par catégorie/type
            let matchesFilter = false;
            if (this.currentFilter === 'all') matchesFilter = !note.isInTrash;
            else if (this.currentFilter === 'favorites') matchesFilter = note.isFavorite && !note.isInTrash;
            else if (this.currentFilter === 'recent') {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                matchesFilter = new Date(note.updatedAt) > weekAgo && !note.isInTrash;
            }
            else if (this.currentFilter === 'trash') matchesFilter = note.isInTrash;
            else matchesFilter = note.category === this.currentFilter && !note.isInTrash;

            // Filtre par recherche
            let matchesSearch = true;
            if (this.searchQuery) {
                matchesSearch = note.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            note.content.toLowerCase().includes(this.searchQuery.toLowerCase());
            }

            return matchesFilter && matchesSearch;
        });

        return filtered;
    }

    displayNotes() {
        const notesGrid = document.getElementById('notesGrid');
        const emptyState = document.getElementById('emptyState');
        const filteredNotes = this.getFilteredNotes();

        notesGrid.innerHTML = '';

        // Appliquer la classe de vue
        notesGrid.className = this.currentView === 'list' ? 'notes-list' : 'notes-grid';

        if (filteredNotes.length === 0) {
            emptyState.style.display = 'block';
            notesGrid.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            notesGrid.style.display = this.currentView === 'list' ? 'flex' : 'grid';

            filteredNotes.forEach((note, index) => {
                const noteCard = this.createNoteCard(note, index);
                notesGrid.appendChild(noteCard);
            });
        }
    }

    createNoteCard(note, index) {
        const noteCard = document.createElement('article');
        noteCard.className = `note-card ${this.currentView === 'list' ? 'list-view' : ''}`;
        noteCard.style.setProperty('--accent-color', this.getCategoryColor(note.category));
        noteCard.onclick = () => this.editNote(note.id);

        const categoryIcon = this.getCategoryIcon(note.category);
        const tagsHtml = note.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

        noteCard.innerHTML = `
            <div class="note-category">${note.category}</div>
            <h3 class="note-title">${note.title}</h3>
            <p class="note-content">${note.content.substring(0, 150)}${note.content.length > 150 ? '...' : ''}</p>
            <div class="note-meta">
                <span class="note-date">${this.formatDate(note.updatedAt)}</span>
                <div class="note-actions">
                    <button class="favorite-btn ${note.isFavorite ? 'active' : ''}" onclick="event.stopPropagation(); notesManager.toggleFavorite(${note.id})">
                        ${note.isFavorite ? '⭐' : '☆'}
                    </button>
                    <button class="delete-btn" onclick="event.stopPropagation(); notesManager.deleteNote(${note.id})">
                        🗑️
                    </button>
                </div>
                <div class="note-icon" style="background: ${this.getCategoryColor(note.category)};">
                    ${categoryIcon}
                </div>
            </div>
        `;

        // Animation d'apparition
        setTimeout(() => {
            noteCard.style.opacity = '1';
            noteCard.style.transform = 'translateY(0)';
        }, index * 100);

        return noteCard;
    }

    getCategoryColor(category) {
        const colors = {
            work: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
            personal: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
            ideas: 'linear-gradient(45deg, #45b7d1, #96c93d)',
            travel: 'linear-gradient(45deg, #f093fb, #f5576c)',
            reading: 'linear-gradient(45deg, #ffd89b, #19547b)',
            recipes: 'linear-gradient(45deg, #a8edea, #fed6e3)'
        };
        return colors[category] || colors.personal;
    }

    getCategoryIcon(category) {
        const icons = {
            work: '💼',
            personal: '🏠',
            ideas: '💡',
            travel: '✈️',
            reading: '📚',
            recipes: '🍰'
        };
        return icons[category] || '📝';
    }

    updateCounts() {
        const counts = {
            all: this.notes.filter(n => !n.isInTrash).length,
            favorites: this.notes.filter(n => n.isFavorite && !n.isInTrash).length,
            recent: this.notes.filter(n => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(n.updatedAt) > weekAgo && !n.isInTrash;
            }).length,
            trash: this.notes.filter(n => n.isInTrash).length,
            work: this.notes.filter(n => n.category === 'work' && !n.isInTrash).length,
            personal: this.notes.filter(n => n.category === 'personal' && !n.isInTrash).length,
            ideas: this.notes.filter(n => n.category === 'ideas' && !n.isInTrash).length,
            travel: this.notes.filter(n => n.category === 'travel' && !n.isInTrash).length
        };

        Object.keys(counts).forEach(key => {
            const countElement = document.getElementById(key + 'Count');
            if (countElement) {
                countElement.textContent = counts[key];
            }
        });
    }

    setupEventListeners() {
        // Gestion du menu hamburger
        const menuToggle = document.getElementById('menuToggle');
        const dropdownMenu = document.getElementById('dropdownMenu');
        let isMenuOpen = false;

        menuToggle.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            
            if (isMenuOpen) {
                dropdownMenu.classList.add('show');
                menuToggle.classList.add('active');
            } else {
                dropdownMenu.classList.remove('show');
                menuToggle.classList.remove('active');
            }
        });

        // Fermer le menu si on clique ailleurs
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
                menuToggle.classList.remove('active');
                isMenuOpen = false;
            }
        });

        // Gestion des filtres
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                this.currentFilter = item.dataset.filter;
                this.displayNotes();
                
                // Fermer le menu après sélection
                dropdownMenu.classList.remove('show');
                menuToggle.classList.remove('active');
                isMenuOpen = false;
            });
        });

        // Gestion des étiquettes
        document.querySelectorAll('.tag-item').forEach(item => {
            item.addEventListener('click', () => {
                const tag = item.dataset.tag;
                // Filtrer par étiquette (à implémenter)
                console.log('Filtrer par étiquette:', tag);
                
                // Fermer le menu après sélection
                dropdownMenu.classList.remove('show');
                menuToggle.classList.remove('active');
                isMenuOpen = false;
            });
        });

        // Gestion des vues
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentView = btn.dataset.view;
                this.displayNotes();
            });
        });

        // Gestion de la recherche
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.displayNotes();
            });
        }
    }
}

// Initialisation
const notesManager = new NotesManager();

// Fonction globale pour créer une note
function createNote() {
    notesManager.createNote();
}

// Fonction pour ouvrir une note (compatibilité)
function openNote(id) {
    notesManager.editNote(id);
}

// Écouter les messages de la page de création de note
window.addEventListener('message', (event) => {
    if (event.data.type === 'noteCreated') {
        notesManager.addNote(event.data.note);
    }
});