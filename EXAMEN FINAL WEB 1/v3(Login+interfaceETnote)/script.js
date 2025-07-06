const loginCard = document.getElementById("login-card");
const registerCard = document.getElementById("register-card");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

// Fonctions de navigation
    function showRegister() {
        loginCard.classList.add("hidden");
        registerCard.classList.remove("hidden");
        clearMessages();
    }

    function showLogin() {
        registerCard.classList.add("hidden");
        loginCard.classList.remove("hidden");
        clearMessages();
    }

    function showForgotPassword() {
      alert("Fonctionnalité de récupération de mot de passe à venir xD!");
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showError(elementId, message) {
      const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    function showSuccess(elementId, message) {
      const successElement = document.getElementById(elementId);
          successElement.textContent = message;
          successElement.style.display = 'block';
    }

    function clearMessages() {
      const errorMessages = document.querySelectorAll('.error-message');
      const successMessages = document.querySelectorAll('.success-message');
      
      errorMessages.forEach(msg => {
          msg.style.display = 'none';
          msg.textContent = '';
      });
      
      successMessages.forEach(msg => {
          msg.style.display = 'none';
          msg.textContent = '';
      });
    }

    // Gestion de l'inscription - CORRIGÉE
    function register() {
       clearMessages();
      
      const name = document.getElementById("reg-name").value.trim();
      const pass = document.getElementById("reg-pass").value;
      const confirm = document.getElementById("reg-confirm").value;

      let isValid = true;

      // Validation du nom
      if (!name) {
          showError('reg-name-error', 'Le nom complet est requis');
          isValid = false;
      }

      // Validation du mot de passe
      if (!pass) {
          showError('reg-pass-error', 'Le mot de passe est requis');
          isValid = false;
      } else if (pass.length < 6) {
          showError('reg-pass-error', 'Le mot de passe doit contenir au moins 6 caractères');
          isValid = false;
      }

      // Validation de la confirmation
      if (!confirm) {
          showError('reg-confirm-error', 'La confirmation du mot de passe est requise');
          isValid = false;
      } else if (pass !== confirm) {
          showError('reg-confirm-error', 'Les mots de passe ne correspondent pas');
          isValid = false;
      }

      // Vérifier si l'utilisateur existe déjà
      if (isValid && localStorage.getItem(name)) {
          showError('reg-name-error', 'Un compte avec ce nom existe déjà');
          isValid = false;
      }

      if (isValid) {
        // Enregistrer l'utilisateur
        localStorage.setItem(name, JSON.stringify({ 
            password: pass,
           createdAt: new Date().toISOString()
        }));
        
        showSuccess('register-success', 'Inscription réussie !');
        
        setTimeout(() => {
          showLogin(); // Retourner à la page de connexion
          clearRegisterFields();
        }, 1500);
      }
    }

    // Gestion de la connexion - CORRIGÉE
    function login() {
      clearMessages();
      
      const name = document.getElementById("login-name").value.trim();
      const pass = document.getElementById("login-pass").value;

      let isValid = true;

      if (!name) {
        showError('login-name-error', 'Le nom d\'utilisateur est requis');
        isValid = false;
      }

      if (!pass) {
        showError('login-pass-error', 'Le mot de passe est requis');
        isValid = false;
      }

      if (isValid) {
        const userData = localStorage.getItem(name);
        
        if (!userData) {
          showError('login-name-error', 'Aucun compte trouvé avec ce nom');
          return;
        }

        const user = JSON.parse(userData);
        
        if (user.password === pass) {
          showSuccess('login-success', 'Connexion réussie ! ');
          
          // Enregistrer la session
          sessionStorage.setItem('currentUser', name);
          
          setTimeout(() => {
            // Rediriger vers la page d'interface principale (à créer)
            window.location.href = "interface/interface.html";
          }, 1000);
        } else {
          showError('login-pass-error', 'Mot de passe incorrect');
        }
      }
    }

    // Fonction utilitaire
    function clearRegisterFields() {
      document.getElementById("reg-name").value = "";
      document.getElementById("reg-pass").value = "";
      document.getElementById("reg-confirm").value = "";
    }

    // Événements des formulaires
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      login();
    });

    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      register();
    });

    // Gestion des touches clavier
    document.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        if (!loginCard.classList.contains('hidden')) {
          e.preventDefault();
          login();
        } else if (!registerCard.classList.contains('hidden')) {
          e.preventDefault();
          register();
        }
      }
    });