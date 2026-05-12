// Game Constants
const CANVAS = document.getElementById('gameCanvas');
const CTX = CANVAS.getContext('2d');

// Set canvas size to fill window
function resizeCanvas() {
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const LEVEL_1 = 1;
const LEVEL_2 = 2;
const LEVEL_3 = 3;

// Load Images
const images = {};
const imageCount = 2;
let imagesLoaded = 0;

const imgPlayer = new Image();
imgPlayer.src = 'Img/MainCharacterSprite-removebg-preview.png';
imgPlayer.onload = () => { images.player = imgPlayer; imagesLoaded++; };

const imgEnemy = new Image();
imgEnemy.src = 'Img/EmenyBasicSprite.png';
imgEnemy.onload = () => { images.enemy = imgEnemy; imagesLoaded++; };

// Player Class
class Player {
    constructor() {
        this.x = CANVAS.width / 2 - 50;
        this.y = CANVAS.height - 120;
        this.width = 100;
        this.height = 100;
        this.speed = 8;
        this.health = 100;
        this.maxHealth = 100;
        this.ammo = 30;
        this.maxAmmo = 60;
        this.damage = 1;
        this.fireRate = 300; // milliseconds between shots
        this.lastShot = 0;
        this.keys = {};
    }

    update() {
        if (this.keys['ArrowLeft'] && this.x > 0) this.x -= this.speed;
        if (this.keys['ArrowRight'] && this.x < CANVAS.width - this.width) this.x += this.speed;
    }

    draw() {
        if (images.player) {
            CTX.drawImage(images.player, this.x, this.y, this.width, this.height);
        } else {
            CTX.fillStyle = '#FFD700';
            CTX.fillRect(this.x, this.y, this.width, this.height);
        }

        // Draw health bar
        CTX.fillStyle = '#0f0';
        CTX.fillRect(this.x, this.y - 10, (this.width * this.health) / this.maxHealth, 5);
        CTX.strokeStyle = '#0f0';
        CTX.strokeRect(this.x, this.y - 10, this.width, 5);
    }

    takeDamage(damage) {
        this.health -= damage;
    }

    isAlive() {
        return this.health > 0;
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShot > this.fireRate && this.ammo > 0) {
            this.lastShot = now;
            this.ammo--;
            return new Bullet(this.x + this.width / 2 - 4, this.y);
        }
        return null;
    }

    upgradeDamage() {
        this.damage += 0.5;
    }

    upgradeHealth() {
        this.maxHealth += 30;
        this.health = this.maxHealth;
    }

    upgradeFireRate() {
        this.fireRate = Math.max(100, this.fireRate - 50);
    }

    pickupAmmo(amount) {
        this.ammo = Math.min(this.maxAmmo, this.ammo + amount);
    }
}

// Bullet Class
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 30;
        this.speed = 12;
    }

    update() {
        this.y -= this.speed;
    }

    draw() {
        CTX.fillStyle = '#FFFF00';
        CTX.fillRect(this.x, this.y, this.width, this.height);
    }

    isOffScreen() {
        return this.y < 0;
    }
}

// Ammo Pickup Class
class AmmoDrop {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.speed = 3;
        this.amount = 10;
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        CTX.fillStyle = '#FFD700';
        CTX.fillRect(this.x, this.y, this.width, this.height);
        CTX.strokeStyle = '#FFA500';
        CTX.lineWidth = 3;
        CTX.strokeRect(this.x, this.y, this.width, this.height);
    }

    isOffScreen() {
        return this.y > CANVAS.height;
    }
}

// Enemy Base Class
class Enemy {
    constructor(x, y, type = 'basic') {
        this.x = x;
        this.y = y;
        this.width = 90;
        this.height = 90;
        this.type = type;
        this.health = 1;
        this.maxHealth = 1;
        this.damage = 1;
        this.velocityX = 2;
        this.shootChance = 0.01;
        this.color = '#8B7355';
    }

