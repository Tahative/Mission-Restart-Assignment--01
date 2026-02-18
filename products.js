/* =========================
   Global Loader
========================= */
function showLoader() {
  const loader = document.getElementById("globalLoader");
  if (loader) loader.classList.remove("hidden");
}

function hideLoader() {
  const loader = document.getElementById("globalLoader");
  if (loader) loader.classList.add("hidden");
}

function showLoader() {
  const loader = document.getElementById("globalLoader");
  if (!loader) return;
  loader.classList.remove("hidden");
}


let ALL_PRODUCTS = [];
let ACTIVE_CATEGORY = "all";

const USE_LOCAL_STORAGE = true;
const CART_KEY = "swiftcraft_cart_v1";

// Cart items shape: { id, title, price, image, qty }
let CART = [];

const money = (n) => Number(n).toFixed(2);

const loadCart = () => {
  if (!USE_LOCAL_STORAGE) return;
  try {
    const raw = localStorage.getItem(CART_KEY);
    CART = raw ? JSON.parse(raw) : [];
  } catch {
    CART = [];
  }
};

const saveCart = () => {
  if (!USE_LOCAL_STORAGE) return;
  localStorage.setItem(CART_KEY, JSON.stringify(CART));
};

const cartCount = () => CART.reduce((sum, item) => sum + item.qty, 0);

const cartTotal = () =>
  CART.reduce((sum, item) => sum + item.price * item.qty, 0);

function renderCart() {
  const countEl = document.getElementById("cartCount");
  const countTextEl = document.getElementById("cartCountText");
  const totalEl = document.getElementById("cartTotal");
  const container = document.getElementById("cartItems");

  
  if (!countEl || !countTextEl || !totalEl || !container) return;

  const count = cartCount();
  const total = cartTotal();

  countEl.textContent = count;
  countTextEl.textContent = count;
  totalEl.textContent = money(total);

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


window.addToCart = (productId) => {
  const product = ALL_PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  const existing = CART.find((i) => i.id === product.id);

  if (existing) {
    existing.qty += 1;
  } else {
    CART.push({
      id: String(product.id),
      title: product.title,
      price: Number(product.price),
      image: product.image,
      qty: 1,
    });
  }

  saveCart();
  renderCart();
};

const removeFromCart = (id) => {
  CART = CART.filter((i) => String(i.id) !== String(id));
  saveCart();
  renderCart();
};

const increaseQty = (id) => {
  const item = CART.find((i) => String(i.id) === String(id));
  if (!item) return;
  item.qty += 1;
  saveCart();
  renderCart();
};

const decreaseQty = (id) => {
  const item = CART.find((i) => String(i.id) === String(id));
  if (!item) return;
  item.qty -= 1;
  if (item.qty <= 0) CART = CART.filter((i) => String(i.id) !== String(id));
  saveCart();
  renderCart();
};

const clearCart = () => {
  CART = [];
  saveCart();
  renderCart();
};


const loadAllProducts = async () => {
  showLoader();

  try {
    const res = await fetch("https://fakestoreapi.com/products");
    const products = await res.json();

    ALL_PRODUCTS = products;

    renderCategoryBar(products);
    displayProducts(products);
  } catch (err) {
    console.error("Failed to load products:", err);
  } finally {
    hideLoader();
  }
};


const normalizeCategoryLabel = (cat) => {
  const map = {
    electronics: "Electronics",
    jewelery: "Jewelery",
    "men's clothing": "Men's Clothing",
    "women's clothing": "Women's Clothing",
  };
  return map[cat] || cat;
};

/* category bar render */
const renderCategoryBar = (products) => {
  const bar = document.getElementById("categoryBar");

  const categories = ["all", ...new Set(products.map((p) => p.category))];

  bar.innerHTML = categories
    .map((cat) => {
      const label = cat === "all" ? "All" : normalizeCategoryLabel(cat);

      const isActive = ACTIVE_CATEGORY === cat;
      const activeClass = isActive
        ? "bg-indigo-600 text-white border-indigo-600"
        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600";

      return `
        <button
          class="px-5 py-2 rounded-full border text-sm font-medium transition ${activeClass}"
          data-cat="${cat}"
          type="button"
        >
          ${label}
        </button>
      `;
    })
    .join("");

  bar.querySelectorAll("button[data-cat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      showLoader();
      setTimeout(() => {
        filterByCategory(btn.dataset.cat);
        hideLoader();
      }, 300);
    });

  });
};

