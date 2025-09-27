// =============
// MOBILE SETUP
// =============
(function () {
    const meta = document.createElement("meta");
    meta.name = "viewport";
    meta.content = "width=device-width, initial-scale=1.0";
    document.head.appendChild(meta);

    const style = document.createElement("style");
    style.textContent = `
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        img { max-width: 100%; height: auto; }
        .container { width: 90%; max-width: 1200px; margin: auto; }
        .error { color: #e74c3c; padding: 10px; }
        /* Floating Cart */
        #floatingCart {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 12px 16px;
            border-radius: 50px;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            display: none;
            cursor: pointer;
        }
        /* Login Modal */
        .modal {
            display: none;
            position: fixed;
            z-index: 2000;
            left: 0; top: 0;
            width: 100%; height: 100%;
            background-color: rgba(0,0,0,0.5);
        }
        .modal-content {
            background-color: white;
            margin: 10% auto;
            padding: 30px;
            width: 90%;
            max-width: 400px;
            border-radius: 10px;
            position: relative;
        }
        .close {
            position: absolute;
            right: 15px;
            top: 10px;
            font-size: 28px;
            cursor: pointer;
        }
        .modal input {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 6px;
            box-sizing: border-box;
        }
        .modal button {
            width: 100%;
            padding: 12px;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
        }
        .modal button:hover { background: #2980b9; }
    `;
    document.head.appendChild(style);
})();

// =============
// GLOBAL STATE
// =============
let componentsLoaded = 0;
const TOTAL_COMPONENTS = 4;
let cartItems = [];

// =============
// DOM READY
// =============
document.addEventListener('DOMContentLoaded', function () {
    loadComponent('header-container', 'header.html');
    loadComponent('slides-container', 'slides.html');
    loadComponent('content-container', 'content.html');
    loadComponent('footer-container', 'footer.html');
});

