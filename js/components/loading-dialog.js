let loadingDiv = null;

export function showLoadingDialog(message = "جاري التحميل...") {
    if (loadingDiv) return;
    
    loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-dialog';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        backdrop-filter: blur(5px);
    `;
    
    loadingDiv.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 20px; text-align: center; min-width: 300px;">
            <div class="spinner" style="margin: 0 auto 1rem;"></div>
            <p id="loadingMessage" style="color: var(--text);">${message}</p>
        </div>
    `;
    
    document.body.appendChild(loadingDiv);
}

export function hideLoadingDialog() {
    if (loadingDiv) {
        loadingDiv.remove();
        loadingDiv = null;
    }
}

export function updateLoadingMessage(message) {
    const msgElement = document.getElementById('loadingMessage');
    if (msgElement) {
        msgElement.textContent = message;
    }
}
