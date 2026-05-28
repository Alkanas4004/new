import { database, ref, set, onValue } from '../config/firebase-config.js';
import { authService } from './auth-service.js';
import { showToast } from '../components/toast.js';

class CartService {
    constructor() {
        this.items = [];
        this.listeners = [];
        this.userId = authService.getUserId();
        this.init();
    }
    
    async init() {
        await this.loadCart();
        this.listenToChanges();
    }
    
    async loadCart() {
        try {
            const snapshot = await get(ref(database, `users/${this.userId}/cart`));
            this.items = snapshot.exists() ? snapshot.val() : [];
            this.notifyListeners();
        } catch (error) {
            console.error("فشل تحميل السلة:", error);
            this.items = [];
        }
    }
    
    listenToChanges() {
        const cartRef = ref(database, `users/${this.userId}/cart`);
        onValue(cartRef, (snapshot) => {
            const newItems = snapshot.val() || [];
            if (JSON.stringify(this.items) !== JSON.stringify(newItems)) {
                this.items = newItems;
                this.notifyListeners();
            }
        });
    }
    
    async saveCart() {
        try {
            await set(ref(database, `users/${this.userId}/cart`), this.items);
        } catch (error) {
            showToast("فشل حفظ السلة", "error");
        }
    }
    
    async addItem(item, qty = 1) {
        const existing = this.items.find(i => i.id === item.id);
        if (existing) {
            existing.qty += qty;
        } else {
            this.items.push({ ...item, qty });
        }
        await this.saveCart();
        showToast(`✅ تم اضافة ${item.name} (${qty})`, 'success');
    }
    
    async removeItem(itemId) {
        this.items = this.items.filter(i => i.id !== itemId);
        await this.saveCart();
        showToast('تم الحذف من السلة', 'info');
    }
    
    async updateQuantity(itemId, delta) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            const newQty = Math.max(1, Math.min(20, item.qty + delta));
            item.qty = newQty;
            await this.saveCart();
        }
    }
    
    getItems() {
        return [...this.items];
    }
    
    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    }
    
    getItemCount() {
        return this.items.reduce((sum, item) => sum + item.qty, 0);
    }
    
    clear() {
        this.items = [];
        this.saveCart();
    }
    
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }
    
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.items));
    }
}

export const cartService = new CartService();