// =============
// LOAD COMPONENTS
// =============
function loadComponent(containerId, filePath) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Container #${containerId} missing.`);
        onComponentLoaded();
        return;
    }

    fetch(filePath)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load ${filePath}`);
            return response.text();
        })
        .then(data => {
            container.innerHTML = data;

            // Initialize specific logic
            if (containerId === 'header-container') {
                initHeaderEvents();
            } else if (containerId === 'content-container') {
                initContentEvents(); // ← This handles floating cart & login
            }
        })
        .catch(err => {
            console.error('Load error:', err);
            container.innerHTML = `<p class="error">⚠️ Failed to load ${filePath}</p>`;
        })
        .finally(() => {
            onComponentLoaded();
        });
}

function onComponentLoaded() {
    componentsLoaded++;
    if (componentsLoaded === TOTAL_COMPONENTS) {
        console.log('✅ All components loaded. Initializing Firebase...');
        initFirebase();
    }
}

// =============
// HEADER EVENTS
// =============
function initHeaderEvents() {
    const triggers = {
        'locationTrigger': () => alert('📍 Location selector would open'),
        'loginTrigger': () => {
            const modal = document.getElementById('loginModal');
            if (modal) modal.style.display = 'block';
        },
        'cartTrigger': () => {
            alert(`🛒 Your cart has ${cartItems.length} item(s)`);
        }
    };

    Object.entries(triggers).forEach(([id, fn]) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', e => {
            e.preventDefault();
            fn();
        });
    });
}

// =============
// CONTENT EVENTS (Floating Cart + Login Modal)
// =============
function initContentEvents() {
    const content = document.getElementById('content-container');
    if (!content) return;

    // --- Floating Cart UI ---
    const floatingCart = document.getElementById('floatingCart');
    const cartCountEl = document.getElementById('cartCount');

    // Update cart UI
    function updateCartUI() {
        if (cartCountEl) cartCountEl.textContent = cartItems.length;
        if (floatingCart) floatingCart.style.display = cartItems.length > 0 ? 'block' : 'none';
    }

    // Add to cart (delegated)
    content.addEventListener('click', e => {
        if (e.target.classList.contains('add-to-cart')) {
            const itemCard = e.target.closest('.menu-item, .offer-card');
            const name = itemCard?.querySelector('h3')?.innerText || 'Item';
            cartItems.push({ name, id: Date.now() });
            updateCartUI();
            alert(`✅ Added "${name}" to cart!`);
        }
    });

    // --- Login Modal ---
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeBtn = loginModal?.querySelector('.close');
    const submitBtn = document.getElementById('submitLogin');

    if (loginBtn && loginModal) {
        loginBtn.onclick = () => loginModal.style.display = 'block';
    }

    if (closeBtn) {
        closeBtn.onclick = () => loginModal.style.display = 'none';
    }

    if (submitBtn) {
        submitBtn.onclick = () => {
            const email = document.getElementById('email')?.value;
            const password = document.getElementById('password')?.value;
            if (email && password) {
                alert(`🔐 Login submitted for: ${email}`);
                loginModal.style.display = 'none';
                // TODO: Integrate Firebase Auth
            } else {
                alert('📧 Please enter email and password');
            }
        };
    }

    // Close modal on outside click
    window.onclick = (e) => {
        if (loginModal && e.target === loginModal) {
            loginModal.style.display = 'none';
        }
    };

    updateCartUI(); // Initialize UI
}

// =============
// FIREBASE
// =============
function initFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase SDK not loaded!');
        loadFallbackContent();
        return;
    }

    if (firebase.apps.length === 0) {
        const config = {
            apiKey: "AIzaSyCPbOZwAZEMiC1LSDSgnSEPmSxQ7-pR2oQ",
            authDomain: "mirdhuna-25542.firebaseapp.com",
            databaseURL: "https://mirdhuna-25542-default-rtdb.firebaseio.com", // ✅ no space
            projectId: "mirdhuna-25542",
            storageBucket: "mirdhuna-25542.firebasestorage.app",
            messagingSenderId: "575924409876",
            appId: "1:575924409876:web:6ba1ed88ce941d9c83b901"
        };
        firebase.initializeApp(config);
        console.log('✅ Firebase initialized');
    }

    loadFirebaseContent();
}

function loadFirebaseContent() {
    const db = firebase.database();

    const fallbacks = {
        slides: getFallbackSlides(),
        categories: getFallbackCategories(),
        offers: getFallbackOffers(),
        menu: getFallbackMenuItems(),
        reviews: getFallbackReviews()
    };

    const refs = ['slides', 'categories', 'offers', 'menu', 'reviews'];
    refs.forEach(refPath => {
        db.ref(refPath).once('value')
            .then(snapshot => {
                const data = snapshot.val();
                const renderFn = {
                    slides: renderSlides,
                    categories: renderCategories,
                    offers: renderOffers,
                    menu: renderMenuItems,
                    reviews: renderReviews
                }[refPath];
                renderFn(data ? Object.values(data) : fallbacks[refPath]);
            })
            .catch(err => {
                console.error(`Failed to load ${refPath}:`, err);
                const renderFn = { /* same as above */ }[refPath];
                renderFn(fallbacks[refPath]);
            });
    });
}

// =============
// FALLBACK DATA
// =============
function getFallbackSlides() { return [/* ... same as before ... */]; }
function getFallbackCategories() { return [/* ... */]; }
function getFallbackOffers() { return [/* ... */]; }
function getFallbackMenuItems() { return [/* ... */]; }
function getFallbackReviews() { return [/* ... */]; }

// For brevity, reuse your original fallback arrays here (ensure no leading/trailing spaces in URLs)

// =============
// RENDER FUNCTIONS (use escapeHtml for safety)
// =============
function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '<', '>': '>', '"': '&quot;', "'": '&#039;' }[m]));
}

// Example renderSlides (others follow same pattern)
function renderSlides(slides) {
    const slider = document.getElementById('slider');
    if (!slider) return;
    slider.innerHTML = slides.map(s => `
        <div class="slide" style="background-image: url('${s.image}');">
            <div class="slide-content">
                <h2>${escapeHtml(s.title)}</h2>
                <p>${escapeHtml(s.description)}</p>
                <a href="#menu" class="cta-button">Order Now</a>
            </div>
        </div>
    `).join('');
    initSliderNavigation(slides.length);
}

// Include your original renderCategories, renderOffers, etc. here (with escapeHtml)

function initSliderNavigation(count) {
    // Your original slider logic (prev/next/dots/auto)
}

// =============
// FINAL NOTE
// =============
// Make sure your index.html includes:
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
// <script src="loadhtml.js"></script>
