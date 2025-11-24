// Global Variables
let currentUser = null;
let posts = [];
let darkMode = false;
let editingPostId = null;
let registeredUsers = []; // Store all registered users
let uploadedImageData = null; // Store uploaded image data
let currentUploadTab = 'url';
let cropRotation = 0;
let cropFlipH = 1;
let cropFlipV = 1;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    checkAuth();
    setupDragAndDrop();
});

// Local Storage Functions
function loadFromLocalStorage() {
    const savedUser = localStorage.getItem('socialMediaUser');
    const savedPosts = localStorage.getItem('socialMediaPosts');
    const savedTheme = localStorage.getItem('darkMode');
    const savedRegisteredUsers = localStorage.getItem('registeredUsers');

    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
    if (savedPosts) {
        posts = JSON.parse(savedPosts);
    }
    if (savedTheme) {
        darkMode = JSON.parse(savedTheme);
        if (darkMode) {
            document.body.classList.add('dark-mode');
            document.getElementById('themeIcon').textContent = '☀️';
        }
    }
    if (savedRegisteredUsers) {
        registeredUsers = JSON.parse(savedRegisteredUsers);
    }
}

function savePosts() {
    localStorage.setItem('socialMediaPosts', JSON.stringify(posts));
}

function saveUser() {
    localStorage.setItem('socialMediaUser', JSON.stringify(currentUser));
}

function saveRegisteredUsers() {
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
}

function saveTheme() {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
}

// Authentication Functions
function checkAuth() {
    if (currentUser) {
        showMainApp();
    } else {
        showAuthScreen();
    }
}

function showAuthScreen() {
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
}

function showMainApp() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    updateUserUI();
    renderPosts();
}

function toggleAuthForm() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        // Clear signup fields
        document.getElementById('signupName').value = '';
        document.getElementById('signupEmail').value = '';
        document.getElementById('signupPassword').value = '';
        document.getElementById('signupConfirmPassword').value = '';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        // Clear login fields
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
    }
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Password validation
function isValidPassword(password) {
    return password.length >= 6;
}

// Name validation
function isValidName(name) {
    return name.length >= 2;
}

function handleSignup() {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        alert('❌ Please fill in all fields!');
        return;
    }

    if (!isValidName(name)) {
        alert('❌ Name must be at least 2 characters long!');
        return;
    }

    if (!isValidEmail(email)) {
        alert('❌ Please enter a valid email address!');
        return;
    }

    if (!isValidPassword(password)) {
        alert('❌ Password must be at least 6 characters long!');
        return;
    }

    if (password !== confirmPassword) {
        alert('❌ Passwords do not match! Please try again.');
        return;
    }

    // Check if user already exists
    const userExists = registeredUsers.find(user => user.email === email);
    if (userExists) {
        alert('❌ User with this email already exists! Please login.');
        toggleAuthForm(); // Switch to login form
        document.getElementById('loginEmail').value = email;
        return;
    }

    // Register new user
    const newUser = {
        name: name,
        email: email,
        password: password // In real app, this should be hashed
    };

    registeredUsers.push(newUser);
    saveRegisteredUsers();

    // Auto login after signup
    currentUser = {
        name: name,
        email: email
    };

    saveUser();
    
    // Clear form
    document.getElementById('signupName').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('signupConfirmPassword').value = '';

    alert('✅ Account created successfully!');
    showMainApp();
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Validation
    if (!email || !password) {
        alert('❌ Please fill in all fields!');
        return;
    }

    if (!isValidEmail(email)) {
        alert('❌ Please enter a valid email address!');
        return;
    }

    // Check if user exists
    const user = registeredUsers.find(u => u.email === email);
    
    if (!user) {
        alert('❌ No account found with this email! Please signup first.');
        toggleAuthForm(); // Switch to signup form
        document.getElementById('signupEmail').value = email;
        return;
    }

    // Check password
    if (user.password !== password) {
        alert('❌ Incorrect password! Please try again.');
        return;
    }

    // Login successful
    currentUser = {
        name: user.name,
        email: user.email
    };

    saveUser();
    
    // Clear form
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';

    alert('✅ Login successful! Welcome back, ' + user.name + '!');
    showMainApp();
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        localStorage.removeItem('socialMediaUser');
        showAuthScreen();
    }
}

