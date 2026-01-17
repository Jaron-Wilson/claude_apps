// =====================================================
// RAYCASTING ENGINE - Wolfenstein 3D Style
// =====================================================

// Canvas setup
const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');
const screenWidth = canvas.width;
const screenHeight = canvas.height;

// =====================================================
// PHASE 2: DATA STRUCTURES
// =====================================================

// The Map - 1 is wall, 0 is empty space
const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const mapWidth = map[0].length;
const mapHeight = map.length;

// The Player
const player = {
    x: 4.5,          // Starting position X
    y: 4.5,          // Starting position Y
    dir: 0,          // Direction angle in radians (0 = facing right)
    plane: 0.66,     // Camera plane (FOV control)
    moveSpeed: 0.05, // Movement speed
    rotSpeed: 0.03   // Rotation speed
};

// Keyboard state
const keys = {};

// =====================================================
// PHASE 3 & 4: THE RAYCASTING ALGORITHM & RENDERING
// =====================================================

function castRays() {
    // Clear the canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, screenWidth, screenHeight);

    // Draw ceiling (dark gray)
    ctx.fillStyle = '#383838';
    ctx.fillRect(0, 0, screenWidth, screenHeight / 2);

    // Draw floor (darker gray)
    ctx.fillStyle = '#282828';
    ctx.fillRect(0, 0, screenWidth, screenHeight);

    // Cast a ray for each vertical stripe of the screen
    for (let x = 0; x < screenWidth; x++) {
        // Calculate ray position and direction
        // cameraX is the x-coordinate on the camera plane (from -1 to 1)
        const cameraX = 2 * x / screenWidth - 1;

        // Ray direction
        const rayDirX = Math.cos(player.dir) + Math.sin(player.dir) * player.plane * cameraX;
        const rayDirY = Math.sin(player.dir) - Math.cos(player.dir) * player.plane * cameraX;

        // Which box of the map we're in
        let mapX = Math.floor(player.x);
        let mapY = Math.floor(player.y);

        // Length of ray from one x or y-side to next x or y-side
        const deltaDistX = Math.abs(1 / rayDirX);
        const deltaDistY = Math.abs(1 / rayDirY);

        // Direction to step in x or y-direction (either +1 or -1)
        let stepX, stepY;

        // Length of ray from current position to next x or y-side
        let sideDistX, sideDistY;

        // Calculate step and initial sideDist
        if (rayDirX < 0) {
            stepX = -1;
            sideDistX = (player.x - mapX) * deltaDistX;
        } else {
            stepX = 1;
            sideDistX = (mapX + 1.0 - player.x) * deltaDistX;
        }

        if (rayDirY < 0) {
            stepY = -1;
            sideDistY = (player.y - mapY) * deltaDistY;
        } else {
            stepY = 1;
            sideDistY = (mapY + 1.0 - player.y) * deltaDistY;
        }

        // Perform DDA (Digital Differential Analysis)
        let hit = 0; // Was there a wall hit?
        let side;    // Was a NS or EW wall hit? (for shading)

        // Keep stepping until we hit a wall
        while (hit === 0) {
            // Jump to next map square in x-direction OR in y-direction
            if (sideDistX < sideDistY) {
                sideDistX += deltaDistX;
                mapX += stepX;
                side = 0; // X-side hit
            } else {
                sideDistY += deltaDistY;
                mapY += stepY;
                side = 1; // Y-side hit
            }

            // Check if ray has hit a wall
            if (mapX < 0 || mapX >= mapWidth || mapY < 0 || mapY >= mapHeight || map[mapY][mapX] > 0) {
                hit = 1;
            }
        }

        // Calculate distance to the wall (perpendicular distance to avoid fisheye effect)
        let perpWallDist;
        if (side === 0) {
            perpWallDist = (mapX - player.x + (1 - stepX) / 2) / rayDirX;
        } else {
            perpWallDist = (mapY - player.y + (1 - stepY) / 2) / rayDirY;
        }

        // Calculate height of line to draw on screen
        const lineHeight = Math.floor(screenHeight / perpWallDist);

        // Calculate lowest and highest pixel to fill in current stripe
        let drawStart = -lineHeight / 2 + screenHeight / 2;
        let drawEnd = lineHeight / 2 + screenHeight / 2;

        if (drawStart < 0) drawStart = 0;
        if (drawEnd >= screenHeight) drawEnd = screenHeight - 1;

        // PHASE 7: SHADING - Choose wall color based on side
        // Make x-sides darker than y-sides for depth perception
        let wallBrightness = side === 0 ? 200 : 150;

        // Add distance-based darkening
        const maxDist = 10;
        const distFactor = Math.max(0, 1 - perpWallDist / maxDist);
        wallBrightness = Math.floor(wallBrightness * distFactor);

        // Different colors based on which wall was hit (you can expand this)
        const wallType = map[mapY] && map[mapY][mapX] ? map[mapY][mapX] : 1;
        let r, g, b;

        switch (wallType) {
            case 1:
                r = wallBrightness;
                g = 0;
                b = 0;
                break;
            default:
                r = wallBrightness;
                g = wallBrightness;
                b = wallBrightness;
        }

        // Draw the vertical line
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
    }
}

// =====================================================
// PHASE 5: GAME ELEMENTS - MOVEMENT & CONTROLS
// =====================================================

function updatePlayer() {
    const moveSpeed = player.moveSpeed;
    const rotSpeed = player.rotSpeed;

    // Rotation (A/D or Left/Right arrows)
    if (keys['a'] || keys['ArrowLeft']) {
        player.dir -= rotSpeed;
    }
    if (keys['d'] || keys['ArrowRight']) {
        player.dir += rotSpeed;
    }

    // Forward/Backward movement (W/S or Up/Down arrows)
    if (keys['w'] || keys['ArrowUp']) {
        const newX = player.x + Math.cos(player.dir) * moveSpeed;
        const newY = player.y + Math.sin(player.dir) * moveSpeed;

        // Collision detection
        if (map[Math.floor(newY)][Math.floor(newX)] === 0) {
            player.x = newX;
            player.y = newY;
        }
    }

    if (keys['s'] || keys['ArrowDown']) {
        const newX = player.x - Math.cos(player.dir) * moveSpeed;
        const newY = player.y - Math.sin(player.dir) * moveSpeed;

        // Collision detection
        if (map[Math.floor(newY)][Math.floor(newX)] === 0) {
            player.x = newX;
            player.y = newY;
        }
    }
}

// =====================================================
// MAIN GAME LOOP
// =====================================================

function gameLoop() {
    updatePlayer();
    castRays();
    requestAnimationFrame(gameLoop);
}

// =====================================================
// EVENT LISTENERS
// =====================================================

window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// =====================================================
// START THE ENGINE!
// =====================================================

console.log('🎮 Raycasting Engine Started!');
console.log('Controls: W/A/S/D or Arrow Keys');
console.log('Position:', player.x, player.y);
gameLoop();
