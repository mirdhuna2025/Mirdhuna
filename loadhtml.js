document.addEventListener("DOMContentLoaded", () => {
  // Load components
  Promise.all([
    loadComponent("header-container", "header.html"),
    loadComponent("slides-container", "slides.html"),
    loadComponent("content-container", "content.html"),
    loadComponent("footer-container", "footer.html"),
    
  ])
    .then(() => {
      // Initialize events after all parts are in place
      initHeaderEvents()
      initSliderEvents()

      // Initialize Firebase and load dynamic content
      initFirebase()
    })
    .catch((err) => {
      console.error("[v0] Component load error:", err)
    })
})

function loadComponent(containerId, filePath) {
  return fetch(filePath)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch ${filePath}`)
      return res.text()
    })
    .then((html) => {
      const el = document.getElementById(containerId)
      if (el) el.innerHTML = html
    })
    .catch((error) => {
      console.error("Error loading component:", filePath, error)
      const el = document.getElementById(containerId)
      if (el) {
        el.innerHTML =
          '<div class="loading"><div class="spinner"></div><p>Error loading content. Please try again later.</p></div>'
      }
      throw error
    })
}

/* Header interactivity: modals + location + simple notification */
function initHeaderEvents() {
  const locationTrigger = document.getElementById("locationTrigger")
  const loginTrigger = document.getElementById("loginTrigger")
  const loginModal = document.getElementById("loginModal")
  const locationModal = document.getElementById("locationModal")
  const closeLogin = document.getElementById("closeLogin")
  const closeLocation = document.getElementById("closeLocation")
  const loginBtn = document.getElementById("loginBtn")
  const mobileInput = document.getElementById("mobileInput")
  const locationText = document.getElementById("locationText")
  const notification = document.getElementById("notification")

  function showNotification(message) {
    if (!notification) return
    notification.textContent = message
    notification.classList.add("show")
    setTimeout(() => notification.classList.remove("show"), 3000)
  }

  function openModal(modal) {
    if (!modal) return
    modal.classList.add("active")
    document.body.style.overflow = "hidden"
  }

  function closeModal(modal) {
    if (!modal) return
    modal.classList.remove("active")
    document.body.style.overflow = ""
  }

  if (loginTrigger) {
    loginTrigger.addEventListener("click", (e) => {
      e.preventDefault()
      openModal(loginModal)
    })
  }
  if (closeLogin) closeLogin.addEventListener("click", () => closeModal(loginModal))

  if (locationTrigger) {
    locationTrigger.addEventListener("click", (e) => {
      e.preventDefault()
      // read from localStorage if available
      const lat = localStorage.getItem("userLat")
      const lng = localStorage.getItem("userLng")
      if (locationText) {
        locationText.innerHTML =
          lat && lng
            ? `<strong>📍 Detected:</strong><br>Lat: ${lat}<br>Lng: ${lng}`
            : "📍 Location not detected. Please enable location access."
      }
      openModal(locationModal)
    })
  }
  if (closeLocation) closeLocation.addEventListener("click", () => closeModal(locationModal))
  ;[loginModal, locationModal].forEach((modal) => {
    if (!modal) return
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal(modal)
    })
  })

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal(loginModal)
      closeModal(locationModal)
    }
  })

  if (loginBtn && mobileInput) {
    loginBtn.addEventListener("click", () => {
      const num = mobileInput.value.trim()
      if (!/^\d{10}$/.test(num)) {
        showNotification("❌ Please enter a valid 10-digit mobile number.")
        return
      }
      loginBtn.textContent = "🔍 Detecting Location..."
      loginBtn.disabled = true

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          localStorage.setItem("currentUser", num)
          localStorage.setItem("userLat", latitude.toFixed(6))
          localStorage.setItem("userLng", longitude.toFixed(6))
          showNotification(`✅ Welcome! Logged in as ${num}`)
          closeModal(loginModal)
          loginBtn.textContent = "Login Now"
          loginBtn.disabled = false

          // If Firebase is ready, persist basic activity (optional, non-blocking)
          try {
            const firebase = window.firebase // Declare the firebase variable
            if (firebase && firebase.apps && firebase.apps.length) {
              const db = firebase.database()
              const locationStr = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
              db.ref(`users/${num}`).set({
                mobile: num,
                location: locationStr,
                lastLogin: firebase.database.ServerValue.TIMESTAMP,
              })
              db.ref("userActivity").push({
                mobile: num,
                location: locationStr,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
              })
            }
          } catch (e) {
            console.warn("Firebase write skipped:", e)
          }
        },
        (error) => {
          let msg = "❌ Location access denied."
          if (error.code === 1) msg = "❌ Please allow location to continue."
          else if (error.code === 2) msg = "❌ Location unavailable."
          else if (error.code === 3) msg = "❌ Location request timed out."
          showNotification(msg)
          loginBtn.textContent = "Login Now"
          loginBtn.disabled = false
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
      )
    })
  }
}

function initSliderEvents() {
  // Navigation will be wired by initSliderNavigation after slides render
  // Kept for parity/logging
  console.log("[v0] Slider events initialized")
}

/* Firebase (Compat) */
function initFirebase() {
  try {
    const firebase = window.firebase // Declare the firebase variable
    if (typeof firebase === "undefined") {
      console.error("Firebase SDK not found on window.")
      return
    }

    if (!firebase.apps || firebase.apps.length === 0) {
      const firebaseConfig = {
        apiKey: "AIzaSyCPbOZwAZEMiC1LSDSgnSEPmSxQ7-pR2oQ",
        authDomain: "mirdhuna-25542.firebaseapp.com",
        databaseURL: "https://mirdhuna-25542-default-rtdb.firebaseio.com",
        projectId: "mirdhuna-25542",
        storageBucket: "mirdhuna-25542.firebasestorage.app",
        messagingSenderId: "575924409876",
        appId: "1:575924409876:web:6ba1ed88ce941d9c83b901",
        measurementId: "G-YB7LDKHBPV",
      }
      firebase.initializeApp(firebaseConfig)
      console.log("[v0] Firebase initialized")
    } else {
      console.log("[v0] Firebase already initialized")
    }

    loadFirebaseContent()
  } catch (e) {
    console.error("Error initializing Firebase:", e)
  }
}

function loadFirebaseContent() {
  const db = window.firebase.database() // Use window.firebase to access Firebase

  // Slides
  db.ref("slides").on("value", (snap) => {
    const data = snap.val()
    if (data) {
      const slides = Object.values(data)
      renderSlides(slides)
    } else {
      renderSlides([
        {
          title: "Authentic South Indian Flavors",
          description: "Experience the rich and diverse cuisine of South India with our traditional recipes",
          image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=1170&q=80",
        },
        {
          title: "Healthy & Organic Options",
          description: "Choose from our wide selection of healthy, organic meals prepared with fresh ingredients",
          image: "https://images.unsplash.com/photo-1565299624946-b0ac66763828?auto=format&fit=crop&w=1198&q=80",
        },
        {
          title: "Special Offers This Week",
          description: "Get 20% off on all South Indian dishes and free delivery for orders over ₹500",
          image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1171&q=80",
        },
      ])
    }
  })

  // Categories
  db.ref("categories").on("value", (snap) => {
    const data = snap.val()
    if (data) {
      renderCategories(Object.values(data))
    } else {
      renderCategories([
        {
          name: "South Indian",
          description: "Traditional dishes with authentic flavors",
          image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=1170&q=80",
        },
        {
          name: "Pizza",
          description: "Freshly baked with premium ingredients",
          image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1081&q=80",
        },
        {
          name: "Burgers",
          description: "Juicy, flavorful, and satisfying",
          image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1740&q=80",
        },
        {
          name: "Mexican",
          description: "Spicy, bold, and authentic flavors",
          image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1587&q=80",
        },
      ])
    }
  })

  // Offers
  db.ref("offers").on("value", (snap) => {
    const data = snap.val()
    if (data) {
      renderOffers(Object.values(data))
    } else {
      renderOffers([
        {
          name: "Truffle Pasta Special",
          description: "Handmade pasta with black truffle, parmesan, and fresh herbs",
          badge: "20% OFF",
          price: 380,
          originalPrice: 475,
          image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=1198&q=80",
        },
        {
          name: "Dragon Roll Deal",
          description: "Eel, avocado, cucumber topped with spicy tuna and eel sauce",
          badge: "BUY 1 GET 1",
          price: 450,
          image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=1170&q=80",
        },
        {
          name: "Gourmet Burger Bundle",
          description: "Angus beef, aged cheddar, caramelized onions, and truffle aioli",
          badge: "FREE DELIVERY",
          price: 335,
          image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1171&q=80",
        },
      ])
    }
  })

  // Menu
  db.ref("menu").on("value", (snap) => {
    const data = snap.val()
    if (data) {
      renderMenuItems(Object.values(data))
    } else {
      renderMenuItems([
        {
          name: "Truffle Pasta",
          description: "Handmade pasta with black truffle, parmesan, and fresh herbs",
          badge: "Chef's Special",
          price: 475,
          rating: 4.5,
          reviews: 128,
          image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=1198&q=80",
        },
        {
          name: "Dragon Roll",
          description: "Eel, avocado, cucumber topped with spicy tuna and eel sauce",
          badge: "New",
          price: 550,
          rating: 4.0,
          reviews: 96,
          image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=1170&q=80",
        },
        {
          name: "Gourmet Burger",
          description: "Angus beef, aged cheddar, caramelized onions, and truffle aioli",
          badge: "Popular",
          price: 420,
          rating: 5.0,
          reviews: 245,
          image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1171&q=80",
        },
      ])
    }
  })

  // Reviews
  db.ref("reviews").on("value", (snap) => {
    const data = snap.val()
    if (data) {
      renderReviews(Object.values(data))
    } else {
      renderReviews([
        {
          name: "Deepak Sharma",
          role: "Food Enthusiast",
          comment:
            "The dosa at MIRDHUNA is absolutely divine! The quality of ingredients and presentation was exceptional. Will definitely order again!",
          stars: 5,
        },
        {
          name: "Priya Patel",
          role: "Regular Customer",
          comment:
            "Fast delivery and the food arrived hot and fresh. The biryani was the best I've had in months. Highly recommended!",
          stars: 4.5,
        },
        {
          name: "Rajesh Kumar",
          role: "Food Blogger",
          comment:
            "As a food blogger, I'm picky about quality. MIRDHUNA exceeded my expectations. The idli was a masterpiece!",
          stars: 5,
        },
      ])
    }
  })
}

/* Renderers */
function renderSlides(slides) {
  const slider = document.getElementById("slider")
  const sliderNav = document.getElementById("sliderNav")
  const prevBtn = document.querySelector(".prev")
  const nextBtn = document.querySelector(".next")

  if (!slider || !sliderNav || !prevBtn || !nextBtn) return

  // Build slides
  slider.innerHTML = slides
    .map(
      (s) => `
    <div class="slide" style="background-image: url('${s.image}')">
      <div class="slide-content">
        <h2>${s.title || ""}</h2>
        <p>${s.description || ""}</p>
        <a href="#menu" class="cta-button">Order Now</a>
      </div>
    </div>
  `,
    )
    .join("")

  // Build dots
  sliderNav.innerHTML = slides.map((_, i) => `<div class="slider-dot ${i === 0 ? "active" : ""}"></div>`).join("")

  initSliderNavigation(slides.length)
}

function initSliderNavigation(slideCount) {
  const prevBtn = document.querySelector(".prev")
  const nextBtn = document.querySelector(".next")
  const slider = document.getElementById("slider")
  const dots = Array.from(document.querySelectorAll(".slider-dot"))

  if (!prevBtn || !nextBtn || !slider || slideCount === 0) return

  let currentIndex = 0

  function updateSlider() {
    slider.style.transform = `translateX(-${currentIndex * 100}%)`
    dots.forEach((dot, idx) => dot.classList.toggle("active", idx === currentIndex))
  }

  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + slideCount) % slideCount
    updateSlider()
  })
  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % slideCount
    updateSlider()
  })
  dots.forEach((dot, idx) =>
    dot.addEventListener("click", () => {
      currentIndex = idx
      updateSlider()
    }),
  )

  setInterval(() => {
    currentIndex = (currentIndex + 1) % slideCount
    updateSlider()
  }, 5000)
}

function renderCategories(categories) {
  const container = document.getElementById("categoriesContainer")
  if (!container) return
  container.innerHTML = categories
    .map(
      (c) => `
    <div class="category-card">
      <div class="category-img" style="background-image: url('${c.image}')"></div>
      <div class="category-content">
        <h3>${c.name}</h3>
        <p>${c.description}</p>
      </div>
    </div>
  `,
    )
    .join("")
}

function renderOffers(offers) {
  const container = document.getElementById("offersContainer")
  if (!container) return
  container.innerHTML = offers
    .map(
      (o) => `
    <div class="offer-card">
      <div class="offer-img" style="background-image: url('${o.image}')">
        <div class="offer-badge">${o.badge || ""}</div>
      </div>
      <div class="offer-content">
        <h3>${o.name}</h3>
        <p>${o.description}</p>
        <div class="price">₹${o.price} ${o.originalPrice ? `<span style="text-decoration: line-through; color: #777; font-size: 1rem;">₹${o.originalPrice}</span>` : ""}</div>
        <div class="offer-actions">
          <button class="add-to-cart">Add to Cart</button>
          <div class="offer-timer">Ends in 24:15:30</div>
        </div>
      </div>
    </div>
  `,
    )
    .join("")
}

function renderMenuItems(items) {
  const container = document.getElementById("menuContainer")
  if (!container) return
  container.innerHTML = items
    .map(
      (it) => `
    <div class="menu-item">
      <div class="item-img" style="background-image: url('${it.image}')">
        <div class="item-badge">${it.badge || ""}</div>
      </div>
      <div class="item-content">
        <div class="item-header">
          <h3>${it.name}</h3>
          <div class="price">₹${it.price}</div>
        </div>
        <p class="item-desc">${it.description}</p>
        <div class="item-actions">
          <div class="rating">
            ${'<i class="fas fa-star"></i>'.repeat(Math.floor(it.rating || 0))}
            ${it.rating && it.rating % 1 ? '<i class="fas fa-star-half-alt"></i>' : ""}
            <span>(${it.reviews || 0})</span>
          </div>
          <button class="add-to-cart">Add to Cart</button>
        </div>
      </div>
    </div>
  `,
    )
    .join("")
}

function renderReviews(reviews) {
  const container = document.getElementById("reviewsContainer")
  if (!container) return
  container.innerHTML = reviews
    .map(
      (r) => `
    <div class="review-card">
      <div class="review-header">
        <div class="review-avatar"><i class="fas fa-user"></i></div>
        <div class="review-info">
          <h4>${r.name}</h4>
          <p>${r.role || ""}</p>
        </div>
      </div>
      <div class="review-content">
        <p>"${r.comment}"</p>
        <div class="review-rating">
          ${'<i class="fas fa-star"></i>'.repeat(Math.floor(r.stars || 0))}
          ${r.stars && r.stars % 1 ? '<i class="fas fa-star-half-alt"></i>' : ""}
        </div>
      </div>
    </div>
  `,
    )
    .join("")
}
