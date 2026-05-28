import { database, ref, set, onValue } from '../config/firebase-config.js';
import { authService } from './auth-service.js';
import { showToast } from '../components/toast.js';

class FavoritesService {
    constructor() {
        this.items = [];
        this.listeners = [];
        this.userId = authService.getUserId();
        this.init();
    }
    
    async init() {
        await this.loadFavorites();
        this.listenToChanges();
    }
    
    async loadFavorites() {
        try {
            const snapshot = await get(ref(database, `users/${this.userId}/favorites`));
            this.items = snapshot.exists() ? snapshot.val() : [];
            this.notifyListeners();
        } catch (error) {
            console.error("فشل تحميل المفضلة:", error);
            this.items = [];
        }
    }
    
    listenToChanges() {
        const favRef = ref(database, `users/${this.userId}/favorites`);
        onValue(favRef, (snapshot) => {
            const newItems = snapshot.val() || [];
            if (JSON.stringify(this.items) !== JSON.stringify(newItems)) {
                this.items = newItems;
                this.notifyListeners();
            }
        });
    }
    
    async saveFavorites() {
        try {
            await set(ref(database, `users/${this.userId}/favorites`), this.items);
        } catch (error) {
            showToast("فشل حفظ المفضلة", "error");
        }
    }
    
    async toggle(itemId) {
        if (this.items.includes(itemId)) {
            this.items = this.items.filter(id => id !== itemId);
            await this.saveFavorites();
            showToast('💔 تمت الإزالة من المفضلة', 'info');
            return false;
        } else {
            this.items.push(itemId);
            await this.saveFavorites();
            showToast('❤️ أضيف للمفضلة', 'success');
            return true;
        }
    }
    
    isFavorite(itemId) {
        return this.items.includes(itemId);
    }
    
    getFavorites() {
        return [...this.items];
    }
    
    getCount() {
        return this.items.length;
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

export const favoritesService = new FavoritesService();
