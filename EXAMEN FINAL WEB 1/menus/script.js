function createNote() {
    // Animation de création de note
    const btn = event.target;
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
        alert('Nouvelle note créée !');
    }, 150);
}

function openNote(id) {
    const card = event.target.closest('.note-card');
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
        card.style.transform = 'scale(1)';
        alert(`Ouverture de la note ${id}`);
    }, 150);
}

// Gestion du menu hamburger
const menuToggle = document.getElementById('menuToggle');
const dropdownMenu = document.getElementById('dropdownMenu');
let isMenuOpen = false;

menuToggle.addEventListener('click', function() {
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
document.addEventListener('click', function(e) {
    if (!menuToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove('show');
        menuToggle.classList.remove('active');
        isMenuOpen = false;
    }
});

// Animation des éléments de la sidebar
document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        
        // Filtrage des notes
        const filter = this.dataset.filter;
        filterNotes(filter);
        
        // Fermer le menu après sélection
        dropdownMenu.classList.remove('show');
        menuToggle.classList.remove('active');
        isMenuOpen = false;
    });
});

// Gestion des étiquettes
document.querySelectorAll('.tag-item').forEach(item => {
    item.addEventListener('click', function() {
        const tag = this.dataset.tag;
        filterNotesByTag(tag);
        
        // Animation de sélection
        this.style.background = '#f0f0f0';
        setTimeout(() => {
            this.style.background = '';
        }, 300);
        
        // Fermer le menu après sélection
        dropdownMenu.classList.remove('show');
        menuToggle.classList.remove('active');
        isMenuOpen = false;
    });
});

function filterNotes(filter) {
    const notes = document.querySelectorAll('.note-card');
    
    notes.forEach(note => {
        note.style.display = 'none';
        note.style.opacity = '0';
        note.style.transform = 'scale(0.8)';
    });
    
    setTimeout(() => {
        notes.forEach((note, index) => {
            let shouldShow = false;
            
            switch(filter) {
                case 'all':
                    shouldShow = true;
                    break;
                case 'favorites':
                    shouldShow = Math.random() > 0.5; // Simulation favoris
                    break;
                case 'recent':
                    shouldShow = index < 3;
                    break;
                case 'trash':
                    shouldShow = false; // Pas de notes en corbeille pour la démo
                    break;
                default:
                    shouldShow = note.dataset.category === filter;
            }
            
            if (shouldShow) {
                note.style.display = 'block';
                setTimeout(() => {
                    note.style.opacity = '1';
                    note.style.transform = 'scale(1)';
                }, index * 100);
            }
        });
    }, 200);
}

function filterNotesByTag(tag) {
    const notes = document.querySelectorAll('.note-card');
    
    notes.forEach(note => {
        const tags = note.dataset.tags ? note.dataset.tags.split(',') : [];
        if (tags.includes(tag)) {
            note.style.background = '#fff3cd';
            note.style.border = '2px solid #ffc107';
            setTimeout(() => {
                note.style.background = '';
                note.style.border = '';
            }, 2000);
        }
    });
}

// Animation d'apparition des cartes
window.addEventListener('load', () => {
    const cards = document.querySelectorAll('.note-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// Effet de parallaxe subtil
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.note-card');
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    
    cards.forEach((card, index) => {
        const speed = (index + 1) * 0.5;
        card.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
    });
});