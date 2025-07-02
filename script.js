document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('.sidebar');
  const menuIcon = document.querySelector('.menu-icon');
  const settingsIcon = document.querySelector('.settings-icon');
  const settingsMenu = document.querySelector('.settings-menu');
  const addNoteBtn = document.querySelector('.add-note');
  const illustration = document.querySelector('.illustration');
  const noteList = document.querySelector('.note-list');
  const searchBar = document.querySelector('.search-bar');

  menuIcon.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });

  menuIcon.addEventListener('mouseover', () => {
    sidebar.classList.add('active');
  });

  sidebar.addEventListener('mouseleave', () => {
    sidebar.classList.remove('active');
  });

  settingsIcon.addEventListener('click', () => {
    settingsMenu.classList.toggle('active');
  });

  settingsIcon.addEventListener('mouseover', () => {
    settingsMenu.classList.add('active');
  });

  settingsMenu.addEventListener('mouseleave', () => {
    settingsMenu.classList.remove('active');
  });

  settingsMenu.querySelectorAll('div').forEach(item => {
    item.addEventListener('click', (e) => {
      const option = e.target.dataset.option;
      const span = e.target.querySelector('span');
      if (option === 'text-size' || option === 'text-size-small') {
        span.textContent = span.textContent === 'moyenne' ? 'grand' : span.textContent === 'grand' ? 'petit' : 'moyenne';
      } else if (option === 'sort') {
        span.textContent = span.textContent === 'par date de création' ? 'par date de modification' : 'par date de création';
      } else if (option === 'display') {
        span.textContent = span.textContent === 'liste' ? 'détail' : 'liste';
      }
    });
  });

  addNoteBtn.addEventListener('click', () => {
    window.location.href = 'create-note.html';
  });

  window.addEventListener('load', () => {
    if (window.location.pathname.includes('index.html')) {
      illustration.style.display = 'block';
    }
  });

  window.addEventListener('message', (event) => {
    if (event.data.type === 'newNote') {
      illustration.style.display = 'none';
      const note = document.createElement('article');
      note.classList.add('note');
      note.textContent = event.data.title || 'Nouvelle note';
      noteList.appendChild(note);
    }
  });

  searchBar.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    document.querySelectorAll('.note').forEach(note => {
      const text = note.textContent.toLowerCase();
      note.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
  });
});