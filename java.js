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
const LEVEL_4 = 4;
const LEVEL_5 = 5;

// Load Images
const images = {};
const imageCount = 5;
let imagesLoaded = 0;

const imgPlayer = new Image();
imgPlayer.src = 'Img/MainCharacterSprite-removebg-preview.png';
imgPlayer.onload = () => { images.player = imgPlayer; imagesLoaded++; };

const imgEnemy = new Image();
imgEnemy.src = 'Img/EmenyBasicSprite.png';
imgEnemy.onload = () => { images.enemy = imgEnemy; imagesLoaded++; };

const imgSpeedy = new Image();
imgSpeedy.src = 'Img/SpeedEmeny.png';
imgSpeedy.onload = () => { images.speedy = imgSpeedy; imagesLoaded++; };

const imgStrong = new Image();
imgStrong.src = 'Img/BruteEmeny.png';
imgStrong.onload = () => { images.strong = imgStrong; imagesLoaded++; };

const imgBoss = new Image();
imgBoss.src = 'Img/BossBug.png';
imgBoss.onload = () => { images.boss = imgBoss; imagesLoaded++; };

// Player Class
class Player {
    constructor() {
        this.x = CANVAS.width / 2 - 50;
        this.y = CANVAS.height - 200;
        this.width = 100;
        this.height = 100;
        this.speed = 8;
        this.health = 100;
        this.maxHealth = 100;
        this.ammo = 30;
        this.maxAmmo = 100;
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

// Wall Repair Powerup Class
class WallRepairPowerup {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        this.speed = 3;
        this.type = 'wall';
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        CTX.fillStyle = '#888';
        CTX.fillRect(this.x, this.y, this.width, this.height);
        CTX.strokeStyle = '#555';
        CTX.lineWidth = 3;
        CTX.strokeRect(this.x, this.y, this.width, this.height);
    }

    isOffScreen() {
        return this.y > CANVAS.height;
    }
}

// Health Restore Powerup Class
class HealthRestorePowerup {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        this.speed = 3;
        this.type = 'health';
        this.healAmount = 8;
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        CTX.fillStyle = '#ff69b4';
        CTX.fillRect(this.x, this.y, this.width, this.height);
        CTX.strokeStyle = '#ff1493';
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
        this.velocityY = 0.5;
        this.direction = 1;
        this.shootChance = 0.01;
        this.color = '#8B7355';
    }

    update(targetX, targetY, gameWidth, boundaryY) {
        // Space Invaders-style horizontal movement
        this.x += this.velocityX * this.direction;
        
        // Move down periodically (when reaching screen edges)
        if (this.x <= 0 || this.x + this.width >= gameWidth) {
            this.direction *= -1;
            this.y += 40;
        }
        
        // Also slowly move down toward target
        if (this.y < targetY - 200) {
            this.y += this.velocityY;
        }

        // Prevent enemies from moving below the wall row
        if (boundaryY !== undefined && this.y + this.height > boundaryY) {
            this.y = boundaryY - this.height;
        }
    }