function updateUserUI() {
    const avatarLetter = currentUser.name[0].toUpperCase();
    document.getElementById('headerAvatar').textContent = avatarLetter;
    document.getElementById('postAvatar').textContent = avatarLetter;
    document.getElementById('headerUsername').textContent = currentUser.name;
}

// Dark Mode Toggle
function toggleDarkMode() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode');
    document.getElementById('themeIcon').textContent = darkMode ? '☀️' : '🌙';
    saveTheme();
}

// Post Functions
function createPost() {
    const text = document.getElementById('postText').value.trim();
    const image = document.getElementById('postImage').value.trim();

    // Validation
    if (!text) {
        alert('❌ Please write something in your post!');
        return;
    }

    if (text.length < 3) {
        alert('❌ Post must be at least 3 characters long!');
        return;
    }

    if (text.length > 5000) {
        alert('❌ Post is too long! Maximum 5000 characters allowed.');
        return;
    }

    // Validate image URL if provided
    if (image && !isValidURL(image)) {
        alert('❌ Please enter a valid image URL!');
        return;
    }

    const newPost = {
        id: Date.now(),
        text: text,
        image: image,
        author: currentUser.name,
        authorEmail: currentUser.email,
        timestamp: new Date().toISOString(),
        likes: 0,
        liked: false
    };

    posts.unshift(newPost);
    savePosts();

    // Clear form
    document.getElementById('postText').value = '';
    document.getElementById('postImage').value = '';

    alert('✅ Post created successfully!');
    renderPosts();
}

// URL validation
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function deletePost(postId) {
    const post = posts.find(p => p.id === postId);
    
    // Check if user owns this post
    if (post.authorEmail !== currentUser.email) {
        alert('❌ You can only delete your own posts!');
        return;
    }

    if (confirm('⚠️ Are you sure you want to delete this post?')) {
        posts = posts.filter(post => post.id !== postId);
        savePosts();
        renderPosts();
        alert('✅ Post deleted successfully!');
    }
}

function toggleLike(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.liked = !post.liked;
        post.likes = post.liked ? post.likes + 1 : post.likes - 1;
        savePosts();
        renderPosts();
    }
}

function openEditModal(postId) {
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
        alert('❌ Post not found!');
        return;
    }

    // Check if user owns this post
    if (post.authorEmail !== currentUser.email) {
        alert('❌ You can only edit your own posts!');
        return;
    }
    
    editingPostId = postId;
    document.getElementById('editText').value = post.text;
    document.getElementById('editImage').value = post.image || '';
    document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
    editingPostId = null;
    document.getElementById('editText').value = '';
    document.getElementById('editImage').value = '';
    document.getElementById('editModal').classList.remove('active');
}

function saveEdit() {
    const text = document.getElementById('editText').value.trim();
    const image = document.getElementById('editImage').value.trim();

    // Validation
    if (!text) {
        alert('❌ Post cannot be empty!');
        return;
    }

    if (text.length < 3) {
        alert('❌ Post must be at least 3 characters long!');
        return;
    }

    if (text.length > 5000) {
        alert('❌ Post is too long! Maximum 5000 characters allowed.');
        return;
    }

    // Validate image URL if provided
    if (image && !isValidURL(image)) {
        alert('❌ Please enter a valid image URL!');
        return;
    }

    const post = posts.find(p => p.id === editingPostId);
    if (post) {
        post.text = text;
        post.image = image;
        savePosts();
        renderPosts();
        closeEditModal();
        alert('✅ Post updated successfully!');
    }
}

