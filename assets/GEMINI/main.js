// ====================================================================
// CONFIGURAÇÃO DO CANVAS E VARIÁVEIS GLOBAIS
// ====================================================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Variável Global de Pontuação
let score = 0;
let assetsLoaded = 0;
// Agora contabiliza os 3 ativos de imagem do usuário + o som
const TOTAL_ASSETS = 3; 

// --- Definição de URLs de Ativos (Agora Locais e Som) ---
const ASSET_URLS = {
    // ATIVOS DO USUÁRIO (Caminho assumido: assets/)
    PLAYER_SPRITE: 'assets/Main Ship - Base - Full health.png', 
    ENEMY_SPRITE: 'assets/Enimies Ship - Engines - Base Engine.png', 
    PROJECTILE_SPRITESHEET: 'assets/Main ship weapon - Projectile - Auto cannon bullet.png', 
    
    // Exemplo de som de laser (efeito sonoro)
    SHOOT_SOUND: 'https://cdn.jsdelivr.net/gh/michaelepps/gdd/assets/laser.mp3' 
};

// --- Estrutura de Ativos ---
const Assets = {
    playerSprite: new Image(),
    enemySprite: new Image(),
    projectileSprite: new Image(),
    shootSound: new Audio(ASSET_URLS.SHOOT_SOUND)
};

// --- Carregamento de Ativos ---
// Função auxiliar para carregar imagens e atualizar o contador
function loadImage(img, url) {
    img.onload = () => {
        assetsLoaded++;
        console.log(`Ativo carregado: ${url}`);
        if (assetsLoaded === TOTAL_ASSETS) {
            // Inicia o jogo somente após o carregamento das imagens
            gameLoop();
        }
    };
    img.onerror = () => {
        console.error(`Falha ao carregar o ativo: ${url}. Verifique o caminho.`);
        // Mesmo com erro, incrementamos para não travar o carregamento
        assetsLoaded++;
        if (assetsLoaded === TOTAL_ASSETS) {
            gameLoop();
        }
    };
    img.src = url;
}

loadImage(Assets.playerSprite, ASSET_URLS.PLAYER_SPRITE);
loadImage(Assets.enemySprite, ASSET_URLS.ENEMY_SPRITE);
loadImage(Assets.projectileSprite, ASSET_URLS.PROJECTILE_SPRITESHEET);


// --- Parâmetros de Sprite ---
// Tamanhos de desenho ajustados para corresponder aproximadamente aos sprites (DOBRADOS)
const PLAYER_DRAW_WIDTH = 32 * 2; 
const PLAYER_DRAW_HEIGHT = 32 * 2;

const ENEMY_DRAW_WIDTH = 24 * 2; 
const ENEMY_DRAW_HEIGHT = 24 * 2;

const PROJECTILE_FRAME_WIDTH = 8; // Tamanho original do frame no spritesheet
const PROJECTILE_FRAME_HEIGHT = 16;
const PROJECTILE_DRAW_WIDTH = 8 * 2; // Tamanho de desenho DOBRADO
const PROJECTILE_DRAW_HEIGHT = 8 * 2; // Tamanho de desenho DOBRADO


// --- Gerenciador de Som ---
const Sound = {
    // Função para tocar o som de tiro
    playShoot: function() {
        const clone = Assets.shootSound.cloneNode();
        clone.volume = 0.4;
        clone.play().catch(e => console.log("Erro ao tocar áudio (pode ser bloqueio do navegador):", e.message));
    }
};


// Estado do jogo
let gameState = {
    state: 'LOADING', 
    lastTime: 0,
    deltaTime: 0,
    gameSpeed: 1,
    // NOVO: Variável para o sistema de spawn
    enemySpawnTimer: 0, 
    enemySpawnInterval: 1.5 // Cria um inimigo a cada 1.5 segundos
};

// ====================================================================
// 1. INPUT HANDLER (CONTROLE DE TECLADO)
// ====================================================================
const Input = {
    keys: {}, 
    init: function() {
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
    },
    isKeyDown: function(keyCode) {
        return this.keys[keyCode];
    }
};

Input.init();

// ====================================================================
// 2. ESTRUTURA DE ENTIDADES (PLAYER, INIMIGO, PROJÉTIL)
// ====================================================================

// Classe Base para todas as Entidades do Jogo
class Entity {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        // Tamanho de desenho da entidade no Canvas
        this.width = width; 
        this.height = height;
        this.speed = speed;
    }

    getBounds() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }
}

