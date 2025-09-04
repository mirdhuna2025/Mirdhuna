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
    const locationTrigger = document.getElementById('locationTrigger');
    const loginTrigger = document.getElementById('loginTrigger');
    const cartTrigger = document.getElementById('cartTrigger');
    
    if (locationTrigger) {
        locationTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Location selection would open here');
        });
    }
    
    if (loginTrigger) {
        loginTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Login modal would open here');
        });
    }
    
    if (cartTrigger) {
        cartTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Cart would open here');
        });
    }
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
    const database = firebase.database();
    
    // Load slides from Firebase
    const slidesRef = database.ref('slides');
    slidesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            renderSlides(Object.values(data));
        } else {
            // Fallback content if no slides in database
            renderSlides([
                {
                    title: "Authentic South Indian Flavors",
                    description: "Experience the rich and diverse cuisine of South India with our traditional recipes",
                    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                },
                {
                    title: "Healthy & Organic Options",
                    description: "Choose from our wide selection of healthy, organic meals prepared with fresh ingredients",
                    image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1198&q=80"
                },
                {
                    title: "Special Offers This Week",
                    description: "Get 20% off on all South Indian dishes and free delivery for orders over ₹500",
                    image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80"
                }
            ]);
        }
    });
    
    // Load categories from Firebase
    const categoriesRef = database.ref('categories');
    categoriesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            renderCategories(Object.values(data));
        } else {
            // Fallback content if no categories in database
            renderCategories([
                {
                    name: "South Indian",
                    description: "Traditional dishes with authentic flavors",
                    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                },
                {
                    name: "Pizza",
                    description: "Freshly baked with premium ingredients",
                    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1081&q=80"
                },
                {
                    name: "Burgers",
                    description: "Juicy, flavorful, and satisfying",
                    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
                },
                {
                    name: "Mexican",
                    description: "Spicy, bold, and authentic flavors",
                    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80"
                }
            ]);
        }
    });
    
    // Load offers from Firebase
    const offersRef = database.ref('offers');
    offersRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            renderOffers(Object.values(data));
        } else {
            // Fallback content if no offers in database
            renderOffers([
                {
                    name: "Truffle Pasta Special",
                    description: "Handmade pasta with black truffle, parmesan, and fresh herbs",
                    badge: "20% OFF",
                    price: 380,
                    originalPrice: 475,
                    image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1198&q=80"
                },
                {
                    name: "Dragon Roll Deal",
                    description: "Eel, avocado, cucumber topped with spicy tuna and eel sauce",
                    badge: "BUY 1 GET 1",
                    price: 450,
                    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                },
                {
                    name: "Gourmet Burger Bundle",
                    description: "Angus beef, aged cheddar, caramelized onions, and truffle aioli",
                    badge: "FREE DELIVERY",
                    price: 335,
                    image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80"
                }
            ]);
        }
    });
    
    // Load menu items from Firebase
    const menuRef = database.ref('menu');
    menuRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            renderMenuItems(Object.values(data));
        } else {
            // Fallback content if no menu items in database
            renderMenuItems([
                {
                    name: "Truffle Pasta",
                    description: "Handmade pasta with black truffle, parmesan, and fresh herbs",
                    badge: "Chef's Special",
                    price: 475,
                    rating: 4.5,
                    reviews: 128,
                    image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1198&q=80"
                },
                {
                    name: "Dragon Roll",
                    description: "Eel, avocado, cucumber topped with spicy tuna and eel sauce",
                    badge: "New",
                    price: 550,
                    rating: 4.0,
                    reviews: 96,
                    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                },
                {
                    name: "Gourmet Burger",
                    description: "Angus beef, aged cheddar, caramelized onions, and truffle aioli",
                    badge: "Popular",
                    price: 420,
                    rating: 5.0,
                    reviews: 245,
                    image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80"
                }
            ]);
        }
    });
    
    // Load reviews from Firebase
    const reviewsRef = database.ref('reviews');
    reviewsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            renderReviews(Object.values(data));
        } else {
            // Fallback content if no reviews in database
            renderReviews([
                {
                    name: "Deepak Sharma",
                    role: "Food Enthusiast",
                    comment: "The dosa at MIRDHUNA is absolutely divine! The quality of ingredients and presentation was exceptional. Will definitely order again!",
                    stars: 5
                },
                {
                    name: "Priya Patel",
                    role: "Regular Customer",
                    comment: "Fast delivery and the food arrived hot and fresh. The biryani was the best I've had in months. Highly recommended!",
                    stars: 4.5
                },
                {
                    name: "Rajesh Kumar",
                    role: "Food Blogger",
                    comment: "As a food blogger, I'm picky about quality. MIRDHUNA exceeded my expectations. The idli was a masterpiece!",
                    stars: 5
                }
            ]);
        }
    });
}

