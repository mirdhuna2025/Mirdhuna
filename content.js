import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"
import {
  getDatabase,
  ref,
  onValue,
  push,
  get,
  set,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
import { getConfig } from "./config.js"

const firebaseConfig = getConfig().firebase
const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

let categories = []
let menuItems = []
let cart = []
let currentOffer = null
let selectedCategory = null
let viewMode = "grid"
let searchQuery = ""

const authBar = document.getElementById("auth-bar")
const categoryCarousel = document.getElementById("categoryCarousel")
const menuGrid = document.getElementById("menuGrid")
const offerBanner = document.getElementById("offerBanner")

const searchInput = document.getElementById("search-input")

const cartPopupEl = document.getElementById("cart-popup")
const cartItemsEl = document.getElementById("cartItems")
const cartTotalEl = document.getElementById("cartTotal")
const cartToggleBtn = document.getElementById("cart-toggle-btn")

const sortSelect = document.getElementById("sort-select")
const gridViewBtn = document.getElementById("grid-view")
const listViewBtn = document.getElementById("list-view")

const productPopup = document.getElementById("productPopup")
const ppImg = document.getElementById("pp-img")
const ppName = document.getElementById("pp-name")
const ppDesc = document.getElementById("pp-desc")
const ppPrice = document.getElementById("pp-price")
const ppQty = document.getElementById("pp-qty")
const ppAdd = document.getElementById("pp-add")
const ppClose = document.getElementById("pp-close")

const checkoutModal = document.getElementById("checkoutModal")
const checkoutAddress = document.getElementById("checkout-address")
const checkoutPayment = document.getElementById("checkout-payment")
const checkoutInstructions = document.getElementById("checkout-instructions")
const checkoutPlace = document.getElementById("checkout-place")
const checkoutCancel = document.getElementById("checkout-cancel")

// ✅ Login popup elements
const loginPopup = document.getElementById("mirdhuna-login-popup")
const mobInput = document.getElementById("mirdhuna-mob-input")
const submitLoginBtn = document.getElementById("mirdhuna-submit-login")
const closeLoginBtn = document.getElementById("mirdhuna-close-popup")

let toastEl = document.getElementById("toast")

function safeNumber(v, fallback = 0) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function showToast(message) {
  if (!toastEl) {
    toastEl = document.createElement("div")
    toastEl.id = "toast"
    toastEl.style.position = "fixed"
    toastEl.style.bottom = "20px"
    toastEl.style.left = "50%"
    toastEl.style.transform = "translateX(-50%)"
    toastEl.style.background = "rgba(0,0,0,0.85)"
    toastEl.style.color = "white"
    toastEl.style.padding = "8px 14px"
    toastEl.style.borderRadius = "18px"
    toastEl.style.zIndex = "99999"
    toastEl.style.opacity = "0"
    toastEl.style.transition = "opacity .25s"
    document.body.appendChild(toastEl)
  }
  toastEl.textContent = message
  toastEl.style.opacity = "1"
  setTimeout(() => {
    if (toastEl) toastEl.style.opacity = "0"
  }, 2200)
}

function isLoggedIn() {
  return localStorage.getItem("isLoggedIn") === "true"
}

function updateAuthUI() {
  if (!authBar) return
  if (isLoggedIn()) {
    const phone = localStorage.getItem("mobileNumber") || ""
    authBar.innerHTML = `Logged in${phone ? " — " + phone : ""} <button onclick="logout()">Logout</button>`
  } else {
    authBar.innerHTML = `Welcome! <button onclick="showLoginModal()">Login to Order</button>`
  }
  authBar.style.display = "block"
}

window.logout = () => {
  localStorage.removeItem("isLoggedIn")
  localStorage.removeItem("mobileNumber")
  updateAuthUI()
  showToast("Logged out")
}

// ✅ NEW: Show login popup (same as stickybar.js)
function showLoginModal() {
  if (loginPopup) loginPopup.style.display = "flex"
}

// ✅ NEW: Close login popup
function closeLoginPopup() {
  if (loginPopup) {
    loginPopup.style.display = "none"
    if (mobInput) mobInput.value = ""
  }
}

// ✅ NEW: Handle login (identical to stickybar.js logic)
async function handleLogin() {
  const number = mobInput?.value.trim()
  if (!number || !/^[6-9]\d{9}$/.test(number)) {
    alert("Please enter a valid 10-digit Indian mobile number (starting with 6–9).")
    return
  }

  if (submitLoginBtn) {
    submitLoginBtn.disabled = true
    submitLoginBtn.textContent = "Logging in..."
  }

  let location = null
  if ("geolocation" in navigator) {
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      })
      location = { lat: pos.coords.latitude, lng: pos.coords.longitude }
    } catch (err) {
      console.warn("Geolocation not available:", err)
    }
  }

  try {
    await push(ref(db, "loginHistory"), {
      mobileNumber: number,
      timestamp: new Date().toISOString(),
      location: location || { error: "Geolocation denied or unavailable" },
    })

    localStorage.setItem("isLoggedIn", "true")
    localStorage.setItem("mobileNumber", number)
    updateAuthUI()
    closeLoginPopup()
    showToast("✅ Logged in!")
  } catch (error) {
    console.error("Firebase login error:", error)
    alert("Login failed. Please try again.")
  } finally {
    if (submitLoginBtn) {
      submitLoginBtn.disabled = false
      submitLoginBtn.textContent = "Login"
    }
  }
}

