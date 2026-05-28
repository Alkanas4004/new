import { cartService } from '../services/cart-service.js';
import { favoritesService } from '../services/favorites-service.js';

export function createFoodCard(item, view = 'grid') {
    const card = document.createElement('div');
    card.className = 'food-card';
    
    const isFavorite = favoritesService.isFavorite(item.id);
    const discountHtml = item.discount ? `<span class="discount-badge">🔥 خصم ${item.discount}</span>` : '';
    
    card.innerHTML = `
        ${discountHtml}
        <div class="card-img">
            <span style="font-size: ${view === 'grid' ? '3.2rem' : '2.5rem'};">${item.image}</span>
        </div>
        <div class="card-info">
            <div class="food-name">${item.name}</div>
            <div class="food-price">💎 $${item.price.toFixed(2)}</div>
            <div class="quantity-selector">
                <button class="qty-btn" data-action="decr" data-id="${item.id}">−</button>
                <span class="qty-display" id="qty-${item.id}">1</span>
                <button class="qty-btn" data-action="incr" data-id="${item.id}">+</button>
            </div>
            <div class="card-actions">
                <button class="add-to-cart-btn" data-id="${item.id}">
                    <i class="fas fa-cart-plus"></i> أضف
                </button>
                <button class="fav-btn ${isFavorite ? 'liked' : ''}" data-id="${item.id}">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        </div>
    `;
    
    // إضافة الأحداث
    const addBtn = card.querySelector('.add-to-cart-btn');
    addBtn.addEventListener('click', async () => {
        const qtySpan = card.querySelector(`#qty-${item.id}`);
        const qty = parseInt(qtySpan.textContent);
        await cartService.addItem(item, qty);
        qtySpan.textContent = '1';
        
        // تأثير الطيران
        animateToCart(card.querySelector('.card-img span'), addBtn);
    });
    
    const favBtn = card.querySelector('.fav-btn');
    favBtn.addEventListener('click', async () => {
        await favoritesService.toggle(item.id);
        favBtn.classList.toggle('liked');
    });
    
    const decrBtn = card.querySelector('[data-action="decr"]');
    const incrBtn = card.querySelector('[data-action="incr"]');
    const qtySpan = card.querySelector(`#qty-${item.id}`);
    
    decrBtn.addEventListener('click', () => {
        let val = parseInt(qtySpan.textContent);
        if (val > 1) {
            qtySpan.textContent = val - 1;
            animateQty(qtySpan);
        }
    });
    
    incrBtn.addEventListener('click', () => {
        let val = parseInt(qtySpan.textContent);
        if (val < 20) {
            qtySpan.textContent = val + 1;
            animateQty(qtySpan);
        }
    });
    
    return card;
}

function animateQty(element) {
    element.style.transform = 'scale(1.3)';
    setTimeout(() => element.style.transform = '', 200);
}

function animateToCart(sourceElement, button) {
    const clone = sourceElement.cloneNode(true);
    const rect = sourceElement.getBoundingClientRect();
    const cartIcon = document.querySelector('.cart-icon');
    
    if (cartIcon) {
        const cartRect = cartIcon.getBoundingClientRect();
        clone.style.cssText = `
            position: fixed;
            left: ${rect.left}px;
            top: ${rect.top}px;
            font-size: 2.5rem;
            z-index: 9999;
            transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            pointer-events: none;
        `;
        document.body.appendChild(clone);
        
        requestAnimationFrame(() => {
            clone.style.left = (cartRect.left + cartRect.width/2 - 20) + 'px';
            clone.style.top = (cartRect.top + cartRect.height/2 - 20) + 'px';
            clone.style.opacity = '0';
            clone.style.transform = 'scale(0.2)';
        });
        
        setTimeout(() => clone.remove(), 800);
    }
}
