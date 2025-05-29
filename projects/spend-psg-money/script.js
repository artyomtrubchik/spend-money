const TOTAL_BUDGET = 2200000000; // €2.2 billion
let remainingBudget = TOTAL_BUDGET;
let cart = [];

// Format number with spaces as thousands separator
const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Format price in euros
const formatPrice = (price) => {
    return `€${formatNumber(price)}`;
};

// Update money display
const updateMoneyDisplay = () => {
    document.getElementById('remainingAmount').textContent = formatPrice(remainingBudget);
    document.getElementById('spentAmount').textContent = formatPrice(TOTAL_BUDGET - remainingBudget);
};

// Create item card HTML
const createItemCard = (item) => {
    const div = document.createElement('div');
    div.className = 'item-card';
    div.innerHTML = `
        <div class="item-emoji">${item.emoji}</div>
        <h3 class="item-name">${item.name}</h3>
        <div class="item-price">${formatPrice(item.price)}</div>
        <div class="item-description">${item.description}</div>
        <div class="item-controls">
            <button class="buy-btn" data-id="${item.id}">Купить</button>
            <div class="quantity-controls" style="display: none;">
                <button class="quantity-btn" data-action="decrease" data-id="${item.id}">-</button>
                <span class="quantity" data-id="${item.id}">0</span>
                <button class="quantity-btn" data-action="increase" data-id="${item.id}">+</button>
            </div>
        </div>
    `;
    return div;
};

// Render items grid
const renderItems = () => {
    const grid = document.getElementById('itemsGrid');
    grid.innerHTML = '';
    
    items.forEach(item => {
        grid.appendChild(createItemCard(item));
    });
};

// Update item card display
const updateItemCard = (itemId) => {
    const cartItem = cart.find(item => item.id === itemId);
    const buyBtn = document.querySelector(`.buy-btn[data-id="${itemId}"]`);
    const quantityControls = buyBtn.nextElementSibling;
    const quantitySpan = document.querySelector(`.quantity[data-id="${itemId}"]`);
    
    if (cartItem && cartItem.quantity > 0) {
        buyBtn.style.display = 'none';
        quantityControls.style.display = 'flex';
        quantitySpan.textContent = cartItem.quantity;
    } else {
        buyBtn.style.display = 'block';
        quantityControls.style.display = 'none';
    }
};

// Add item to cart
const addToCart = (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (item.price > remainingBudget) {
        alert('Недостаточно средств для покупки этого товара!');
        return;
    }
    
    const existingItem = cart.find(i => i.id === itemId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    
    remainingBudget -= item.price;
    updateMoneyDisplay();
    updateItemCard(itemId);
    renderCart();
    
    checkWinCondition();
};

// Remove item from cart
const removeFromCart = (itemId) => {
    const cartItem = cart.find(i => i.id === itemId);
    if (!cartItem || cartItem.quantity === 0) return;
    
    const item = items.find(i => i.id === itemId);
    cartItem.quantity--;
    remainingBudget += item.price;
    
    if (cartItem.quantity === 0) {
        cart = cart.filter(i => i.id !== itemId);
    }
    
    updateMoneyDisplay();
    updateItemCard(itemId);
    renderCart();
};

// Render cart
const renderCart = () => {
    const cartItems = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Пока ничего не куплено</p>';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <span class="cart-item-emoji">${item.emoji}</span>
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-quantity">x${item.quantity}</span>
            </div>
            <span class="cart-item-total">${formatPrice(item.price * item.quantity)}</span>
        </div>
    `).join('');
};

// Check win condition
const checkWinCondition = () => {
    if (remainingBudget === 0) {
        showSuccessModal();
    }
};

// Show success modal
const showSuccessModal = () => {
    const modal = document.getElementById('successModal');
    const finalCart = document.getElementById('finalCart');
    
    finalCart.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <span class="cart-item-emoji">${item.emoji}</span>
                <span class="cart-item-name">${item.name} x${item.quantity}</span>
            </div>
            <span class="cart-item-total">${formatPrice(item.price * item.quantity)}</span>
        </div>
    `).join('');
    
    modal.style.display = 'flex';
};

// Reset game
const resetGame = () => {
    remainingBudget = TOTAL_BUDGET;
    cart = [];
    updateMoneyDisplay();
    renderCart();
    items.forEach(item => updateItemCard(item.id));
    document.getElementById('successModal').style.display = 'none';
};

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    renderItems();
    updateMoneyDisplay();
    
    // Buy button clicks
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('buy-btn')) {
            const itemId = parseInt(e.target.dataset.id);
            addToCart(itemId);
        }
        
        // Quantity control buttons
        if (e.target.classList.contains('quantity-btn')) {
            const itemId = parseInt(e.target.dataset.id);
            const action = e.target.dataset.action;
            
            if (action === 'increase') {
                addToCart(itemId);
            } else if (action === 'decrease') {
                removeFromCart(itemId);
            }
        }
    });
    
    // Reset button
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    
    // Play again button
    document.getElementById('playAgainBtn').addEventListener('click', resetGame);
}); 