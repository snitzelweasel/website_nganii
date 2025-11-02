document.addEventListener('DOMContentLoaded', function() {
    const feedbackForm = document.getElementById('feedback-form');
    const emailInput = document.getElementById('email');
    const feedbackTextarea = document.getElementById('feedback-text');
    const emailError = document.getElementById('email-error');
    const feedbackError = document.getElementById('feedback-error');
    const themeToggle = document.getElementById('theme-toggle');

    // Theme functionality
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    function getTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }

    // Initialize theme
    setTheme(getTheme());

    // Theme toggle event listener
    themeToggle.addEventListener('click', toggleTheme);

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showError(element, message) {
        element.textContent = message;
        const input = element.parentElement.querySelector('input, textarea');
        input.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--error-color');
    }

    function clearError(element) {
        element.textContent = '';
        const input = element.parentElement.querySelector('input, textarea');
        input.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--input-border');
    }

    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !validateEmail(email)) {
            showError(emailError, 'Please enter a valid email address');
        } else {
            clearError(emailError);
        }
    });

    emailInput.addEventListener('input', function() {
        if (emailError.textContent) {
            const email = this.value.trim();
            if (validateEmail(email)) {
                clearError(emailError);
            }
        }
    });

    feedbackTextarea.addEventListener('blur', function() {
        const feedback = this.value.trim();
        if (!feedback) {
            showError(feedbackError, 'Please provide your feedback');
        } else {
            clearError(feedbackError);
        }
    });

    feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const feedback = feedbackTextarea.value.trim();
        let isValid = true;

        clearError(emailError);
        clearError(feedbackError);

        if (!email) {
            showError(emailError, 'Email address is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError(emailError, 'Please enter a valid email address');
            isValid = false;
        }

        if (!feedback) {
            showError(feedbackError, 'Feedback is required');
            isValid = false;
        }

        if (isValid) {
            alert('Thank you for your feedback! Your message has been received.');
            feedbackForm.reset();
        }
    });

    const sections = document.querySelectorAll('.section');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    // Playlist functionality
    const PLAYLIST_PASSWORD = 'WebsiteNgani';
    const addSongBtn = document.getElementById('add-song-btn');
    const modal = document.getElementById('add-song-modal');
    const closeModal = document.querySelector('.close-modal');
    const cancelBtn = document.querySelector('.cancel-btn');
    const addSongForm = document.getElementById('add-song-form');
    const playlistContainer = document.getElementById('playlist-container');
    const iframeInput = document.getElementById('song-iframe');
    const passwordInput = document.getElementById('song-password');
    const iframeError = document.getElementById('iframe-error');
    const passwordError = document.getElementById('password-error');

    // Load saved songs from localStorage
    function loadPlaylist() {
        const songs = JSON.parse(localStorage.getItem('playlist-songs') || '[]');
        renderPlaylist(songs);
    }

    // Save songs to localStorage
    function savePlaylist(songs) {
        localStorage.setItem('playlist-songs', JSON.stringify(songs));
    }

    // Render playlist
    function renderPlaylist(songs) {
        if (songs.length === 0) {
            playlistContainer.innerHTML = '<p class="empty-playlist">No songs added yet. Click "Add Song" to get started!</p>';
            return;
        }

        playlistContainer.innerHTML = songs.map((song, index) => `
            <div class="song-embed" data-index="${index}">
                ${song.iframe}
                <div class="song-controls">
                    <button class="remove-song-btn" onclick="removeSong(${index})">🗑️ Remove</button>
                </div>
            </div>
        `).join('');
    }

    // Show modal
    function showModal() {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // Hide modal
    function hideModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        addSongForm.reset();
        clearError(iframeError);
        clearError(passwordError);
    }

    // Validate iframe
    function validateIframe(iframe) {
        const iframeRegex = /<iframe[^>]*src\s*=\s*["']https:\/\/open\.spotify\.com\/embed\/[^"']*["'][^>]*><\/iframe>/i;
        return iframeRegex.test(iframe.trim());
    }

    // Add song
    function addSong(iframe) {
        const songs = JSON.parse(localStorage.getItem('playlist-songs') || '[]');
        songs.push({ iframe: iframe.trim(), id: Date.now() });
        savePlaylist(songs);
        renderPlaylist(songs);
    }

    // Remove song (global function for onclick)
    window.removeSong = function(index) {
        if (confirm('Are you sure you want to remove this song?')) {
            const songs = JSON.parse(localStorage.getItem('playlist-songs') || '[]');
            songs.splice(index, 1);
            savePlaylist(songs);
            renderPlaylist(songs);
        }
    };

    // Event listeners
    addSongBtn.addEventListener('click', showModal);
    closeModal.addEventListener('click', hideModal);
    cancelBtn.addEventListener('click', hideModal);

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            hideModal();
        }
    });

    // Form submission
    addSongForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const iframe = iframeInput.value.trim();
        const password = passwordInput.value.trim();
        let isValid = true;

        clearError(iframeError);
        clearError(passwordError);

        // Validate iframe
        if (!iframe) {
            showError(iframeError, 'Spotify embed code is required');
            isValid = false;
        } else if (!validateIframe(iframe)) {
            showError(iframeError, 'Please enter a valid Spotify iframe embed code');
            isValid = false;
        }

        // Validate password
        if (!password) {
            showError(passwordError, 'Password is required');
            isValid = false;
        } else if (password !== PLAYLIST_PASSWORD) {
            showError(passwordError, 'Incorrect password');
            isValid = false;
        }

        if (isValid) {
            addSong(iframe);
            hideModal();
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.textContent = '✨ Song added successfully!';
            successMsg.style.cssText = `
                position: fixed; top: 20px; right: 20px;
                background: var(--accent-color); color: white;
                padding: 1rem 2rem; border: 2px solid var(--accent-color);
                box-shadow: 0 0 20px var(--accent-color); z-index: 1001;
                font-family: 'Orbitron', monospace; font-weight: 700;
            `;
            document.body.appendChild(successMsg);
            setTimeout(() => successMsg.remove(), 3000);
        }
    });

    // Load playlist on page load
    loadPlaylist();

    // Image Modal functionality
    const imageModal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const closeImageModal = document.querySelector('.close-image-modal');

    // Open image modal function (global for onclick)
    window.openImageModal = function(imgElement) {
        imageModal.style.display = 'block';
        modalImage.src = imgElement.src;
        modalImage.alt = imgElement.alt;
        document.body.style.overflow = 'hidden';
    };

    // Close image modal
    function closeImageModalFunction() {
        imageModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Event listeners for image modal
    closeImageModal.addEventListener('click', closeImageModalFunction);

    // Close modal when clicking outside the image
    imageModal.addEventListener('click', function(event) {
        if (event.target === imageModal) {
            closeImageModalFunction();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && imageModal.style.display === 'block') {
            closeImageModalFunction();
        }
    });
});