// Render Posts
function renderPosts() {
    const feed = document.getElementById('postsFeed');
    const filteredPosts = getFilteredAndSortedPosts();

    if (filteredPosts.length === 0) {
        feed.innerHTML = `
            <div class="card empty-state">
                <div class="empty-state-icon">📝</div>
                <h3>No posts yet</h3>
                <p>Be the first to share something!</p>
            </div>
        `;
        return;
    }

    feed.innerHTML = filteredPosts.map(post => {
        const isOwnPost = post.authorEmail === currentUser.email;
        return `
        <div class="post-card">
            <div class="post-header">
                <div class="post-author">
                    <div class="user-avatar">${post.author[0].toUpperCase()}</div>
                    <div class="post-author-info">
                        <h3>${post.author}</h3>
                        <div class="post-time">${formatTime(post.timestamp)}</div>
                    </div>
                </div>
                ${isOwnPost ? `
                <div class="post-actions">
                    <button class="icon-btn-small" onclick="openEditModal(${post.id})" title="Edit">
                        ✏️
                    </button>
                    <button class="icon-btn-small" onclick="deletePost(${post.id})" title="Delete">
                        🗑️
                    </button>
                </div>
                ` : ''}
            </div>
            <div class="post-content">${escapeHtml(post.text)}</div>
            ${post.image ? `<img src="${escapeHtml(post.image)}" alt="Post image" class="post-image" onerror="this.style.display='none'">` : ''}
            <div class="post-footer">
                <button class="like-btn ${post.liked ? 'liked' : ''}" onclick="toggleLike(${post.id})">
                    <span class="heart-icon">${post.liked ? '❤️' : '🤍'}</span>
                    <span>${post.likes} ${post.likes === 1 ? 'Like' : 'Likes'}</span>
                </button>
            </div>
        </div>
    `}).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Filter and Sort Posts
function getFilteredAndSortedPosts() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const sortBy = document.getElementById('sortSelect').value;

    let filtered = posts.filter(post => 
        post.text.toLowerCase().includes(searchQuery) ||
        post.author.toLowerCase().includes(searchQuery)
    );

    if (sortBy === 'latest') {
        filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (sortBy === 'oldest') {
        filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } else if (sortBy === 'mostLiked') {
        filtered.sort((a, b) => b.likes - a.likes);
    }

    return filtered;
}

function filterPosts() {
    renderPosts();
}

// Format Time
function formatTime(timestamp) {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - postTime) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    // For older posts, show date
    return postTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Enter to submit post (Ctrl/Cmd + Enter)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const postText = document.getElementById('postText');
        const editText = document.getElementById('editText');
        
        if (postText === document.activeElement) {
            createPost();
        } else if (editText === document.activeElement) {
            saveEdit();
        }
    }
    
    // Escape to close modal
    if (e.key === 'Escape') {
        closeEditModal();
    }
});

// Handle Enter key in login/signup forms
document.addEventListener('DOMContentLoaded', () => {
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const signupName = document.getElementById('signupName');
    const signupEmail = document.getElementById('signupEmail');
    const signupPassword = document.getElementById('signupPassword');

    if (loginEmail) {
        loginPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }

    if (signupPassword) {
        signupPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                // Move to confirm password or submit
                const confirmPassword = document.getElementById('signupConfirmPassword');
                if (document.activeElement === signupPassword) {
                    confirmPassword.focus();
                } else if (document.activeElement === confirmPassword) {
                    handleSignup();
                }
            }
        });
        
        const confirmPassword = document.getElementById('signupConfirmPassword');
        confirmPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSignup();
        });
    }
});

// Password visibility toggle function
function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    const eyeIcon = button.querySelector('.eye-icon');
    
    if (input.type === 'password') {
        input.type = 'text';
        eyeIcon.textContent = '🔓';
    } else {
        input.type = 'password';
        eyeIcon.textContent = '🔒';
    }
}

// Upload Tab Switching
function switchUploadTab(tab) {
    currentUploadTab = tab;
    const urlUpload = document.getElementById('urlUpload');
    const fileUpload = document.getElementById('fileUpload');
    const tabs = document.querySelectorAll('.upload-tab');
    
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'url') {
        urlUpload.style.display = 'block';
        fileUpload.style.display = 'none';
        tabs[0].classList.add('active');
        uploadedImageData = null;
    } else {
        urlUpload.style.display = 'none';
        fileUpload.style.display = 'block';
        tabs[1].classList.add('active');
        document.getElementById('postImage').value = '';
    }
}

