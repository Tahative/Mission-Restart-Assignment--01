/* =========================
   Trending Products Load
========================= */
const loadProducts = () => {
  fetch("https://fakestoreapi.com/products")
    .then((res) => res.json())
    .then((data) => displayProducts(data.slice(0, 3)));
};

/* =========================
   Display Products
========================= */
const displayProducts = (products) => {
  
  const grid = document.getElementById("trendingGrid");
  if (!grid) return;

  grid.innerHTML = "";

  products.forEach((product) => {
    const div = document.createElement("div");

    div.innerHTML = `
      <!-- Product Card 1 -->
      <div class="bg-white border border-none rounded-xl overflow-hidden shadow-sm hover:shadow-md transition h-full">

        <!-- Image Area -->
        <div class="bg-slate-100 h-56 flex items-center justify-center p-6">
          <img src="${product.image}" alt="${product.title}" class="h-full object-contain" />
        </div>

        <!-- Content -->
        <div class="p-4">

          <!-- Category + Rating -->
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium">
              ${product.category}
            </span>

            <div class="text-sm flex items-center gap-1 text-slate-600">
              <span class="text-yellow-500">★</span>
              <span>${product.rating.rate}</span>
              <span class="text-slate-400">(${product.rating.count})</span>
            </div>
          </div>

          <!-- Title -->
          <h3 class="font-semibold text-slate-900 leading-snug">
            ${product.title.split(" ").slice(0, 5).join(" ")}...
          </h3>

          <!-- Price -->
          <p class="mt-2 font-bold text-slate-900">$${product.price}</p>

          <!-- Buttons -->
          <div class="mt-4 flex gap-3">
            <!-- Details -->
            <button onclick="openModal(${product.id})"
              class="flex-1 border border-base-300 rounded-lg py-2 text-sm font-medium hover:bg-slate-50 transition flex flex-row items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg"
                width="16" height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"></path>
                <circle cx="12" cy="12" r="2.5"></circle>
              </svg>
              Details
            </button>

            <!-- Add -->
            <button
              class="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              onclick='addToCart({
                id: "${product.id}",
                title: ${JSON.stringify(product.title)},
                price: ${Number(product.price)},
                image: "${product.image}"
              })'
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Add
            </button>
          </div>

        </div>
      </div>
      <!-- End Product Card -->
    `;

    grid.appendChild(div);
  });
};

loadProducts();

/* ============
     Modal 
============*/
const modal = document.getElementById("productModal");

function openModal(id) {
  fetch(`https://fakestoreapi.com/products/${id}`)
    .then((res) => res.json())
    .then((product) => {
      document.getElementById("modalImg").src = product.image;
      document.getElementById("modalTitle").innerText = product.title;
      document.getElementById("modalCategory").innerText = product.category;
      document.getElementById("modalRate").innerText = product.rating.rate;
      document.getElementById("modalCount").innerText = product.rating.count;
      document.getElementById("modalDesc").innerText = product.description;
      document.getElementById("modalPrice").innerText = `$${product.price}`;

      modal.classList.remove("hidden");
      modal.classList.add("flex");
    });
}

function closeModal() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

document.getElementById("closeModal").addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

/* ===============
       Cart 
   ============== */
const USE_LOCAL_STORAGE = true;
const STORAGE_KEY = "swiftcraft_cart_v1";
let cart = [];

const money = (n) => Number(n).toFixed(2);

function saveCart() {
  if (!USE_LOCAL_STORAGE) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function loadCart() {
  if (!USE_LOCAL_STORAGE) return;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) cart = JSON.parse(raw) || [];
}

function cartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function cartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function renderCart() {
  const count = cartCount();
  const total = cartTotal();

  const cartCountEl = document.getElementById("cartCount");
  const cartCountTextEl = document.getElementById("cartCountText");
  const cartTotalEl = document.getElementById("cartTotal");
  const container = document.getElementById("cartItems");

  if (cartCountEl) cartCountEl.textContent = count;
  if (cartCountTextEl) cartCountTextEl.textContent = count;
  if (cartTotalEl) cartTotalEl.textContent = money(total);

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `<p class="text-sm opacity-70">Your cart is empty.</p>`;
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="flex gap-3 items-center border rounded-xl p-2">
      <img src="${item.image || ''}" alt="" class="w-12 h-12 object-contain rounded bg-base-200" />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold truncate">${item.title}</p>
        <p class="text-xs opacity-70">$${money(item.price)} × ${item.qty}</p>
      </div>

      <div class="flex items-center gap-2">
        <button class="btn btn-ghost btn-xs" onclick="decreaseQty('${item.id}')">−</button>
        <button class="btn btn-ghost btn-xs" onclick="increaseQty('${item.id}')">+</button>
        <button class="btn btn-error btn-xs" onclick="removeFromCart('${item.id}')">Remove</button>
      </div>
    </div>
  `).join("");
}

function addToCart(product) {
  const existing = cart.find(i => String(i.id) === String(product.id));

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => String(i.id) !== String(id));
  saveCart();
  renderCart();
}

function increaseQty(id) {
  const item = cart.find(i => String(i.id) === String(id));
  if (!item) return;
  item.qty += 1;
  saveCart();
  renderCart();
}

function decreaseQty(id) {
  const item = cart.find(i => String(i.id) === String(id));
  if (!item) return;
  item.qty -= 1;
  if (item.qty <= 0) cart = cart.filter(i => String(i.id) !== String(id));
  saveCart();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
}


loadCart();
renderCart();

const clearBtn = document.getElementById("clearCartBtn");
if (clearBtn) clearBtn.addEventListener("click", clearCart);

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.increaseQty = increaseQty;
window.decreaseQty = decreaseQty;
window.openModal = openModal;
