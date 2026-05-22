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
let selectedLevel = LEVEL_1;

// Load Images
const images = {};
const imageCount = 14;
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

const imgBackground = new Image();
imgBackground.src = 'Img/dirt.webp';
imgBackground.onload = () => { images.background = imgBackground; imagesLoaded++; };

const imgWall = new Image();
imgWall.src = 'Img/WallSprite.png';
imgWall.onload = () => { images.wall = imgWall; imagesLoaded++; };

const imgWrench = new Image();
imgWrench.src = 'Img/WrenchSprite.png';
imgWrench.onload = () => { images.wrench = imgWrench; imagesLoaded++; };

const imgAmmo = new Image();
imgAmmo.src = 'Img/AmmoSprite.png';
imgAmmo.onload = () => { images.ammo = imgAmmo; imagesLoaded++; };

const imgHealth = new Image();
imgHealth.src = 'Img/HealthSprite.webp';
imgHealth.onload = () => { images.health = imgHealth; imagesLoaded++; };

const imgEgg = new Image();
imgEgg.src = 'Img/Alien.egg.png';
imgEgg.onload = () => { images.egg = imgEgg; imagesLoaded++; };

const imgShotgun = new Image();
imgShotgun.src = 'Img/ShotG.sprite.png';
imgShotgun.onload = () => { images.shotgun = imgShotgun; imagesLoaded++; };

const imgMiniGun = new Image();
imgMiniGun.src = 'Img/MiniG.Powerup.webp';
imgMiniGun.onload = () => { images.minigun = imgMiniGun; imagesLoaded++; };

const imgSupplyDrop = new Image();
imgSupplyDrop.src = 'Img/SuppyDropSprite.png';
imgSupplyDrop.onload = () => { images.supplyDrop = imgSupplyDrop; imagesLoaded++; };

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
        this.baseDamage = 1;
        this.damage = 1;
        this.baseFireRate = 300;
        this.fireRate = 300; // milliseconds between shots
        this.lastShot = 0;
        this.powerup = null;
        this.powerupEndTime = 0;
        this.keys = {};
    }

    update() {
        if (this.keys['ArrowLeft'] && this.x > 0) this.x -= this.speed;
        if (this.keys['ArrowRight'] && this.x < CANVAS.width - this.width) this.x += this.speed;

        this.updatePowerup();
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
            const centerX = this.x + this.width / 2 - 4;

            if (this.powerup === 'shotgun') {
                return [
                    new Bullet(centerX, this.y, -1.5, -12),
                    new Bullet(centerX, this.y, 0, -12),
                    new Bullet(centerX, this.y, 1.5, -12)
                ];
            }

            return [new Bullet(centerX, this.y)];
        }
        return null;
    }

    updatePowerup() {
        if (this.powerup && Date.now() > this.powerupEndTime) {
            this.powerup = null;
            this.applyPowerupStats();
        }
    }

    activatePowerup(type, duration) {
        this.powerup = type;
        this.powerupEndTime = Date.now() + duration;
        this.applyPowerupStats();
    }

    applyPowerupStats() {
        if (this.powerup === 'shotgun') {
            this.fireRate = Math.max(450, this.baseFireRate + 150);
            this.damage = this.baseDamage * 3;
        } else if (this.powerup === 'minigun') {
            this.fireRate = Math.max(80, this.baseFireRate - 180);
            this.damage = this.baseDamage + 0.5;
        } else {
            this.fireRate = this.baseFireRate;
            this.damage = this.baseDamage;
        }
    }

    upgradeDamage() {
        this.baseDamage += 0.5;
        this.applyPowerupStats();
    }

    upgradeHealth() {
        this.maxHealth += 30;
        this.health = this.maxHealth;
    }

    upgradeFireRate() {
        this.baseFireRate = Math.max(100, this.baseFireRate - 50);
        this.applyPowerupStats();
    }

    pickupAmmo(amount) {
        this.ammo = Math.min(this.maxAmmo, this.ammo + amount);
    }
}

// Bullet Class
class Bullet {
    constructor(x, y, vx = 0, vy = -12, width = 8, height = 30) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vx = vx;
        this.vy = vy;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
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
    constructor(x, y, amount = 10, speed = 3, targetY = null, isSupply = false) {
        this.x = x;
        this.y = y;
        this.width = isSupply ? 60 : 35;
        this.height = isSupply ? 60 : 35;
        this.speed = speed;
        this.amount = amount;
        this.targetY = targetY;
        this.isSupply = isSupply;
    }

