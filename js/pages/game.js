export async function renderGamePage() {
    const container = document.getElementById('app');
    if (!container) return;
    
    container.innerHTML = `
        <div class="game-container">
            <h2 class="section-title">🎮 لعبة الشيف الجائع</h2>
            <p class="game-instructions">اضغط على الشيف أو اضغط مفتاح المسافة للقفز فوق العوائق</p>
            <canvas id="gameCanvas" width="300" height="150" style="border: 2px solid var(--primary); border-radius: 10px;"></canvas>
            <button id="restartGameBtn" class="btn-primary">🔄 إعادة اللعب</button>
        </div>
    `;
    
    startGame();
    
    document.getElementById('restartGameBtn').addEventListener('click', () => {
        startGame();
    });
}

function startGame() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    
    canvas.width = 300;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    
    let gameRunning = true;
    let chefY = 100;
    let vy = 0;
    let obstacles = [];
    let score = 0;
    let frameId;
    let lastObstacleTime = 0;
    
    function jump() {
        if (chefY >= 115) vy = -8;
    }
    
    canvas.onclick = jump;
    window.onkeydown = (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            jump();
        }
    };
    
    function gameLoop(currentTime) {
        if (!gameRunning) return;
        
        // الفيزياء
        vy += 0.5;
        chefY += vy;
        if (chefY > 115) {
            chefY = 115;
            vy = 0;
        }
        if (chefY < 0) chefY = 0;
        
        // إضافة عوائق
        if (currentTime - lastObstacleTime > 1000 && Math.random() < 0.3) {
            obstacles.push({ x: 300 });
            lastObstacleTime = currentTime;
        }
        
        // تحديث العوائق
        obstacles.forEach(o => o.x -= 4);
        obstacles = obstacles.filter(o => o.x > -30);
        
        // كشف التصادم
        obstacles.forEach(o => {
            if (o.x < 70 && o.x > 20 && chefY > 85) {
                gameRunning = false;
                cancelAnimationFrame(frameId);
                drawGameOver();
            }
        });
        
        score++;
        draw();
        frameId = requestAnimationFrame(gameLoop);
    }
    
    function draw() {
        ctx.clearRect(0, 0, 300, 150);
        
        // الأرض
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, 145, 300, 5);
        
        // الشيف
        ctx.fillStyle = '#c8963e';
        ctx.fillRect(40, chefY, 30, 30);
        ctx.font = '24px Arial';
        ctx.fillText('👨‍🍳', 42, chefY + 26);
        
        // العوائق
        ctx.fillStyle = '#2c3e50';
        obstacles.forEach(o => ctx.fillRect(o.x, 110, 20, 35));
        
        // النتيجة
        ctx.fillStyle = 'black';
        ctx.font = 'bold 14px Cairo';
        ctx.fillText(`🏆 ${Math.floor(score / 10)}`, 10, 20);
    }
    
    function drawGameOver() {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, 300, 150);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 18px Cairo';
        ctx.fillText('انتهت اللعبة!', 80, 70);
        ctx.font = '14px Cairo';
        ctx.fillText(`نقاطك: ${Math.floor(score / 10)}`, 100, 95);
    }
    
    frameId = requestAnimationFrame(gameLoop);
    
    // تنظيف عند مغادرة الصفحة
    return () => {
        cancelAnimationFrame(frameId);
        canvas.onclick = null;
        window.onkeydown = null;
    };
}