// --- Entidade Jogador (Nave com Sprite Fixo) ---
class Player extends Entity {
    constructor(x, y) {
        // Agora usa o tamanho de desenho definido
        super(x, y, PLAYER_DRAW_WIDTH, PLAYER_DRAW_HEIGHT, 300); 
        this.dx = 0; 
        this.dy = 0; 
        this.isShooting = false; 

        // Como não é um spritesheet animado, simplificamos a animação.
        this.currentState = 'idle'; 
    }

    update(dt) {
        this.dx = 0;
        this.dy = 0;

        // 1. Captura de Input e Movimento
        if (Input.isKeyDown('KeyW') || Input.isKeyDown('ArrowUp')) {
            this.dy -= 1;
        }
        if (Input.isKeyDown('KeyS') || Input.isKeyDown('ArrowDown')) {
            this.dy += 1;
        }
        if (Input.isKeyDown('KeyA') || Input.isKeyDown('ArrowLeft')) {
            this.dx -= 1;
        }
        if (Input.isKeyDown('KeyD') || Input.isKeyDown('ArrowRight')) {
            this.dx += 1;
        }

        if (this.dx !== 0 && this.dy !== 0) {
            const length = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
            this.dx /= length;
            this.dy /= length;
        }

        this.x += this.dx * this.speed * dt;
        this.y += this.dy * this.speed * dt;

        this.x = Math.max(0, Math.min(this.x, WIDTH - this.width));
        this.y = Math.max(0, Math.min(this.y, HEIGHT - this.height));

        // 2. Lógica de Disparo (Criação de Balas)
        if (Input.isKeyDown('Space') && !this.isShooting) {
            // Ajusta o ponto de origem da bala para sair do centro da nave
            const bulletX = this.x + this.width / 2 - PROJECTILE_DRAW_WIDTH / 2; 
            const bulletY = this.y;
            projectiles.push(new Projectile(bulletX, bulletY));
            this.isShooting = true; 
            
            Sound.playShoot();

            // Cooldown de 200ms
            setTimeout(() => this.isShooting = false, 200); 
        }
    }

    // Não precisamos de animate, pois não há spritesheet de animação (por enquanto)
    animate(dt) {
        // Método mantido para compatibilidade com o loop, mas vazio
    }

    draw() {
        if (assetsLoaded < TOTAL_ASSETS) {
            // Desenha o fallback se a imagem ainda não carregou
            ctx.fillStyle = '#00C853';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            return;
        }

        // Desenha a imagem completa da nave
        ctx.drawImage(
            Assets.playerSprite, // Imagem da nave
            this.x, this.y, // Destination X, Y
            this.width, this.height // Destination Width, Height
        );
    }
}

// --- Entidade Inimigo (Nave com Sprite Fixo) ---
class Enemy extends Entity {
    constructor(x, y, target) {
        // Agora usa o tamanho de desenho e cor (fallback)
        super(x, y, ENEMY_DRAW_WIDTH, ENEMY_DRAW_HEIGHT, 150); 
        this.target = target;
    }

    update(dt) {
        // IA simples: move-se em direção ao jogador
        const targetX = this.target.x + this.target.width / 2;
        const targetY = this.target.y + this.target.height / 2;

        const angle = Math.atan2(targetY - (this.y + this.height / 2), targetX - (this.x + this.width / 2));

        // Aumentando a velocidade horizontal para dar um toque mais agressivo
        this.x += Math.cos(angle) * this.speed * 1.5 * dt; 
        this.y += Math.sin(angle) * this.speed * 0.5 * dt; // Diminuindo o avanço vertical para dar tempo de atirar
        
        // Se o inimigo sair da tela por baixo, ele é removido
        if (this.y > HEIGHT) {
            this.active = false;
        }
    }

    draw() {
        if (assetsLoaded < TOTAL_ASSETS) {
             // Fallback
             ctx.fillStyle = '#FF5722';
             ctx.fillRect(this.x, this.y, this.width, this.height);
             return;
        }
        
        // Desenha a imagem do inimigo
        ctx.drawImage(
            Assets.enemySprite, // Imagem do inimigo
            this.x, this.y, // Destination X, Y
            this.width, this.height // Destination Width, Height
        );
    }
}

