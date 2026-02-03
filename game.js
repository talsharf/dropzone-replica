const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Constants
const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;
const WORLD_WIDTH = 2268;
const GROUND_Y = 550;
const ENEMY_CEILING_Y = 50;
const DROPZONE_X = 1175;
const DROPZONE_WIDTH = 100;
const BULLET_SPAWN_OFFSET_Y = 2;
const BULLET_SPAWN_OFFSET_X = 15;

canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;

// Sprite Definitions (Simple 1-bit or colored pixel maps)
// 0: transparent, 1: primary color, 2: secondary color
const SPRITES = {
    ENEMY_LANDER: [
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0]
    ],
    MAN_WALK_1: [
        [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 2, 2, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    MAN_WALK_2: [
        [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 2, 2, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0]
    ]
};

function drawSprite(ctx, sprite, x, y, scale, colorPrimary, colorSecondary, flipX = false) {
    ctx.save();
    ctx.translate(x, y);
    if (flipX) {
        ctx.translate(sprite[0].length * scale, 0);
        ctx.scale(-1, 1);
    }

    for (let r = 0; r < sprite.length; r++) {
        for (let c = 0; c < sprite[r].length; c++) {
            let pixel = sprite[r][c];
            if (pixel !== 0) {
                ctx.fillStyle = pixel === 1 ? colorPrimary : (colorSecondary || '#fff');
                ctx.fillRect(c * scale, r * scale, scale, scale);
            }
        }
    }
    ctx.restore();
}

// Terrain Image
const terrainImg = new Image();
terrainImg.src = 'terrain-loop.jpg';
const TERRAIN_HEIGHT = 79; // Height of the terrain image strip
const flameImg = new Image();
flameImg.src = 'flame.png';

// Sound
// Sound
const shootSound = new Audio('shoot.wav');

function playShootSound() {
    shootSound.cloneNode(true).play().catch(e => console.warn("Audio play failed", e));
}

// Player Image Processing
const playerImg = new Image();
playerImg.src = 'player.png';
let playerSpriteCanvas = null;

playerImg.onload = function () {
    const c = document.createElement('canvas');
    c.width = playerImg.width;
    c.height = playerImg.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(playerImg, 0, 0);

    try {
        const imgData = ctx.getImageData(0, 0, c.width, c.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Threshold for black background (handling jpeg artifacts)
            if (r < 30 && g < 30 && b < 30) {
                data[i + 3] = 0; // Set alpha to 0
            }
        }
        ctx.putImageData(imgData, 0, 0);
    } catch (e) {
        console.warn("Unable to access image data (likely CORS restriction from file://). Player background will remain black.", e);
    }

    playerSpriteCanvas = c;
};



// Game State
let gameState = 'MENU';
let score = 0;
let lives = 3;
let cameraX = 0;
let explosionEndTime = 0;

// Input Handling
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Enter' && gameState !== 'PLAYING') {
        startGame();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Game Objects
const player = {
    x: DROPZONE_X,
    y: 300,
    width: 30,
    height: 35,
    vx: 0,
    vy: 0,
    speedX: 0.09,
    speedY: 0.08,
    maxSpeed: 8,
    friction: 0.985,
    gravity: 0.01,
    facingRight: true,
    color: '#fff', // White suit
    color2: '#f00', // Red backpack
    lastShotTime: 0,
    shootDelay: 150,
    carrying: null
};

const bullets = [];
const enemies = [];
const particles = [];
const men = [];

// Stars for background
const stars = [];
for (let i = 0; i < 200; i++) {
    stars.push({
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * (GROUND_Y - 50),
        size: Math.random() < 0.9 ? 1 : 2,
        color: Math.random() < 0.8 ? '#fff' : (Math.random() < 0.5 ? '#f0f' : '#0ff')
    });
}

function startGame() {
    gameState = 'PLAYING';
    score = 0;
    lives = 3;
    player.x = DROPZONE_X;
    player.y = 300;
    player.vx = 0;
    player.vy = 0;
    player.carrying = null;
    bullets.length = 0;
    enemies.length = 0;
    particles.length = 0;
    men.length = 0;

    // Spawn initial men
    for (let i = 0; i < 8; i++) {
        men.push({
            x: Math.random() * WORLD_WIDTH,
            y: GROUND_Y - 14,
            width: 8,
            height: 14,
            vx: (Math.random() - 0.5) * 0.5,
            state: 'WALKING', // WALKING, CARRIED, FALLING
            color: '#ff0'
        });
    }

    document.getElementById('message').style.display = 'none';
}

function spawnEnemy() {
    if (enemies.length < 5 && Math.random() < 0.02) {
        let ex = (cameraX + SCREEN_WIDTH + Math.random() * 500) % WORLD_WIDTH;
        enemies.push({
            x: ex,
            y: ENEMY_CEILING_Y + Math.random() * (GROUND_Y - 300),
            width: 20,
            height: 20,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 2,
            type: 'LANDER',
            active: true
        });
    }
}

function update() {
    if (gameState === 'PLAYER_EXPLODING') {
        // Check timer
        if (Date.now() > explosionEndTime) {
            lives--;
            if (lives <= 0) {
                gameState = 'GAMEOVER';
                document.getElementById('message').innerText = "GAME OVER";
                document.getElementById('message').style.display = 'block';
            } else {
                startGame(); // Reset positions
                // Keep score and lives (startGame resets them, need to fix that)
                // Actually startGame resets score/lives. We need a soft reset.
                // Let's fix startGame or make a resetPlayer function.
                // For now, let's manually reset player here to avoid breaking startGame logic which is "New Game"
                gameState = 'PLAYING';
                player.x = DROPZONE_X;
                player.y = 300;
                player.vx = 0;
                player.vy = 0;
                player.carrying = null;
                enemies.length = 0;
                bullets.length = 0;
                particles.length = 0; // Optional: clear particles or let them fade
            }
        }
        updateParticles();
        return;
    }

    if (gameState !== 'PLAYING') return;

    // Player Movement
    if (keys['ArrowRight']) {
        player.vx += player.speedX;
        player.facingRight = true;
    }
    if (keys['ArrowLeft']) {
        player.vx -= player.speedX;
        player.facingRight = false;
    }
    if (keys['ArrowUp']) {
        player.vy -= player.speedY;
    }
    if (keys['ArrowDown']) {
        player.vy += player.speedY;
    }

    // Gravity
    player.vy += player.gravity;

    // Physics
    player.vx *= player.friction;
    player.vy *= player.friction;

    // Cap speed
    if (player.vx > player.maxSpeed) player.vx = player.maxSpeed;
    if (player.vx < -player.maxSpeed) player.vx = -player.maxSpeed;
    if (player.vy > player.maxSpeed) player.vy = player.maxSpeed;
    if (player.vy < -player.maxSpeed) player.vy = -player.maxSpeed;

    player.x += player.vx;
    player.y += player.vy;

    // Vertical Boundaries
    if (player.y < 40) {
        player.y = 40;
        player.vy = 0;
    }
    if (player.y > GROUND_Y - player.height) {
        player.y = GROUND_Y - player.height;
        player.vy = 0;
    }

    // World Wrapping (Horizontal)
    if (player.x >= WORLD_WIDTH) player.x -= WORLD_WIDTH;
    if (player.x < 0) player.x += WORLD_WIDTH;

    // Camera Follow (Center Player)
    cameraX = player.x - SCREEN_WIDTH / 2;
    if (cameraX < 0) cameraX += WORLD_WIDTH;
    if (cameraX >= WORLD_WIDTH) cameraX -= WORLD_WIDTH;

    // Shooting
    if (keys['Space']) {
        const now = Date.now();
        if (now - player.lastShotTime > player.shootDelay) {
            bullets.push({
                x: player.x + (player.facingRight ? BULLET_SPAWN_OFFSET_X : 0),
                y: player.y + BULLET_SPAWN_OFFSET_Y,
                vx: player.facingRight ? 15 : -15,
                vy: 0,
                width: 12,
                height: 2,
                life: 60
            });
            player.lastShotTime = now;
            playShootSound();
        }
    }

    // Update Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.x += b.vx;
        b.life--;

        // Wrap bullet
        if (b.x >= WORLD_WIDTH) b.x -= WORLD_WIDTH;
        if (b.x < 0) b.x += WORLD_WIDTH;

        if (b.life <= 0) {
            bullets.splice(i, 1);
            continue;
        }

        // Collision with Enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            let e = enemies[j];
            if (checkCollision(b, e)) {
                // Destroy enemy
                createExplosion(e.x, e.y, 30);
                enemies.splice(j, 1);
                bullets.splice(i, 1);
                score += 100;
                break; // Bullet destroyed
            }
        }
    }

    // Update Enemies
    spawnEnemy();
    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        e.x += e.vx;
        e.y += e.vy;

        // Wrap enemy
        if (e.x >= WORLD_WIDTH) e.x -= WORLD_WIDTH;
        if (e.x < 0) e.x += WORLD_WIDTH;

        // Bounce off ground/ceiling
        if (e.y < ENEMY_CEILING_Y || e.y > GROUND_Y - e.height) e.vy *= -1;

        // Collision with Player
        if (checkCollision(player, e)) {
            // Player explodes
            gameState = 'PLAYER_EXPLODING';
            explosionEndTime = Date.now() + 3000;
            createExplosion(player.x, player.y, 50);
            createExplosion(e.x, e.y, 10);

            enemies.splice(i, 1); // Remove enemy

            // Drop man if carrying
            if (player.carrying) {
                player.carrying.state = 'FALLING';
                player.carrying = null;
            }

            break;
        }
    }

    // Update Men
    for (let i = men.length - 1; i >= 0; i--) {
        let m = men[i];

        if (m.state === 'WALKING') {
            m.x += m.vx;
            if (m.x >= WORLD_WIDTH) m.x -= WORLD_WIDTH;
            if (m.x < 0) m.x += WORLD_WIDTH;

            // Randomly change direction
            if (Math.random() < 0.01) m.vx *= -1;

            // Pickup logic
            let distToDrop = Math.abs(m.x - DROPZONE_X);
            if (distToDrop > WORLD_WIDTH / 2) distToDrop = WORLD_WIDTH - distToDrop;

            if (!player.carrying && checkCollision(player, m) && distToDrop >= DROPZONE_WIDTH / 2) {
                player.carrying = m;
                m.state = 'CARRIED';
            }
        } else if (m.state === 'CARRIED') {
            m.x = player.x + 8;
            m.y = player.y + 10; // Hang below player

            // Drop logic (if near Dropzone base)
            // Let's define Dropzone Base at DROPZONE_X
            let distToBase = Math.abs(player.x - DROPZONE_X);
            if (distToBase > WORLD_WIDTH / 2) distToBase = WORLD_WIDTH - distToBase;

            if (distToBase < DROPZONE_WIDTH / 2 && player.y > GROUND_Y - 50) {
                // Drop safely
                m.state = 'WALKING';
                m.y = GROUND_Y - m.height;
                player.carrying = null;
                score += 500; // Rescue bonus
                // createExplosion(m.x, m.y); // Sparkle effect removed per request
            }
        } else if (m.state === 'FALLING') {
            m.y += 2;
            if (m.y >= GROUND_Y - m.height) {
                m.y = GROUND_Y - m.height;
                m.state = 'WALKING'; // Survived fall
            }
        }
    }

    // Update Particles
    updateParticles();
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function checkCollision(r1, r2) {
    let dx = Math.abs(r1.x - r2.x);
    if (dx > WORLD_WIDTH / 2) dx = WORLD_WIDTH - dx; // Shortest distance wrapping

    if (dx < (r1.width + r2.width) / 2 && Math.abs(r1.y - r2.y) < (r1.height + r2.height) / 2) {
        return true;
    }
    return false;
}

