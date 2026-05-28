import { database, ref, get, set } from '../config/firebase-config.js';

class AuthService {
    constructor() {
        this.userId = null;
        this.init();
    }
    
    init() {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 12);
        }
        // إزالة الأحرف غير المسموحة
        userId = userId.replace(/[.#$\[\]]/g, '_');
        localStorage.setItem('userId', userId);
        this.userId = userId;
    }
    
    getUserId() {
        return this.userId;
    }
    
    async getUserData() {
        const snapshot = await get(ref(database, `users/${this.userId}`));
        return snapshot.exists() ? snapshot.val() : { cart: [], favorites: [] };
    }
}

export const authService = new AuthService();