// Drag and Drop Setup
function setupDragAndDrop() {
    const dragDropArea = document.getElementById('dragDropArea');
    
    if (!dragDropArea) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dragDropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dragDropArea.addEventListener(eventName, () => {
            dragDropArea.classList.add('drag-over');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dragDropArea.addEventListener(eventName, () => {
            dragDropArea.classList.remove('drag-over');
        }, false);
    });
    
    dragDropArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleImageFile(files[0]);
        }
    }, false);
}

// Handle Image Upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        handleImageFile(file);
    }
}

function handleImageFile(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('❌ Please upload an image file!');
        return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('❌ Image size must be less than 5MB!');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedImageData = e.target.result;
        showImagePreview(uploadedImageData);
    };
    reader.readAsDataURL(file);
}

function showImagePreview(imageData) {
    const preview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const dragDropArea = document.getElementById('dragDropArea');
    
    previewImg.src = imageData;
    preview.style.display = 'block';
    dragDropArea.style.display = 'none';
}

function removeImage() {
    uploadedImageData = null;
    const preview = document.getElementById('imagePreview');
    const dragDropArea = document.getElementById('dragDropArea');
    const fileInput = document.getElementById('imageFileInput');
    
    preview.style.display = 'none';
    dragDropArea.style.display = 'block';
    fileInput.value = '';
}

// Crop Modal Functions
function openCropModal() {
    if (!uploadedImageData) return;
    
    const modal = document.getElementById('cropModal');
    const cropImage = document.getElementById('cropImage');
    
    cropImage.src = uploadedImageData;
    cropRotation = 0;
    cropFlipH = 1;
    cropFlipV = 1;
    updateCropTransform();
    
    modal.classList.add('active');
}

function closeCropModal() {
    document.getElementById('cropModal').classList.remove('active');
}

function rotateCropImage(degrees) {
    cropRotation = (cropRotation + degrees) % 360;
    updateCropTransform();
}

function flipCropImage(direction) {
    if (direction === 'horizontal') {
        cropFlipH *= -1;
    } else {
        cropFlipV *= -1;
    }
    updateCropTransform();
}

function updateCropTransform() {
    const cropImage = document.getElementById('cropImage');
    cropImage.style.transform = `rotate(${cropRotation}deg) scaleX(${cropFlipH}) scaleY(${cropFlipV})`;
}

function applyCrop() {
    const cropImage = document.getElementById('cropImage');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = cropImage.naturalWidth;
    canvas.height = cropImage.naturalHeight;
    
    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(cropRotation * Math.PI / 180);
    ctx.scale(cropFlipH, cropFlipV);
    ctx.drawImage(cropImage, -canvas.width / 2, -canvas.height / 2);
    
    // Get cropped image data with high quality
    uploadedImageData = canvas.toDataURL('image/jpeg', 0.95);
    showImagePreview(uploadedImageData);
    closeCropModal();
}

// Modified createPost function
function createPost() {
    const text = document.getElementById('postText').value.trim();
    let imageData = '';
    
    if (currentUploadTab === 'url') {
        imageData = document.getElementById('postImage').value.trim();
    } else {
        imageData = uploadedImageData || '';
    }

    // Validation
    if (!text) {
        alert('❌ Please write something in your post!');
        return;
    }

    if (text.length < 3) {
        alert('❌ Post must be at least 3 characters long!');
        return;
    }

    if (text.length > 5000) {
        alert('❌ Post is too long! Maximum 5000 characters allowed.');
        return;
    }

    // Validate image URL if provided and using URL tab
    if (currentUploadTab === 'url' && imageData && !isValidURL(imageData)) {
        alert('❌ Please enter a valid image URL!');
        return;
    }

    const newPost = {
        id: Date.now(),
        text: text,
        image: imageData,
        author: currentUser.name,
        authorEmail: currentUser.email,
        timestamp: new Date().toISOString(),
        likes: 0,
        liked: false
    };

    posts.unshift(newPost);
    savePosts();

    // Clear form
    document.getElementById('postText').value = '';
    document.getElementById('postImage').value = '';
    removeImage();

    alert('✅ Post created successfully!');
    renderPosts();
}