    update() {
        this.x += this.velocityX;
    }

    draw() {
        if (images.enemy) {
            CTX.save();
            CTX.globalAlpha = 1;
            
            // Apply color tinting
            CTX.fillStyle = this.color;
            CTX.globalCompositeOperation = 'multiply';
            CTX.fillRect(this.x, this.y, this.width, this.height);
            CTX.globalCompositeOperation = 'source-over';
            
            CTX.drawImage(images.enemy, this.x, this.y, this.width, this.height);
            CTX.restore();
        } else {
            CTX.fillStyle = this.color;
            CTX.fillRect(this.x, this.y, this.width, this.height);
        }

        // Draw health bar
        CTX.fillStyle = '#f00';
        CTX.fillRect(this.x, this.y - 8, (this.width * this.health) / this.maxHealth, 4);
        CTX.strokeStyle = '#f00';
        CTX.strokeRect(this.x, this.y - 8, this.width, 4);
    }

    takeDamage(damage) {
        this.health -= damage;
    }

    isAlive() {
        return this.health > 0;
    }

    isOffScreen() {
        return this.x > CANVAS.width || this.x < -this.width;
    }

    canShoot() {
        return Math.random() < this.shootChance;
    }

    shoot() {
        return new EnemyBullet(this.x + this.width / 2 - 4, this.y + this.height, this.type);
    }
}

// Basic Enemy Type
class BasicEnemy extends Enemy {
    constructor(x, y, direction = 1) {
        super(x, y, 'basic');
        this.health = 1;
        this.maxHealth = 1;
        this.damage = 1;
        this.velocityX = 2 * direction;
        this.shootChance = 0.008;
        this.color = '#8B7355';
    }
}

// Speedy Enemy Type (Fast, Quick Attacks)
class SpeedyEnemy extends Enemy {
    constructor(x, y, direction = 1) {
        super(x, y, 'speedy');
        this.health = 1;
        this.maxHealth = 1;
        this.damage = 2;
        this.velocityX = 4 * direction;
        this.shootChance = 0.02;
        this.color = '#00AA00';
    }
}

// Strong Enemy Type (High Health, Stronger Attacks)
class StrongEnemy extends Enemy {
    constructor(x, y, direction = 1) {
        super(x, y, 'strong');
        this.health = 3;
        this.maxHealth = 3;
        this.damage = 3;
        this.velocityX = 1 * direction;
        this.shootChance = 0.015;
        this.color = '#AA0000';
    }
}

// Enemy Bullet Class
class EnemyBullet {
    constructor(x, y, type = 'basic') {
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 24;
        this.speed = 7;
        this.type = type;
        
        // Set color based on enemy type
        if (type === 'basic') {
            this.color = '#FF6600'; // Orange
        } else if (type === 'speedy') {
            this.color = '#00FF00'; // Green
        } else if (type === 'strong') {
            this.color = '#FF0000'; // Red
        } else {
            this.color = '#FF6600'; // Default orange
        }
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        CTX.fillStyle = this.color;
        CTX.fillRect(this.x, this.y, this.width, this.height);
    }

    isOffScreen() {
        return this.y > CANVAS.height;
    }
}

// Game Class
class Game {
    constructor() {
        this.player = new Player();
        this.level = LEVEL_1;
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.ammoDrops = [];
        this.score = 0;
        this.scoreGoal = 5000;
        this.gameRunning = true;
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 80;
        this.maxEnemies = 5;
        this.waveCount = 0;

        this.setupKeyListeners();
        this.initLevel();
    }

    setupKeyListeners() {
        document.addEventListener('keydown', (e) => {
            this.player.keys[e.key] = true;
            if (e.key === ' ') {
                e.preventDefault();
                const bullet = this.player.shoot();
                if (bullet) this.bullets.push(bullet);
            }
        });

        document.addEventListener('keyup', (e) => {
            this.player.keys[e.key] = false;
        });
    }

