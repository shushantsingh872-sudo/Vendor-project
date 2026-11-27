const DEFAULT_PRODUCTS = [
  { id: 1, name: "Farm Fresh Milk (1L)", vendor: "Sharma Dairy", category: "Dairy", price: 62, stock: 15 },
  { id: 2, name: "Whole Wheat Sourdough", vendor: "Bakehouse Corner", category: "Bakery", price: 90, stock: 8 },
  { id: 3, name: "Raw Forest Honey (250g)", vendor: "Green Valley Co-op", category: "Groceries", price: 180, stock: 12 },
  { id: 4, name: "Handwoven Cotton Tote", vendor: "Kala Craft Studio", category: "Handmade", price: 250, stock: 6 }
];

let products = JSON.parse(localStorage.getItem("localmart_products")) || DEFAULT_PRODUCTS;
let cart = JSON.parse(localStorage.getItem("localmart_cart")) || [];
let selectedCategory = "All";

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilters = document.getElementById("categoryFilters");
const vendorForm = document.getElementById("vendorForm");
const cartDrawer = document.getElementById("cartDrawer");
const cartBtn = document.getElementById("cartBtn");
const closeCart = document.getElementById("closeCart");
const cartItemsEl = document.getElementById("cartItems");
const cartCountEl = document.getElementById("cartCount");
const cartTotalEl = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const orderMsg = document.getElementById("orderMsg");

function saveState() {
  localStorage.setItem("localmart_products", JSON.stringify(products));
  localStorage.setItem("localmart_cart", JSON.stringify(cart));
}

function renderProducts() {
  const query = searchInput.value.trim().toLowerCase();

  const filtered = products.filter((item) => {
    const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
    const matchesText =
      item.name.toLowerCase().includes(query) || item.vendor.toLowerCase().includes(query);
    return matchesCat && matchesText;
  });

  if (filtered.length === 0) {
    productGrid.innerHTML = `<p>No products match your search or filter.</p>`;
    return;
  }

  productGrid.innerHTML = filtered
    .map(
      (item) => `
      <div class="product-card">
        <div>
          <span class="badge">${item.category}</span>
          <h3>${item.name}</h3>
          <p class="vendor-label">Sold by: ${item.vendor}</p>
          <div class="price-row">
            <span class="price">₹${item.price}</span>
            <span class="stock">Stock: ${item.stock}</span>
          </div>
        </div>
        <button
          class="btn primary full-width"
          onclick="addToCart(${item.id})"
          ${item.stock <= 0 ? "disabled" : ""}
        >
          ${item.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    `
    )
    .join("");
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product || product.stock <= 0) return;

  const existing = cart.find((c) => c.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
  }

  product.stock -= 1;
  orderMsg.textContent = "";
  saveState();
  renderProducts();
  renderCart();
}

function removeFromCart(productId) {
  const index = cart.findIndex((c) => c.id === productId);
  if (index === -1) return;

  const removed = cart[index];
  const product = products.find((p) => p.id === productId);
  if (product) {
    product.stock += removed.qty;
  }

  cart.splice(index, 1);
  saveState();
  renderProducts();
  renderCart();
}

function renderCart() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  cartCountEl.textContent = totalQty;
  cartTotalEl.textContent = totalPrice;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<li class="cart-item">Your cart is empty.</li>`;
    return;
  }

  cartItemsEl.innerHTML = cart
    .map(
      (item) => `
      <li class="cart-item">
        <div>
          <strong>${item.name}</strong><br />
          <small>₹${item.price} × ${item.qty}</small>
        </div>
        <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
      </li>
    `
    )
    .join("");
}

vendorForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newProduct = {
    id: Date.now(),
    name: document.getElementById("prodName").value.trim(),
    vendor: document.getElementById("vendorName").value.trim(),
    category: document.getElementById("prodCategory").value,
    price: Number(document.getElementById("prodPrice").value),
    stock: Number(document.getElementById("prodStock").value)
  };

  products.unshift(newProduct);
  saveState();
  renderProducts();
  vendorForm.reset();
});

categoryFilters.addEventListener("click", (e) => {
  if (!e.target.classList.contains("chip")) return;
  document.querySelectorAll(".chip").forEach((btn) => btn.classList.remove("active"));
  e.target.classList.add("active");
  selectedCategory = e.target.dataset.cat;
  renderProducts();
});

searchInput.addEventListener("input", renderProducts);

cartBtn.addEventListener("click", () => cartDrawer.classList.remove("hidden"));
closeCart.addEventListener("click", () => cartDrawer.classList.add("hidden"));

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    orderMsg.textContent = "Add items before placing an order.";
    return;
  }
  cart = [];
  saveState();
  renderCart();
  orderMsg.textContent = "Order placed! Local vendors have been notified.";
});

// Initial render
renderProducts();
renderCart();