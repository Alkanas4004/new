import { database, ref, onValue } from '../config/firebase-config.js';

class RealtimeSync {
    constructor() {
        this.listeners = [];
        this.setupConnectionStatus();
    }
    
    setupConnectionStatus() {
        const connectedRef = ref(database, '.info/connected');
        onValue(connectedRef, (snap) => {
            const isConnected = snap.val() === true;
            if (isConnected) {
                this.showConnectionStatus('متصل', 'success');
            } else {
                this.showConnectionStatus('غير متصل - جاري إعادة المحاولة', 'error');
            }
        });
    }
    
    showConnectionStatus(message, type) {
        const statusDiv = document.getElementById('connectionStatus');
        if (!statusDiv) {
            const div = document.createElement('div');
            div.id = 'connectionStatus';
            div.style.cssText = `
                position: fixed;
                top: 70px;
                right: 10px;
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 11px;
                z-index: 9999;
                background: ${type === 'success' ? '#4caf50' : '#f44336'};
                color: white;
                font-weight: bold;
                transition: all 0.3s ease;
                pointer-events: none;
            `;
            div.innerHTML = type === 'success' ? '🟢 متصل' : '🔴 غير متصل';
            document.body.appendChild(div);
            
            setTimeout(() => div.remove(), 2000);
        }
    }
    
    addListener(ref, callback) {
        const unsubscribe = onValue(ref, callback);
        this.listeners.push(unsubscribe);
        return unsubscribe;
    }
    
    cleanup() {
        this.listeners.forEach(unsubscribe => unsubscribe());
        this.listeners = [];
    }
}

export const realtimeSync = new RealtimeSync();
