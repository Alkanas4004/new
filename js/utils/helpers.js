// دوال مساعدة عامة
export function formatPrice(price) {
    return `$${price.toFixed(2)}`;
}

export function formatDate(date) {
    return new Date(date).toLocaleString('ar-EG');
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('home') || path === '/' || path === '/index.html') return 'home';
    if (path.includes('menu')) return 'menu';
    if (path.includes('cart')) return 'cart';
    if (path.includes('orders')) return 'orders';
    if (path.includes('favorites')) return 'favorites';
    if (path.includes('game')) return 'game';
    return 'home';
}