    draw() {
        let enemyImage = null;
        if (this.type === 'speedy') {
            enemyImage = images.speedy;
        } else if (this.type === 'strong') {
            enemyImage = images.strong;
        } else {
            enemyImage = images.enemy;
        }

        if (enemyImage) {
            CTX.save();
            CTX.globalAlpha = 1;
            
            // Apply color tinting
            CTX.fillStyle = this.color;
            CTX.globalCompositeOperation = 'multiply';
            CTX.fillRect(this.x, this.y, this.width, this.height);
            CTX.globalCompositeOperation = 'source-over';
            
            CTX.drawImage(enemyImage, this.x, this.y, this.width, this.height);
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
        this.velocityX = 1.5;
        this.velocityY = 0.3;
        this.direction = direction;
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
        this.velocityX = 2.5;
        this.velocityY = 0.4;
        this.direction = direction;
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
        this.velocityX = 1;
        this.velocityY = 0.25;
        this.direction = direction;
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

// Wall Class
class Wall {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 100;
        this.health = 25;
        this.maxHealth = 25;
        this.color = '#808080'; // Gray
    }

    update() {
        // Walls don't move
    }

    draw() {
        CTX.fillStyle = this.color;
        CTX.fillRect(this.x, this.y, this.width, this.height);

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
}

// Generator Class
class Generator {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 40;
        this.health = 50;
        this.maxHealth = 50;
        this.color = '#87CEEB'; // Light blue
        this.pulsePhase = 0;
    }

    update() {
        this.pulsePhase += 0.05;
    }

    draw() {
        // Draw main circle
        CTX.fillStyle = this.color;
        CTX.beginPath();
        CTX.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        CTX.fill();

        // Draw pulsing white center
        const pulse = Math.abs(Math.sin(this.pulsePhase));
        const centerRadius = 15 + pulse * 5;
        CTX.fillStyle = 'white';
        CTX.beginPath();
        CTX.arc(this.x, this.y, centerRadius, 0, Math.PI * 2);
        CTX.fill();

        // Draw health bar
        CTX.fillStyle = '#f00';
        CTX.fillRect(this.x - this.radius, this.y - this.radius - 15, (this.radius * 2 * this.health) / this.maxHealth, 4);
        CTX.strokeStyle = '#f00';
        CTX.strokeRect(this.x - this.radius, this.y - this.radius - 15, this.radius * 2, 4);
    }

    takeDamage(damage) {
        this.health -= damage;
    }

    isAlive() {
        return this.health > 0;
    }
}

// Laser Class (for boss)
class Laser {
    constructor(x, y, direction = 1) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 15;
        this.speed = 15;
        this.direction = direction;
        this.color = '#FF0000';
    }

    update() {
        this.x += this.speed * this.direction;
    }

    draw() {
        CTX.fillStyle = this.color;
        CTX.fillRect(this.x, this.y, this.width, this.height);
        CTX.strokeStyle = '#FF3333';
        CTX.lineWidth = 2;
        CTX.strokeRect(this.x, this.y, this.width, this.height);
    }

    isOffScreen() {
        return this.x > CANVAS.width || this.x + this.width < 0;
    }
}

// Boss Class
class Boss {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 200;
        this.height = 200;
        this.health = 100;
        this.maxHealth = 100;
        this.speed = 3;
        this.direction = 1;
        this.attackTimer = 0;
        this.attackInterval = 120;
        this.minionSpawnTimer = 0;
        this.minionSpawnInterval = 300;
        this.lastLaserTime = 0;
        this.laserCooldown = 400;
        this.color = '#FF6600';
    }

    update(gameWidth) {
        // Move back and forth
        this.x += this.speed * this.direction;
        if (this.x <= 50 || this.x + this.width >= gameWidth - 50) {
            this.direction *= -1;
        }

        this.attackTimer++;
        this.minionSpawnTimer++;
    }

    draw() {
        if (images.boss) {
            CTX.drawImage(images.boss, this.x, this.y, this.width, this.height);
        } else {
            CTX.fillStyle = this.color;
            CTX.fillRect(this.x, this.y, this.width, this.height);
        }

        // Draw health bar
        CTX.fillStyle = '#f00';
        CTX.fillRect(this.x, this.y - 15, (this.width * this.health) / this.maxHealth, 8);
        CTX.strokeStyle = '#f00';
        CTX.lineWidth = 2;
        CTX.strokeRect(this.x, this.y - 15, this.width, 8);
    }

    takeDamage(damage) {
        this.health -= damage;
    }

    isAlive() {
        return this.health > 0;
    }

    canAttack() {
        return this.attackTimer >= this.attackInterval;
    }

    canLaser() {
        return Date.now() - this.lastLaserTime >= this.laserCooldown;
    }