function loadCartFromStorage() {
  const raw = JSON.parse(localStorage.getItem("cart")) || []
  cart = raw.map((it, idx) => ({
    id: it?.id || `temp-${Date.now()}-${idx}`,
    name: it?.name || "Unnamed Item",
    price: safeNumber(it?.price, 0),
    image: it?.image || "",
    qty: Math.max(1, Number.parseInt(it?.qty) || 1),
  }))
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart))
}

function loadShopData() {
  if (categoryCarousel) {
    onValue(ref(db, "categories"), (snapshot) => {
      const val = snapshot.val() || {}
      categories = Object.values(val || [])
      renderCategories()
    })
  }

  onValue(ref(db, "menu"), (snapshot) => {
    const raw = snapshot.val() || {}
    const arr = []
    snapshot.forEach((child) => {
      const it = child.val() || {}
      it.id = child.key
      it.name = it.name || it.title || `Item ${child.key}`
      it.price = safeNumber(it.price, 0)
      it.mrp = it.mrp !== undefined && it.mrp !== null ? safeNumber(it.mrp, it.mrp) : it.mrp
      it.image = it.image || ""
      arr.push(it)
    })
    sessionStorage.setItem("menuCache", JSON.stringify(raw))
    menuItems = arr
    renderMenu()
  })

  onValue(ref(db, "offers"), (snapshot) => {
    const val = snapshot.val() || {}
    const arr = Object.values(val || {})
    currentOffer = arr.find((o) => o.active) || null
    renderOffer()
  })
}

function renderOffer() {
  if (!offerBanner) return
  if (currentOffer) {
    offerBanner.textContent = `🔥 ${currentOffer.title} — ${currentOffer.description || ""}`
    offerBanner.style.display = "block"
  } else {
    offerBanner.style.display = "none"
  }
}

function renderCategories() {
  if (!categoryCarousel) return
  categoryCarousel.innerHTML = ""

  // ✅ "All" category with clean SVG (no border, no bg)
  const fallbackSvg =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E' +
    '%3Crect width="80" height="80" fill="none" /%3E' +
    '%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="16" fill="%23999" font-family="sans-serif"%3EALL%3C/text%3E' +
    "%3C/svg%3E"

  const allDiv = document.createElement("div")
  allDiv.className = "category-item"
  allDiv.innerHTML = `<img class="category-img" src="${fallbackSvg}" alt="All"/>`
  allDiv.addEventListener("click", () => {
    selectedCategory = null
    renderMenu()
  })
  categoryCarousel.appendChild(allDiv)

  categories.forEach((cat) => {
    const div = document.createElement("div")
    div.className = "category-item"
    // ✅ src only — no alt text shown, no name, no border
    div.innerHTML = `<img class="category-img" src="${cat.image || fallbackSvg}" />`
    div.addEventListener("click", () => {
      selectedCategory = cat.name
      renderMenu()
    })
    categoryCarousel.appendChild(div)
  })
}

