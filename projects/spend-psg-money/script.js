const TOTAL_BUDGET = 2200000000; // €2.2 billion
let remainingBudget = TOTAL_BUDGET;
let cart = [];

// Format number with spaces as thousands separator
const formatNumber = (num) => {
    return new Intl.NumberFormat('ru-RU').format(num);
};

// Format price in euros
const formatPrice = (price) => {
    return `€${formatNumber(price)}`;
};

// Update money display
const updateMoneyDisplay = () => {
    const remainingElement = document.getElementById('remainingAmount');
    const spentElement = document.getElementById('spentAmount');
    
    // Ensure we have properly formatted numbers before animation
    remainingElement.textContent = formatPrice(remainingBudget);
    spentElement.textContent = formatPrice(TOTAL_BUDGET - remainingBudget);
    
    // Add small delay before animation to ensure rendering completes
    setTimeout(() => {
        // Animate money update
        remainingElement.classList.add('updating');
        setTimeout(() => {
            remainingElement.classList.remove('updating');
        }, 600);
    }, 50);
    
    // Update progress bar
    updateProgressBar();
};

// Update progress bar
const updateProgressBar = () => {
    const spent = TOTAL_BUDGET - remainingBudget;
    const percentage = Math.round((spent / TOTAL_BUDGET) * 100);
    
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    progressBar.style.width = percentage + '%';
    progressText.textContent = percentage + '%';
    
    // Add special effects at milestones
    if (percentage === 25 || percentage === 50 || percentage === 75 || percentage === 100) {
        progressBar.style.animation = 'shimmerProgress 1s linear infinite, pulseGold 0.5s ease';
        setTimeout(() => {
            progressBar.style.animation = 'shimmerProgress 2s linear infinite';
        }, 500);
    }
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

// Create flying item animation
const createFlyingItem = (itemElement, itemData) => {
    const rect = itemElement.getBoundingClientRect();
    const cart = document.getElementById('cart');
    const cartRect = cart.getBoundingClientRect();
    
    const flyingItem = document.createElement('div');
    flyingItem.className = 'flying-item';
    flyingItem.innerHTML = `<span style="font-size: 48px;">${itemData.emoji}</span>`;
    flyingItem.style.left = rect.left + rect.width / 2 - 24 + 'px';
    flyingItem.style.top = rect.top + 'px';
    
    document.body.appendChild(flyingItem);
    
    setTimeout(() => {
        flyingItem.remove();
    }, 800);
};

// Create confetti animation
const createConfetti = () => {
    const colors = ['#FFD700', '#D4AF37', '#FFA500', '#FF6347', '#FF1493'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animation = `confettiFall ${2 + Math.random() * 2}s linear forwards`;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 4000);
        }, i * 50);
    }
};

// Add item to cart
const addToCart = (itemId) => {
    const item = items.find(i => i.id === itemId);
    const itemElement = document.querySelector(`.quantity-input[data-id="${itemId}"]`);
    const itemCard = itemElement.closest('.item-card');
    
    if (item.price > remainingBudget) {
        itemCard.classList.add('insufficient-funds');
        setTimeout(() => {
            itemCard.classList.remove('insufficient-funds');
        }, 500);
        alert('Недостаточно средств для покупки этого товара!');
        return;
    }
    
    // Add animation classes
    itemCard.classList.add('adding');
    setTimeout(() => {
        itemCard.classList.remove('adding');
    }, 500);
    
    // Create flying animation
    createFlyingItem(itemCard, item);
    
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
    const itemElement = document.querySelector(`.quantity-input[data-id="${itemId}"]`);
    const itemCard = itemElement.closest('.item-card');
    
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
            itemCard.classList.add('insufficient-funds');
            setTimeout(() => {
                itemCard.classList.remove('insufficient-funds');
            }, 500);
            alert(`Недостаточно средств! Максимально доступное количество: ${maxAffordable}`);
            updateItemCard(itemId); // Reset input to current value
            return;
        }
        
        // Add animation if increasing quantity
        if (difference > 0) {
            itemCard.classList.add('adding');
            setTimeout(() => {
                itemCard.classList.remove('adding');
            }, 500);
            
            // Create flying animation
            createFlyingItem(itemCard, item);
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
        document.getElementById('mostExpensive').style.display = 'none';
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
    
    // Show most expensive item
    updateMostExpensive();
};

// Update most expensive item display
const updateMostExpensive = () => {
    if (cart.length === 0) return;
    
    const mostExpensive = cart.reduce((max, item) => 
        (item.price * item.quantity > max.price * max.quantity) ? item : max
    );
    
    const mostExpensiveDiv = document.getElementById('mostExpensive');
    const expensiveItem = document.getElementById('expensiveItem');
    
    mostExpensiveDiv.style.display = 'block';
    expensiveItem.innerHTML = `
        <span class="emoji">${mostExpensive.emoji}</span>
        <div class="details">
            <div class="name">${mostExpensive.name}</div>
            <div class="price">${formatPrice(mostExpensive.price * mostExpensive.quantity)}</div>
        </div>
    `;
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
    
    // Add confetti effect
    setTimeout(() => {
        createConfetti();
    }, 300);
};

// Reset game
const resetGame = () => {
    remainingBudget = TOTAL_BUDGET;
    cart = [];
    updateMoneyDisplay();
    renderCart();
    items.forEach(item => updateItemCard(item.id));
    document.getElementById('successModal').style.display = 'none';
    document.getElementById('mostExpensive').style.display = 'none';
};

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    renderItems();
    updateMoneyDisplay();
    
    // Получаем необходимые элементы
    const moneyDisplayContainer = document.getElementById('moneyDisplayContainer');
    const moneyDisplay = document.getElementById('moneyDisplay');
    
    // Определяем позицию контейнера
    let containerTop = moneyDisplayContainer.offsetTop;
    let moneyDisplayHeight = moneyDisplay.offsetHeight;
    
    // Обновляем позицию при изменении размера окна
    window.addEventListener('resize', () => {
        containerTop = moneyDisplayContainer.offsetTop;
        moneyDisplayHeight = moneyDisplay.offsetHeight;
    });
    
    // Слушаем событие скролла
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Если проскроллили ниже контейнера, добавляем sticky-header
        if (scrollTop > containerTop) {
            moneyDisplayContainer.classList.add('sticky-header');
            moneyDisplay.classList.add('compact-view');
            document.body.style.paddingTop = moneyDisplayHeight + 'px';
        } else {
            moneyDisplayContainer.classList.remove('sticky-header');
            moneyDisplay.classList.remove('compact-view');
            document.body.style.paddingTop = '0';
        }
    });
    
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