// --- Entidade Projétil (Bala com Spritesheet Animado) ---
class Projectile extends Entity {
    constructor(x, y) {
        // Projétil com tamanho e velocidade ajustados
        super(x, y, PROJECTILE_DRAW_WIDTH, PROJECTILE_DRAW_HEIGHT, 700); 
        this.dy = -1; 
        this.dx = 0;
        this.active = true;

        // --- Variáveis de Animação (4 frames) ---
        this.frameX = 0; 
        this.fps = 15; // Velocidade da animação da bala
        this.frameInterval = 1000 / this.fps; 
        this.frameTimer = 0;
        this.maxFrame = 3; // 4 frames: 0, 1, 2, 3
    }
    
    animate(dt) {
        this.frameTimer += dt * 1000; 
        
        if (this.frameTimer >= this.frameInterval) {
            this.frameTimer = 0; 
            this.frameX = (this.frameX + 1) % (this.maxFrame + 1); // Loop entre 0 e 3
        }
    }

    update(dt) {
        this.y += this.dy * this.speed * dt;

        // Remoção da bala quando sair da tela (limite superior)
        if (this.y < -this.height) {
            this.active = false;
        }
    }

    draw() {
        if (assetsLoaded < TOTAL_ASSETS) {
            // Fallback
            ctx.fillStyle = '#00E5FF';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            return;
        }

        // Parâmetros de Clipping (Source)
        const sx = this.frameX * PROJECTILE_FRAME_WIDTH;
        const sy = 0;
        const sw = PROJECTILE_FRAME_WIDTH;
        const sh = PROJECTILE_FRAME_HEIGHT;

        // Parâmetros de Desenho (Destination)
        const dx = this.x;
        const dy = this.y;
        const dw = this.width;
        const dh = this.height;

        // Usa drawImage com 9 argumentos para o clipping
        ctx.drawImage(
            Assets.projectileSprite, // Spritesheet da bala
            sx, sy, sw, sh, // Source (o que cortar do spritesheet)
            dx, dy, dw, dh  // Destination (onde e qual tamanho desenhar)
        );
    }
}

// Instanciação das entidades
const player = new Player(WIDTH / 2 - PLAYER_DRAW_WIDTH / 2, HEIGHT - PLAYER_DRAW_HEIGHT - 50);

// Alterado: Começa com uma lista vazia de inimigos
let enemies = []; 
let projectiles = [];

// ====================================================================
// 3. SISTEMA DE COLISÃO AABB
// ====================================================================

/**
 * Verifica a colisão entre duas caixas delimitadoras (AABB).
 */
function checkAABBCollision(rectA, rectB) {
    const boundsA = rectA.getBounds();
    const boundsB = rectB.getBounds();

    return (
        boundsA.left < boundsB.right &&
        boundsA.right > boundsB.left &&
        boundsA.top < boundsB.bottom &&
        boundsA.bottom > boundsB.top
    );
}

// ====================================================================
// 4. ESTRUTURA DE PARALAXE
// ====================================================================

const Parallax = {
    layers: [
        { id: 1, color: 'rgba(255, 255, 255, 0.5)', speed: 10, count: 100, particles: [] },
        { id: 2, color: 'rgba(76, 175, 80, 0.2)', speed: 30, count: 50, particles: [] }
    ],
    
    init: function() {
        this.layers.forEach(layer => {
            for (let i = 0; i < layer.count; i++) {
                layer.particles.push({
                    x: Math.random() * WIDTH,
                    y: Math.random() * HEIGHT,
                    size: Math.random() * 2 + 1
                });
            }
        });
    },

    update: function(dt) {
        this.layers.forEach(layer => {
            const speed = layer.speed * dt; 

            layer.particles.forEach(p => {
                p.y += speed;
                if (p.y > HEIGHT) {
                    p.y = 0; 
                    p.x = Math.random() * WIDTH; 
                }
            });
        });
    },

    draw: function() {
        this.layers.forEach(layer => {
            ctx.fillStyle = layer.color;
            layer.particles.forEach(p => {
                ctx.fillRect(p.x, p.y, p.size, p.size);
            });
        });
    }
};

Parallax.init();

// ====================================================================
// 5. SISTEMA DE SPAWN DE INIMIGOS (NOVO)
// ====================================================================

function spawnEnemy() {
    // Posição X aleatória, garantindo que o inimigo esteja dentro da tela
    const x = Math.random() * (WIDTH - ENEMY_DRAW_WIDTH);
    // Posição Y fora da tela (no topo)
    const y = -ENEMY_DRAW_HEIGHT; 
    
    enemies.push(new Enemy(x, y, player));
}