function renderMenuItems(items) {
  items.forEach((item) => {
    const safeName = (item.name || "Unnamed Item").replace(/"/g, "&quot;")
    const safePrice = safeNumber(item.price, 0).toFixed(2)
    const mrpDisplay =
      item.mrp && item.mrp > item.price ? `<del style="color:#999;font-size:14px">₹${item.mrp}</del>` : ""
    const discountDisplay =
      item.mrp && item.mrp > item.price
        ? `<div style="color:#d40000;font-size:13px;font-weight:600;margin-top:2px;">${Math.round(((item.mrp - item.price) / item.mrp) * 100)}% OFF</div>`
        : ""

    const card = document.createElement("div")
    card.className = `menu-card ${viewMode === "list" ? "list-view" : ""}`
    card.innerHTML = `
      <img class="menu-img" loading="lazy" src="${item.image || ""}" alt="${safeName}" />
      <div class="menu-info">
        <div class="menu-name">${safeName}</div>
        <div style="display:flex;gap:6px;align-items:center;">
          ${mrpDisplay}
          <div class="menu-price">₹${safePrice}</div>
          ${discountDisplay}
        </div>
        ${item.offer ? `<div class="offer-tag">OFFER</div>` : ""}
        <button class="add-cart-btn" data-id="${item.id}" data-name="${safeName}" data-price="${safeNumber(item.price, 0)}" data-image="${item.image || ""}">Add to Cart</button>
      </div>
    `

    const imgEl = card.querySelector(".menu-img")
    imgEl?.addEventListener("click", (e) => openProductPopup(item))
    card.addEventListener("click", (e) => {
      if (!e.target.classList.contains("add-cart-btn") && e.target !== imgEl) openProductPopup(item)
    })

    menuGrid.appendChild(card)
  })
}

function renderMenu() {
  if (!menuGrid) return
  menuGrid.innerHTML = ""

  let items = selectedCategory ? menuItems.filter((i) => i.category === selectedCategory) : [...menuItems]

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase()
    items = items.filter((item) => {
      const name = (item.name || "").toLowerCase()
      const desc = (item.description || "").toLowerCase()
      const category = (item.category || "").toLowerCase()
      return name.includes(query) || desc.includes(query) || category.includes(query)
    })
  } else {
    menuGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3>Start Searching</h3>
        <p>Type in the search bar above to find products</p>
      </div>
    `
    menuGrid.style.gridTemplateColumns = "1fr"
    return
  }

  const sortVal = sortSelect?.value || "default"
  if (sortVal === "price-low-high") items.sort((a, b) => (a.price || 0) - (b.price || 0))
  else if (sortVal === "price-high-low") items.sort((a, b) => (b.price || 0) - (a.price || 0))
  else if (sortVal === "offer-first") items.sort((a, b) => (b.offer ? 1 : 0) - (a.offer ? 1 : 0))

  if (!items.length) {
    menuGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;">No items found for your search</p>'
    menuGrid.style.gridTemplateColumns = "1fr"
    return
  }

  renderMenuItems(items)
  menuGrid.style.gridTemplateColumns = viewMode === "list" ? "1fr" : "repeat(2, 1fr)"
}

let popupCurrentItem = null

function openProductPopup(item) {
  popupCurrentItem = item
  if (!productPopup) return

  ppImg && (ppImg.src = item.image || "")
  ppName && (ppName.textContent = item.name || "Unnamed Item")
  ppDesc && (ppDesc.textContent = item.description || "")
  ppPrice && (ppPrice.textContent = `₹${safeNumber(item.price, 0).toFixed(2)}`)
  if (ppQty && ppQty.value === "") ppQty.value = "1"

  if (ppAdd) {
    ppAdd.dataset.id = item.id || ""
    ppAdd.dataset.name = item.name || ""
    ppAdd.dataset.price = String(safeNumber(item.price, 0))
    ppAdd.dataset.image = item.image || ""
  }

  productPopup.style.display = "flex"
}

ppClose &&
  ppClose.addEventListener("click", () => {
    if (productPopup) productPopup.style.display = "none"
  })
productPopup &&
  productPopup.addEventListener("click", (e) => {
    if (e.target === productPopup) productPopup.style.display = "none"
  })

function addToCart(id, name, price, image, qty = 1) {
  const itemId = id || `temp-${Date.now()}`
  const itemName = name || "Unnamed Item"
  const itemPrice = safeNumber(price, 0)
  const itemImage = image || ""
  const itemQty = Math.max(1, Number(qty) || 1)

  const existing = cart.find((c) => c.id === itemId)
  if (existing) existing.qty += itemQty
  else cart.push({ id: itemId, name: itemName, price: itemPrice, image: itemImage, qty: itemQty })

  saveCart()
  updateCartUI()
  showToast(`${itemName} added (${itemQty})`)
}

function updateCartUI() {
  if (!cartItemsEl || !cartTotalEl) return
  cartItemsEl.innerHTML = ""
  let total = 0
  let totalCount = 0
  const fallbackImg =
    "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22%3E%3Crect width=%2260%22 height=%2260%22 fill=%22%23f0f0f0%22/%3E%3C/svg%3E"

  for (const it of cart) {
    const price = safeNumber(it.price, 0)
    const qty = Math.max(0, Number(it.qty) || 0)
    const subtotal = price * qty
    total += subtotal
    totalCount += qty

    const div = document.createElement("div")
    div.className = "cart-item"
    div.innerHTML = `
      <img class="cart-img" src="${it.image || fallbackImg}" />
      <div class="cart-info">
        <div>${it.name}</div>
        <div>₹${price} × 
          <button class="qty-btn" data-id="${it.id}" data-action="dec">-</button>
          ${qty}
          <button class="qty-btn" data-id="${it.id}" data-action="inc">+</button>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
          <div>₹${subtotal.toFixed(2)}</div>
          <button class="delete-item" data-id="${it.id}" style="background:none;border:none;color:#d40000;font-size:20px;cursor:pointer;padding:0;">🗑️</button>
        </div>
      </div>
    `
    cartItemsEl.appendChild(div)
  }
  cartTotalEl.textContent = Number(total).toFixed(2)
  updateCartBadge(totalCount)
}

function updateCartBadge(count) {
  if (!cartToggleBtn) return
  const existing = cartToggleBtn.querySelector(".cart-badge")
  if (existing) existing.remove()
  if (count > 0) {
    const b = document.createElement("span")
    b.className = "cart-badge"
    b.textContent = count > 9 ? "9+" : String(count)
    cartToggleBtn.appendChild(b)
  }
}

function changeQty(id, delta) {
  const it = cart.find((c) => c.id === id)
  if (!it) return
  it.qty = (Number(it.qty) || 0) + delta
  if (it.qty <= 0) cart = cart.filter((c) => c.id !== id)
  saveCart()
  updateCartUI()
}

function removeFromCart(id) {
  cart = cart.filter((c) => c.id !== id)
  saveCart()
  updateCartUI()
}

// ✅ placeOrder — now uses popup instead of toast when not logged in
async function placeOrder() {
  if (!isLoggedIn()) {
    // ✅ SHOW LOGIN POPUP INSTEAD OF TOAST
    showLoginModal()
    return
  }

  if (!cart || cart.length === 0) return showToast("Cart is empty!")
  const address = (checkoutAddress?.value || "").trim()
  if (!address) return showToast("Please enter delivery address")

  const phone = localStorage.getItem("mobileNumber")
  if (!phone) {
    showLoginModal()
    return
  }

  const payment = checkoutPayment?.value || "Cash on Delivery"
  const instructions = (checkoutInstructions?.value || "").trim()

  const total = cart.reduce((s, it) => {
    const pr = safeNumber(it.price, 0)
    const q = Math.max(0, Number(it.qty) || 0)
    return s + pr * q
  }, 0)

  // ✅ Generate 5-digit ID
  let orderIdStr = "00000"
  try {
    const lastIdRef = ref(db, "lastOrderId")
    const snapshot = await get(lastIdRef)
    const current = snapshot.exists() ? snapshot.val() : 0
    const next = current + 1
    await set(lastIdRef, next)
    orderIdStr = String(next).padStart(5, "0")
  } catch (err) {
    console.warn("⚠️ ID fallback")
    orderIdStr = String(Math.floor(Date.now() / 1000) % 100000).padStart(5, "0")
  }

  // Geolocation (non-blocking)
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("📍 Location captured for order:", { lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      (err) => console.warn("📍 Geolocation denied"),
      { enableHighAccuracy: true, timeout: 5000 },
    )
  }

  const order = {
    phoneNumber: phone,
    address,
    instructions,
    paymentMode: payment,
    items: cart.map((i) => ({
      id: i.id,
      name: i.name,
      price: safeNumber(i.price, 0),
      qty: Number(i.qty) || 0,
      image: i.image || "",
    })),
    total: Number(total.toFixed(2)),
    timestamp: new Date().toISOString(),
    status: "pending",
    orderId: orderIdStr,
  }

  try {
    await push(ref(db, "orders"), order)
    showToast(`✅ Order #${orderIdStr} placed!`)
    cart = []
    saveCart()
    updateCartUI()
    if (cartPopupEl) cartPopupEl.style.display = "none"
    if (checkoutModal) checkoutModal.style.display = "none"
  } catch (err) {
    console.error("❌ Order save failed:", err)
    showToast("❌ Order failed. Try again.")
  }
}

