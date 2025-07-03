// Éléments DOM
const editor = document.getElementById("editor");
const textColorInput = document.getElementById("textColor");
const bgColorInput = document.getElementById("bgColor");
const menuBtn = document.getElementById("menuBtn");
const contextMenu = document.getElementById("contextMenu");
const bgColorBtn = document.getElementById("bgColorBtn");
const templatesMenu = document.getElementById("templatesMenu");
const bgColorsMenu = document.getElementById("bgColorsMenu");

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
  newSize = Math.max(8, Math.min(72, newSize)); // Limite 8-72
  fontSizeInput.value = newSize;
  document.getElementById("fontSizeDisplay").textContent = newSize;
  formatText("fontSize", newSize);
}

// Initialisation de la taille de police
document.getElementById("fontSizeDisplay").textContent = document.getElementById("fontSize").value;

// Couleurs texte/fond
textColorInput.addEventListener("input", () => {
  formatText("foreColor", textColorInput.value);
});

bgColorInput.addEventListener("input", () => {
  formatText("hiliteColor", bgColorInput.value);
});

// Placeholder dynamique
function togglePlaceholder() {
  editor.classList.toggle("empty", editor.innerText.trim() === "");
}
editor.addEventListener("input", () => {
  togglePlaceholder();
  updateActiveButtons();
});
window.addEventListener("load", togglePlaceholder);

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

// Fermeture des menus au clic ailleurs
window.addEventListener("click", () => {
  contextMenu.style.display = "none";
  templatesMenu.style.display = "none";
  bgColorsMenu.style.display = "none";
});

// Application des templates
function applyTemplate(templateType) {
  // Supprime tous les styles de template existants
  editor.classList.remove(
    "template-lined", 
    "template-grid", 
    "template-cornell"
  );
  
  if (templateType !== 'blank') {
    editor.classList.add(`template-${templateType}`);
  }
  
  templatesMenu.style.display = "none";
}

// Changement de couleur de fond
function changeBackground(color) {
  document.querySelector(".note-body").style.background = color;
  bgColorsMenu.style.display = "none";
  localStorage.setItem('noteBackground', color);
}

// Sauvegarde automatique
function saveContent() {
  const content = {
    title: document.querySelector('.title').value,
    body: editor.innerHTML,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('noteContent', JSON.stringify(content));
}

setInterval(saveContent, 30000);
editor.addEventListener("input", saveContent);
document.querySelector('.title').addEventListener("input", saveContent);

// Chargement au démarrage
window.addEventListener("load", () => {
  const saved = localStorage.getItem('noteContent');
  if (saved) {
    const content = JSON.parse(saved);
    document.querySelector('.title').value = content.title || '';
    editor.innerHTML = content.body || '';
    togglePlaceholder();
  }
  
  const savedBg = localStorage.getItem('noteBackground');
  if (savedBg) {
    document.querySelector(".note-body").style.background = savedBg;
  }
  
  textColorInput.value = '#000000';
  bgColorInput.value = '#ffffff';
  applyInitialTheme();
});

// Export/Import
function exportNote() {
  const content = {
    title: document.querySelector('.title').value,
    body: editor.innerHTML
  };
  const blob = new Blob([JSON.stringify(content)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${content.title || 'note-sans-titre'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importNotePrompt() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const content = JSON.parse(event.target.result);
        document.querySelector('.title').value = content.title || '';
        editor.innerHTML = content.body || '';
        togglePlaceholder();
        saveContent();
      } catch (err) {
        alert('Erreur lors de la lecture du fichier');
      }
    };
    reader.readAsText(file);
  };
  
  input.click();
}

// Gestion du thème
function applyInitialTheme() {
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  }
  
  updateDarkModeButton();
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateDarkModeButton();
}

function updateDarkModeButton() {
  const btn = document.getElementById('darkModeToggle');
  btn.textContent = document.body.classList.contains('dark-mode') ? '🌙' : '☀️';
}

document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

// Effacer la note
function clearNote() {
  if (confirm('Voulez-vous vraiment effacer toute la note ?')) {
    document.querySelector('.title').value = '';
    editor.innerHTML = '';
    togglePlaceholder();
    saveContent();
  }
}

// Raccourcis clavier
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey) {
    switch (e.key.toLowerCase()) {
      case 'b': e.preventDefault(); formatText("bold"); break;
      case 'i': e.preventDefault(); formatText("italic"); break;
      case 'u': e.preventDefault(); formatText("underline"); break;
      case 'z': e.preventDefault(); undo(); break;
      case 'y': e.preventDefault(); redo(); break;
      case 'l': e.preventDefault(); formatText("insertOrderedList"); break;
      case 'm': e.preventDefault(); formatText("insertUnorderedList"); break;
      case 's': e.preventDefault(); saveContent(); break;
      case 'd': e.preventDefault(); toggleDarkMode(); break;
    }
  }
});