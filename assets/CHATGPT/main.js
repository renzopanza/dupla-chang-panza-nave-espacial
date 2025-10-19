// main.js (com Game Over implementado)
// ============================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const keys = {};
let score = 0;
let gameOver = false;
let gameOverTimer = 0;

// ============================
// CARREGAMENTO DE IMAGENS
// ============================
const imgPlayerBase = new Image();
imgPlayerBase.src = "assets/Main Ship - Base - Full health.png";

const imgPlayerEngine = new Image();
imgPlayerEngine.src = "assets/Main Ship - Engines - Base Engine - Idle.png";

const imgEnemy = new Image();
imgEnemy.src = "assets/Enimies Ship - Engines - Base Engine.png";

const imgBullet = new Image();
imgBullet.src = "assets/Main ship weapon - Projectile - Auto cannon bullet.png";

function allAssetsLoaded() {
  return imgPlayerBase.complete && imgPlayerEngine.complete && imgEnemy.complete && imgBullet.complete;
}

// ============================
// ENTIDADES
// ============================
let player;
let enemies;

function resetGame() {
  player = {
    x: WIDTH / 2 - 24,
    y: HEIGHT - 100,
    width: 48,
    height: 48,
    speed: 5,
    bullets: [],
    shootCooldown: 0,
    engineFrame: 0,
    engineTimer: 0,
    engineFrameDelay: 6,
  };
  enemies = [];
  score = 0;
  gameOver = false;
  gameOverTimer = 0;
}

resetGame();

// ============================
// EVENTOS DE TECLADO
// ============================
window.addEventListener("keydown", (e) => {
  const k = (e.key || "").toLowerCase();
  keys[k] = true;
  if (e.code === "Space") {
    keys["space"] = true;
    e.preventDefault();
  }
});

window.addEventListener("keyup", (e) => {
  const k = (e.key || "").toLowerCase();
  keys[k] = false;
  if (e.code === "Space") {
    keys["space"] = false;
    e.preventDefault();
  }
});

// ============================
// DISPAROS E INIMIGOS
// ============================
function shootBullet() {
  if (player.shootCooldown <= 0) {
    player.bullets.push({
      x: player.x + player.width / 2 - 16,
      y: player.y - 20,
      width: 32,
      height: 32,
      speed: 8,
      frame: 0,
      frameTimer: 0,
    });
    player.shootCooldown = 15;
  }
}

function spawnEnemy() {
  enemies.push({
    x: Math.random() * (WIDTH - 48),
    y: -48,
    width: 48,
    height: 48,
    speed: 2 + Math.random() * 2,
  });
}

// ============================
// FUNDO
// ============================
const backgroundLayers = [
  { stars: [], speed: 0.3, color: "#111" },
  { stars: [], speed: 0.6, color: "#333" },
  { stars: [], speed: 1.0, color: "#666" },
];
backgroundLayers.forEach((layer) => {
  for (let i = 0; i < 50; i++) {
    layer.stars.push({
      x: Math.random() * WIDTH,
      y: Math.random() * HEIGHT,
      r: Math.random() * 2,
    });
  }
});

// ============================
// COLISÕES
// ============================
function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function checkCollisions() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];

    // Bala × inimigo
    for (let j = player.bullets.length - 1; j >= 0; j--) {
      if (isColliding(player.bullets[j], e)) {
        enemies.splice(i, 1);
        player.bullets.splice(j, 1);
        score += 100;
        break;
      }
    }

    // Player × inimigo → Game Over
    if (isColliding(player, e)) {
      triggerGameOver();
    }
  }
}

// ============================
// GAME OVER
// ============================
function triggerGameOver() {
  if (!gameOver) {
    gameOver = true;
    gameOverTimer = 180; // 3 segundos até reiniciar
  }
}

// ============================
// ATUALIZAÇÃO
// ============================
function update() {
  if (gameOver) {
    gameOverTimer--;
    if (gameOverTimer <= 0) {
      resetGame();
    }
    return; // pausa tudo enquanto mostra "Game Over"
  }

  if (keys["a"] || keys["arrowleft"]) player.x -= player.speed;
  if (keys["d"] || keys["arrowright"]) player.x += player.speed;
  if (keys["w"] || keys["arrowup"]) player.y -= player.speed;
  if (keys["s"] || keys["arrowdown"]) player.y += player.speed;

  player.x = Math.max(0, Math.min(WIDTH - player.width, player.x));
  player.y = Math.max(0, Math.min(HEIGHT - player.height, player.y));

  if (keys[" "] || keys["space"]) shootBullet();
  if (player.shootCooldown > 0) player.shootCooldown--;

  for (let i = player.bullets.length - 1; i >= 0; i--) {
    const b = player.bullets[i];
    b.y -= b.speed;
    b.frameTimer++;
    if (b.frameTimer > 6) {
      b.frame = (b.frame + 1) % 4;
      b.frameTimer = 0;
    }
    if (b.y + b.height < 0) {
      player.bullets.splice(i, 1);
    }
  }

  player.engineTimer++;
  if (player.engineTimer > player.engineFrameDelay) {
    player.engineFrame = (player.engineFrame + 1) % 3;
    player.engineTimer = 0;
  }

  if (Math.random() < 0.02) spawnEnemy();

  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].y += enemies[i].speed;
    if (enemies[i].y > HEIGHT) enemies.splice(i, 1);
  }

  backgroundLayers.forEach((layer) => {
    layer.stars.forEach((s) => {
      s.y += layer.speed;
      if (s.y > HEIGHT) {
        s.y = 0;
        s.x = Math.random() * WIDTH;
      }
    });
  });

  checkCollisions();
}

// ============================
// DESENHO
// ============================
function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  if (!allAssetsLoaded()) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#0ff";
    ctx.font = "20px sans-serif";
    ctx.fillText("Carregando assets...", WIDTH / 2 - 80, HEIGHT / 2);
    return;
  }

  backgroundLayers.forEach((layer) => {
    ctx.fillStyle = layer.color;
    layer.stars.forEach((s) => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  const engineFrameY = player.engineFrame * 48;
  ctx.drawImage(
    imgPlayerEngine,
    0,
    engineFrameY,
    48,
    48,
    player.x,
    player.y + 40,
    48,
    48
  );
  ctx.drawImage(imgPlayerBase, player.x, player.y, player.width, player.height);

  for (const b of player.bullets) {
    const frameY = b.frame * 32;
    ctx.drawImage(imgBullet, 0, frameY, 32, 32, b.x, b.y, b.width, b.height);
  }

  for (const e of enemies) {
    ctx.drawImage(imgEnemy, e.x, e.y, e.width, e.height);
  }

  ctx.fillStyle = "#0ff";
  ctx.font = "20px Orbitron, sans-serif";
  ctx.fillText(`SCORE: ${score}`, 20, 30);

  // Se Game Over
  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "red";
    ctx.font = "bold 48px Orbitron, sans-serif";
    ctx.fillText("GAME OVER", WIDTH / 2 - 150, HEIGHT / 2);
  }
}

// ============================
// LOOP PRINCIPAL
// ============================
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function startWhenReady() {
  if (allAssetsLoaded()) {
    requestAnimationFrame(gameLoop);
  } else {
    setTimeout(startWhenReady, 100);
  }
}
startWhenReady();
