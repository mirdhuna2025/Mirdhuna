// === 1. Firebase Configuration & Initialization === //
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

// Load Firebase SDKs if not already present
function loadFirebaseSDKs() {
  if (window.firebase?.apps?.length) {
    window.db = firebase.database();
    initApp(); // Start app if already initialized
    return;
  }

  // Inject Firebase scripts dynamically
  const loadScript = (src, onload) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = onload;
    script.onerror = () => console.error(`Failed to load script: ${src}`);
    document.head.appendChild(script);
  };

  loadScript("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js", () => {
    loadScript("https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js", () => {
      loadScript("https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics-compat.js", () => {
        firebase.initializeApp(firebaseConfig);
        console.log("✅ Firebase initialized");
        window.db = firebase.database();
        initApp();
      });
    });
  });
}

// === 2. Main App Initialization === //
function initApp() {
  document.addEventListener('DOMContentLoaded', () => {
    // Load all partial HTML files
    loadComponent('header-container', 'header.html');
    loadComponent('slides-container', 'slides.html');
    loadComponent('content-container', 'content.html');
    loadComponent('footer-container', 'footer.html');
    loadComponent('loginModal', 'login.html', true);   // Modal content
    loadComponent('cartModal', 'cart.html', true);

    // Show floating buttons after load
    setTimeout(() => {
      document.getElementById('floatingLoginBtn')?.style.setProperty('display', 'flex', 'important');
      updateCartButton();
      loadFirebaseData(); // Start loading Firebase content
    }, 1000);
  });
}

// === 3. Dynamic Component Loader === //
function loadComponent(containerId, filePath, isModal = false) {
  fetch(filePath)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${filePath}`);
      return res.text();
    })
    .then(html => {
      const el = document.getElementById(containerId);
      if (!el) return;
      el.innerHTML = html;

      // Initialize events after loading
      if (isModal && filePath === 'login.html') initLoginEvents();
      if (isModal && filePath === 'cart.html') initCartEvents();
    })
    .catch(err => {
      console.error('Load failed:', filePath, err);
      const el = document.getElementById(containerId);
      if (el && !isModal) {
        el.innerHTML = `
          <div class="loading" style="text-align:center;padding:40px;color:#777;">
            <p>Error loading ${filePath}. Please try again later.</p>
          </div>`;
      }
    });
}

// === 4. Login System (Mobile + Geolocation) === //
function initLoginEvents() {
  const modal = document.getElementById('loginModal');
  const closeBtn = document.getElementById('closeLogin');
  const loginBtn = document.getElementById('loginBtn');
  const mobileInput = document.getElementById('mobileInput');
  const successMsg = document.getElementById('loginSuccess');
  const errorMsg = document.getElementById('loginError');

  // Open login modal
  window.openLoginModal = () => {
    mobileInput.value = '';
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  // Close modal
  closeBtn.onclick = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Click outside to close
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // Escape key closes modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Login Button Action
  loginBtn.onclick = () => {
    const num = mobileInput.value.trim();

    if (!num || !/^\d{10}$/.test(num)) {
      errorMsg.textContent = "❌ Enter a valid 10-digit number.";
      errorMsg.style.display = 'block';
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "📍 Capturing location...";

    if (!navigator.geolocation) {
      errorMsg.textContent = "📍 Browser doesn't support location.";
      errorMsg.style.display = 'block';
      loginBtn.disabled = false;
      loginBtn.textContent = "Login Now";
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          await db.ref(`users/${num}`).set({
            mobile: num,
            lat: latitude,
            lng: longitude,
            lastLogin: Date.now()
          });

          localStorage.setItem('currentUser', num);
          localStorage.setItem('userLat', latitude);
          localStorage.setItem('userLng', longitude);

          successMsg.style.display = 'block';
          setTimeout(() => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            alert(`🎉 Welcome!\nSaved Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }, 800);
        } catch (err) {
          console.error("Firebase write error:", err);
          errorMsg.textContent = "❌ Failed to save data.";
          errorMsg.style.display = 'block';
        } finally {
          loginBtn.disabled = false;
          loginBtn.textContent = "Login Now";
        }
      },
      (err) => {
        let msg = "📍 Location access denied.";
        if (err.code === 1) msg = "📍 Allow location to continue.";
        else if (err.code === 2) msg = "📍 Location unavailable.";
        else if (err.code === 3) msg = "📍 Request timed out.";
        errorMsg.textContent = msg;
        errorMsg.style.display = 'block';
        loginBtn.disabled = false;
        loginBtn.textContent = "Login Now";
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };
}

// === 5. Cart System === //
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartButton() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const btn = document.getElementById('floatingCartBtn');
  const countEl = btn?.querySelector('.cart-count');
  if (countEl) countEl.textContent = count;
  if (btn) btn.style.display = count > 0 ? 'flex' : 'none';
}

