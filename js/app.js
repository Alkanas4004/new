import { showLoadingDialog, hideLoadingDialog, updateLoadingMessage } from './components/loading-dialog.js';
import { menuService } from './services/menu-service.js';
import { cartService } from './services/cart-service.js';
import { favoritesService } from './services/favorites-service.js';
import { ordersService } from './services/orders-service.js';
import { renderHomePage } from './pages/home.js';
import { renderMenuPage } from './pages/menu.js';
import { renderCartPage } from './pages/cart.js';
import { renderOrdersPage } from './pages/orders.js';
import { renderFavoritesPage } from './pages/favorites.js';
import { renderGamePage } from './pages/game.js';
import { getCurrentPage } from './utils/helpers.js';
import { realtimeSync } from './utils/realtime-sync.js';
import { showToast } from './components/toast.js';

// تحديث البادجات
function updateBadges() {
    const cartBadge = document.getElementById('cartCountBadge');
    const favBadge = document.getElementById('favCountBadge');
    
    if (cartBadge) {
        const count = cartService.getItemCount();
        cartBadge.textContent = count;
        if (count > 0) {
            cartBadge.style.animation = 'badgePop 0.3s ease';
            setTimeout(() => cartBadge.style.animation = '', 300);
        }
    }
    
    if (favBadge) {
        const count = favoritesService.getCount();
        favBadge.textContent = count;
        if (count > 0) {
            favBadge.style.animation = 'badgePop 0.3s ease';
            setTimeout(() => favBadge.style.animation = '', 300);
        }
    }
}

// إعداد زر السكرول
function setupScrollToTop() {
    const btn = document.getElementById('scrollTopBtn');
    if (!btn) return;
    
    window.addEventListener('scroll', () => {
        btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
    });
    
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// إعداد الشات بوت
function setupChatBot() {
    window.toggleChat = () => {
        const chatWindow = document.getElementById('chatWindow');
        if (chatWindow) chatWindow.classList.toggle('open');
    };
    
    window.sendMessage = () => {
        const input = document.getElementById('chatInput');
        const msg = input.value.trim();
        if (!msg) return;
        
        addChatMessage('user', msg);
        input.value = '';
        
        setTimeout(() => {
            addChatMessage('bot', generateBotReply(msg));
        }, 500);
    };
    
    window.startVoice = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            showToast("المتصفح لا يدعم الإدخال الصوتي", "info");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'ar-SA';
        recognition.onresult = (e) => {
            const input = document.getElementById('chatInput');
            if (input) input.value = e.results[0][0].transcript;
            window.sendMessage();
        };
        recognition.start();
    };
    
    function addChatMessage(sender, text) {
        const div = document.getElementById('chatMessages');
        if (!div) return;
        const bubble = document.createElement('div');
        bubble.className = `message ${sender}`;
        bubble.textContent = text;
        div.appendChild(bubble);
        div.scrollTop = div.scrollHeight;
    }
    
    function generateBotReply(input) {
        const replies = [
            "شهية طيبة! جرب ستيك الفريتس 🔥",
            "تشيز كيك نيويورك رائع 🍰",
            "عصير مانجو منعش 💛",
            "دجاج ألفريدو الأكثر طلباً 🍝",
            "هل تود مساعدة في الطلب؟ 😊"
        ];
        return replies[Math.floor(Math.random() * replies.length)];
    }
}

// تحميل الصفحة حسب المسار
async function loadPage() {
    const page = getCurrentPage();
    updateLoadingMessage(`جاري تحميل ${getPageName(page)}...`);
    
    switch(page) {
        case 'home':
            await renderHomePage();
            break;
        case 'menu':
            await renderMenuPage();
            break;
        case 'cart':
            await renderCartPage();
            break;
        case 'orders':
            await renderOrdersPage();
            break;
        case 'favorites':
            await renderFavoritesPage();
            break;
        case 'game':
            await renderGamePage();
            break;
        default:
            await renderHomePage();
    }
}

function getPageName(page) {
    const names = {
        home: 'الرئيسية',
        menu: 'قائمة الطعام',
        cart: 'السلة',
        orders: 'الطلبات',
        favorites: 'المفضلة',
        game: 'اللعبة'
    };
    return names[page] || 'الصفحة';
}

// التهيئة الرئيسية
document.addEventListener('DOMContentLoaded', async () => {
    showLoadingDialog("الشيف يجهز أشهى الأطباق لك... 🧑‍🍳");
    
    try {
        updateLoadingMessage("جاري تحميل البيانات... 📋");
        
        // تهيئة الخدمات
        await menuService.init();
        await cartService.init();
        await favoritesService.init();
        
        updateLoadingMessage("جاري تحميل الصفحة... ✨");
        await loadPage();
        
        updateBadges();
        setupScrollToTop();
        setupChatBot();
        
        // الاستماع للتغييرات في السلة والمفضلة لتحديث البادجات
        cartService.subscribe(() => updateBadges());
        favoritesService.subscribe(() => updateBadges());
        
        // إضافة زر تحديث يدوي
        addManualRefreshButton();
        
        setTimeout(() => hideLoadingDialog(), 500);
    } catch (error) {
        console.error("خطأ في تحميل التطبيق:", error);
        updateLoadingMessage("حدث خطأ، جاري إعادة المحاولة...");
        setTimeout(() => hideLoadingDialog(), 2000);
    }
});

function addManualRefreshButton() {
    const refreshBtn = document.createElement('button');
    refreshBtn.id = 'manualRefreshBtn';
    refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
    refreshBtn.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary), var(--primary-dark));
        color: white;
        border: none;
        cursor: pointer;
        z-index: 999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
        font-size: 1.2rem;
    `;
    
    refreshBtn.onmouseover = () => refreshBtn.style.transform = 'scale(1.1)';
    refreshBtn.onmouseout = () => refreshBtn.style.transform = 'scale(1)';
    
    refreshBtn.onclick = async () => {
        refreshBtn.style.transform = 'rotate(360deg)';
        refreshBtn.style.transition = 'transform 0.5s';
        showToast('جاري تحديث البيانات...', 'info');
        
        await menuService.loadMenu();
        await cartService.loadCart();
        await favoritesService.loadCart();
        await loadPage();
        
        setTimeout(() => refreshBtn.style.transform = 'rotate(0deg)', 500);
        showToast('تم تحديث البيانات بنجاح', 'success');
    };
    
    document.body.appendChild(refreshBtn);
}
