let ALL_PRODUCTS = [];
let ACTIVE_CATEGORY = "all";

const loadAllProducts = async () => {
  const res = await fetch("https://fakestoreapi.com/products");
  const products = await res.json();

  ALL_PRODUCTS = products;

  renderCategoryBar(products);
  displayProducts(products);
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

/*Category Bar Render*/
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
      filterByCategory(btn.dataset.cat);
    });
  });
};

/* Filter Products */
const filterByCategory = (cat) => {
  ACTIVE_CATEGORY = cat;

  renderCategoryBar(ALL_PRODUCTS);

  const filtered =
    cat === "all"
      ? ALL_PRODUCTS
      : ALL_PRODUCTS.filter((p) => p.category === cat);

  displayProducts(filtered);
};

/* Display Products */
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

          <!-- Add Button -->
          <button
            class="btn btn-primary w-full rounded-xl normal-case font-semibold">

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
});

loadAllProducts();