    update() {
        if (this.targetY !== null) {
            this.y += this.speed;
            if (this.y >= this.targetY) {
                this.y = this.targetY;
                this.speed = 0;
            }
        } else {
            this.y += this.speed;
        }
    }

    draw() {
        if (this.isSupply && images.supplyDrop) {
            CTX.drawImage(images.supplyDrop, this.x, this.y, this.width, this.height);
        } else if (!this.isSupply && images.ammo) {
            CTX.drawImage(images.ammo, this.x, this.y, this.width, this.height);
        } else {
            CTX.fillStyle = this.isSupply ? '#00BFFF' : '#FFD700';
            CTX.fillRect(this.x, this.y, this.width, this.height);
            CTX.strokeStyle = this.isSupply ? '#1E90FF' : '#FFA500';
            CTX.lineWidth = 3;
            CTX.strokeRect(this.x, this.y, this.width, this.height);
        }
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
        this.width = 40;
        this.height = 40;
        this.speed = 3;
        this.type = 'wall';
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        if (images.wrench) {
            CTX.drawImage(images.wrench, this.x, this.y, this.width, this.height);
        } else {
            CTX.fillStyle = '#888';
            CTX.fillRect(this.x, this.y, this.width, this.height);
            CTX.strokeStyle = '#555';
            CTX.lineWidth = 3;
            CTX.strokeRect(this.x, this.y, this.width, this.height);
        }
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
        this.width = 40;
        this.height = 40;
        this.speed = 3;
        this.type = 'health';
        this.healAmount = 8;
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        if (images.health) {
            CTX.drawImage(images.health, this.x, this.y, this.width, this.height);
        } else {
            CTX.fillStyle = '#ff69b4';
            CTX.fillRect(this.x, this.y, this.width, this.height);
            CTX.strokeStyle = '#ff1493';
            CTX.lineWidth = 3;
            CTX.strokeRect(this.x, this.y, this.width, this.height);
        }
    }

    isOffScreen() {
        return this.y > CANVAS.height;
    }
}

// Shotgun Powerup Class
class ShotgunPowerup {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = 3;
        this.type = 'shotgun';
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        if (images.shotgun) {
            CTX.drawImage(images.shotgun, this.x, this.y, this.width, this.height);
        } else {
            CTX.fillStyle = '#8b0000';
            CTX.fillRect(this.x, this.y, this.width, this.height);
            CTX.strokeStyle = '#ff4500';
            CTX.lineWidth = 3;
            CTX.strokeRect(this.x, this.y, this.width, this.height);
        }
    }

    isOffScreen() {
        return this.y > CANVAS.height;
    }
}

// MiniGun Powerup Class
class MiniGunPowerup {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = 3;
        this.type = 'minigun';
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        if (images.minigun) {
            CTX.drawImage(images.minigun, this.x, this.y, this.width, this.height);
        } else {
            CTX.fillStyle = '#1e90ff';
            CTX.fillRect(this.x, this.y, this.width, this.height);
            CTX.strokeStyle = '#00ffff';
            CTX.lineWidth = 3;
            CTX.strokeRect(this.x, this.y, this.width, this.height);
        }
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
            CTX.drawImage(enemyImage, this.x, this.y, this.width, this.height);
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
    constructor(x, y, maxHealth = 25, color = '#808080') {
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 100;
        this.maxHealth = maxHealth;
        this.health = maxHealth;
        this.color = color;
        this.positionIndex = null;
    }

    update() {
        // Walls don't move
    }

    draw() {
        if (images.wall) {
            CTX.drawImage(images.wall, this.x, this.y, this.width, this.height);
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
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 40;
        this.speed = 12;
        this.color = '#ADFF2F';
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        CTX.fillStyle = this.color;
        CTX.fillRect(this.x, this.y, this.width, this.height);
        CTX.strokeStyle = '#7CFC00';
        CTX.lineWidth = 2;
        CTX.strokeRect(this.x, this.y, this.width, this.height);
    }

    isOffScreen() {
        return this.y > CANVAS.height;
    }
}

// Beam Class (boss ability)
class Beam {
    constructor(x, y, width, duration = 180) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = CANVAS.height - y;
        this.duration = duration;
        this.age = 0;
        this.color = 'rgba(173, 255, 47, 0.35)';
    }

    update() {
        this.age++;
    }