checkoutCancel &&
  checkoutCancel.addEventListener("click", () => {
    if (checkoutModal) checkoutModal.style.display = "none"
  })
checkoutPlace &&
  checkoutPlace.addEventListener("click", () => {
    const addr = (checkoutAddress?.value || "").trim()
    if (!addr) return showToast("Please enter delivery address")
    placeOrder()
  })

// ✅ LOGIN POPUP EVENT LISTENERS
closeLoginBtn?.addEventListener("click", closeLoginPopup)
submitLoginBtn?.addEventListener("click", handleLogin)
loginPopup?.addEventListener("click", (e) => {
  if (e.target === loginPopup) closeLoginPopup()
})

document.addEventListener("click", (e) => {
  const t = e.target

  if (t.classList && t.classList.contains("add-cart-btn")) {
    const id = t.dataset.id
    const name = t.dataset.name
    const price = safeNumber(t.dataset.price, 0)
    const image = t.dataset.image || ""
    addToCart(id, name, price, image, 1)
    return
  }

  if (t && t.id === "pp-add") {
    const id = ppAdd?.dataset.id || `temp-${Date.now()}`
    const name = ppAdd?.dataset.name || "Unnamed Item"
    const price = safeNumber(ppAdd?.dataset.price, 0)
    const image = ppAdd?.dataset.image || ""
    const qty = Math.max(1, Number.parseInt(ppQty?.value || "1"))

    addToCart(id, name, price, image, qty)
    if (productPopup) productPopup.style.display = "none"
    if (ppQty) ppQty.value = "1"
    return
  }

  if (t.classList && t.classList.contains("qty-btn")) {
    const id = t.dataset.id
    const action = t.dataset.action
    if (action === "inc") changeQty(id, 1)
    else changeQty(id, -1)
    return
  }

  if (t.classList && t.classList.contains("delete-item")) {
    removeFromCart(t.dataset.id)
    showToast("Item removed")
    return
  }

  if (t.id === "cart-toggle-btn") {
    if (cartPopupEl) cartPopupEl.style.display = cartPopupEl.style.display === "block" ? "none" : "block"
    return
  }

  if (t.id === "close-cart") {
    if (cartPopupEl) cartPopupEl.style.display = "none"
    return
  }

  if (t.id === "checkout-btn") {
    if (!isLoggedIn()) {
      // ✅ POPUP INSTEAD OF TOAST
      showLoginModal()
      return
    }
    if (checkoutModal) {
      checkoutModal.style.display = "flex"
    } else {
      placeOrder()
    }
    return
  }
})

