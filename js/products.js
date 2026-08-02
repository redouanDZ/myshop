// Global variables
let editingProductId = null;
let currentPage = 1;
const itemsPerPage = 5;
let products = [];

async function loadProductsFromDatabase() {
    try {
        const response = await fetch('/api/products?limit=100');
        if (!response.ok) throw new Error('خطأ في جلب المنتجات');
        const data = await response.json();
        products = Array.isArray(data) ? data : (Array.isArray(data && data.products) ? data.products : []);
        loadProducts();
    } catch (error) {

        products = [];
        loadProducts();
    }
}

async function saveProduct() {
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    const image = document.getElementById('productImage').files[0] ? URL.createObjectURL(document.getElementById('productImage').files[0]) : '../images/product-placeholder.jpg';

    if (!name || !category || isNaN(price) || isNaN(stock) || price < 0 || stock < 0) {
        alert('يرجى ملء جميع الحقول بشكل صحيح واستخدام قيم غير سالبة');
        return;
    }

    const productData = { name, category, price, stock, image_url: image, status: stock > 0 ? 'active' : 'inactive' };

    try {
        let response;
        if (editingProductId !== null) {
            response = await fetch(`/api/products/${editingProductId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            editingProductId = null;
            alert('تم تحديث المنتج بنجاح');
        } else {
            response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            alert('تم إضافة المنتج بنجاح');
        }

        if (!response.ok) throw new Error('خطأ في الحفظ');
        await loadProductsFromDatabase();
        closeProductModal();
    } catch (error) {

        alert('حدث خطأ أثناء الحفظ');
    }
}

async function deleteProduct(id) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
        const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('خطأ في الحذف');
        products = products.filter(p => p.id !== id);
        loadProducts();
        alert('تم حذف المنتج بنجاح');
    } catch (error) {

        alert('حدث خطأ أثناء الحذف');
    }
}

// باقي الكود (loadProducts, filterAndSortProducts, updatePagination, editProduct, openAddProductModal, closeProductModal) كما هو

// Load products into table
function loadProducts() {
    const tbody = document.querySelector(".products-table tbody");
    tbody.innerHTML = "";

    let filteredProducts = filterAndSortProducts();

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(start, end);

    paginatedProducts.forEach(product => {
        const row = document.createElement("tr");
        row.dataset.id = product.id;
        row.innerHTML = `
            <td>
                <div class="product-info">
                    <div>
                        <div class="product-name">${product.name}</div>
                        <div class="product-category">${product.category}</div>
                    </div>
                    <div class="product-image">
                        <img src="${product.image_url}" alt="${product.name}">
                    </div>
                </div>
            </td>
            <td><div class="product-price">${product.price.toLocaleString()} دج</div></td>
            <td><div class="product-stock ${product.stock === 0 ? 'out-of-stock' : product.stock < 5 ? 'low-stock' : 'in-stock'}">${product.stock}</div></td>
            <td><div class="product-status"><span class="status-badge ${product.status === 'active' ? 'active' : 'inactive'}">${product.status}</span></div></td>
            <td>
                <div class="product-actions">
                    <button class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn"><i class="fas fa-trash-alt"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(row);

        row.querySelector(".delete-btn").addEventListener("click", () => deleteProduct(product.id));
        row.querySelector(".edit-btn").addEventListener("click", () => editProduct(product.id));
    });

    updatePagination(filteredProducts.length);
}

// Filter and sort products
function filterAndSortProducts() {
    const searchQuery = document.getElementById("searchInput").value.toLowerCase();
    const categoryFilter = document.getElementById("categoryFilter").value;
    const stockFilter = document.getElementById("stockFilter").value;
    const sortFilter = document.getElementById("sortFilter").value;

    let filteredProducts = [...products];

    if (searchQuery) {
        filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(searchQuery));
    }

    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
    }

    if (stockFilter) {
        filteredProducts = filteredProducts.filter(p => {
            if (stockFilter === "in-stock") return p.stock >= 5;
            if (stockFilter === "low-stock") return p.stock > 0 && p.stock < 5;
            if (stockFilter === "out-of-stock") return p.stock === 0;
            return true;
        });
    }

    filteredProducts.sort((a, b) => {
        if (sortFilter === "newest") return b.id - a.id;
        if (sortFilter === "oldest") return a.id - b.id;
        if (sortFilter === "price-asc") return a.price - b.price;
        if (sortFilter === "price-desc") return b.price - a.price;
        if (sortFilter === "name-asc") return a.name.localeCompare(b.name);
        if (sortFilter === "name-desc") return b.name.localeCompare(a.name);
        return 0;
    });

    return filteredProducts;
}

