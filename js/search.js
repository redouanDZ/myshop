
/**
 * نظام البحث والتصفية المتقدم
 * يوفر وظائف للبحث عن المنتجات وتصفيتها حسب معايير مختلفة
 */

// استدعاء الدوال عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة البحث
    initSearch();

    // تهيئة أزرار التصفية
    initFilterButtons();

    // تهيئة الترتيب
    initSorting();
});

/**
 * تهيئة نظام البحث
 */
function initSearch() {
    const searchForm = document.querySelector('.search-bar form');
    const searchInput = document.querySelector('.search-bar input');

    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performSearch();
        });
    }

    if (searchInput) {
        // البحث أثناء الكتابة (بعد تأخير)
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch();
            }, 500); // تأخير نصف ثانية
        });
    }
}

/**
 * تنفيذ عملية البحث
 */
function performSearch() {
    const searchInput = document.querySelector('.search-bar input');
    if (!searchInput) return;

    const searchTerm = searchInput.value.trim();

    // استخدام وحدة المنتجات للبحث
    if (window.productsModule) {
        window.productsModule.searchProducts(searchTerm);
    }
}

/**
 * تهيئة أزرار التصفية
 */
function initFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length === 0) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // إزالة الفعالية من جميع الأزرار
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // إضافة الفعالية للزر الحالي
            this.classList.add('active');

            // التصفية حسب الفئة
            const filter = this.dataset.filter;
            filterProducts(filter);
        });
    });

    // تهيئة نطاقات الأسعار
    initPriceRangeFilter();

    // تهيئة فلتر التقييمات
    initRatingFilter();

    // تهيئة فلتر التوفر
    initAvailabilityFilter();
}

/**
 * تصفية المنتجات حسب الفئة
 * @param {string} category - اسم الفئة
 */
function filterProducts(category) {
    // استخدام وحدة المنتجات للتصفية
    if (window.productsModule) {
        window.productsModule.filterByCategory(category);
    }
}

/**
 * تهيئة فلتر نطاق الأسعار
 */
function initPriceRangeFilter() {
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const applyFilterBtn = document.getElementById('apply-price-filter');

    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', function() {
            applyPriceRangeFilter();
        });
    }

    if (minPriceInput) {
        minPriceInput.addEventListener('change', function() {
            applyPriceRangeFilter();
        });
    }

    if (maxPriceInput) {
        maxPriceInput.addEventListener('change', function() {
            applyPriceRangeFilter();
        });
    }
}

/**
 * تطبيق فلتر نطاق الأسعار
 */
function applyPriceRangeFilter() {
    const minPrice = parseFloat(document.getElementById('min-price').value) || 0;
    const maxPrice = parseFloat(document.getElementById('max-price').value) || Infinity;

    if (window.productsModule) {
        const currentProducts = window.productsModule.products;
        const filteredProducts = currentProducts.filter(product => 
            product.price >= minPrice && product.price <= maxPrice
        );

        window.productsModule.loadProducts(filteredProducts);
    }
}

/**
 * تهيئة فلتر التقييمات
 */
function initRatingFilter() {
    const ratingOptions = document.querySelectorAll('.rating-filter input');
    ratingOptions.forEach(option => {
        option.addEventListener('change', function() {
            applyRatingFilter();
        });
    });
}

/**
 * تطبيق فلتر التقييمات
 */
function applyRatingFilter() {
    const selectedRating = document.querySelector('.rating-filter input:checked');
    if (!selectedRating) return;

    const minRating = parseFloat(selectedRating.value);

    if (window.productsModule) {
        const currentProducts = window.productsModule.products;
        const filteredProducts = currentProducts.filter(product => 
            product.rating >= minRating
        );

        window.productsModule.loadProducts(filteredProducts);
    }
}

/**
 * تهيئة فلتر التوفر
 */
function initAvailabilityFilter() {
    const availabilityOptions = document.querySelectorAll('.availability-filter input');
    availabilityOptions.forEach(option => {
        option.addEventListener('change', function() {
            applyAvailabilityFilter();
        });
    });
}

/**
 * تطبيق فلتر التوفر
 */
function applyAvailabilityFilter() {
    const inStockOption = document.getElementById('in-stock');
    const outOfStockOption = document.getElementById('out-of-stock');

    let showInStock = inStockOption.checked;
    let showOutOfStock = outOfStockOption.checked;

    if (!showInStock && !showOutOfStock) {
        // إذا لم يتم تحديد أي خيار، إظهار الكل
        showInStock = true;
        showOutOfStock = true;
    }

    if (window.productsModule) {
        const currentProducts = window.productsModule.products;
        const filteredProducts = currentProducts.filter(product => 
            (product.inStock && showInStock) || (!product.inStock && showOutOfStock)
        );

        window.productsModule.loadProducts(filteredProducts);
    }
}