function createExplosion(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 20,
            color: '#ff0'
        });
    }
}

function draw() {
    // Clear Screen
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'MENU') {
        drawBackground();
        drawTerrain();
        return;
    }

    ctx.save();

    drawBackground();
    drawTerrain();

    // Draw Dropzone Base
    let baseX = DROPZONE_X - cameraX;
    if (baseX < -SCREEN_WIDTH) baseX += WORLD_WIDTH;
    if (baseX > SCREEN_WIDTH) baseX -= WORLD_WIDTH;
    if (baseX > -100 && baseX < SCREEN_WIDTH + 100) {
        ctx.fillStyle = '#00f';
        ctx.fillRect(baseX - DROPZONE_WIDTH / 2, GROUND_Y - 10, DROPZONE_WIDTH, 10);
        ctx.font = '10px monospace';
        ctx.fillStyle = '#fff';
        ctx.fillText('DROPZONE', baseX - 25, GROUND_Y - 15);
    }

    // Draw Men
    men.forEach(m => {
        let screenX = m.x - cameraX;
        if (screenX < -SCREEN_WIDTH) screenX += WORLD_WIDTH;
        if (screenX > SCREEN_WIDTH) screenX -= WORLD_WIDTH;

        if (screenX >= 0 && screenX <= SCREEN_WIDTH) {
            let sprite = (Math.floor(Date.now() / 200) % 2 === 0) ? SPRITES.MAN_WALK_1 : SPRITES.MAN_WALK_2;
            drawSprite(ctx, sprite, screenX, m.y, 1, m.color);
        }
    });

    // Draw Bullets
    ctx.fillStyle = '#fff';
    bullets.forEach(b => {
        let screenX = b.x - cameraX;
        if (screenX < -SCREEN_WIDTH) screenX += WORLD_WIDTH;
        if (screenX > SCREEN_WIDTH) screenX -= WORLD_WIDTH;
        if (screenX >= 0 && screenX <= SCREEN_WIDTH) {
            // Laser beam style
            ctx.fillStyle = (Math.floor(Date.now() / 50) % 2 === 0) ? '#ff0' : '#fff';
            ctx.fillRect(screenX, b.y, 12, 2);
        }
    });

    // Draw Enemies
    enemies.forEach(e => {
        let screenX = e.x - cameraX;
        if (screenX < -SCREEN_WIDTH) screenX += WORLD_WIDTH;
        if (screenX > SCREEN_WIDTH) screenX -= WORLD_WIDTH;
        if (screenX >= 0 && screenX <= SCREEN_WIDTH) {
            drawSprite(ctx, SPRITES.ENEMY_LANDER, screenX, e.y, 1, '#0f0');
        }
    });

    // Draw Particles
    particles.forEach(p => {
        let screenX = p.x - cameraX;
        if (screenX < -SCREEN_WIDTH) screenX += WORLD_WIDTH;
        if (screenX > SCREEN_WIDTH) screenX -= WORLD_WIDTH;
        if (screenX >= 0 && screenX <= SCREEN_WIDTH) {
            ctx.fillStyle = p.color;
            ctx.fillRect(screenX, p.y, 2, 2);
        }
    });

    if (gameState === 'PLAYING') {
        drawPlayer();
    }

    ctx.restore();

    drawRadar();

    // Update UI
    document.getElementById('score').innerText = `SCORE: ${score}`;
    document.getElementById('lives').innerText = `LIVES: ${lives}`;
}

