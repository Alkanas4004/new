import { database, ref, get, set, onValue } from '../config/firebase-config.js';

// البيانات الافتراضية للمنيو
export const DEFAULT_MENU = [
    { id: 1, name: "ستيك فريتس", price: 29.99, category: "main", image: "🥩", discount: null },
    { id: 2, name: "دجاج ألفريدو", price: 18.50, category: "main", image: "🍝", discount: "10%" },
    { id: 3, name: "شوربة الفطر", price: 12.99, category: "appetizer", image: "🍄", discount: null },
    { id: 4, name: "تشيز كيك نيويورك", price: 8.50, category: "dessert", image: "🍰", discount: "5%" },
    { id: 5, name: "عصير مانجو", price: 5.99, category: "drink", image: "🥭", discount: null },
    { id: 6, name: "بيتزا مارجريتا", price: 15.99, category: "main", image: "🍕", discount: null },
    { id: 7, name: "سيزر سلطة", price: 9.99, category: "appetizer", image: "🥗", discount: "15%" },
    { id: 8, name: "مكرونة بولونيز", price: 17.50, category: "main", image: "🍝", discount: null },
    { id: 9, name: "كريب نوتيلا", price: 11.99, category: "dessert", image: "🥞", discount: null },
    { id: 10, name: "كوكاكولا", price: 3.50, category: "drink", image: "🥤", discount: null },
    { id: 11, name: "برجر لحم", price: 14.99, category: "main", image: "🍔", discount: "5%" },
    { id: 12, name: "بطاطس مقلية", price: 6.99, category: "appetizer", image: "🍟", discount: null },
    { id: 13, name: "آيس كريم فانيليا", price: 4.99, category: "dessert", image: "🍦", discount: null },
    { id: 14, name: "عصير برتقال", price: 4.50, category: "drink", image: "🍊", discount: null },
    { id: 15, name: "سمك مشوي", price: 22.99, category: "main", image: "🐟", discount: "10%" }
];

class MenuService {
    constructor() {
        this.items = [];
        this.listeners = [];
        this.init();
    }
    
    async init() {
        await this.loadMenu();
        this.listenToChanges();
    }
    
    async loadMenu() {
        try {
            const snapshot = await get(ref(database, 'menu'));
            if (snapshot.exists()) {
                this.items = snapshot.val();
            } else {
                this.items = [...DEFAULT_MENU];
                await set(ref(database, 'menu'), this.items);
            }
            this.notifyListeners();
        } catch (error) {
            console.error("فشل تحميل المنيو:", error);
            this.items = [...DEFAULT_MENU];
            this.notifyListeners();
        }
    }
    
    listenToChanges() {
        const menuRef = ref(database, 'menu');
        onValue(menuRef, (snapshot) => {
            if (snapshot.exists()) {
                this.items = snapshot.val();
                this.notifyListeners();
            }
        });
    }
    
    getItem(id) {
        return this.items.find(item => item.id === id);
    }
    
    getAllItems() {
        return [...this.items];
    }
    
    getItemsByCategory(category) {
        return this.items.filter(item => item.category === category);
    }
    
    getSpecials(limit = 6) {
        return [...this.items].sort(() => 0.5 - Math.random()).slice(0, limit);
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

export const menuService = new MenuService();
