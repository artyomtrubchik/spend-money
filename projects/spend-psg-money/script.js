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
    const percentage = (spent / TOTAL_BUDGET) * 100; // Процент потраченных денег
    
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    // Обновляем ширину прогресс-бара (минимум 0.1% для видимости)
    const displayWidth = Math.max(percentage, 0.1);
    progressBar.style.width = displayWidth + '%';
    
    // Форматируем процент с нужной точностью
    let percentText;
    if (percentage === 0) {
        percentText = '0%';
    } else if (percentage < 0.000001) {
        // Если очень маленький процент, показываем научную нотацию
        percentText = percentage.toExponential(6) + '%';
    } else if (percentage < 0.0001) {
        // Для очень маленьких значений показываем 6 знаков после запятой
        percentText = percentage.toFixed(6) + '%';
    } else if (percentage < 0.01) {
        // Для маленьких значений показываем 4 знака после запятой
        percentText = percentage.toFixed(4) + '%';
    } else if (percentage < 1) {
        // Для значений меньше 1% показываем 2 знака после запятой
        percentText = percentage.toFixed(2) + '%';
    } else {
        // Для остальных значений округляем до 2 знаков
        percentText = percentage.toFixed(2) + '%';
    }
    
    // Обновляем текст процента
    progressText.innerHTML = `Вы потратили ${percentText}`;
    
    // Add special effects at milestones
    if (Math.round(percentage) === 25 || Math.round(percentage) === 50 || 
        Math.round(percentage) === 75 || Math.round(percentage) === 100) {
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
    const cartShare = document.getElementById('cartShare');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Ваша корзина пуста</p>';
        document.getElementById('mostExpensive').style.display = 'none';
        cartShare.style.display = 'none';
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
    
    // Show share buttons if there are items in cart
    cartShare.style.display = 'flex';
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
    const itemsGrid = document.getElementById('itemsGrid');
    
    // Hide the items grid when game is completed
    itemsGrid.style.display = 'none';
    
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
    document.getElementById('cartShare').style.display = 'none';
    
    // Show the items grid again when resetting the game
    document.getElementById('itemsGrid').style.display = 'grid';
};

// Создаем текст с результатами для шаринга
const createShareText = () => {
    const totalSpent = TOTAL_BUDGET - remainingBudget;
    
    let shareText = `🤑 Я потратил(а) ${formatPrice(totalSpent)} из бюджета ПСЖ! 🤑\n\n`;
    
    // Добавляем топ-3 самых дорогих покупок
    const sortedCart = [...cart].sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity));
    const top3 = sortedCart.slice(0, 3);
    
    shareText += 'Мои самые дорогие покупки:\n';
    top3.forEach((item, index) => {
        shareText += `${index + 1}. ${item.emoji} ${item.name} - ${formatPrice(item.price * item.quantity)}\n`;
    });
    
    // Добавляем правильное склонение для количества покупок
    const itemCount = cart.length;
    let itemCountText;
    
    if (itemCount === 0) {
        itemCountText = 'Нет покупок';
    } else if (itemCount === 1) {
        itemCountText = '1 покупка';
    } else if (itemCount >= 2 && itemCount <= 4) {
        itemCountText = `${itemCount} покупки`;
    } else {
        itemCountText = `${itemCount} покупок`;
    }
    
    shareText += `\nВсего: ${itemCountText}!\n`;
    shareText += 'Попробуй потратить деньги ПСЖ на https://www.sports.ru/';
    
    return shareText;
};

// Копируем текст в буфер обмена
const copyTextToClipboard = (text, successElementId = 'copySuccess') => {
    // Пробуем использовать современное API clipboard
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text)
            .then(() => {
                showCopySuccess(successElementId);
            })
            .catch(err => {
                console.error('Ошибка при копировании: ', err);
                fallbackCopyTextToClipboard(text, successElementId);
            });
    } else {
        fallbackCopyTextToClipboard(text, successElementId);
    }
};

// Запасной метод копирования текста
const fallbackCopyTextToClipboard = (text, successElementId = 'copySuccess') => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Скрываем элемент
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopySuccess(successElementId);
        } else {
            console.error('Не удалось скопировать текст');
        }
    } catch (err) {
        console.error('Ошибка при копировании текста: ', err);
    }
    
    document.body.removeChild(textArea);
};

// Показываем сообщение об успешном копировании
const showCopySuccess = (elementId = 'copySuccess') => {
    const copySuccess = document.getElementById(elementId);
    copySuccess.textContent = 'Текст скопирован!';
    copySuccess.classList.add('visible');
    
    // Скрываем сообщение через 3 секунды
    setTimeout(() => {
        copySuccess.classList.remove('visible');
    }, 3000);
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
    
    // Share button in final modal
    document.getElementById('copyBtn').addEventListener('click', () => {
        const shareText = createShareText();
        copyTextToClipboard(shareText);
    });
    
    // Telegram share button in final modal
    document.getElementById('tgBtn').addEventListener('click', () => {
        const shareText = encodeURIComponent(createShareText());
        const telegramUrl = `https://t.me/share/url?url=https://www.sports.ru/&text=${shareText}`;
        window.open(telegramUrl, '_blank');
    });
    
    // WhatsApp share button in final modal
    document.getElementById('waBtn').addEventListener('click', () => {
        const shareText = encodeURIComponent(createShareText());
        const whatsappUrl = `https://wa.me/?text=${shareText}`;
        window.open(whatsappUrl, '_blank');
    });
    
    // Share button in cart
    document.getElementById('copyCartBtn').addEventListener('click', () => {
        const shareText = createShareText();
        copyTextToClipboard(shareText, 'cartCopySuccess');
    });
    
    // Telegram share button in cart
    document.getElementById('tgCartBtn').addEventListener('click', () => {
        const shareText = encodeURIComponent(createShareText());
        const telegramUrl = `https://t.me/share/url?url=https://www.sports.ru/&text=${shareText}`;
        window.open(telegramUrl, '_blank');
    });
    
    // WhatsApp share button in cart
    document.getElementById('waCartBtn').addEventListener('click', () => {
        const shareText = encodeURIComponent(createShareText());
        const whatsappUrl = `https://wa.me/?text=${shareText}`;
        window.open(whatsappUrl, '_blank');
    });
}); 