    draw() {
        CTX.fillStyle = this.color;
        CTX.fillRect(this.x, this.y, this.width, this.height);
        CTX.strokeStyle = '#FF00FF';
        CTX.lineWidth = 3;
        CTX.strokeRect(this.x, this.y, this.width, this.height);
    }

    isExpired() {
        return this.age >= this.duration;
    }
}

// Orb Class (boss ability)
class Orb {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * 2;
        this.vy = Math.sin(angle) * 2;
        this.color = '#4F4F4F';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }

    draw() {
        if (images.egg) {
            CTX.drawImage(images.egg, this.x, this.y, this.width, this.height);
            return;
        }

        CTX.fillStyle = this.color;
        CTX.beginPath();
        CTX.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        CTX.fill();
        CTX.strokeStyle = '#A9A9A9';
        CTX.lineWidth = 3;
        CTX.stroke();
    }

    isOffScreen() {
        return this.x + this.width < 0 || this.x > CANVAS.width || this.y + this.height < 0 || this.y > CANVAS.height;
    }
}

// Boss Class
class Boss {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 200;
        this.height = 200;
        this.health = 150;
        this.maxHealth = 150;
        this.speed = 4;
        this.direction = 1;
        this.attackTimer = 0;
        this.attackInterval = 90;
        this.abilityTimer = 0;
        this.abilityDuration = 90;
        this.abilityCooldown = 160;
        this.lastAbilityTime = Date.now() - this.abilityCooldown;
        this.currentAbility = null;
        this.phase = 1;
        this.color = '#FF6600';
    }

    update(gameWidth) {
        // Move back and forth
        this.x += this.speed * this.direction;
        if (this.x <= 50 || this.x + this.width >= gameWidth - 50) {
            this.direction *= -1;
        }

        this.adjustAggression();

        if (this.currentAbility) {
            this.abilityTimer++;
            if (this.abilityTimer >= this.abilityDuration) {
                this.currentAbility = null;
                this.abilityTimer = 0;
                this.lastAbilityTime = Date.now();
            }
        } else {
            this.attackTimer++;
        }
    }

    adjustAggression() {
        if (this.health <= this.maxHealth * 0.7 && this.phase === 1) {
            this.phase = 2;
            this.speed += 1;
            this.attackInterval = Math.max(70, this.attackInterval - 20);
            this.abilityCooldown = Math.max(140, this.abilityCooldown - 30);
        }

        if (this.health <= this.maxHealth * 0.4 && this.phase === 2) {
            this.phase = 3;
            this.speed += 1;
            this.attackInterval = Math.max(50, this.attackInterval - 20);
            this.abilityCooldown = Math.max(110, this.abilityCooldown - 30);
        }
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
        return !this.currentAbility && this.attackTimer >= this.attackInterval;
    }

    canUseAbility() {
        return !this.currentAbility && Date.now() - this.lastAbilityTime >= this.abilityCooldown;
    }

    useLaser() {
        this.currentAbility = 'laser';
        this.abilityTimer = 0;
        this.attackTimer = 0;
        this.abilityDuration = 90;
    }

    throwOrb() {
        this.currentAbility = 'orb';
        this.abilityTimer = 0;
        this.attackTimer = 0;
        this.abilityDuration = 90;
    }

    useBeam() {
        this.currentAbility = 'beam';
        this.abilityTimer = 0;
        this.attackTimer = 0;
        this.abilityDuration = 180;
    }
}

// Game Class
class Game {
    constructor(startLevel = LEVEL_1) {
        this.player = new Player();
        this.level = startLevel;
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.ammoDrops = [];
        this.powerups = [];
        this.walls = [];
        this.wallsInitialized = false;
        this.wallRepairPickups = 0;
        this.wallPositions = [];
        this.generator = null;
        this.boss = null;
        this.bossLasers = [];
        this.beams = [];
        this.score = 0;
        this.killsThisLevel = 0;
        this.supplyDropActive = false;
        this.killGoal = 25;
        this.gameRunning = true;
        this.bossIntroActive = false;
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 80;
        this.maxEnemies = 5;
        this.waveCount = 0;
        this.enemyBoundaryY = CANVAS.height * 0.5; // Fixed boundary for enemies
        this.lossReason = null;

        this.setupKeyListeners();
        this.initLevel();
    }