/**
 * تهيئة الترتيب
 */
function initSorting() {
    const sortSelect = document.getElementById('sort');
    if (!sortSelect) return;

    sortSelect.addEventListener('change', function() {
        const sortBy = this.value;
        applySorting(sortBy);
    });
}

/**
 * تطبيق الترتيب
 * @param {string} sortBy - معيار الترتيب
 */
function applySorting(sortBy) {
    if (window.productsModule) {
        window.productsModule.sortProducts(sortBy);
    }
}

/**
 * إعادة تعيين جميع الفلاتر
 */
function resetFilters() {
    // إعادة تعيين أزرار التصفية
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));

    // تحديد زر "الكل" كنشط
    const allButton = document.querySelector('.filter-btn[data-filter="all"]');
    if (allButton) {
        allButton.classList.add('active');
    }

    // إعادة تعيين نطاق الأسعار
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');

    if (minPriceInput) minPriceInput.value = '';
    if (maxPriceInput) maxPriceInput.value = '';

    // إعادة تعيين فلتر التقييمات
    const ratingOptions = document.querySelectorAll('.rating-filter input');
    ratingOptions.forEach(option => option.checked = false);

    // إعادة تعيين فلتر التوفر
    const inStockOption = document.getElementById('in-stock');
    const outOfStockOption = document.getElementById('out-of-stock');

    if (inStockOption) inStockOption.checked = true;
    if (outOfStockOption) outOfStockOption.checked = false;

    // إعادة تعيين الترتيب
    const sortSelect = document.getElementById('sort');
    if (sortSelect) {
        sortSelect.value = 'default';
    }

    // إعادة تحميل جميع المنتجات
    if (window.productsModule) {
        window.productsModule.loadProducts();
    }
}

/**
 * حف حالة الفلاتر في التخزين المحلي
 */
function saveFilterState() {
    const filterState = {
        category: document.querySelector('.filter-btn.active')?.dataset.filter || 'all',
        minPrice: document.getElementById('min-price')?.value || '',
        maxPrice: document.getElementById('max-price')?.value || '',
        rating: document.querySelector('.rating-filter input:checked')?.value || '',
        inStock: document.getElementById('in-stock')?.checked || false,
        outOfStock: document.getElementById('out-of-stock')?.checked || false,
        sortBy: document.getElementById('sort')?.value || 'default'
    };

    localStorage.setItem('filterState', JSON.stringify(filterState));
}

/**
 * استعادة حالة الفلاتر من التخزين المحلي
 */
function restoreFilterState() {
    const savedState = localStorage.getItem('filterState');
    if (!savedState) return;

    try {
        const filterState = JSON.parse(savedState);

        // استعادة حالة تصفية الفئات
        const categoryButton = document.querySelector(`.filter-btn[data-filter="${filterState.category}"]`);
        if (categoryButton) {
            categoryButton.classList.add('active');
        }

        // استعادة نطاق الأسعار
        if (filterState.minPrice) {
            const minPriceInput = document.getElementById('min-price');
            if (minPriceInput) minPriceInput.value = filterState.minPrice;
        }

        if (filterState.maxPrice) {
            const maxPriceInput = document.getElementById('max-price');
            if (maxPriceInput) maxPriceInput.value = filterState.maxPrice;
        }

        // استعادة فلتر التقييمات
        if (filterState.rating) {
            const ratingOption = document.querySelector(`.rating-filter input[value="${filterState.rating}"]`);
            if (ratingOption) ratingOption.checked = true;
        }

        // استعادة فلتر التوفر
        if (filterState.inStock) {
            const inStockOption = document.getElementById('in-stock');
            if (inStockOption) inStockOption.checked = true;
        }

        if (filterState.outOfStock) {
            const outOfStockOption = document.getElementById('out-of-stock');
            if (outOfStockOption) outOfStockOption.checked = true;
        }

        // استعادة الترتيب
        if (filterState.sortBy) {
            const sortSelect = document.getElementById('sort');
            if (sortSelect) sortSelect.value = filterState.sortBy;
        }

        // تطبيق الفلاتر المحفوظة
        applyCurrentFilters();
    } catch (e) {

    }
}

/**
 * تطبيق الفلاتر الحالية
 */
function applyCurrentFilters() {
    // تطبيق تصفية الفئة
    const activeFilter = document.querySelector('.filter-btn.active');
    if (activeFilter) {
        filterProducts(activeFilter.dataset.filter);
    }

    // تطبيق الترتيب
    const sortSelect = document.getElementById('sort');
    if (sortSelect) {
        applySorting(sortSelect.value);
    }
}
