import { database, ref, push, onValue } from '../config/firebase-config.js';
import { authService } from './auth-service.js';
import { cartService } from './cart-service.js';
import { showToast } from '../components/toast.js';

class OrdersService {
    constructor() {
        this.orders = [];
        this.listeners = [];
        this.userId = authService.getUserId();
        this.init();
    }
    
    init() {
        this.listenToOrders();
    }
    
    listenToOrders() {
        const ordersRef = ref(database, 'orders');
        onValue(ordersRef, (snapshot) => {
            const allOrders = snapshot.val() || {};
            this.orders = Object.values(allOrders)
                .filter(order => order.userId === this.userId)
                .sort((a, b) => new Date(b.date) - new Date(a.date));
            this.notifyListeners();
        });
    }
    
    async createOrder() {
        const cartItems = cartService.getItems();
        if (cartItems.length === 0) {
            showToast('السلة فارغة!', 'error');
            return null;
        }
        
        const total = cartService.getTotal();
        const orderRef = push(ref(database, 'orders'));
        const order = {
            id: orderRef.key,
            userId: this.userId,
            date: new Date().toISOString(),
            items: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                qty: item.qty,
                price: item.price,
                image: item.image
            })),
            total: total,
            status: 'pending'
        };
        
        await set(orderRef, order);
        cartService.clear();
        showToast(`🎉 تم الطلب بنجاح! $${total.toFixed(2)}`, 'success');
        return order;
    }
    
    getUserOrders() {
        return [...this.orders];
    }
    
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }
    
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.orders));
    }
}

export const ordersService = new OrdersService();