function drawBackground() {
    // Draw Stars
    ctx.fillStyle = '#fff';
    stars.forEach(star => {
        let screenX = star.x - cameraX;
        if (screenX < -SCREEN_WIDTH) screenX += WORLD_WIDTH;
        if (screenX > SCREEN_WIDTH) screenX -= WORLD_WIDTH;

        if (screenX >= 0 && screenX <= SCREEN_WIDTH) {
            ctx.fillStyle = star.color;
            ctx.fillRect(screenX, star.y, star.size, star.size);
        }
    });
}

function drawTerrain() {
    // Fallback background (always draw to ensure visibility)
    ctx.fillStyle = '#a52a2a';
    ctx.fillRect(0, GROUND_Y, SCREEN_WIDTH, SCREEN_HEIGHT - GROUND_Y);

    // Draw terrain image using pattern
    if (terrainImg.complete && terrainImg.naturalWidth > 0) {
        ctx.save();

        // Create pattern
        const pattern = ctx.createPattern(terrainImg, 'repeat-x');
        if (pattern) {
            // Offset pattern to simulate scrolling
            // We want the pattern to move with the camera.
            // We also want it to start at GROUND_Y vertically.

            ctx.translate(-cameraX, GROUND_Y);
            ctx.fillStyle = pattern;
            // Draw the pattern strip
            // We draw a rectangle that covers the full width of the world (conceptually)
            // but we only need to draw what's on screen.
            // Since we translated by -cameraX, the screen starts at cameraX.
            ctx.fillRect(cameraX, 0, SCREEN_WIDTH, terrainImg.naturalHeight);
        }

        ctx.restore();
    }
}

