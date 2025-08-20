// Cart Management System for Amazon Shopping Site
let cart = JSON.parse(localStorage.getItem('amazonCart')) || [];
let cartCount = 0;

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    initializeFiltering();
    initializeSorting();
    
    // Initialize cart-specific functions if on cart page
    if (window.location.pathname.includes('cart.html')) {
        loadCartItems();
        updateCartSummary();
    }
});

// ==================== CART CORE FUNCTIONS ====================

// Add to Cart Function
function addToCart(productId, productName, price, imageUrl) {
    // Check if product already exists in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            image: imageUrl,
            quantity: 1,
            addedDate: new Date().toISOString()
        });
    }
    
    // Save to localStorage
    localStorage.setItem('amazonCart', JSON.stringify(cart));
    
    // Update UI
    updateCartCount();
    showAddToCartFeedback(event.target);
    
    // Show success message
    showCartNotification(`${productName} added to cart!`);
}

// Update Cart Count in Navigation
function updateCartCount() {
    cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
        cartCountElement.style.display = cartCount > 0 ? 'flex' : 'none';
    }
}

// Get cart items
function getCartItems() {
    return cart;
}

// Get cart total
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('amazonCart', JSON.stringify(cart));
    updateCartCount();
}

// Update quantity in cart
function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            localStorage.setItem('amazonCart', JSON.stringify(cart));
            updateCartCount();
        }
    }
}

// Clear entire cart
function clearCart() {
    cart = [];
    localStorage.setItem('amazonCart', JSON.stringify(cart));
    updateCartCount();
}

// ==================== CART PAGE FUNCTIONS ====================

