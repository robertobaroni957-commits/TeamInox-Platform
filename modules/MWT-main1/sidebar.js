/* ====================================
   FILE: sidebar.js
   ==================================== */

(function() {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('menu-toggle');
    const overlay = document.getElementById('sidebar-overlay');
    const menuIconOpen = document.getElementById('menu-icon-open');
    const menuIconClose = document.getElementById('menu-icon-close');
    const body = document.body;

    if (!sidebar || !toggleButton) return;

    // --- Funzioni di apertura/chiusura ---
    const openSidebar = () => {
        sidebar.classList.add('is-open');
        overlay.classList.remove('hidden');
        overlay.classList.add('opacity-50', 'pointer-events-auto'); 
        body.classList.add('no-scroll');
        if (menuIconOpen) menuIconOpen.classList.add('hidden');
        if (menuIconClose) menuIconClose.classList.remove('hidden');
    };

    const closeSidebar = () => {
        sidebar.classList.remove('is-open');
        overlay.classList.remove('opacity-50', 'pointer-events-auto');
        overlay.classList.add('hidden');
        body.classList.remove('no-scroll');
        if (menuIconOpen) menuIconOpen.classList.remove('hidden');
        if (menuIconClose) menuIconClose.classList.add('hidden');
    };

    toggleButton.addEventListener('click', () => {
        if (sidebar.classList.contains('is-open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    overlay.addEventListener('click', closeSidebar);

    document.querySelectorAll('#sidebar a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 1024) closeSidebar();
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) closeSidebar();
    });

    // --- Logica di aggiornamento dinamico per Utente Loggato ---
    function updateSidebarForUser() {
        const token = localStorage.getItem('jwt_token');
        const headers = document.querySelectorAll('#sidebar h3');
        let areaRiservataDiv = null;

        headers.forEach(h3 => {
            if (h3.textContent.trim() === 'Area Riservata') {
                areaRiservataDiv = h3.parentNode;
            }
        });

        if (!areaRiservataDiv) return;

        // Rimuovi tutti i link dinamici esistenti (Login, Registrazione, Profilo, Admin, Gestione Utenti, Logout)
        const dynamicLinkTexts = ['Login/Accesso', 'Registrazione', 'Profilo', 'Admin', 'Gestione Utenti', 'Logout'];
        const allDynamicLinks = areaRiservataDiv.querySelectorAll('a');
        allDynamicLinks.forEach(link => {
            const text = link.textContent.trim();
            if (dynamicLinkTexts.includes(text)) {
                link.remove();
            }
        });

        let userRole = null;
        if (token) {
            try {
                const payloadBase64 = token.split('.')[1];
                const decodedPayload = JSON.parse(atob(payloadBase64));
                userRole = decodedPayload.role;
            } catch (e) {
                console.error("Errore decoding JWT in sidebar:", e);
                localStorage.removeItem('jwt_token');
                userRole = null;
            }
        }

        if (token && userRole) {
            // Utente Loggato: Aggiungi "Profilo" e "Logout"
            const profileLink = document.createElement('a');
            profileLink.href = 'profilo.html';
            profileLink.className = 'sidebar-link';
            profileLink.textContent = 'Profilo';
            areaRiservataDiv.insertBefore(profileLink, areaRiservataDiv.children[1]);

            if (userRole === 'admin') {
                // Se è anche Admin, aggiungi link admin
                const userManagementLink = document.createElement('a');
                userManagementLink.href = 'gestione-utenti.html';
                userManagementLink.className = 'sidebar-link';
                userManagementLink.textContent = 'Gestione Utenti';
                areaRiservataDiv.insertBefore(userManagementLink, areaRiservataDiv.children[1]);

                const adminLink = document.createElement('a');
                adminLink.href = 'admin.html';
                adminLink.className = 'sidebar-link';
                adminLink.textContent = 'Admin';
                areaRiservataDiv.insertBefore(adminLink, areaRiservataDiv.children[1]);
            }

            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.className = 'sidebar-link';
            logoutLink.textContent = 'Logout';
            logoutLink.onclick = (e) => {
                e.preventDefault();
                localStorage.removeItem('jwt_token');
                window.location.href = '/index.html';
            };
            areaRiservataDiv.insertBefore(logoutLink, areaRiservataDiv.children[1]);

        } else {
            // Utente non loggato: Aggiungi "Login" e "Registrazione"
            const loginLink = document.createElement('a');
            loginLink.href = 'index.html';
            loginLink.className = 'sidebar-link';
            loginLink.textContent = 'Login/Accesso';
            areaRiservataDiv.insertBefore(loginLink, areaRiservataDiv.children[1]);

            const registerLink = document.createElement('a');
            registerLink.href = 'registrazione.html';
            registerLink.className = 'sidebar-link';
            registerLink.textContent = 'Registrazione';
            areaRiservataDiv.insertBefore(registerLink, areaRiservataDiv.children[1]);
        }
    }

    // Esegui la funzione all'avvio per sistemare la sidebar
    updateSidebarForUser();
})();

(function(){
    const langToggleBtn = document.getElementById('lang-toggle-btn');
    const langIcon = document.getElementById('lang-icon');
    const langItElements = document.querySelectorAll('.lang-it');
    const langEnElements = document.querySelectorAll('.lang-en');

    function setLanguage(lang, persist = true) {
        const isItalian = lang === 'it';
        
        langItElements.forEach(el => el.hidden = !isItalian);
        langEnElements.forEach(el => el.hidden = isItalian);
        
        if (langIcon) {
            langIcon.textContent = isItalian ? '🇮🇹' : '🇬🇧';
        }
        
        document.documentElement.lang = lang;

        if (persist) {
            try { localStorage.setItem('mwt_lang', lang); } catch(e){}
        }

        // Dispatch a custom event to notify other scripts of the change
        document.dispatchEvent(new CustomEvent('languageChanged'));
    }

    // Initialize from localStorage or default to Italian
    try {
        const saved = localStorage.getItem('mwt_lang') || 'it';
        setLanguage(saved, false);
    } catch(e) {
        setLanguage('it', false);
    }

    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            const currentLang = localStorage.getItem('mwt_lang') || 'it';
            const newLang = currentLang === 'it' ? 'en' : 'it';
            setLanguage(newLang);
        });
    }
})();