    setupKeyListeners() {
        document.addEventListener('keydown', (e) => {
            this.player.keys[e.key] = true;
            if (e.key === ' ') {
                e.preventDefault();
                const bullets = this.player.shoot();
                if (bullets) {
                    if (Array.isArray(bullets)) {
                        this.bullets.push(...bullets);
                    } else {
                        this.bullets.push(bullets);
                    }
                }
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
        this.beams = [];
        this.orbs = [];
        this.boss = null;
        this.killsThisLevel = 0;
        this.supplyDropActive = false;
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
            const wall1 = new Wall(wall1X, wall1Y);
            wall1.positionIndex = 0;
            this.walls.push(wall1);

            const wall2X = generatorX - 50;
            const wall2Y = generatorY - 285;
            const wall2 = new Wall(wall2X, wall2Y);
            wall2.positionIndex = 1;
            this.walls.push(wall2);

            const wall3X = generatorX + wallDistance + 500;
            const wall3Y = generatorY - 265;
            const wall3 = new Wall(wall3X, wall3Y);
            wall3.positionIndex = 2;
            this.walls.push(wall3);

            this.wallPositions = [
                { x: wall1X, y: wall1Y },
                { x: wall2X, y: wall2Y },
                { x: wall3X, y: wall3Y }
            ];

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
            this.gameRunning = true;
            this.boss = new Boss(CANVAS.width / 2 - 100, 50);
            this.maxEnemies = 8;
            this.enemySpawnInterval = 150;
            this.killGoal = 0;
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

    spawnOrbEnemy(orb, hitLeft, hitRight, wallTop) {
        if (this.level !== LEVEL_5 || this.enemies.length >= this.maxEnemies) return;

        let spawnX = orb.x + orb.width / 2 - 45;
        let spawnY = orb.y + orb.height / 2;

        if (hitLeft) {
            spawnX = 20;
        } else if (hitRight) {
            spawnX = CANVAS.width - 110;
        }

        if (spawnX < 20) spawnX = 20;
        if (spawnX > CANVAS.width - 90) spawnX = CANVAS.width - 90;

        if (spawnY >= wallTop - 20 && spawnY <= wallTop + 120) {
            spawnY = Math.max(20, wallTop - 20);
        }

        spawnY = Math.max(20, Math.min(spawnY, CANVAS.height - 120));

        const direction = Math.random() < 0.5 ? 1 : -1;
        const rand = Math.random();
        let enemy;

        if (rand < 0.3) {
            enemy = new BasicEnemy(spawnX, spawnY, direction);
            enemy.health += 1 + this.boss.phase;
            enemy.maxHealth += 1 + this.boss.phase;
            enemy.damage += 1;
        } else if (rand < 0.75) {
            enemy = new SpeedyEnemy(spawnX, spawnY, direction);
            enemy.health += this.boss.phase;
            enemy.maxHealth += this.boss.phase;
            enemy.damage += 1 + this.boss.phase;
            enemy.velocityX += 0.5 * this.boss.phase;
        } else {
            enemy = new StrongEnemy(spawnX, spawnY, direction);
            enemy.health += 2 + this.boss.phase;
            enemy.maxHealth += 2 + this.boss.phase;
            enemy.damage += 1 + this.boss.phase;
            enemy.velocityX += 0.4 * this.boss.phase;
        }

        this.enemies.push(enemy);
    }

    update() {
        if (!this.gameRunning) return;

        // Update player
        this.player.update();

        // Auto-fire while holding fire with minigun powerup
        if (this.player.keys[' '] && this.player.powerup === 'minigun') {
            const bullets = this.player.shoot();
            if (bullets) {
                if (Array.isArray(bullets)) {
                    this.bullets.push(...bullets);
                } else {
                    this.bullets.push(bullets);
                }
            }
        }

        // Spawn a supply drop when ammo is empty
        if (this.player.ammo <= 0 && !this.supplyDropActive) {
            const startX = Math.min(Math.max(20, this.player.x + this.player.width / 2 - 20), CANVAS.width - 60);
            const targetY = Math.min(this.player.y + 10, CANVAS.height - 60);
            this.ammoDrops.push(new AmmoDrop(startX, -80, 75, 1.5, targetY, true));
            this.supplyDropActive = true;
        }

        // Spawn enemies (skip random spawns in level 5)
        if (this.level !== LEVEL_5) {
            this.enemySpawnTimer++;
            if (this.enemySpawnTimer > this.enemySpawnInterval) {
                this.spawnEnemy();
                this.enemySpawnTimer = 0;
            }
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

        // Update boss lasers
        if (this.boss) {
            this.bossLasers = this.bossLasers.filter((laser) => {
                laser.update();
                return !laser.isOffScreen();
            });
        }

        // Update beams
        this.beams = this.beams.filter((beam) => {
            beam.update();
            return !beam.isExpired();
        });

        // Update boss orbs
        this.orbs = this.orbs.filter((orb) => {
            orb.update();
            const wallTop = Math.min(...this.walls.map((wall) => wall.y));
            const hitWallZone = orb.y >= wallTop - 20 && orb.y <= wallTop + 120;
            const hitLeft = orb.x <= 0;
            const hitRight = orb.x + orb.width >= CANVAS.width;

            if (hitWallZone || hitLeft || hitRight || orb.isOffScreen()) {
                this.spawnOrbEnemy(orb, hitLeft, hitRight, wallTop);
                return false;
            }

            return true;
        });

        // Check collisions: bullets hitting boss or enemies
        for (let i = 0; i < this.bullets.length; i++) {
            let bulletUsed = false;

            if (this.level === LEVEL_5 && this.boss && this.checkCollision(this.bullets[i], this.boss)) {
                this.boss.takeDamage(this.player.damage);
                this.bullets.splice(i, 1);
                i--;
                bulletUsed = true;

                if (Math.random() < 0.25) {
                    this.ammoDrops.push(new AmmoDrop(this.boss.x + this.boss.width / 2 - 10, this.boss.y + this.boss.height));
                }
                if (Math.random() < 0.15) {
                    this.powerups.push(new WallRepairPowerup(this.boss.x + this.boss.width / 2 - 12, this.boss.y + this.boss.height));
                }
                if (Math.random() < 0.13) {
                    this.powerups.push(new HealthRestorePowerup(this.boss.x + this.boss.width / 2 - 12, this.boss.y + this.boss.height));
                }
                if (Math.random() < 0.15) {
                    this.powerups.push(new ShotgunPowerup(this.boss.x + this.boss.width / 2 - 12, this.boss.y + this.boss.height));
                }
                if (Math.random() < 0.15) {
                    this.powerups.push(new MiniGunPowerup(this.boss.x + this.boss.width / 2 - 12, this.boss.y + this.boss.height));
                }

                if (!this.boss.isAlive()) {
                    this.score += 2000;
                    this.levelComplete();
                }
            }

            if (bulletUsed) continue;

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

        // Update boss and boss attacks
        if (this.level === LEVEL_5 && this.boss && this.boss.isAlive()) {
            this.boss.update(CANVAS.width);

            if (this.boss.canAttack() && this.boss.canUseAbility()) {
                const roll = Math.random();
                if (roll < 0.4) {
                    this.boss.useBeam();
                    this.beams.push(new Beam(this.boss.x + this.boss.width / 2 - 15, this.boss.y + this.boss.height, 30, 180));
                } else if (roll < 0.75) {
                    this.boss.useLaser();
                    this.bossLasers.push(new Laser(this.boss.x + this.boss.width / 2 - 5, this.boss.y + this.boss.height));
                } else {
                    this.boss.throwOrb();
                    this.orbs.push(new Orb(this.boss.x + this.boss.width * 0.25 - 12, this.boss.y + this.boss.height));
                    this.orbs.push(new Orb(this.boss.x + this.boss.width * 0.75 - 12, this.boss.y + this.boss.height));
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
                    this.lossReason = 'Your health reached 0. You were defeated by enemy fire!';
                    this.gameOver();
                }
            }
        }

        // Check collisions: boss lasers hitting player
        for (let i = 0; i < this.bossLasers.length; i++) {
            if (this.checkCollision(this.bossLasers[i], this.player)) {
                this.player.takeDamage(2);
                this.bossLasers.splice(i, 1);
                i--;

                if (!this.player.isAlive()) {
                    this.lossReason = 'Your health reached 0. You were destroyed by boss laser fire!';
                    this.gameOver();
                }
            }
        }
        for (let i = 0; i < this.beams.length; i++) {
            const beam = this.beams[i];
            const beamRect = {
                x: beam.x,
                y: beam.y,
                width: beam.width,
                height: beam.height,
            };

            if (this.checkCollision(beamRect, this.player)) {
                this.player.takeDamage(4);
                if (!this.player.isAlive()) {
                    this.lossReason = 'Your health reached 0. You were vaporized by the boss beam!';
                    this.gameOver();
                    break;
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
                        this.lossReason = 'The generator was destroyed! The enemies breached your defenses!';
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
            if (ammo.isOffScreen()) {
                if (ammo.isSupply) {
                    this.supplyDropActive = false;
                }
                return false;
            }
            return true;
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
                if (this.ammoDrops[i].isSupply) {
                    this.supplyDropActive = false;
                }
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
                } else if (this.powerups[i].type === 'shotgun') {
                    this.player.activatePowerup('shotgun', 10000);
                } else if (this.powerups[i].type === 'minigun') {
                    this.player.activatePowerup('minigun', 10000);
                }
                this.powerups.splice(i, 1);
                i--;
            }
        }

        // Check if level complete
        if (this.level === LEVEL_5) {
            if (this.boss && !this.boss.isAlive()) {
                this.levelComplete();
            }
        } else if (this.killsThisLevel >= this.killGoal) {
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

        if (Math.random() < 0.15) {
            this.powerups.push(new ShotgunPowerup(enemy.x + enemy.width / 2 - 12, enemy.y));
        }

        if (Math.random() < 0.15) {
            this.powerups.push(new MiniGunPowerup(enemy.x + enemy.width / 2 - 12, enemy.y));
        }
    }

    applyWallRepairPowerup() {
        this.wallRepairPickups += 1;

        const destroyedSlot = this.wallPositions.find((pos, index) => {
            return !this.walls.some((wall) => wall.positionIndex === index && wall.isAlive());
        });

        if (destroyedSlot && this.wallRepairPickups >= 4) {
            this.wallRepairPickups = 0;
            const restoredIndex = this.wallPositions.indexOf(destroyedSlot);
            const restoredWall = new Wall(destroyedSlot.x, destroyedSlot.y, 20, '#999');
            restoredWall.positionIndex = restoredIndex;
            this.walls.push(restoredWall);
            return;
        }

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
        if (images.background) {
            CTX.drawImage(images.background, 0, 0, CANVAS.width, CANVAS.height);
        } else {
            CTX.fillStyle = '#000';
            CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);
        }

        // Draw game objects
        this.player.draw();
        this.bullets.forEach((bullet) => bullet.draw());
        this.enemies.forEach((enemy) => enemy.draw());
        this.enemyBullets.forEach((bullet) => bullet.draw());
        this.ammoDrops.forEach((ammo) => ammo.draw());
        this.powerups.forEach((powerup) => powerup.draw());
        this.walls.forEach((wall) => wall.draw());
        if (this.generator) this.generator.draw();
        if (this.boss) this.boss.draw();
        this.bossLasers.forEach((laser) => laser.draw());
        this.beams.forEach((beam) => beam.draw());
        this.orbs.forEach((orb) => orb.draw());
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
        this.selectedUpgrade = null;
        this.resetUpgradePanel();
        document.getElementById('upgradePanel').style.display = 'block';
        if (this.level < LEVEL_4) {
            const nextLevel = this.level + 1;
            document.getElementById('upgradeText').textContent = `Level ${this.level} Complete! Kills: ${this.killsThisLevel}/${this.killGoal}. Choose an upgrade to advance to Level ${nextLevel}.`;
        } else {
            document.getElementById('upgradeText').textContent = `Level ${this.level} Complete! Kills: ${this.killsThisLevel}/${this.killGoal}. Final level complete.`;
        }
    }

    resetUpgradePanel() {
        document.getElementById('upgradeDetailText').textContent = 'Select one upgrade below to keep it for the next level. You can change your choice before pressing Next Level.';
        document.getElementById('btnUpgradeDamage').classList.remove('selected');
        document.getElementById('btnUpgradeHealth').classList.remove('selected');
        document.getElementById('btnUpgradeFireRate').classList.remove('selected');
    }

    selectUpgrade(upgrade, button) {
        this.selectedUpgrade = upgrade;
        this.updateUpgradeHighlight(button);

        const descriptions = {
            damage: 'Damage increases shot damage by 0.5 so each hit hits harder.',
            health: 'Health increases your maximum health by 30 and restores it fully.',
            fireRate: 'Fire Rate reduces the delay between shots by 50ms for faster firing.'
        };

        document.getElementById('upgradeDetailText').textContent = `Selected: ${descriptions[upgrade]}`;
    }

    applySelectedUpgrade() {
        if (!this.selectedUpgrade) return;
        if (this.selectedUpgrade === 'damage') {
            this.player.upgradeDamage();
        } else if (this.selectedUpgrade === 'health') {
            this.player.upgradeHealth();
        } else if (this.selectedUpgrade === 'fireRate') {
            this.player.upgradeFireRate();
        }
    }

    updateUpgradeHighlight(button) {
        document.getElementById('btnUpgradeDamage').classList.remove('selected');
        document.getElementById('btnUpgradeHealth').classList.remove('selected');
        document.getElementById('btnUpgradeFireRate').classList.remove('selected');
        if (button) {
            button.classList.add('selected');
        }
    }

    nextLevel() {
        if (this.selectedUpgrade) {
            this.applySelectedUpgrade();
        }

        if (this.level < LEVEL_5) {
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
        updateLeaderboardWithScore(this.score);
    }

    gameOver() {
        this.gameRunning = false;
        document.getElementById('gameOverPanel').style.display = 'block';
        const reasonText = this.lossReason ? `${this.lossReason}\n\n` : '';
        document.getElementById('gameOverText').textContent = `${reasonText}Final Score: ${this.score} on Level ${this.level}`;
        document.getElementById('gameOverScore').textContent = `You reached Level ${this.level}`;
        updateLeaderboardWithScore(this.score);
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize and start game
let game;

function toggleAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    adminPanel.style.display = adminPanel.style.display === 'none' ? 'block' : 'none';
}

function closeAdminPanel() {
    document.getElementById('adminPanel').style.display = 'none';
}

function selectAdminLevel(level) {
    selectedLevel = level;
    document.querySelectorAll('.adminLevelBtn').forEach((btn) => {
        btn.classList.toggle('selected', btn.textContent.trim() === `Level ${level}`);
    });
}

function showNameEntry() {
    document.getElementById('mainMenuPanel').style.display = 'none';
    document.getElementById('nameEntryPanel').style.display = 'flex';
    document.getElementById('playerName').focus();
}

function startGame() {
    const playerName = document.getElementById('playerName').value.trim();
    if (!playerName) {
        alert('Please enter your name to play!');
        return;
    }
    
    // Hide menu and show game container
    document.getElementById('nameEntryPanel').style.display = 'none';
    document.getElementById('mainMenuPanel').style.display = 'none';
    const gameContainer = document.getElementById('gameContainer');
    gameContainer.style.display = 'block';
    gameContainer.style.pointerEvents = 'auto';
    
    // Wait for images to load
    const checkImagesLoaded = setInterval(() => {
        if (imagesLoaded === imageCount) {
            clearInterval(checkImagesLoaded);
            game = new Game(selectedLevel);
            game.gameLoop();
        }
    }, 100);
}

function backToMenu() {
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('nameEntryPanel').style.display = 'none';
    document.getElementById('leaderboardPanel').style.display = 'none';
    document.getElementById('mainMenuPanel').style.display = 'block';
    document.getElementById('upgradePanel').style.display = 'none';
    document.getElementById('gameOverPanel').style.display = 'none';
    document.getElementById('levelCompletePanel').style.display = 'none';
}

function loadLeaderboard() {
    const data = localStorage.getItem('spaceInvadersLeaderboard');
    return data ? JSON.parse(data) : {};
}

function saveLeaderboard(leaderboard) {
    localStorage.setItem('spaceInvadersLeaderboard', JSON.stringify(leaderboard));
}

function updateLeaderboardWithScore(score) {
    const playerName = document.getElementById('playerName').value.trim() || 'Anonymous';
    const leaderboard = loadLeaderboard();
    
    if (!leaderboard[playerName] || score > leaderboard[playerName]) {
        leaderboard[playerName] = score;
        saveLeaderboard(leaderboard);
    }
}

function showLeaderboard() {
    const leaderboard = loadLeaderboard();
    const sortedPlayers = Object.entries(leaderboard)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';
    
    sortedPlayers.forEach((entry, index) => {
        const [name, score] = entry;
        const row = tbody.insertRow();
        row.innerHTML = `<td>${index + 1}</td><td>${name}</td><td>${score}</td>`;
    });
    
    document.getElementById('mainMenuPanel').style.display = 'none';
    document.getElementById('leaderboardPanel').style.display = 'flex';
}

window.addEventListener('load', () => {
    // Menu is shown by default, waiting for play button click
});