    initLevel() {
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.ammoDrops = [];
        this.enemySpawnTimer = 0;
        this.waveCount = 0;

        if (this.level === LEVEL_1) {
            this.maxEnemies = 5;
            this.enemySpawnInterval = 100;
            this.scoreGoal = 5000;
        } else if (this.level === LEVEL_2) {
            this.maxEnemies = 8;
            this.enemySpawnInterval = 80;
            this.scoreGoal = 10000;
        } else if (this.level === LEVEL_3) {
            this.maxEnemies = 10;
            this.enemySpawnInterval = 60;
            this.scoreGoal = 15000;
        }
    }

    spawnEnemy() {
        if (this.enemies.length >= this.maxEnemies) return;

        const y = Math.random() * (CANVAS.height - 90);
        const direction = Math.random() < 0.5 ? 1 : -1;
        const x = direction === 1 ? -90 : CANVAS.width;
        let enemy;

        if (this.level === LEVEL_1) {
            enemy = new BasicEnemy(x, y, direction);
        } else if (this.level === LEVEL_2) {
            const rand = Math.random();
            if (rand < 0.7) {
                enemy = new BasicEnemy(x, y, direction);
            } else {
                enemy = new SpeedyEnemy(x, y, direction);
            }
        } else if (this.level === LEVEL_3) {
            const rand = Math.random();
            if (rand < 0.5) {
                enemy = new BasicEnemy(x, y, direction);
            } else if (rand < 0.8) {
                enemy = new SpeedyEnemy(x, y, direction);
            } else {
                enemy = new StrongEnemy(x, y, direction);
            }
        }

        this.enemies.push(enemy);
    }

    update() {
        if (!this.gameRunning) return;

        // Update player
        this.player.update();

        // Spawn enemies
        this.enemySpawnTimer++;
        if (this.enemySpawnTimer > this.enemySpawnInterval) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }

        // Update and manage enemies
        this.enemies = this.enemies.filter((enemy) => {
            enemy.update();

            // Enemy shoots
            if (enemy.canShoot()) {
                this.enemyBullets.push(enemy.shoot());
            }

            return !enemy.isOffScreen();
        });

        // Update bullets
        this.bullets = this.bullets.filter((bullet) => {
            bullet.update();
            return !bullet.isOffScreen();
        });

        // Update enemy bullets
        this.enemyBullets = this.enemyBullets.filter((bullet) => {
            bullet.update();
            return !bullet.isOffScreen();
        });

        // Check collisions: bullets hitting enemies
        for (let i = 0; i < this.bullets.length; i++) {
            for (let j = 0; j < this.enemies.length; j++) {
                if (this.checkCollision(this.bullets[i], this.enemies[j])) {
                    this.enemies[j].takeDamage(this.player.damage);
                    this.bullets.splice(i, 1);
                    i--;

                    if (!this.enemies[j].isAlive()) {
                        this.score += this.getEnemyPoints(this.enemies[j]);
                        this.checkAmmoDrop(this.enemies[j]);
                        this.enemies.splice(j, 1);
                        j--;
                    }
                    break;
                }
            }
        }

        // Check collisions: enemy bullets hitting player
        for (let i = 0; i < this.enemyBullets.length; i++) {
            if (this.checkCollision(this.enemyBullets[i], this.player)) {
                this.player.takeDamage(1);
                this.enemyBullets.splice(i, 1);
                i--;

                if (!this.player.isAlive()) {
                    this.gameOver();
                }
            }
        }

        // Update ammo drops
        this.ammoDrops = this.ammoDrops.filter((ammo) => {
            ammo.update();
            return !ammo.isOffScreen();
        });

        // Check collisions: ammo drops with player
        for (let i = 0; i < this.ammoDrops.length; i++) {
            if (this.checkCollision(this.ammoDrops[i], this.player)) {
                this.player.pickupAmmo(this.ammoDrops[i].amount);
                this.ammoDrops.splice(i, 1);
                i--;
            }
        }

