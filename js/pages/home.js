import { menuService } from '../services/menu-service.js';
import { createFoodCard } from '../components/food-card.js';

export async function renderHomePage() {
    const container = document.getElementById('app');
    if (!container) return;
    
    container.innerHTML = `
        <div class="hero-section">
            <div class="hero-content">
                <h1>مرحباً بك في مطعم الشيف</h1>
                <p>أشهى الأطباق بأفضل الأسعار</p>
                <a href="menu.html" class="btn-primary">اطلب الآن</a>
            </div>
        </div>
        <div class="specials-section">
            <h2 class="section-title">⭐ عروض اليوم المميزة</h2>
            <div class="menu-grid" id="specialsContainer"></div>
        </div>
    `;
    
    const specialsContainer = document.getElementById('specialsContainer');
    if (specialsContainer) {
        const specials = menuService.getSpecials(6);
        specials.forEach(item => {
            specialsContainer.appendChild(createFoodCard(item));
        });
    }
}
