// Mobile-friendly setup
(function () {
    const meta = document.createElement("meta");
    meta.name = "viewport";
    meta.content = "width=device-width, initial-scale=1.0";
    document.head.appendChild(meta);

    const style = document.createElement("style");
    style.textContent = `
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        img { max-width: 100%; height: auto; }
        iframe { max-width: 100%; height: auto; }
        table { width: 100%; border-collapse: collapse; }
        td, th { word-wrap: break-word; padding: 8px; }
        .container { width: 90%; margin: auto; }
        nav { display: flex; flex-wrap: wrap; justify-content: space-between; }
        h1, h2, h3, p { word-wrap: break-word; }
    `;
    document.head.appendChild(style);

    function adjustFontSize() {
        document.body.style.fontSize = window.innerWidth < 600 ? "16px" : "18px";
    }
    window.addEventListener("resize", adjustFontSize);
    window.addEventListener("load", adjustFontSize);
})();

// Global state
let componentsLoaded = 0;
const TOTAL_COMPONENTS = 4;

// Wait until DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    loadComponent('header-container', 'header.html');
    loadComponent('slides-container', 'slides.html');
    loadComponent('content-container', 'content.html');
    loadComponent('footer-container', 'footer.html');
});

function loadComponent(containerId, filePath) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Container #${containerId} not found.`);
        onComponentLoaded();
        return;
    }

    fetch(filePath)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.text();
        })
        .then(data => {
            container.innerHTML = data;

            // Initialize specific events if needed
            if (containerId === 'header-container') {
                initHeaderEvents();
            } else if (containerId === 'slides-container') {
                // Slider will be initialized after Firebase data loads
            } else if (containerId === 'content-container') {
                initContentEvents();
            }
        })
        .catch(error => {
            console.error(`Failed to load ${filePath}:`, error);
            container.innerHTML = '<p class="error">Failed to load content.</p>';
        })
        .finally(() => {
            onComponentLoaded();
        });
}

function onComponentLoaded() {
    componentsLoaded++;
    if (componentsLoaded === TOTAL_COMPONENTS) {
        console.log('All components loaded. Initializing Firebase...');
        initFirebase();
    }
}

// Header event handlers
function initHeaderEvents() {
    const triggers = {
        'locationTrigger': () => alert('Location selection would open here'),
        'loginTrigger': () => alert('Login modal would open here'),
        'cartTrigger': () => alert('Cart would open here')
    };

    Object.entries(triggers).forEach(([id, handler]) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', e => {
            e.preventDefault();
            handler();
        });
    });
}

// Content event delegation (for dynamic buttons)
function initContentEvents() {
    const content = document.getElementById('content-container');
    if (!content) return;

    content.addEventListener('click', function (e) {
        // Handle "Add to Cart"
        if (e.target.classList.contains('add-to-cart')) {
            const itemCard = e.target.closest('.menu-item, .offer-card');
            const itemName = itemCard?.querySelector('h3')?.innerText || 'Unknown item';
            alert(`Added "${itemName}" to cart!`);
            // TODO: Implement real cart logic
        }
    });
}

// Firebase initialization
function initFirebase() {
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded. Please include Firebase scripts in HTML.');
        loadFallbackContent();
        return;
    }

    if (firebase.apps.length === 0) {
        const firebaseConfig = {
            apiKey: "AIzaSyCPbOZwAZEMiC1LSDSgnSEPmSxQ7-pR2oQ",
            authDomain: "mirdhuna-25542.firebaseapp.com",
            databaseURL: "https://mirdhuna-25542-default-rtdb.firebaseio.com", // ✅ Fixed trailing space
            projectId: "mirdhuna-25542",
            storageBucket: "mirdhuna-25542.firebasestorage.app",
            messagingSenderId: "575924409876",
            appId: "1:575924409876:web:6ba1ed88ce941d9c83b901",
            measurementId: "G-YB7LDKHBPV"
        };

        firebase.initializeApp(firebaseConfig);
        console.log('Firebase initialized');
    }

    loadFirebaseContent();
}

