import { cartService } from '../services/cart-service.js';
import { ordersService } from '../services/orders-service.js';

export async function renderCartPage() {
    const container = document.getElementById('app');
    if (!container) return;
    
    function updateCartUI() {
        const items = cartService.getItems();
        const total = cartService.getTotal();
        
        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>السلة فارغة</h3>
                    <p>أضف بعض الأطباق اللذيذة إلى سلتك</p>
                    <a href="menu.html" class="btn-primary">تصفح المنيو</a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="cart-container">
                <h2 class="section-title">🛒 سلة المشتريات</h2>
                <div class="cart-items" id="cartItems"></div>
                <div class="cart-summary" id="cartSummary"></div>
            </div>
        `;
        
        const cartItemsDiv = document.getElementById('cartItems');
        const cartSummary = document.getElementById('cartSummary');
        
        cartItemsDiv.innerHTML = items.map(item => `
            <div class="cart-item">
                <div class="cart-item-img">
                    <span style="font-size: 2rem;">${item.image}</span>
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="qty-btn" data-id="${item.id}" data-delta="-1">−</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" data-id="${item.id}" data-delta="1">+</button>
                    </div>
                </div>
                <div class="cart-item-total">
                    $${(item.price * item.qty).toFixed(2)}
                </div>
                <button class="remove-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
        
        cartSummary.innerHTML = `
            <div class="summary-card">
                <h3>ملخص الطلب</h3>
                <div class="summary-row">
                    <span>المجموع:</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>الضريبة (14%):</span>
                    <span>$${(total * 0.14).toFixed(2)}</span>
                </div>
                <div class="summary-row total">
                    <span>الإجمالي:</span>
                    <span>$${(total * 1.14).toFixed(2)}</span>
                </div>
                <button id="checkoutBtn" class="btn-primary checkout-btn">
                    <i class="fas fa-check"></i> إتمام الطلب
                </button>
            </div>
        `;
        
        // إضافة الأحداث
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = parseInt(btn.dataset.id);
                const delta = parseInt(btn.dataset.delta);
                await cartService.updateQuantity(id, delta);
                updateCartUI();
            });
        });
        
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = parseInt(btn.dataset.id);
                await cartService.removeItem(id);
                updateCartUI();
            });
        });
        
        document.getElementById('checkoutBtn').addEventListener('click', async () => {
            await ordersService.createOrder();
            updateCartUI();
        });
    }
    
    updateCartUI();
    
    // الاستماع للتغييرات
    cartService.subscribe(() => updateCartUI());
}
