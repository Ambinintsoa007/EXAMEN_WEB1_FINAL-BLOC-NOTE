// Récupération des éléments du DOM
const loginCard = document.getElementById("login-card");
const registerCard = document.getElementById("register-card");

/**
 * Affiche le formulaire d'inscription et cache celui de connexion
 */
function showRegister() {
  loginCard.classList.add("hidden");
  registerCard.classList.remove("hidden");
}

/**
 * Affiche le formulaire de connexion et cache celui d'inscription
 */
function showLogin() {
  registerCard.classList.add("hidden");
  loginCard.classList.remove("hidden");
}

/**
 * Gère l'inscription d'un nouvel utilisateur
 */
function register() {
  const name = document.getElementById("reg-name").value;
  const email = document.getElementById("reg-email").value;
  const pass = document.getElementById("reg-pass").value;
  const confirm = document.getElementById("reg-confirm").value;

  // Validation des champs
  if (name && email && pass && pass === confirm) {
    alert("Registration successful! Please login.");
    showLogin();
    // Optionnel : Vider les champs après inscription
    clearRegisterFields();
  } else {
    alert("Please fill all fields correctly.");
  }
}

/**
 * Gère la connexion d'un utilisateur
 */
function login() {
  const name = document.getElementById("login-name").value;
  const pass = document.getElementById("login-pass").value;

  // Validation des champs
  if (name && pass) {
    alert("Login successful!");
    // Redirection vers le tableau de bord
    // window.location.href = 'dashboard.html';
  } else {
    alert("Please enter your name and password.");
  }
}

/**
 * Vide les champs du formulaire d'inscription
 */
function clearRegisterFields() {
  document.getElementById("reg-name").value = "";
  document.getElementById("reg-email").value = "";
  document.getElementById("reg-pass").value = "";
  document.getElementById("reg-confirm").value = "";
}

/**
 * Vide les champs du formulaire de connexion
 */
function clearLoginFields() {
  document.getElementById("login-name").value = "";
  document.getElementById("login-pass").value = "";
}

// Gestionnaire d'événements pour la touche Entrée
document.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    // Si le formulaire de connexion est visible
    if (!loginCard.classList.contains('hidden')) {
      login();
    }
    // Si le formulaire d'inscription est visible
    else if (!registerCard.classList.contains('hidden')) {
      register();
    }
  }
});

// Animation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
  // Ajouter une classe pour déclencher les animations
  document.body.classList.add('loaded');
});