function initCartEvents() {
  const modal = document.getElementById('cartModal');
  const closeBtn = document.getElementById('closeCart');
  const list = document.getElementById('cartItemsList');
  const totalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  document.getElementById('floatingCartBtn')?.addEventListener('click', () => {
    renderCart();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  closeBtn.onclick = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  function renderCart() {
    if (cart.length === 0) {
      list.innerHTML = '<p style="text-align:center;padding:20px;color:#777;">Your cart is empty.</p>';
      totalEl.style.display = 'none';
      checkoutBtn.style.display = 'none';
      return;
    }

    let total = 0;
    list.innerHTML = cart.map(item => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;
      return `
        <div style="padding:15px;border-bottom:1px solid #eee;">
          <div style="display:flex;align-items:center;gap:12px;">
            <img src="${item.image}" alt="${item.name}" style="width:60px;height:60px;border-radius:8px;object-fit:cover;">
            <div style="flex:1;">
              <strong>${item.name}</strong><br>
              <small>₹${item.price} × </small>
              <button onclick="changeQty(${item.id}, -1)" style="width:25px;">−</button>
              <span>${item.qty}</span>
              <button onclick="changeQty(${item.id}, 1)" style="width:25px;">+</button>
            </div>
            <button onclick="removeItem(${item.id})" style="color:red;font-size:1.2rem;">🗑️</button>
          </div>
        </div>`;
    }).join('');

    totalEl.textContent = `Total: ₹${total}`;
    totalEl.style.display = 'block';
    checkoutBtn.style.display = 'block';
    checkoutBtn.disabled = false;
  }

  window.changeQty = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (item) {
      item.qty += delta;
      if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
      saveCart();
      renderCart();
      updateCartButton();
    }
  };

  window.removeItem = (id) => {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCart();
    updateCartButton();
  };

  checkoutBtn.onclick = () => {
    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    alert(`✅ Order Confirmed!\nTotal: ₹${total}\nThank you for choosing MIRDHUNA!`);
    cart = [];
    saveCart();
    modal.classList.remove('active');
    document.body.style.overflow = '';
    updateCartButton();
    list.innerHTML = '<p style="text-align:center;padding:20px;color:#777;">Your cart is empty.</p>';
    totalEl.style.display = 'none';
    checkoutBtn.style.display = 'none';
  };
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// === 6. Load Data from Firebase === //
function loadFirebaseData() {
  if (!window.db) {
    console.warn("Firebase not ready yet. Retrying...");
    setTimeout(loadFirebaseData, 500);
    return;
  }

  // Slides
  db.ref('slides').on('value', snap => {
    const data = snap.val();
    if (data) {
      const slides = Object.keys(data)
        .map(k => ({ id: k, ...data[k] }))
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      renderSlides(slides);
    }
  });

  // Categories
  db.ref('categories').on('value', snap => {
    const data = snap.val();
    if (data) {
      const cats = Object.values(data);
      const container = document.getElementById('categoriesContainer');
      if (container) {
        container.innerHTML = cats.map(cat => `
          <div class="category-card">
            <div class="category-img" style="background-image:url('${cat.image}')"></div>
            <div class="category-content">
              <h3>${cat.name}</h3>
              <p>${cat.description}</p>
            </div>
          </div>
        `).join('');
      }
    }
  });

  // Menu Items
  db.ref('menu').on('value', snap => {
    const data = snap.val();
    if (data) {
      const items = Object.values(data);
      const container = document.getElementById('menuContainer');
      if (container) {
        container.innerHTML = items.map(item => `
          <div class="menu-item">
            <div class="item-image"><img src="${item.image}" alt="${item.name}"></div>
            <div class="item-details">
              <h3 class="item-title">${item.name}</h3>
              <p class="item-desc">${item.description}</p>
              <div class="item-price">₹${item.price}</div>
              <button class="add-button" onclick="addToCart(${item.id}, '${escapeQuotes(item.name)}', ${item.price}, '${item.image}')">
                <i class="fas fa-plus"></i> Add
              </button>
            </div>
          </div>
        `).join('');
      }
    }
  });
}

// Helper to escape quotes in names
function escapeQuotes(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// === 7. Add to Cart Function === //
window.addToCart = (id, name, price, image) => {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, image, qty: 1 });
  }
  saveCart();
  updateCartButton();
  alert(`${name} added to cart! 🛒`);
};

// === 8. Slider Rendering === //
function renderSlides(slides) {
  const slider = document.getElementById('slider');
  const nav = document.getElementById('sliderNav');
  if (!slider || !nav) return;

  slider.innerHTML = slides.map(slide => `
    <div class="slide" style="background-image:url('${slide.image}')">
      <div class="slide-content">
        <h2>${slide.title}</h2>
        <p>${slide.description}</p>
      </div>
    </div>
  `).join('');

  nav.innerHTML = slides.map((_, i) =>
    `<div class="slider-dot ${i === 0 ? 'active' : ''}"></div>`
  ).join('');

  initSlider(slides.length);
}

function initSlider(count) {
  let idx = 0;
  const slider = document.querySelector('.slider');
  const dots = document.querySelectorAll('.slider-dot');
  const prev = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');

  const update = () => {
    if (slider) slider.style.transform = `translateX(-${idx * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  };

  prev?.addEventListener('click', () => { idx = (idx - 1 + count) % count; update(); });
  next?.addEventListener('click', () => { idx = (idx + 1) % count; update(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { idx = i; update(); }));

  setInterval(() => { idx = (idx + 1) % count; update(); }, 5000);
}

// === Start Everything === //
loadFirebaseSDKs();