    canSpawnMinion() {
        return this.minionSpawnTimer >= this.minionSpawnInterval;
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
        this.powerups = [];
        this.walls = [];
        this.wallsInitialized = false;
        this.generator = null;
        this.boss = null;
        this.bosslasers = [];
        this.score = 0;
        this.killsThisLevel = 0;
        this.killGoal = 25;
        this.gameRunning = true;
        this.bossIntroActive = false;
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 80;
        this.maxEnemies = 5;
        this.waveCount = 0;
        this.enemyBoundaryY = CANVAS.height * 0.5; // Fixed boundary for enemies

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
        this.powerups = [];
        this.bossLasers = [];
        this.boss = null;
        this.killsThisLevel = 0;
        // Keep existing walls across levels so they do not respawn each round
        this.enemySpawnTimer = 0;
        this.waveCount = 0;

        // Create generator in front of the player
        const generatorX = CANVAS.width / 2;
        const generatorY = CANVAS.height - 50;
        this.generator = new Generator(generatorX, generatorY);

        if (!this.wallsInitialized) {
            // Create 3 walls spaced forward and spread out (more forward than generator)
            const wallDistance = 250;
            const wall1X = generatorX - wallDistance - 500;
            const wall1Y = generatorY - 265;
            this.walls.push(new Wall(wall1X, wall1Y));

            const wall2X = generatorX - 50;
            const wall2Y = generatorY - 285;
            this.walls.push(new Wall(wall2X, wall2Y));

            const wall3X = generatorX + wallDistance + 500;
            const wall3Y = generatorY - 265;
            this.walls.push(new Wall(wall3X, wall3Y));

            this.wallsInitialized = true;
            // Set enemy boundary based on wall positions
            this.enemyBoundaryY = Math.min(...this.walls.map((wall) => wall.y)) - 10;
        }

        if (this.level === LEVEL_1) {
            this.maxEnemies = 5;
            this.enemySpawnInterval = 100;
            this.killGoal = 25;
        } else if (this.level === LEVEL_2) {
            this.maxEnemies = 8;
            this.enemySpawnInterval = 80;
            this.killGoal = 35;
        } else if (this.level === LEVEL_3) {
            this.maxEnemies = 10;
            this.enemySpawnInterval = 60;
            this.killGoal = 45;
        } else if (this.level === LEVEL_4) {
            this.maxEnemies = 12;
            this.enemySpawnInterval = 40;
            this.killGoal = 50;
        } else if (this.level === LEVEL_5) {
            this.bossIntroActive = true;
            this.bossIntroTimer = 0;
            this.gameRunning = false;
            this.boss = new Boss(CANVAS.width / 2 - 100, 50);
            this.maxEnemies = 8;
            this.enemySpawnInterval = 150;
            this.killGoal = 1;
        }
    }

