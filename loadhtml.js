// loadhtml.js
document.addEventListener('DOMContentLoaded', function() {
    // Load all components
    loadComponent('header-container', 'header.html');
    loadComponent('slides-container', 'slides.html');
    loadComponent('content-container', 'content.html');
    loadComponent('footer-container', 'footer.html');
    
    // Initialize Firebase after components are loaded
    setTimeout(initFirebase, 1000);
});

function loadComponent(containerId, filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(data => {
            document.getElementById(containerId).innerHTML = data;
            
            // Add event listeners after loading
            if (containerId === 'header-container') {
                initHeaderEvents();
            } else if (containerId === 'slides-container') {
                initSliderEvents();
            } else if (containerId === 'content-container') {
                initContentEvents();
            }
        })
        .catch(error => {
            console.error('Error loading component:', filePath, error);
            document.getElementById(containerId).innerHTML = 
                '<div class="loading"><p>Error loading content. Please try again later.</p></div>';
        });
}

function initHeaderEvents() {
    // Add event listeners for header elements
    document.getElementById('locationTrigger').addEventListener('click', function(e) {
        e.preventDefault();
        alert('Location selection would open here');
    });
    
    document.getElementById('loginTrigger').addEventListener('click', function(e) {
        e.preventDefault();
        alert('Login modal would open here');
    });
    
    document.getElementById('cartTrigger').addEventListener('click', function(e) {
        e.preventDefault();
        alert('Cart would open here');
    });
}

function initSliderEvents() {
    // Slider functionality would be initialized here
    console.log('Slider events initialized');
}

function initContentEvents() {
    // Content events would be initialized here
    console.log('Content events initialized');
}

// Firebase initialization
function initFirebase() {
    // Check if Firebase is already initialized
    if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
        // Your web app's Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyCPbOZwAZEMiC1LSDSgnSEPmSxQ7-pR2oQ",
            authDomain: "mirdhuna-25542.firebaseapp.com",
            databaseURL: "https://mirdhuna-25542-default-rtdb.firebaseio.com",
            projectId: "mirdhuna-25542",
            storageBucket: "mirdhuna-25542.firebasestorage.app",
            messagingSenderId: "575924409876",
            appId: "1:575924409876:web:6ba1ed88ce941d9c83b901",
            measurementId: "G-YB7LDKHBPV"
        };

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase initialized');
        
        // Load dynamic content from Firebase
        loadFirebaseContent();
    }
}

