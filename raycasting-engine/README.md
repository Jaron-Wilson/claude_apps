# Raycasting Engine from Scratch

A Wolfenstein 3D-style raycasting engine built with pure HTML5, CSS, and JavaScript - no game libraries, just raw mathematics!

## The Ultimate Developer Flex

This project renders a 3D world from a 2D map using trigonometry and the DDA (Digital Differential Analysis) algorithm. It's how classic games like Wolfenstein 3D were built.

## How It Works

### The Concept
- HTML5 Canvas for rendering
- 2D grid in memory (array of arrays)
- Trigonometry to cast "rays" from player position
- When a ray hits a wall (1 in the grid), calculate distance
- Draw vertical lines: short = far away, tall = close up

### Technical Implementation

#### 1. Data Structures
- **The Map**: 2D array where `1` = wall, `0` = empty space
- **The Player**: Position (x, y), direction angle, camera plane (FOV)
- **Constants**: Field of view, movement speed, rotation speed

#### 2. The Math - DDA Algorithm
For each vertical pixel column (0 to 640):
1. Calculate ray direction based on player's viewing angle + column offset
2. Use DDA to jump from grid line to grid line (not checking every pixel)
3. Calculate `deltaDistX` and `deltaDistY` using Pythagorean theorem
4. Step the ray forward until it hits a wall (1 in map array)
5. Calculate perpendicular distance to avoid fisheye effect

#### 3. Rendering
- **Ceiling**: Top half of screen (dark gray)
- **Floor**: Bottom half of screen (darker gray)
- **Walls**: For each ray:
  - Line height = `screenHeight / perpWallDist`
  - Draw vertical line centered on screen
  - Apply shading based on wall side and distance

#### 4. Movement Controls
- **W/↑**: Move forward
- **S/↓**: Move backward
- **A/←**: Rotate left
- **D/→**: Rotate right

## File Structure
```
raycasting-engine/
├── index.html    # Canvas element and page structure
├── style.css     # Styling with retro green glow effect
└── engine.js     # The raycasting magic
```

## How to Run

1. Open `index.html` in any modern web browser
2. Use WASD or arrow keys to move and look around
3. That's it! No build process, no dependencies.

## Features

- ✅ DDA raycasting algorithm
- ✅ Collision detection
- ✅ Distance-based shading for depth perception
- ✅ Side-based shading (different brightness for N/S vs E/W walls)
- ✅ Smooth keyboard controls
- ✅ 640x480 resolution rendering
- ✅ Custom map layout with pillars and rooms

## The Math Behind It

### Key Formulas

**Perpendicular Wall Distance** (prevents fisheye):
```
perpWallDist = (mapX - player.x + (1 - stepX) / 2) / rayDirX
```

**Line Height on Screen**:
```
lineHeight = screenHeight / perpWallDist
```

**Delta Distances** (DDA stepping):
```
deltaDistX = |1 / rayDirX|
deltaDistY = |1 / rayDirY|
```

## Customization

### Change the Map
Edit the `map` array in `engine.js`:
```javascript
const map = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],  // Add your walls here
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1]
];
```

### Adjust Movement Speed
```javascript
player.moveSpeed = 0.05;  // Lower = slower
player.rotSpeed = 0.03;   // Lower = slower rotation
```

### Change Colors
In the `castRays()` function, modify the wall colors:
```javascript
case 1:
    r = wallBrightness;
    g = 0;
    b = 0;  // Currently red walls
    break;
```

## What Makes This Special

This isn't using Three.js or any 3D library. It's pure mathematics:
- Trigonometry for ray angles
- Linear algebra for vector math
- DDA algorithm for efficient grid traversal
- Perspective projection for 3D illusion

## Next Steps to Enhance

Want to take it further? Add:
- Textured walls (load images instead of solid colors)
- Sprites (enemies, items)
- Multiple wall types with different colors
- Minimap in corner
- Mouse look controls
- Doors that open
- Different floor/ceiling textures

## Credits

Built from scratch using vanilla JavaScript and the power of mathematics.
Inspired by Wolfenstein 3D (1992) and the classic raycasting technique.

---

**Now go flex on your developer friends!** 💪🎮