// Load data from Firebase or fallback
function loadFirebaseContent() {
    const db = firebase.database();

    // Helper to safely render with fallback
    function loadData(refPath, renderFn, fallbackData) {
        db.ref(refPath).once('value')
            .then(snapshot => {
                const data = snapshot.val();
                if (data) {
                    renderFn(Object.values(data));
                } else {
                    console.warn(`No data at ${refPath}, using fallback.`);
                    renderFn(fallbackData);
                }
            })
            .catch(err => {
                console.error(`Error loading ${refPath}:`, err);
                renderFn(fallbackData);
            });
    }

    // Load all sections
    loadData('slides', renderSlides, getFallbackSlides());
    loadData('categories', renderCategories, getFallbackCategories());
    loadData('offers', renderOffers, getFallbackOffers());
    loadData('menu', renderMenuItems, getFallbackMenuItems());
    loadData('reviews', renderReviews, getFallbackReviews());
}

// --- Fallback Data ---
function getFallbackSlides() {
    return [
        { title: "Authentic South Indian Flavors", description: "Experience the rich and diverse cuisine of South India with our traditional recipes", image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80" },
        { title: "Healthy & Organic Options", description: "Choose from our wide selection of healthy, organic meals prepared with fresh ingredients", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=1081&q=80" },
        { title: "Special Offers This Week", description: "Get 20% off on all South Indian dishes and free delivery for orders over ₹500", image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3&auto=format&fit=crop&w=1171&q=80" }
    ];
}

function getFallbackCategories() {
    return [
        { name: "South Indian", description: "Traditional dishes with authentic flavors", image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80" },
        { name: "Pizza", description: "Freshly baked with premium ingredients", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=1081&q=80" },
        { name: "Burgers", description: "Juicy, flavorful, and satisfying", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80" },
        { name: "Mexican", description: "Spicy, bold, and authentic flavors", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1587&q=80" }
    ];
}

function getFallbackOffers() {
    return [
        { name: "Truffle Pasta Special", description: "Handmade pasta with black truffle, parmesan, and fresh herbs", badge: "20% OFF", price: 380, originalPrice: 475, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=1081&q=80" },
        { name: "Dragon Roll Deal", description: "Eel, avocado, cucumber topped with spicy tuna and eel sauce", badge: "BUY 1 GET 1", price: 450, image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80" },
        { name: "Gourmet Burger Bundle", description: "Angus beef, aged cheddar, caramelized onions, and truffle aioli", badge: "FREE DELIVERY", price: 335, image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3&auto=format&fit=crop&w=1171&q=80" }
    ];
}

function getFallbackMenuItems() {
    return [
        { name: "Truffle Pasta", description: "Handmade pasta with black truffle, parmesan, and fresh herbs", badge: "Chef's Special", price: 475, rating: 4.5, reviews: 128, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=1081&q=80" },
        { name: "Dragon Roll", description: "Eel, avocado, cucumber topped with spicy tuna and eel sauce", badge: "New", price: 550, rating: 4.0, reviews: 96, image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80" },
        { name: "Gourmet Burger", description: "Angus beef, aged cheddar, caramelized onions, and truffle aioli", badge: "Popular", price: 420, rating: 5.0, reviews: 245, image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3&auto=format&fit=crop&w=1171&q=80" }
    ];
}

function getFallbackReviews() {
    return [
        { name: "Deepak Sharma", role: "Food Enthusiast", comment: "The dosa at MIRDHUNA is absolutely divine! The quality of ingredients and presentation was exceptional. Will definitely order again!", stars: 5 },
        { name: "Priya Patel", role: "Regular Customer", comment: "Fast delivery and the food arrived hot and fresh. The biryani was the best I've had in months. Highly recommended!", stars: 4.5 },
        { name: "Rajesh Kumar", role: "Food Blogger", comment: "As a food blogger, I'm picky about quality. MIRDHUNA exceeded my expectations. The idli was a masterpiece!", stars: 5 }
    ];
}

// --- Render Functions ---
function renderSlides(slides) {
    const slider = document.getElementById('slider');
    const nav = document.getElementById('sliderNav');
    if (!slider) return;

    slider.innerHTML = slides.map(slide => `
        <div class="slide" style="background-image: url('${slide.image}');">
            <div class="slide-content">
                <h2>${escapeHtml(slide.title)}</h2>
                <p>${escapeHtml(slide.description)}</p>
                <a href="#menu" class="cta-button">Order Now</a>
            </div>
        </div>
    `).join('');

    if (nav) {
        nav.innerHTML = slides.map((_, i) => 
            `<div class="slider-dot ${i === 0 ? 'active' : ''}"></div>`
        ).join('');
    }

    initSliderNavigation(slides.length);
}

function initSliderNavigation(count) {
    const prev = document.querySelector('.prev');
    const next = document.querySelector('.next');
    const slider = document.getElementById('slider');
    const dots = document.querySelectorAll('.slider-dot');
    let index = 0;

    const update = () => {
        if (slider) slider.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
    };

    if (prev) prev.onclick = () => { index = (index - 1 + count) % count; update(); };
    if (next) next.onclick = () => { index = (index + 1) % count; update(); };
    dots.forEach((d, i) => d.onclick = () => { index = i; update(); });

    // Auto-rotate
    setInterval(() => { index = (index + 1) % count; update(); }, 5000);
}

function renderCategories(categories) {
    const el = document.getElementById('categoriesContainer');
    if (!el) return;
    el.innerHTML = categories.map(cat => `
        <div class="category-card">
            <div class="category-img" style="background-image: url('${cat.image}');"></div>
            <div class="category-content">
                <h3>${escapeHtml(cat.name)}</h3>
                <p>${escapeHtml(cat.description)}</p>
            </div>
        </div>
    `).join('');
}

function renderOffers(offers) {
    const el = document.getElementById('offersContainer');
    if (!el) return;
    el.innerHTML = offers.map(offer => `
        <div class="offer-card">
            <div class="offer-img" style="background-image: url('${offer.image}');">
                <div class="offer-badge">${escapeHtml(offer.badge)}</div>
            </div>
            <div class="offer-content">
                <h3>${escapeHtml(offer.name)}</h3>
                <p>${escapeHtml(offer.description)}</p>
                <div class="price">₹${offer.price}${offer.originalPrice ? ` <span style="text-decoration:line-through;color:#777;">₹${offer.originalPrice}</span>` : ''}</div>
                <div class="offer-actions">
                    <button class="add-to-cart">Add to Cart</button>
                    <div class="offer-timer">Ends in 24:15:30</div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderMenuItems(items) {
    const el = document.getElementById('menuContainer');
    if (!el) return;
    el.innerHTML = items.map(item => {
        const fullStars = Math.floor(item.rating);
        const hasHalf = item.rating % 1 >= 0.5;
        const starsHtml = '★'.repeat(fullStars) + (hasHalf ? '½' : '') + '☆'.repeat(5 - fullStars - (hasHalf ? 1 : 0));
        return `
        <div class="menu-item">
            <div class="item-img" style="background-image: url('${item.image}');">
                <div class="item-badge">${escapeHtml(item.badge)}</div>
            </div>
            <div class="item-content">
                <div class="item-header">
                    <h3>${escapeHtml(item.name)}</h3>
                    <div class="price">₹${item.price}</div>
                </div>
                <p class="item-desc">${escapeHtml(item.description)}</p>
                <div class="item-actions">
                    <div class="rating">
                        ${starsHtml} (${item.reviews})
                    </div>
                    <button class="add-to-cart">Add to Cart</button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function renderReviews(reviews) {
    const el = document.getElementById('reviewsContainer');
    if (!el) return;
    el.innerHTML = reviews.map(r => {
        const stars = '★'.repeat(Math.floor(r.stars)) + (r.stars % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.floor(r.stars) - (r.stars % 1 >= 0.5 ? 1 : 0));
        return `
        <div class="review-card">
            <div class="review-header">
                <div class="review-avatar"><i class="fas fa-user"></i></div>
                <div class="review-info">
                    <h4>${escapeHtml(r.name)}</h4>
                    <p>${escapeHtml(r.role)}</p>
                </div>
            </div>
            <div class="review-content">
                <p>"${escapeHtml(r.comment)}"</p>
                <div class="review-rating">${stars}</div>
            </div>
        </div>
        `;
    }).join('');
}

// Basic XSS protection
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
        }
