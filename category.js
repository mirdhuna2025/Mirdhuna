import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
import { getConfig } from "./config.js"

const firebaseConfig = getConfig().firebase
const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

let allMenuItems = []

function safeNumber(v, fallback = 0) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function getCart() {
  const cart = localStorage.getItem("cart")
  return cart ? JSON.parse(cart) : []
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart))
}

function addToCart(item) {
  const cart = getCart()
  const existing = cart.find((i) => i.id === item.id)
  if (existing) {
    existing.qty = (existing.qty || 1) + 1
  } else {
    cart.push({ ...item, qty: 1 })
  }
  saveCart(cart)
}

function showToast(message) {
  const toast = document.getElementById("toast")
  if (!toast) return

  toast.textContent = message
  toast.style.opacity = "1"
  setTimeout(() => {
    toast.style.opacity = "0"
  }, 2200)
}

function renderItems(items) {
  const container = document.getElementById("results")
  if (!container) return

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-text">No products found</div>
        <div class="empty-state-hint">Try a different search term</div>
      </div>
    `
    return
  }

  const gridHtml = items
    .map((item) => {
      const safeName = (item.name || "Unnamed Item").replace(/"/g, "&quot;")
      const safePrice = safeNumber(item.price, 0).toFixed(2)
      const mrpDisplay =
        item.mrp && item.mrp > item.price ? `<del style="color:#999;font-size:14px">₹${item.mrp}</del>` : ""
      const discountDisplay =
        item.mrp && item.mrp > item.price
          ? `<div style="color:#d40000;font-size:13px;font-weight:600;margin-top:2px;">
          ${Math.round(((item.mrp - item.price) / item.mrp) * 100)}% OFF
        </div>`
          : ""

      const id = item.id || `temp-${Date.now()}`
      const priceNum = safeNumber(item.price, 0)
      const image = item.image || ""

      return `
      <div class="menu-card">
        ${item.offer ? `<div class="offer-tag">OFFER</div>` : ""}
        <img class="menu-img" src="${image}" alt="${safeName}" loading="lazy" />
        <div class="menu-info">
          <div class="menu-name">${safeName}</div>
          <div style="display:flex;gap:6px;align-items:center;">
            ${mrpDisplay}
            <div class="menu-price">₹${safePrice}</div>
          </div>
          ${discountDisplay}
          <button class="add-cart-btn" 
            data-id="${id}" 
            data-name="${safeName}" 
            data-price="${priceNum}" 
            data-image="${image}">
            Add to Cart
          </button>
        </div>
      </div>
    `
    })
    .join("")

  container.innerHTML = `<div class="menu-grid">${gridHtml}</div>`

  container.querySelectorAll(".add-cart-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation()
      const id = btn.dataset.id
      const name = btn.dataset.name
      const price = Number.parseFloat(btn.dataset.price)
      const image = btn.dataset.image || ""

      const item = { id, name, price, image }
      addToCart(item)
      showToast(`${name} added to cart!`)
    })
  })
}

function performSearch(query) {
  if (!query.trim()) {
    const container = document.getElementById("results")
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-text">Start Searching</div>
          <div class="empty-state-hint">Type in the search bar above to find products</div>
        </div>
      `
    }
    return
  }

  const term = query.toLowerCase()
  const filtered = allMenuItems.filter(
    (item) => (item.name || "").toLowerCase().includes(term) || (item.category || "").toLowerCase().includes(term),
  )

  renderItems(filtered)
}

onValue(ref(db, "menu"), (snapshot) => {
  const arr = []
  snapshot.forEach((child) => {
    const it = child.val() || {}
    it.id = child.key
    it.name = it.name || it.title || `Item ${child.key}`
    it.price = safeNumber(it.price, 0)
    it.mrp = it.mrp !== undefined ? safeNumber(it.mrp, it.mrp) : it.mrp
    it.image = it.image || ""
    it.offer = it.offer || false
    it.category = it.category || ""
    arr.push(it)
  })
  allMenuItems = arr

  console.log("[v0] Loaded menu items:", allMenuItems.length)
})

let searchTimer
document.getElementById("search-input")?.addEventListener("input", (e) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    performSearch(e.target.value)
  }, 300)
})

document.getElementById("back-btn")?.addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    window.location.href = "index.html"
  }
})