function setActiveView(mode) {
  gridViewBtn?.classList.toggle("active", mode === "grid")
  listViewBtn?.classList.toggle("active", mode === "list")
}

gridViewBtn &&
  gridViewBtn.addEventListener("click", () => {
    viewMode = "grid"
    setActiveView("grid")
    renderMenu()
  })

listViewBtn &&
  listViewBtn.addEventListener("click", () => {
    viewMode = "list"
    setActiveView("list")
    renderMenu()
  })

sortSelect && sortSelect.addEventListener("change", () => renderMenu())

let searchDebounce
searchInput &&
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchDebounce)
    searchDebounce = setTimeout(() => {
      searchQuery = e.target.value
      renderMenu()
    }, 300)
  })

updateAuthUI()
loadCartFromStorage()
updateCartUI()

try {
  const cached = sessionStorage.getItem("menuCache")
  if (cached) {
    const obj = JSON.parse(cached) || {}
    menuItems = Object.keys(obj).map((k) => {
      const v = obj[k] || {}
      v.id = v.id || k
      v.name = v.name || v.title || `Item ${k}`
      v.price = safeNumber(v.price, 0)
      v.image = v.image || ""
      return v
    })
    renderMenu()
  }
} catch (e) {}

loadShopData()

// Expose needed globals
window.addToCart = addToCart
window.placeOrder = placeOrder
window.openProductPopup = openProductPopup
window.showLoginModal = showLoginModal