// Update pagination buttons
function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.querySelector(".pagination");
    pagination.innerHTML = `
        <button class="page-btn" id="prevPage"><i class="fas fa-chevron-left"></i></button>
        ${Array.from({ length: totalPages }, (_, i) => `
            <button class="page-btn ${currentPage === i + 1 ? 'active' : ''}" data-page="${i + 1}">${i + 1}</button>
        `).join('')}
        <button class="page-btn" id="nextPage"><i class="fas fa-chevron-right"></i></button>
    `;

    document.getElementById("prevPage").disabled = currentPage === 1;
    document.getElementById("nextPage").disabled = currentPage === totalPages;

    document.querySelectorAll(".page-btn[data-page]").forEach(btn => {
        btn.addEventListener("click", () => {
            currentPage = parseInt(btn.dataset.page);
            loadProducts();
        });
    });
}

// Delete product
async function deleteProduct(id) {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

    try {
        const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('خطأ في الحذف');
        products = products.filter(p => p.id !== id);
        loadProducts();
        showNotification("تم حذف المنتج بنجاح");
    } catch (error) {

        showNotification("حدث خطأ أثناء الحذف", "error");
    }
}

// Open modal to edit product
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    editingProductId = id;
    document.getElementById("modalTitle").textContent = "تعديل المنتج";
    document.getElementById("productName").value = product.name;
    document.getElementById("productCategory").value = product.category;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productStock").value = product.stock;
    document.getElementById("imagePreview").src = product.image_url;

    document.getElementById('productModal').classList.add('active');
}

// Save changes or add new product
async function saveProduct() {
    const name = document.getElementById("productName").value.trim();
    const category = document.getElementById("productCategory").value;
    const price = parseFloat(document.getElementById("productPrice").value);
    const stock = parseInt(document.getElementById("productStock").value);
    const fileInput = document.getElementById("productImage");
    const image = fileInput.files[0] ? URL.createObjectURL(fileInput.files[0]) : "../images/product-placeholder.jpg";

    if (!name || !category || isNaN(price) || isNaN(stock) || price < 0 || stock < 0) {
        alert("يرجى ملء جميع الحقول بشكل صحيح واستخدام قيم غير سالبة");
        return;
    }

    const productData = { name, category, price, stock, image_url: image, status: stock > 0 ? "active" : "inactive" };

    try {
        let response;
        if (editingProductId !== null) {
            // Edit product
            response = await fetch(`/api/products/${editingProductId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            editingProductId = null;
            showNotification("تم تحديث المنتج بنجاح");
        } else {
            // Add new product
            response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            showNotification("تم إضافة المنتج بنجاح");
        }

        if (!response.ok) throw new Error('خطأ في الحفظ');
        await loadProductsFromDatabase();
        loadProducts();
        closeProductModal();
    } catch (error) {

        showNotification("حدث خطأ أثناء الحفظ", "error");
    }
}

// Open window to add new product
function openAddProductModal() {

    editingProductId = null;
    document.getElementById("modalTitle").textContent = "إضافة منتج جديد";
    document.getElementById("productName").value = "";
    document.getElementById("productCategory").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("productStock").value = "";
    document.getElementById("productImage").value = "";
    document.getElementById("imagePreview").src = "../images/product-placeholder.jpg";
    document.getElementById('productModal').classList.add('active');
}

// Close window for adding/editing product
function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}