    spawnEnemy() {
        if (this.enemies.length >= this.maxEnemies) return;

        // Spawn enemies at the top of the screen in a row
        const spawnY = 50 + (this.enemies.length * 80);
        const spawnX = Math.random() * (CANVAS.width - 90);
        const direction = Math.random() < 0.5 ? 1 : -1;
        let enemy;

        if (this.level === LEVEL_1) {
            enemy = new BasicEnemy(spawnX, spawnY, direction);
        } else if (this.level === LEVEL_2) {
            const rand = Math.random();
            if (rand < 0.7) {
                enemy = new BasicEnemy(spawnX, spawnY, direction);
            } else {
                enemy = new SpeedyEnemy(spawnX, spawnY, direction);
            }
        } else if (this.level === LEVEL_3) {
            const rand = Math.random();
            if (rand < 0.5) {
                enemy = new BasicEnemy(spawnX, spawnY, direction);
            } else if (rand < 0.8) {
                enemy = new SpeedyEnemy(spawnX, spawnY, direction);
            } else {
                enemy = new StrongEnemy(spawnX, spawnY, direction);
            }
        } else if (this.level === LEVEL_4) {
            const rand = Math.random();
            if (rand < 0.4) {
                enemy = new BasicEnemy(spawnX, spawnY, direction);
            } else if (rand < 0.8) {
                enemy = new SpeedyEnemy(spawnX, spawnY, direction);
            } else {
                enemy = new StrongEnemy(spawnX, spawnY, direction);
            }

            enemy.velocityX *= 1.3;
            enemy.velocityY *= 1.3;
            enemy.damage += 1;
            enemy.maxHealth += 1;
            enemy.health += 1;
        } else if (this.level === LEVEL_5) {
            const rand = Math.random();
            if (rand < 0.5) {
                enemy = new BasicEnemy(spawnX, spawnY, direction);
            } else if (rand < 0.8) {
                enemy = new SpeedyEnemy(spawnX, spawnY, direction);
            } else {
                enemy = new StrongEnemy(spawnX, spawnY, direction);
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
            enemy.update(this.generator.x, this.generator.y, CANVAS.width, this.enemyBoundaryY);

            // Enemy shoots
            if (enemy.canShoot()) {
                this.enemyBullets.push(enemy.shoot());
            }

            return !enemy.isOffScreen();
        });

        // Update bullets
        this.bullets = this.bullets.filter((bullet) => {
            bullet.update();
            let hitWall = false;

            for (let j = 0; j < this.walls.length; j++) {
                if (this.checkCollision(bullet, this.walls[j])) {
                    this.walls[j].takeDamage(this.player.damage);
                    hitWall = true;
                    break;
                }
            }

            return !bullet.isOffScreen() && !hitWall;
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
                        this.killsThisLevel += 1;
                        this.checkAmmoDrop(this.enemies[j]);
                        this.enemies.splice(j, 1);
                        j--;
                    }
                    break;
                }
            }
        }

        // Update walls and generator
        this.walls.forEach((wall) => wall.update());
        if (this.generator) this.generator.update();

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

        // Check collisions: enemy bullets hitting walls
        for (let i = 0; i < this.enemyBullets.length; i++) {
            for (let j = 0; j < this.walls.length; j++) {
                if (this.checkCollisionCircleRect(this.enemyBullets[i], this.walls[j])) {
                    this.walls[j].takeDamage(1);
                    this.enemyBullets.splice(i, 1);
                    i--;
                    break;
                }
            }
        }

        // Check collisions: enemy bullets hitting generator
        if (this.generator) {
            for (let i = 0; i < this.enemyBullets.length; i++) {
                if (this.checkCollisionCircle(this.enemyBullets[i], this.generator)) {
                    this.generator.takeDamage(1);
                    this.enemyBullets.splice(i, 1);
                    i--;
                    if (!this.generator.isAlive()) {
                        this.gameOver();
                    }
                    break;
                }
            }
        }

        // Remove destroyed walls
        this.walls = this.walls.filter((wall) => wall.isAlive());

        // Update ammo drops
        this.ammoDrops = this.ammoDrops.filter((ammo) => {
            ammo.update();
            return !ammo.isOffScreen();
        });

        // Update powerups
        this.powerups = this.powerups.filter((powerup) => {
            powerup.update();
            return !powerup.isOffScreen();
        });

        // Check collisions: ammo drops with player
        for (let i = 0; i < this.ammoDrops.length; i++) {
            if (this.checkCollision(this.ammoDrops[i], this.player)) {
                this.player.pickupAmmo(this.ammoDrops[i].amount);
                this.ammoDrops.splice(i, 1);
                i--;
            }
        }

        // Check collisions: powerups with player
        for (let i = 0; i < this.powerups.length; i++) {
            if (this.checkCollision(this.powerups[i], this.player)) {
                if (this.powerups[i].type === 'wall') {
                    this.applyWallRepairPowerup();
                } else if (this.powerups[i].type === 'health') {
                    this.player.health = Math.min(this.player.maxHealth, this.player.health + this.powerups[i].healAmount);
                }
                this.powerups.splice(i, 1);
                i--;
            }
        }

        // Check if level complete
        if (this.killsThisLevel >= this.killGoal) {
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

    checkCollisionCircle(bullet, generator) {
        const dx = bullet.x + bullet.width / 2 - generator.x;
        const dy = bullet.y + bullet.height / 2 - generator.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < generator.radius + bullet.width / 2;
    }

    checkCollisionCircleRect(bullet, wall) {
        const bulletCenterX = bullet.x + bullet.width / 2;
        const bulletCenterY = bullet.y + bullet.height / 2;
        const bulletRadius = bullet.width / 2;

        // Find closest point on wall to bullet center
        const closestX = Math.max(wall.x, Math.min(bulletCenterX, wall.x + wall.width));
        const closestY = Math.max(wall.y, Math.min(bulletCenterY, wall.y + wall.height));

        const dx = bulletCenterX - closestX;
        const dy = bulletCenterY - closestY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < bulletRadius;
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
            dropChance = 0.25; // 25% chance
        } else if (enemy.type === 'speedy') {
            dropChance = 0.40; // 40% chance
        } else if (enemy.type === 'strong') {
            dropChance = 0.50; // 50% chance
        }
        
        if (Math.random() < dropChance) {
            this.ammoDrops.push(new AmmoDrop(enemy.x + enemy.width / 2 - 10, enemy.y));
        }

        if (Math.random() < 0.15) {
            this.powerups.push(new WallRepairPowerup(enemy.x + enemy.width / 2 - 12, enemy.y));
        }

        if (Math.random() < 0.13) {
            this.powerups.push(new HealthRestorePowerup(enemy.x + enemy.width / 2 - 12, enemy.y));
        }
    }

    applyWallRepairPowerup() {
        if (this.walls.length === 0) return;

        // Prioritize center wall (middle wall, index 1)
        let targetWall = this.walls[1]; // Center wall
        if (!targetWall || !targetWall.isAlive()) {
            // If center wall is dead, pick from other alive walls
            const aliveWalls = this.walls.filter((wall) => wall.isAlive());
            if (aliveWalls.length === 0) return;
            targetWall = aliveWalls[0];
        }

        targetWall.health = Math.min(targetWall.maxHealth, targetWall.health + 10);
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
        this.powerups.forEach((powerup) => powerup.draw());
        this.walls.forEach((wall) => wall.draw());
        if (this.generator) this.generator.draw();
    }

    updateUI() {
        document.getElementById('levelDisplay').textContent = `Level ${this.level}`;
        document.getElementById('scoreDisplay').textContent = `Score: ${this.score}`;
        document.getElementById('killsDisplay').textContent = `Kills: ${this.killsThisLevel}/${this.killGoal}`;
        document.getElementById('healthDisplay').textContent = `Health: ${Math.max(0, this.player.health)}`;
        document.getElementById('ammoDisplay').textContent = `Ammo: ${this.player.ammo}/${this.player.maxAmmo}`;
        document.getElementById('enemyCount').textContent = `Enemies: ${this.enemies.length}`;
        if (this.generator) {
            document.getElementById('generatorHealth').textContent = `Generator: ${Math.max(0, this.generator.health)}/50`;
        }
    }

    levelComplete() {
        this.gameRunning = false;
        document.getElementById('upgradePanel').style.display = 'block';
        if (this.level < LEVEL_4) {
            const nextLevel = this.level + 1;
            document.getElementById('upgradeText').textContent = `Level ${this.level} Complete! Kills: ${this.killsThisLevel}/${this.killGoal}. Choose an upgrade to advance to Level ${nextLevel}.`;
        } else {
            document.getElementById('upgradeText').textContent = `Level ${this.level} Complete! Kills: ${this.killsThisLevel}/${this.killGoal}. Final level complete.`;
        }
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
        if (this.level < LEVEL_4) {
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

function startGame() {
    // Hide menu and show game container
    document.getElementById('mainMenuPanel').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    
    // Wait for images to load
    const checkImagesLoaded = setInterval(() => {
        if (imagesLoaded === imageCount) {
            clearInterval(checkImagesLoaded);
            game = new Game();
            game.gameLoop();
        }
    }, 100);
}

window.addEventListener('load', () => {
    // Menu is shown by default, waiting for play button click
});
