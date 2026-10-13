<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Nuka-Cola Catch</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #1a1a1a;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #fff;
      overflow: hidden;
    }
    #gameContainer {
      position: relative;
      box-shadow: 0 0 30px rgba(0, 255, 100, 0.3);
    }
    canvas {
      background: #0d1f0d;
      display: block;
      cursor: none;
    }
    #ui {
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      display: flex;
      justify-content: space-between;
      pointer-events: none;
      text-shadow: 0 0 5px #000;
    }
    #message {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 28px;
      text-align: center;
      pointer-events: none;
      display: none;
    }
  </style>
</head>
<body>
  <div id="gameContainer">
    <canvas id="gameCanvas" width="480" height="640"></canvas>
    <div id="ui">
      <div>Score: <span id="score">0</span></div>
      <div>Lives: <span id="lives">3</span></div>
      <div>Combo: <span id="combo">0</span></div>
    </div>
    <div id="message"></div>
  </div>

  <script>
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const livesEl = document.getElementById('lives');
    const comboEl = document.getElementById('combo');
    const messageEl = document.getElementById('message');

    // ========== PLACEHOLDER IMAGES ==========
    // Replace these with your own images later
    // Example: const bottleImg = new Image(); bottleImg.src = 'bottle.png';
    const images = {
      // bottle: null,
      // basket: null,
      // background: null
    };

    // Game state
    let score = 0;
    let lives = 3;
    let combo = 0;
    let gameOver = false;
    let keys = {};
    let mouseX = canvas.width / 2;

    // Player (basket)
    const player = {
      x: canvas.width / 2 - 40,
      y: canvas.height - 70,
      width: 80,
      height: 40,
      speed: 8
    };

    // Bottles
    const flavors = [
      { name: 'Classic', color: '#8B4513', points: 10 },
      { name: 'Orange', color: '#FF8C00', points: 15 },
      { name: 'Cherry', color: '#DC143C', points: 15 },
      { name: 'Grape', color: '#8A2BE2', points: 15 },
      { name: 'Root Beer', color: '#5D4037', points: 12 },
      { name: 'Victory', color: '#FFD700', points: 20 },
      { name: 'Quantum', color: '#00BFFF', points: 30 },
      { name: 'Twist', color: '#FF69B4', points: 25 },
      { name: 'Irradiated', color: '#39FF14', points: -20 } // bad bottle
    ];

    let bottles = [];
    let spawnTimer = 0;
    let spawnInterval = 60; // frames

    // Input
    window.addEventListener('keydown', e => keys[e.key] = true);
    window.addEventListener('keyup', e => keys[e.key] = false);
    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
    });

    function spawnBottle() {
      const flavor = flavors[Math.floor(Math.random() * flavors.length)];
      bottles.push({
        x: Math.random() * (canvas.width - 30),
        y: -40,
        width: 30,
        height: 50,
        speed: 2 + Math.random() * 2.5,
        flavor: flavor
      });
    }

    function update() {
      if (gameOver) return;

      // Player movement
      if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
      if (keys['ArrowRight'] || keys['d']) player.x += player.speed;
      // Mouse control (optional – comment out if you prefer only keyboard)
      player.x = mouseX - player.width / 2;

      player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

      // Spawn bottles
      spawnTimer++;
      if (spawnTimer >= spawnInterval) {
        spawnBottle();
        spawnTimer = 0;
        if (spawnInterval > 25) spawnInterval -= 0.3; // slowly get harder
      }

      // Update bottles
      for (let i = bottles.length - 1; i >= 0; i--) {
        const b = bottles[i];
        b.y += b.speed;

        // Catch check
        if (b.y + b.height > player.y &&
            b.x < player.x + player.width &&
            b.x + b.width > player.x &&
            b.y < player.y + player.height) {
          
          score += b.flavor.points;
          if (b.flavor.points > 0) {
            combo++;
            score += combo; // combo bonus
          } else {
            combo = 0;
            lives--;
          }
          bottles.splice(i, 1);
          updateUI();
          continue;
        }

        // Missed
        if (b.y > canvas.height) {
          if (b.flavor.points > 0) {
            lives--;
            combo = 0;
          }
          bottles.splice(i, 1);
          updateUI();
        }
      }

      if (lives <= 0) {
        gameOver = true;
        messageEl.style.display = 'block';
        messageEl.innerHTML = `Game Over!<br>Final Score: ${score}<br><small>Refresh to play again</small>`;
      }
    }

    function updateUI() {
      scoreEl.textContent = score;
      livesEl.textContent = lives;
      comboEl.textContent = combo;
    }

    function draw() {
      // Background
      ctx.fillStyle = '#0d1f0d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // TODO: ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);

      // Player (basket)
      ctx.fillStyle = '#555';
      ctx.fillRect(player.x, player.y, player.width, player.height);
      ctx.fillStyle = '#888';
      ctx.fillRect(player.x + 5, player.y + 5, player.width - 10, 10);
      // TODO: ctx.drawImage(images.basket, player.x, player.y, player.width, player.height);

      // Bottles
      bottles.forEach(b => {
        ctx.fillStyle = b.flavor.color;
        ctx.fillRect(b.x, b.y, b.width, b.height);
        // Bottle neck
        ctx.fillRect(b.x + 8, b.y - 10, 14, 12);
        // Label
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(b.flavor.name.substring(0, 6), b.x + b.width / 2, b.y + 28);
        // TODO: ctx.drawImage(images.bottle, b.x, b.y, b.width, b.height);
      });
    }

    function gameLoop() {
      update();
      draw();
      requestAnimationFrame(gameLoop);
    }

    // Start
    updateUI();
    gameLoop();
  </script>
</body>
</html>