/* filter products */
const filterByCategory = (cat) => {
  ACTIVE_CATEGORY = cat;

  renderCategoryBar(ALL_PRODUCTS);

  const filtered =
    cat === "all"
      ? ALL_PRODUCTS
      : ALL_PRODUCTS.filter((p) => p.category === cat);

  displayProducts(filtered);
};

/* display products */
const displayProducts = (products) => {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";

  products.forEach((product) => {
    const div = document.createElement("div");

    div.className =
      "bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col";

    div.innerHTML = `
      <!-- Image -->
      <div class="bg-slate-50 h-64 flex items-center justify-center p-10">
        <img src="${product.image}" alt="${product.title}" class="h-full w-full object-contain" />
      </div>

      <!-- Body -->
      <div class="p-6 flex flex-col flex-1">

        <!-- Category + Rating -->
        <div class="flex items-center justify-between mb-4">
          <span class="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium">
            ${normalizeCategoryLabel(product.category)}
          </span>

          <div class="text-sm flex items-center gap-1 text-slate-600">
            <span class="text-yellow-500">★</span>
            <span>${product.rating.rate}</span>
            <span class="text-slate-400">(${product.rating.count})</span>
          </div>
        </div>

        <!-- Title -->
        <h3 class="font-bold text-slate-900 leading-snug line-clamp-2 min-h-[52px]">
          ${product.title}
        </h3>

        <!-- Price -->
        <p class="mt-3 text-xl font-extrabold text-slate-900">$${product.price}</p>

        <!-- Buttons -->
        <div class="mt-6 grid grid-cols-2 gap-3">

          <!-- Details Button -->
          <button onclick="openModal(${product.id})"
            class="btn btn-none w-full border rounded-xl normal-case font-semibold">
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

          <!-- Add Button (HOOKED) -->
          <button
            class="btn btn-primary w-full rounded-xl normal-case font-semibold"
            onclick="addToCart(${product.id})"
          >
            <svg xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4
                M7 13L5.4 5M7 13l-2.293 2.293
                c-.63.63-.184 1.707.707 1.707H17
                m0 0a2 2 0 100 4 2 2 0 000-4
                zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Add
          </button>
        </div>
      </div>
    `;

    grid.appendChild(div);
  });
};


let modalEl, closeBtn;

window.openModal = (id) => {
  const product = ALL_PRODUCTS.find((p) => p.id === id);
  if (!product || !modalEl) return;

  document.getElementById("modalImg").src = product.image;
  document.getElementById("modalTitle").textContent = product.title;
  document.getElementById("modalDesc").textContent = product.description;
  document.getElementById("modalPrice").textContent = `$${product.price}`;
  document.getElementById("modalCategory").textContent =
    normalizeCategoryLabel(product.category);

  document.getElementById("modalRate").textContent =
    product.rating?.rate ?? "0";

  document.getElementById("modalCount").textContent =
    product.rating?.count ?? "0";

  modalEl.classList.remove("hidden");
  modalEl.classList.add("flex");
};

const closeModal = () => {
  modalEl.classList.add("hidden");
  modalEl.classList.remove("flex");
};

document.addEventListener("DOMContentLoaded", () => {
 
  modalEl = document.getElementById("productModal");
  closeBtn = document.getElementById("closeModal");

  if (!modalEl || !closeBtn) {
    console.error("Modal HTML missing. Check IDs.");
    return;
  }

  closeBtn.addEventListener("click", closeModal);

  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  
  loadCart();
  renderCart();

  const clearBtn = document.getElementById("clearCartBtn");
  if (clearBtn) clearBtn.addEventListener("click", clearCart);
});

loadAllProducts();

/* =========================
   Page Navigation Loader
========================= */
document.addEventListener("DOMContentLoaded", () => {

  // Home + Products links
  document.querySelectorAll('a[href$="index.html"], a[href$="products.html"]').forEach(link => {
    link.addEventListener("click", () => {
      showLoader();
    });
  });

  // shop now button
  document.querySelectorAll('a[href$="products.html"]').forEach(btn => {
    btn.addEventListener("click", () => {
      showLoader();
    });
  });

});

