import { menuService } from '../services/menu-service.js';
import { favoritesService } from '../services/favorites-service.js';
import { createFoodCard } from '../components/food-card.js';

export async function renderFavoritesPage() {
    const container = document.getElementById('app');
    if (!container) return;
    
    function updateFavoritesUI() {
        const favoriteIds = favoritesService.getFavorites();
        const allItems = menuService.getAllItems();
        const favoriteItems = allItems.filter(item => favoriteIds.includes(item.id));
        
        if (favoriteItems.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-heart"></i>
                    <h3>لا توجد مفضلات</h3>
                    <p>أضف أطباقك المفضلة لتجدها هنا</p>
                    <a href="menu.html" class="btn-primary">استكشف المنيو</a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <h2 class="section-title">❤️ أطباقي المفضلة</h2>
            <div class="menu-grid" id="favoritesContainer"></div>
        `;
        
        const favoritesContainer = document.getElementById('favoritesContainer');
        favoriteItems.forEach(item => {
            favoritesContainer.appendChild(createFoodCard(item));
        });
    }
    
    updateFavoritesUI();
    
    menuService.subscribe(() => updateFavoritesUI());
    favoritesService.subscribe(() => updateFavoritesUI());
}