function drawPlayer() {
    let screenX = player.x - cameraX;
    if (screenX < 0) screenX += WORLD_WIDTH;
    if (screenX > SCREEN_WIDTH) screenX -= WORLD_WIDTH;
    screenX = SCREEN_WIDTH / 2;

    // Draw Jetman Sprite
    // Draw Jetman Sprite
    if (playerSpriteCanvas) {
        ctx.save();
        ctx.translate(screenX, player.y);
        if (!player.facingRight) {
            ctx.scale(-1, 1);
        }
        // Draw centered
        ctx.drawImage(playerSpriteCanvas, -15, -17.5, 30, 35);
        ctx.restore();
    }

    // Flame
    if (keys['ArrowUp'] || keys['ArrowRight'] || keys['ArrowLeft']) {
        ctx.save();
        ctx.translate(screenX, player.y);
        if (!player.facingRight) {
            ctx.scale(-1, 1);
        }
        ctx.drawImage(flameImg, -28, -4, 15, 15);
        ctx.restore();
    }
}

function drawRadar() {
    const radarW = 300;
    const radarH = 40;
    const radarX = (SCREEN_WIDTH - radarW) / 2;
    const radarY = SCREEN_HEIGHT - radarH - 10;

    // Frame
    ctx.strokeStyle = '#00f';
    ctx.lineWidth = 2;
    ctx.strokeRect(radarX, radarY, radarW, radarH);
    ctx.fillStyle = 'rgba(0, 0, 50, 0.5)';
    ctx.fillRect(radarX, radarY, radarW, radarH);

    const scaleX = radarW / WORLD_WIDTH;

    // Draw Terrain Line
    ctx.fillStyle = '#a00';
    ctx.fillRect(radarX, radarY + radarH - 5, radarW, 2);

    // Draw Player dot
    ctx.fillStyle = '#fff';
    let pX = (player.x * scaleX);
    ctx.fillRect(radarX + pX, radarY + radarH / 2, 4, 4);

    // Draw Enemies
    ctx.fillStyle = '#0f0';
    enemies.forEach(e => {
        let eX = (e.x * scaleX);
        ctx.fillRect(radarX + eX, radarY + (e.y / SCREEN_HEIGHT) * radarH, 2, 2);
    });

    // Draw Men
    ctx.fillStyle = '#ff0';
    men.forEach(m => {
        let mX = (m.x * scaleX);
        ctx.fillRect(radarX + mX, radarY + radarH - 8, 2, 2);
    });

    // Draw Viewport Box
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    let viewX = (cameraX * scaleX);
    let viewW = (SCREEN_WIDTH * scaleX);
    if (viewX < 0) viewX += radarW;
    ctx.strokeRect(radarX + viewX, radarY, viewW, radarH);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start Loop
loop();