// Render functions for each section
function renderSlides(slides) {
    const slider = document.getElementById('slider');
    if (!slider) return;
    
    let slidesHTML = '';
    slides.forEach((slide, index) => {
        slidesHTML += `
        <div class="slide" style="background-image: url('${slide.image}');">
            <div class="slide-content">
                <h2>${slide.title}</h2>
                <p>${slide.description}</p>
                <a href="#menu" class="cta-button">Order Now</a>
            </div>
        </div>
        `;
    });
    
    slider.innerHTML = slidesHTML;
    
    // Add navigation dots
    const sliderNav = document.getElementById('sliderNav');
    if (sliderNav) {
        let navHTML = '';
        slides.forEach((_, index) => {
            navHTML += `<div class="slider-dot ${index === 0 ? 'active' : ''}"></div>`;
        });
        sliderNav.innerHTML = navHTML;
    }
    
    // Add slider navigation functionality
    initSliderNavigation(slides.length);
}

function initSliderNavigation(slideCount) {
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const slider = document.getElementById('slider');
    const dots = document.querySelectorAll('.slider-dot');
    
    if (!prevBtn || !nextBtn || !slider) return;
    
    let currentIndex = 0;
    
    function updateSlider() {
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Update active dot
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
    
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + slideCount) % slideCount;
        updateSlider();
    });
    
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % slideCount;
        updateSlider();
    });
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateSlider();
        });
    });
    
    // Auto-slide
    setInterval(() => {
        currentIndex = (currentIndex + 1) % slideCount;
        updateSlider();
    }, 5000);
}

function renderCategories(categories) {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;
    
    let categoriesHTML = '';
    categories.forEach(category => {
        categoriesHTML += `
        <div class="category-card">
            <div class="category-img" style="background-image: url('${category.image}');"></div>
            <div class="category-content">
                <h3>${category.name}</h3>
                <p>${category.description}</p>
            </div>
        </div>
        `;
    });
    
    container.innerHTML = categoriesHTML;
}

function renderOffers(offers) {
    const container = document.getElementById('offersContainer');
    if (!container) return;
    
    let offersHTML = '';
    offers.forEach(offer => {
        offersHTML += `
        <div class="offer-card">
            <div class="offer-img" style="background-image: url('${offer.image}');">
                <div class="offer-badge">${offer.badge}</div>
            </div>
            <div class="offer-content">
                <h3>${offer.name}</h3>
                <p>${offer.description}</p>
                <div class="price">₹${offer.price} ${offer.originalPrice ? `<span style="text-decoration: line-through; color: #777; font-size: 1rem;">₹${offer.originalPrice}</span>` : ''}</div>
                <div class="offer-actions">
                    <button class="add-to-cart">Add to Cart</button>
                    <div class="offer-timer">Ends in 24:15:30</div>
                </div>
            </div>
        </div>
        `;
    });
    
    container.innerHTML = offersHTML;
}

function renderMenuItems(menuItems) {
    const container = document.getElementById('menuContainer');
    if (!container) return;
    
    let menuHTML = '';
    menuItems.forEach(item => {
        menuHTML += `
        <div class="menu-item">
            <div class="item-img" style="background-image: url('${item.image}');">
                <div class="item-badge">${item.badge}</div>
            </div>
            <div class="item-content">
                <div class="item-header">
                    <h3>${item.name}</h3>
                    <div class="price">₹${item.price}</div>
                </div>
                <p class="item-desc">${item.description}</p>
                <div class="item-actions">
                    <div class="rating">
                        ${'<i class="fas fa-star"></i>'.repeat(Math.floor(item.rating))}
                        ${item.rating % 1 ? '<i class="fas fa-star-half-alt"></i>' : ''}
                        <span>(${item.reviews})</span>
                    </div>
                    <button class="add-to-cart">Add to Cart</button>
                </div>
            </div>
        </div>
        `;
    });
    
    container.innerHTML = menuHTML;
}

function renderReviews(reviews) {
    const container = document.getElementById('reviewsContainer');
    if (!container) return;
    
    let reviewsHTML = '';
    reviews.forEach(review => {
        reviewsHTML += `
        <div class="review-card">
            <div class="review-header">
                <div class="review-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="review-info">
                    <h4>${review.name}</h4>
                    <p>${review.role}</p>
                </div>
            </div>
            <div class="review-content">
                <p>"${review.comment}"</p>
                <div class="review-rating">
                    ${'<i class="fas fa-star"></i>'.repeat(Math.floor(review.stars))}
                    ${review.stars % 1 ? '<i class="fas fa-star-half-alt"></i>' : ''}
                </div>
            </div>
        </div>
        `;
    });
    
    container.innerHTML = reviewsHTML;
                    }
// Make site fully mobile-friendly
(function () {
  // Add <meta viewport>
  const meta = document.createElement("meta");
  meta.name = "viewport";
  meta.content = "width=device-width, initial-scale=1.0";
  document.head.appendChild(meta);

  // Add responsive CSS
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

  // Adjust font size dynamically
  function adjustFontSize() {
    document.body.style.fontSize = window.innerWidth < 600 ? "16px" : "18px";
  }
  window.addEventListener("resize", adjustFontSize);
  window.addEventListener("load", adjustFontSize);
})();
