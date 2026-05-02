### ### Step 1: Foundation & Project Structure
**Prompt for Gemini:**
> "I am building a Vertical Tower Defense game (HTML5/Phaser 3) in the directory `/home/samsung1466/Python/onslaught game/`. I need you to write the code for the first 3 foundational files. Use ES6 Modules.
> 
> 1. **index.html**: Create a clean HTML5 layout with a `div` id 'game-container' and a UI overlay `div`. Include the Phaser 3 CDN.
> 2. **style.css**: Make the game container 1080x1920 (centered) and ensure the UI overlay sits on top of the canvas.
> 3. **main.js**: Setup the Phaser configuration. Use `type: Phaser.AUTO`, `parent: 'game-container'`, and `physics: { default: 'arcade' }`. Set up a single scene called `GameScene` imported from `./src/scenes/GameScene.js`.
> 
> Please output the code for these three files clearly."

---

### ### Step 2: The Vertical Map & Enemy Movement
**Prompt for Gemini:**
> "Now, create the core gameplay logic in a sub-folder `./src/`. I need:
> 
> 1. **src/scenes/GameScene.js**: The main scene that initializes the map and manages the update loop.
> 2. **src/entities/Enemy.js**: A class that extends `Phaser.Physics.Arcade.Sprite`. It must follow a path defined by an array of points. 
> 3. **src/map/MapManager.js**: A utility that defines the 'Vertical Ledge' path. Create a path that zig-zags from the bottom ledge to the top ledge.
> 
> Make sure the Enemy moves horizontally across a ledge, then 'climbs' vertically to the next one. Use a simple green square for the enemy sprite for now."

---

### ### Step 3: Towers, Combat, and Projectiles
**Prompt for Gemini:**
> "Let's add the combat system in `./src/entities/`.
> 
> 1. **Tower.js**: A class for 'Building Slots.' When clicked, it should 'construct' a tower (blue circle) that has a range of 200px.
> 2. **Projectile.js**: A simple class for bullets that track enemies and deal damage.
> 3. **Combat Logic**: Update `GameScene.js` to handle the overlap between projectiles and enemies. When an enemy's HP reaches 0, play a simple 'shrink' animation and destroy it."

---

### ### Step 4: Hero Control & RPG Stats
**Prompt for Gemini:**
> "Add the Player Hero and RPG mechanics.
> 
> 1. **Hero.js**: Create a Hero class (gold square). The Hero should move to wherever the player clicks on a 'Ledge.'
> 2. **Stats System**: Give the Hero `attackPower`, `level`, and `xp`.
> 3. **UIManager.js**: A module that updates the HTML `div` we created in index.html to show 'Gold: X' and 'Hero Level: Y'. Use `document.getElementById` to link the game variables to the UI."

---

### ### How to Run Your Game
Since you are in a Python folder, you cannot just open `index.html`. You must run a local server. Create a file named `run_game.py` in your folder and paste this:

```python
import http.server
import socketserver
import os

PORT = 8000
DIRECTORY = "/home/samsung1466/Python/onslaught game/"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Game running at http://localhost:{PORT}")
    httpd.serve_forever()
```

**To play:**
1. Open your terminal.
2. Type: `python3 "/home/samsung1466/Python/onslaught game/run_game.py"`
3. Open your browser to `http://localhost:8000`.