function updateEnemySpawner(dt) {
    gameState.enemySpawnTimer += dt;
    
    if (gameState.enemySpawnTimer >= gameState.enemySpawnInterval) {
        spawnEnemy();
        gameState.enemySpawnTimer = 0; // Reseta o temporizador
        
        // Opcional: Acelera o spawn a cada novo inimigo (limite de 0.5s)
        gameState.enemySpawnInterval = Math.max(0.5, gameState.enemySpawnInterval - 0.02); 
    }
}


// ====================================================================
// 6. FUNÇÕES DE LOOP PRINCIPAL
// ====================================================================

/**
 * 1. Lógica do Jogo (Movimento, IA, Colisão)
 * @param {number} dt - Delta time (tempo decorrido desde o último frame em segundos)
 */
function update(dt) {
    if (gameState.state !== 'PLAYING') return;

    // Atualiza lógica
    Parallax.update(dt);
    player.update(dt);
    player.animate(dt); 

    // NOVO: Atualiza o Spawner
    updateEnemySpawner(dt);

    projectiles.forEach(p => {
        p.update(dt);
        p.animate(dt); 
    });
    projectiles = projectiles.filter(p => p.active);

    enemies.forEach(enemy => enemy.update(dt));
    // Remove inimigos inativos (os que saíram da tela por baixo)
    enemies = enemies.filter(enemy => enemy.active !== false); 

    // --- Checagem de Colisão (Player vs Inimigo) ---
    enemies.forEach(enemy => {
        if (checkAABBCollision(player, enemy)) {
            console.log('COLISÃO! Nave vs Inimigo');
            gameState.state = 'GAME_OVER';
        }
    });

    // --- Checagem de Colisão (Projétil vs Inimigo) ---
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];
            if (checkAABBCollision(p, e)) {
                console.log('Inimigo atingido!');
                // Desativa/remove projétil e inimigo
                p.active = false;
                enemies.splice(j, 1);
                
                // ATUALIZAÇÃO DE PONTUAÇÃO
                score += 10; // Adiciona 10 pontos por inimigo destruído
                
                break; 
            }
        }
    }
}

/**
 * 2. Renderização (Desenho na tela)
 */
function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    Parallax.draw();

    player.draw();
    enemies.forEach(enemy => enemy.draw());
    projectiles.forEach(p => p.draw());

    // Desenho do HUD (Informações do Jogador)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Inter';
    ctx.textAlign = 'left';

    ctx.fillText(`Estado: ${gameState.state}`, 10, 30);

    // EXIBIÇÃO DE PONTUAÇÃO (Canto superior direito)
    ctx.textAlign = 'right';
    ctx.fillText(`Pontuação: ${score}`, WIDTH - 10, 30);
    ctx.textAlign = 'left'; 

    // Se for Game Over, exibe uma mensagem centralizada
    if (gameState.state === 'GAME_OVER') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '48px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('FIM DE JOGO', WIDTH / 2, HEIGHT / 2);
        ctx.font = '24px Inter';
        ctx.fillText('Recarregue a página para tentar novamente', WIDTH / 2, HEIGHT / 2 + 50);
    }
    
    // Tela de Carregamento
    if (gameState.state === 'LOADING' || assetsLoaded < TOTAL_ASSETS) {
        ctx.fillStyle = '#0d1117';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#4CAF50';
        ctx.font = '30px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('CARREGANDO ATIVOS...', WIDTH / 2, HEIGHT / 2);
    }
}

/**
 * Loop Principal do Jogo
 */
function gameLoop(currentTime = 0) {
    // Só inicia o loop de jogo se as imagens estiverem carregadas.
    if (assetsLoaded < TOTAL_ASSETS) {
        gameState.state = 'LOADING';
        draw();
        requestAnimationFrame(gameLoop);
        return;
    }
    
    if (gameState.state === 'LOADING') {
        gameState.state = 'PLAYING';
    }

    gameState.deltaTime = (currentTime - gameState.lastTime) / 1000;
    gameState.lastTime = currentTime;

    update(gameState.deltaTime * gameState.gameSpeed);
    draw();

    requestAnimationFrame(gameLoop);
}

// Inicia o processo de carregamento/loop quando a janela carregar
window.onload = function () {
    if (assetsLoaded < TOTAL_ASSETS) {
        requestAnimationFrame(gameLoop);
    }
}