        // Check if level complete
        if (this.score >= this.scoreGoal) {
            this.levelComplete();
        }

        this.updateUI();
    }

    checkCollision(obj1, obj2) {
        return (
            obj1.x < obj2.x + obj2.width &&
            obj1.x + obj1.width > obj2.x &&
            obj1.y < obj2.y + obj2.height &&
            obj1.y + obj1.height > obj2.y
        );
    }

    getEnemyPoints(enemy) {
        if (enemy.type === 'basic') return 100;
        if (enemy.type === 'speedy') return 250;
        if (enemy.type === 'strong') return 500;
        return 100;
    }

    checkAmmoDrop(enemy) {
        let dropChance = 0;
        
        if (enemy.type === 'basic') {
            dropChance = 0.10; // 10% chance
        } else if (enemy.type === 'speedy') {
            dropChance = 0.25; // 25% chance
        } else if (enemy.type === 'strong') {
            dropChance = 0.40; // 40% chance
        }
        
        if (Math.random() < dropChance) {
            this.ammoDrops.push(new AmmoDrop(enemy.x + enemy.width / 2 - 10, enemy.y));
        }
    }

    draw() {
        // Clear canvas
        CTX.fillStyle = '#000';
        CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);

        // Draw game objects
        this.player.draw();
        this.bullets.forEach((bullet) => bullet.draw());
        this.enemies.forEach((enemy) => enemy.draw());
        this.enemyBullets.forEach((bullet) => bullet.draw());
        this.ammoDrops.forEach((ammo) => ammo.draw());
    }

    updateUI() {
        document.getElementById('levelDisplay').textContent = `Level ${this.level}`;
        document.getElementById('scoreDisplay').textContent = `Score: ${this.score} / ${this.scoreGoal}`;
        document.getElementById('healthDisplay').textContent = `Health: ${Math.max(0, this.player.health)}`;
        document.getElementById('ammoDisplay').textContent = `Ammo: ${this.player.ammo}/${this.player.maxAmmo}`;
        document.getElementById('enemyCount').textContent = `Enemies: ${this.enemies.length}`;
    }

    levelComplete() {
        this.gameRunning = false;
        document.getElementById('upgradePanel').style.display = 'block';
        const nextLevel = this.level < LEVEL_3 ? this.level + 1 : 3;
        document.getElementById('upgradeText').textContent = `Level ${this.level} Complete! Score: ${this.score} / ${this.scoreGoal}. Choose an upgrade to advance to Level ${nextLevel}.`;
    }

    selectUpgrade(upgrade) {
        if (upgrade === 'damage') {
            this.player.upgradeDamage();
        } else if (upgrade === 'health') {
            this.player.upgradeHealth();
        } else if (upgrade === 'fireRate') {
            this.player.upgradeFireRate();
        }
    }

    nextLevel() {
        if (this.level < LEVEL_3) {
            this.level++;
            this.player.ammo = 30; // Refill ammo for next level
            this.gameRunning = true;
            document.getElementById('upgradePanel').style.display = 'none';
            this.initLevel();
        } else {
            this.allLevelsComplete();
        }
    }

    allLevelsComplete() {
        this.gameRunning = false;
        document.getElementById('upgradePanel').style.display = 'none';
        document.getElementById('levelCompletePanel').style.display = 'block';
        document.getElementById('finalScore').textContent = this.score;
    }

    gameOver() {
        this.gameRunning = false;
        document.getElementById('gameOverPanel').style.display = 'block';
        document.getElementById('gameOverText').textContent = `Final Score: ${this.score} on Level ${this.level}`;
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize and start game
let game;
window.addEventListener('load', () => {
    // Wait for images to load
    const checkImagesLoaded = setInterval(() => {
        if (imagesLoaded === imageCount) {
            clearInterval(checkImagesLoaded);
            game = new Game();
            game.gameLoop();
        }
    }, 100);
});
