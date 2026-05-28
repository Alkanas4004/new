import { menuService } from '../services/menu-service.js';
import { createFoodCard } from '../components/food-card.js';

let currentView = localStorage.getItem('menuView') || 'grid';

export async function renderMenuPage() {
    const container = document.getElementById('app');
    if (!container) return;
    
    container.innerHTML = `
        <div class="menu-header">
            <div class="menu-controls">
                <button id="gridViewBtn" class="view-btn ${currentView === 'grid' ? 'active' : ''}">
                    <i class="fas fa-th"></i>
                </button>
                <button id="listViewBtn" class="view-btn ${currentView === 'list' ? 'active' : ''}">
                    <i class="fas fa-list"></i>
                </button>
            </div>
            <div class="category-filters">
                <button class="filter-btn active" data-category="all">الكل</button>
                <button class="filter-btn" data-category="main">أطباق رئيسية</button>
                <button class="filter-btn" data-category="appetizer">مقبلات</button>
                <button class="filter-btn" data-category="dessert">حلويات</button>
                <button class="filter-btn" data-category="drink">مشروبات</button>
            </div>
        </div>
        <div id="menuContainer" class="menu-${currentView}"></div>
    `;
    
    const menuContainer = document.getElementById('menuContainer');
    const allItems = menuService.getAllItems();
    
    function renderItems(category = 'all') {
        menuContainer.innerHTML = '';
        const filtered = category === 'all' ? allItems : allItems.filter(i => i.category === category);
        filtered.forEach(item => {
            menuContainer.appendChild(createFoodCard(item, currentView));
        });
    }
    
    renderItems();
    
    // أحداث الأزرار
    document.getElementById('gridViewBtn').addEventListener('click', () => {
        currentView = 'grid';
        localStorage.setItem('menuView', 'grid');
        menuContainer.className = 'menu-grid';
        renderItems(document.querySelector('.filter-btn.active').dataset.category);
    });
    
    document.getElementById('listViewBtn').addEventListener('click', () => {
        currentView = 'list';
        localStorage.setItem('menuView', 'list');
        menuContainer.className = 'menu-list';
        renderItems(document.querySelector('.filter-btn.active').dataset.category);
    });
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderItems(btn.dataset.category);
        });
    });
    
    // تحديث عند تغيير المنيو
    menuService.subscribe(() => {
        renderItems(document.querySelector('.filter-btn.active').dataset.category);
    });
}