function loadFirebaseContent() {
    // This would fetch data from Firebase and populate the UI
    // For demonstration, we'll simulate loading with sample data
    
    // Simulate loading slides
    setTimeout(() => {
        const slidesContainer = document.getElementById('slider');
        if (slidesContainer) {
            slidesContainer.innerHTML = `
                <div class="slide" style="background-image: url('https://images.unsplash.com/photo-1606755962773-d324e0a13086?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80');">
                    <div class="slide-content">
                        <h2>Authentic South Indian Flavors</h2>
                        <p>Experience the rich and diverse cuisine of South India with our traditional recipes</p>
                        <a href="#menu" class="cta-button">Order Now</a>
                    </div>
                </div>
                <div class="slide" style="background-image: url('https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1198&q=80');">
                    <div class="slide-content">
                        <h2>Healthy & Organic Options</h2>
                        <p>Choose from our wide selection of healthy, organic meals prepared with fresh ingredients</p>
                        <a href="#menu" class="cta-button">Explore Menu</a>
                    </div>
                </div>
                <div class="slide" style="background-image: url('https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80');">
                    <div class="slide-content">
                        <h2>Special Offers This Week</h2>
                        <p>Get 20% off on all South Indian dishes and free delivery for orders over ₹500</p>
                        <a href="#menu" class="cta-button">View Offers</a>
                    </div>
                </div>
            `;
            
            // Add navigation dots
            const sliderNav = document.getElementById('sliderNav');
            if (sliderNav) {
                sliderNav.innerHTML = `
                    <div class="slider-dot active"></div>
                    <div class="slider-dot"></div>
                    <div class="slider-dot"></div>
                `;
            }
        }
    }, 1000);
    
    // Simulate loading categories
    setTimeout(() => {
        const categoriesContainer = document.getElementById('categoriesContainer');
        if (categoriesContainer) {
            categoriesContainer.innerHTML = `
                <div class="category-card">
                    <div class="category-img" style="background-image: url('https://images.unsplash.com/photo-1606755962773-d324e0a13086?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80');"></div>
                    <div class="category-content">
                        <h3>South Indian</h3>
                        <p>Traditional dishes with authentic flavors</p>
                    </div>
                </div>
                <div class="category-card">
                    <div class="category-img" style="background-image: url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1081&q=80');"></div>
                    <div class="category-content">
                        <h3>Pizza</h3>
                        <p>Freshly baked with premium ingredients</p>
                    </div>
                </div>
                <div class="category-card">
                    <div class="category-img" style="background-image: url('https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80');"></div>
                    <div class="category-content">
                        <h3>Burgers</h3>
                        <p>Juicy, flavorful, and satisfying</p>
                    </div>
                </div>
                <div class="category-card">
                    <div class="category-img" style="background-image: url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80');"></div>
                    <div class="category-content">
                        <h3>Mexican</h3>
                        <p>Spicy, bold, and authentic flavors</p>
                    </div>
                </div>
            `;
        }
    }, 1200);
    
    // Simulate loading offers
    setTimeout(() => {
        const offersContainer = document.getElementById('offersContainer');
        if (offersContainer) {
            offersContainer.innerHTML = `
                <div class="offer-card">
                    <div class="offer-img" style="background-image: url('https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1198&q=80');">
                        <div class="offer-badge">20% OFF</div>
                    </div>
                    <div class="offer-content">
                        <h3>Truffle Pasta Special</h3>
                        <p>Handmade pasta with black truffle, parmesan, and fresh herbs</p>
                        <div class="price">₹380 <span style="text-decoration: line-through; color: #777; font-size: 1rem;">₹475</span></div>
                        <div class="offer-actions">
                            <button class="add-to-cart" data-id="1" data-name="Truffle Pasta" data-price="380">Add to Cart</button>
                            <div class="offer-timer">Ends in 24:15:30</div>
                        </div>
                    </div>
                </div>
                <div class="offer-card">
                    <div class="offer-img" style="background-image: url('https://images.unsplash.com/photo-1606755962773-d324e0a13086?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80');">
                        <div class="offer-badge">BUY 1 GET 1</div>
                    </div>
                    <div class="offer-content">
                        <h3>Dragon Roll Deal</h3>
                        <p>Eel, avocado, cucumber topped with spicy tuna and eel sauce</p>
                        <div class="price">₹450</div>
                        <div class="offer-actions">
                            <button class="add-to-cart" data-id="2" data-name="Dragon Roll" data-price="450">Add to Cart</button>
                            <div class="offer-timer">Ends in 18:45:22</div>
                        </div>
                    </div>
                </div>
                <div class="offer-card">
                    <div class="offer-img" style="background-image: url('https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80');">
                        <div class="offer-badge">FREE DELIVERY</div>
                    </div>
                    <div class="offer-content">
                        <h3>Gourmet Burger Bundle</h3>
                        <p>Angus beef, aged cheddar, caramelized onions, and truffle aioli</p>
                        <div class="price">₹335</div>
                        <div class="offer-actions">
                            <button class="add-to-cart" data-id="3" data-name="Gourmet Burger" data-price="335">Add to Cart</button>
                            <div class="offer-timer">Ends in 32:10:45</div>
                        </div>
                    </div>
                </div>
            `;
        }
    }, 1400);
    
    // Simulate loading menu items
    setTimeout(() => {
        const menuContainer = document.getElementById('menuContainer');
        if (menuContainer) {
            menuContainer.innerHTML = `
                <div class="menu-item">
                    <div class="item-img" style="background-image: url('https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1198&q=80');">
                        <div class="item-badge">Chef's Special</div>
                    </div>
                    <div class="item-content">
                        <div class="item-header">
                            <h3>Truffle Pasta</h3>
                            <div class="price">₹475</div>
                        </div>
                        <p class="item-desc">Handmade pasta with black truffle, parmesan, and fresh herbs</p>
                        <div class="item-actions">
                            <div class="rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star-half-alt"></i>
                                <span>(128)</span>
                            </div>
                            <button class="add-to-cart" data-id="4" data-name="Truffle Pasta" data-price="475">Add to Cart</button>
                        </div>
                    </div>
                </div>
                <div class="menu-item">
                    <div class="item-img" style="background-image: url('https://images.unsplash.com/photo-1606755962773-d324e0a13086?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80');">
                        <div class="item-badge">New</div>
                    </div>
                    <div class="item-content">
                        <div class="item-header">
                            <h3>Dragon Roll</h3>
                            <div class="price">₹550</div>
                        </div>
                        <p class="item-desc">Eel, avocado, cucumber topped with spicy tuna and eel sauce</p>
                        <div class="item-actions">
                            <div class="rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="far fa-star"></i>
                                <span>(96)</span>
                            </div>
                            <button class="add-to-cart" data-id="5" data-name="Dragon Roll" data-price="550">Add to Cart</button>
                        </div>
                    </div>
                </div>
                <div class="menu-item">
                    <div class="item-img" style="background-image: url('https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80');">
                        <div class="item-badge">Popular</div>
                    </div>
                    <div class="item-content">
                        <div class="item-header">
                            <h3>Gourmet Burger</h3>
                            <div class="price">₹420</div>
                        </div>
                        <p class="item-desc">Angus beef, aged cheddar, caramelized onions, and truffle aioli</p>
                        <div class="item-actions">
                            <div class="rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <span>(245)</span>
                            </div>
                            <button class="add-to-cart" data-id="6" data-name="Gourmet Burger" data-price="420">Add to Cart</button>
                        </div>
                    </div>
                </div>
            `;
        }
    }, 1600);
    
    // Simulate loading reviews
    setTimeout(() => {
        const reviewsContainer = document.getElementById('reviewsContainer');
        if (reviewsContainer) {
            reviewsContainer.innerHTML = `
                <div class="review-card">
                    <div class="review-header">
                        <div class="review-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="review-info">
                            <h4>Deepak Sharma</h4>
                            <p>Food Enthusiast</p>
                        </div>
                    </div>
                    <div class="review-content">
                        <p>"The dosa at MIRDHUNA is absolutely divine! The quality of ingredients and presentation was exceptional. Will definitely order again!"</p>
                        <div class="review-rating">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                        </div>
                    </div>
                </div>
                <div class="review-card">
                    <div class="review-header">
                        <div class="review-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="review-info">
                            <h4>Priya Patel</h4>
                            <p>Regular Customer</p>
                        </div>
                    </div>
                    <div class="review-content">
                        <p>"Fast delivery and the food arrived hot and fresh. The biryani was the best I've had in months. Highly recommended!"</p>
                        <div class="review-rating">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star-half-alt"></i>
                        </div>
                    </div>
                </div>
                <div class="review-card">
                    <div class="review-header">
                        <div class="review-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="review-info">
                            <h4>Rajesh Kumar</h4>
                            <p>Food Blogger</p>
                        </div>
                    </div>
                    <div class="review-content">
                        <p>"As a food blogger, I'm picky about quality. MIRDHUNA exceeded my expectations. The idli was a masterpiece!"</p>
                        <div class="review-rating">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                        </div>
                    </div>
                </div>
            `;
        }
    }, 1800);
}
