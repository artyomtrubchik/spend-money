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
            <div class="quantity-controls">
                <button class="quantity-btn" data-action="decrease" data-id="${item.id}">−</button>
                <input type="number" class="quantity-input" data-id="${item.id}" value="0" min="0">
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
    const quantityInput = document.querySelector(`.quantity-input[data-id="${itemId}"]`);
    
    if (cartItem && cartItem.quantity > 0) {
        quantityInput.value = cartItem.quantity;
    } else {
        quantityInput.value = 0;
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

// Set item quantity directly
const setItemQuantity = (itemId, newQuantity) => {
    const item = items.find(i => i.id === itemId);
    const cartItem = cart.find(i => i.id === itemId);
    
    // Ensure newQuantity is a valid number
    newQuantity = Math.max(0, parseInt(newQuantity) || 0);
    
    if (newQuantity === 0) {
        // Remove item from cart
        if (cartItem) {
            remainingBudget += item.price * cartItem.quantity;
            cart = cart.filter(i => i.id !== itemId);
        }
    } else {
        const currentQuantity = cartItem ? cartItem.quantity : 0;
        const difference = newQuantity - currentQuantity;
        const totalCost = item.price * difference;
        
        // Check if we can afford the new quantity
        if (totalCost > remainingBudget) {
            // Calculate maximum affordable quantity
            const maxAffordable = currentQuantity + Math.floor(remainingBudget / item.price);
            alert(`Недостаточно средств! Максимально доступное количество: ${maxAffordable}`);
            updateItemCard(itemId); // Reset input to current value
            return;
        }
        
        // Update cart
        if (cartItem) {
            cartItem.quantity = newQuantity;
        } else {
            cart.push({ ...item, quantity: newQuantity });
        }
        
        remainingBudget -= totalCost;
    }
    
    updateMoneyDisplay();
    updateItemCard(itemId);
    renderCart();
    checkWinCondition();
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
    
    // Quantity control buttons
    document.addEventListener('click', (e) => {
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
    
    // Quantity input changes
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('quantity-input')) {
            const itemId = parseInt(e.target.dataset.id);
            const newQuantity = e.target.value;
            setItemQuantity(itemId, newQuantity);
        }
    });
    
    // Prevent negative numbers and non-numeric input
    document.addEventListener('keydown', (e) => {
        if (e.target.classList.contains('quantity-input')) {
            // Allow: backspace, delete, tab, escape, enter
            if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right
                (e.keyCode >= 35 && e.keyCode <= 39)) {
                return;
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        }
    });
    
    // Reset button
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    
    // Play again button
    document.getElementById('playAgainBtn').addEventListener('click', resetGame);
}); 