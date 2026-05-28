import { ordersService } from '../services/orders-service.js';

export async function renderOrdersPage() {
    const container = document.getElementById('app');
    if (!container) return;
    
    function updateOrdersUI() {
        const orders = ordersService.getUserOrders();
        
        if (orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <h3>لا توجد طلبات سابقة</h3>
                    <p>قم بتقديم طلبك الأول الآن</p>
                    <a href="menu.html" class="btn-primary">اطلب الآن</a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <h2 class="section-title">📦 طلباتي السابقة</h2>
            <div class="orders-container" id="ordersList"></div>
        `;
        
        const ordersList = document.getElementById('ordersList');
        
        const statusMap = {
            pending: '⏳ قيد المعالجة',
            preparing: '👨‍🍳 جاري التحضير',
            ready: '✅ جاهز للتسليم',
            cancelled: '❌ ملغي'
        };
        
        ordersList.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">طلب #${order.id.slice(-6)}</span>
                    <span class="order-date">📅 ${new Date(order.date).toLocaleString('ar-EG')}</span>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span>${item.name}</span>
                            <span>x${item.qty}</span>
                            <span>$${(item.price * item.qty).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-footer">
                    <div class="order-total">💰 الإجمالي: $${order.total.toFixed(2)}</div>
                    <div class="status ${order.status}">${statusMap[order.status]}</div>
                </div>
            </div>
        `).join('');
    }
    
    updateOrdersUI();
    ordersService.subscribe(() => updateOrdersUI());
}