// Load cart items for cart.html page
function loadCartItems() {
    const cartItems = getCartItems();
    const container = document.getElementById('cartItemsContainer');
    const emptyState = document.getElementById('emptyCartState');
    const recommendedItems = document.getElementById('recommendedItems');
    
    if (!container) return; // Not on cart page
    
    if (cartItems.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        if (recommendedItems) recommendedItems.style.display = 'none';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    if (recommendedItems) recommendedItems.style.display = 'block';
    
    container.innerHTML = cartItems.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='./assets/box1-1.jpg'">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name" onclick="viewProduct('${item.id}')">${item.name}</div>
                <div class="cart-item-status">In stock</div>
                <div class="cart-item-actions">
                    <div class="quantity-selector">
                        <label for="qty-${item.id}">Qty:</label>
                        <select id="qty-${item.id}" onchange="changeQuantity('${item.id}', this.value)">
                            ${[1,2,3,4,5,6,7,8,9,10].map(num => 
                                `<option value="${num}" ${item.quantity === num ? 'selected' : ''}>${num}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <button class="cart-action-btn delete" onclick="removeItem('${item.id}')">Delete</button>
                    <button class="cart-action-btn" onclick="saveForLater('${item.id}')">Save for later</button>
                    <button class="cart-action-btn" onclick="shareItem('${item.id}')">Share</button>
                </div>
            </div>
            <div class="cart-item-price-section">
                <div class="cart-item-price">${formatPrice(item.price)}</div>
            </div>
        </div>
    `).join('');
}

// Update cart summary for cart.html page
function updateCartSummary() {
    const cartItems = getCartItems();
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const subtotal = getCartTotal();
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const shipping = subtotal >= 499 ? 0 : 49;
    const orderTotal = subtotal + tax + shipping;

    // Update all cart summary elements
    const elements = {
        'itemCount': itemCount,
        'checkoutItemCount': itemCount,
        'subtotal': formatPrice(subtotal),
        'tax': formatPrice(tax),
        'shipping': shipping === 0 ? 'FREE' : formatPrice(shipping),
        'orderTotal': formatPrice(orderTotal),
        'cartCountText': `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// Cart item actions for cart.html page
function changeQuantity(productId, newQuantity) {
    updateCartQuantity(productId, parseInt(newQuantity));
    loadCartItems();
    updateCartSummary();
    showCartNotification('Quantity updated');
}

function removeItem(productId) {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
        removeFromCart(productId);
        loadCartItems();
        updateCartSummary();
        showCartNotification('Item removed from cart');
    }
}

function viewProduct(productId) {
    showCartNotification(`Opening product details for ${productId}`);
}

function saveForLater(productId) {
    showCartNotification('Item saved for later');
}

function shareItem(productId) {
    if (navigator.share) {
        navigator.share({
            title: 'Check out this product from Amazon',
            url: window.location.href
        });
    } else {
        showCartNotification('Share link copied to clipboard');
    }
}

function proceedToCheckout() {
    const cartItems = getCartItems();
    if (cartItems.length === 0) {
        showCartNotification('Your cart is empty. Add some items first!');
        return;
    }
    showCartNotification('Redirecting to checkout...');
    // In a real app, this would redirect to checkout page
    setTimeout(() => {
        showCartNotification('Checkout feature coming soon!');
    }, 1500);
}

function addRecommendedToCart(productId, productName, price) {
    const imageUrl = `./products/${productId}.jpg`;
    addToCart(productId, productName, price, imageUrl);
    setTimeout(() => {
        loadCartItems();
        updateCartSummary();
    }, 100);
}

// ==================== UI FEEDBACK FUNCTIONS ====================

// Visual feedback for Add to Cart button
function showAddToCartFeedback(button) {
    if (!button) return;
    
    const originalText = button.textContent;
    button.classList.add('added');
    button.textContent = 'Added!';
    button.disabled = true;
    
    setTimeout(() => {
        button.classList.remove('added');
        button.textContent = originalText;
        button.disabled = false;
    }, 1500);
}

// Cart Notification System
function showCartNotification(message) {
    // Remove existing notification
    const existing = document.querySelector('.cart-notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <div class="cart-notification-content">
            <div class="cart-notification-icon">✓</div>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="cart-notification-close">×</button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// ==================== PRODUCT FILTERING & SORTING ====================

// Product filtering functionality
function initializeFiltering() {
    const categoryFilters = document.querySelectorAll('input[name="category"]');
    const checkboxFilters = document.querySelectorAll('.filter-section input[type="checkbox"]');
    
    // Category filter listeners
    categoryFilters.forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });
    
    // Other filter listeners
    checkboxFilters.forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });
}

// Apply filters to products
function applyFilters() {
    const selectedCategory = document.querySelector('input[name="category"]:checked')?.value || 'all';
    const products = document.querySelectorAll('.product-card');
    const productsGrid = document.querySelector('.products-grid');
    
    if (!productsGrid) return; // Not on products page
    
    // Add filtering animation
    productsGrid.classList.add('filtering');
    
    setTimeout(() => {
        products.forEach(product => {
            const productCategory = product.dataset.category;
            let showProduct = true;
            
            // Category filter
            if (selectedCategory !== 'all' && productCategory !== selectedCategory) {
                showProduct = false;
            }
            
            // Price range filter
            const priceFilters = document.querySelectorAll('.filter-section input[type="checkbox"]:checked');
            if (priceFilters.length > 0) {
                const productPrice = parseInt(product.dataset.price);
                let matchesPriceRange = false;
                
                priceFilters.forEach(filter => {
                    const filterText = filter.parentElement.textContent.trim();
                    if (filterText.includes('Under ₹10,000') && productPrice < 10000) {
                        matchesPriceRange = true;
                    } else if (filterText.includes('₹10,000 - ₹25,000') && productPrice >= 10000 && productPrice <= 25000) {
                        matchesPriceRange = true;
                    } else if (filterText.includes('₹25,000 - ₹50,000') && productPrice >= 25000 && productPrice <= 50000) {
                        matchesPriceRange = true;
                    } else if (filterText.includes('₹50,000 - ₹1,00,000') && productPrice >= 50000 && productPrice <= 100000) {
                        matchesPriceRange = true;
                    } else if (filterText.includes('Over ₹1,00,000') && productPrice > 100000) {
                        matchesPriceRange = true;
                    }
                });
                
                if (!matchesPriceRange) {
                    showProduct = false;
                }
            }
            
            // Apply filter
            if (showProduct) {
                product.classList.remove('filtered-out');
                product.style.display = 'flex';
            } else {
                product.classList.add('filtered-out');
                setTimeout(() => {
                    product.style.display = 'none';
                }, 300);
            }
        });
        
        productsGrid.classList.remove('filtering');
        updateResultCount();
    }, 100);
}

// Update result count
function updateResultCount() {
    const visibleProducts = document.querySelectorAll('.product-card:not(.filtered-out)').length;
    const resultCount = document.querySelector('.result-count');
    if (resultCount) {
        resultCount.innerHTML = `1-${visibleProducts} of over 2,000 results for <span>"Latest Devices"</span>`;
    }
}

// Initialize sorting functionality
function initializeSorting() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', sortProducts);
    }
}

// Sort products
function sortProducts() {
    const sortValue = document.getElementById('sortSelect').value;
    const productsGrid = document.querySelector('.products-grid');
    const products = Array.from(document.querySelectorAll('.product-card'));
    
    if (!productsGrid) return; // Not on products page
    
    products.sort((a, b) => {
        switch (sortValue) {
            case 'price-low':
                return parseInt(a.dataset.price) - parseInt(b.dataset.price);
            case 'price-high':
                return parseInt(b.dataset.price) - parseInt(a.dataset.price);
            case 'reviews':
                const reviewsA = parseInt(a.querySelector('.review-count').textContent.replace(/,/g, ''));
                const reviewsB = parseInt(b.querySelector('.review-count').textContent.replace(/,/g, ''));
                return reviewsB - reviewsA;
            case 'newest':
                // For demo purposes, reverse the current order
                return Array.from(productsGrid.children).indexOf(b) - Array.from(productsGrid.children).indexOf(a);
            default: // featured
                return 0;
        }
    });
    
    // Reorder DOM elements
    productsGrid.innerHTML = '';
    products.forEach(product => {
        productsGrid.appendChild(product);
    });
    
    // Add load more button back
    const loadMoreContainer = document.querySelector('.load-more-container');
    if (loadMoreContainer) {
        productsGrid.parentElement.appendChild(loadMoreContainer);
    }
}

// Load more products functionality
function loadMoreProducts() {
    const button = event.target;
    button.textContent = 'Loading...';
    button.disabled = true;
    
    // Simulate loading delay
    setTimeout(() => {
        button.textContent = 'All products loaded';
        button.style.opacity = '0.6';
        showCartNotification('All available products are already displayed!');
    }, 1000);
}

// ==================== UTILITY FUNCTIONS ====================

// Format price for display
function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price).replace('₹', '₹');
}

// Format date for display
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

// Enhanced product card interactions
document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers to product cards for better UX
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        // Add hover effect for product name
        const productName = card.querySelector('h3');
        if (productName) {
            productName.addEventListener('click', function(e) {
                e.stopPropagation();
                showCartNotification(`Opening details for ${this.textContent}`);
            });
        }
        
        // Add click handler for product images
        const productImage = card.querySelector('.product-image img');
        if (productImage) {
            productImage.addEventListener('click', function(e) {
                e.stopPropagation();
                showCartNotification('Product image gallery would open here');
            });
        }
        
        // Add click handler for ratings
        const rating = card.querySelector('.review-count');
        if (rating) {
            rating.addEventListener('click', function(e) {
                e.stopPropagation();
                showCartNotification('Customer reviews would open here');
            });
        }
    });
});

// ==================== STYLES ====================

// Add styles for cart notification and button feedback
const cartStyles = `
<style>
.cart-notification {
    position: fixed;
    top: 70px;
    right: 20px;
    z-index: 10000;
    animation: slideInRight 0.3s ease-out;
}

.cart-notification-content {
    background: #d4ff8a;
    border: 1px solid #b8e65c;
    border-radius: 4px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    min-width: 280px;
    font-family: 'Outfit', sans-serif;
}

.cart-notification-icon {
    background: #007185;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    flex-shrink: 0;
}

.cart-notification-close {
    background: none;
    border: none;
    font-size: 18px;
    color: #666;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.2s;
}

.cart-notification-close:hover {
    background: rgba(0,0,0,0.1);
}

.add-to-cart-btn.added {
    background: #28a745 !important;
    color: white !important;
    transform: scale(0.95);
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@media (max-width: 768px) {
    .cart-notification {
        right: 10px;
        left: 10px;
    }
    
    .cart-notification-content {
        min-width: auto;
    }
}
</style>
`;

// Inject cart styles
document.head.insertAdjacentHTML('beforeend', cartStyles);

// Export functions for global access
window.cartFunctions = {
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getCartItems,
    getCartTotal,
    clearCart,
    updateCartCount,
    formatPrice,
    formatDate
};
