class Key {
    constructor(name, baseValue, upgradeCost, locked) {
        this.name = name;
        this.baseValue = baseValue;
        this.value = baseValue;
        this.upgradeCost = upgradeCost;
        this.level = 1;
        this.locked = locked;
        this._isPressed = false;
        this.increment = baseValue;
        this.element = document.getElementById(`key-${name.toLowerCase()}`);
    }

    get isPressed() {
        return this._isPressed;
    }

    set isPressed(value) {
        if (this._isPressed !== value) {
            this._isPressed = value;
            this.updateVisualState();
        }
    }

    press() {
        if (this.locked || this.isPressed) return 0;
        this.isPressed = true;
        return this.value; // Returns points only on initial press
    }

    release() {
        this.isPressed = false;
    }

    upgrade() {
        if (this.locked) {
            this.locked = false;
        } else {
            this.increment = Math.floor(this.baseValue * this.level * 1.5);
            this.value = Math.floor(this.increment + this.value);
            this.upgradeCost = Math.floor(this.upgradeCost * 1.5);
            this.level++;
        }
        this.updateVisualState();
    }

    unlock() {
        this.locked = false;
        this.updateVisualState();
        return true;
    }

    updateVisualState() {
        if (!this.element) return;

        this.element.classList.toggle('locked', this.locked);
        this.element.classList.toggle('pressed', this.isPressed);

        const imgSrc = this.isPressed ? this.getPressedImagePath() : this.getImagePath();
        if (this.element.src !== imgSrc) {
            this.element.src = imgSrc;
        }
    }

    getImagePath() {
        return this.locked ? 'gameassets/lock.png' : `gameassets/${this.name}.png`;
    }

    getPressedImagePath() {
        return `gameassets/${this.name}-p.png`;
    }
}

class QKey extends Key {
    constructor() {
        super('Q', 1, 10, false);
        this.increment = 1;
    }
}

class WKey extends Key {
    constructor() {
        super('W', 5, 20, true);
        this.increment = 5;
        this.holdInterval = 1000; // 1 second in milliseconds
        this.lastHoldTime = 0;
    }

    getHoldPoints(currentTime) {
        if (!this.isPressed) return 0;

        if (currentTime - this.lastHoldTime >= this.holdInterval) {
            this.lastHoldTime = currentTime;
            return this.value;
        }
        return 0;
    }
}

class Game {
    constructor() {
        this.points = 0;
        this.keys = {
            'q': new QKey(),
            'w': new WKey()
        };
        this.activePresses = new Set();
        this.lastUpdateTime = performance.now();

        this.setupEventListeners();
        this.render();
        this.gameLoop();
    }

    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            const keyName = e.key.toLowerCase();
            if (this.keys[keyName] && !this.activePresses.has(keyName)) {
                this.activePresses.add(keyName);
                this.points += this.keys[keyName].press();
                this.render();
            }
        });

        document.addEventListener('keyup', (e) => {
            const keyName = e.key.toLowerCase();
            if (this.keys[keyName]) {
                this.activePresses.delete(keyName);
                this.keys[keyName].release();
            }
        });

        // Mouse events
        Object.values(this.keys).forEach(key => {
            if (key.element) {
                key.element.addEventListener('mousedown', () => {
                    if (!key.locked && !this.activePresses.has(key.name.toLowerCase())) {
                        this.activePresses.add(key.name.toLowerCase());
                        this.points += key.press();
                        this.render();
                    }
                });

                const endPress = () => {
                    this.activePresses.delete(key.name.toLowerCase());
                    key.release();
                };

                key.element.addEventListener('mouseup', endPress);
                key.element.addEventListener('mouseleave', endPress);
            }
        });

        // Upgrade buttons
        document.getElementById('upgrade-Q').addEventListener('click', () => {
            const key = this.keys['q'];
            if (this.points >= key.upgradeCost) {
                this.points -= key.upgradeCost;
                key.upgrade();
                this.render();
            }
        });

        document.getElementById('upgrade-W').addEventListener('click', () => {
            const key = this.keys['w'];
            if (this.points >= key.upgradeCost) {
                this.points -= key.upgradeCost;
                if (key.locked) {
                    key.unlock();
                    document.getElementById('upgrade-W').classList.remove('locked');
                } else {
                    key.upgrade();
                }
                this.render();
            }
        });
    }

    gameLoop() {
        const now = performance.now();
        const deltaTime = Math.min(now - this.lastUpdateTime, 100);
        this.lastUpdateTime = now;

        // Only W key gets continuous points
        if (this.activePresses.has('w')) {
            const wKey = this.keys['w'];
            if (!wKey.locked) {
                const pointsToAdd = wKey.getHoldPoints(now);
                if (pointsToAdd > 0) {
                    this.points += pointsToAdd;
                    this.render();
                }
            }
        }

        requestAnimationFrame(() => this.gameLoop());
    }

    render() {
        // Update points display
        document.getElementById('points-display').textContent = Math.floor(this.points);

        // Update key info displays
        this.updateKeyInfo('q');
        this.updateKeyInfo('w');
    }

    updateKeyInfo(keyName) {
        const key = this.keys[keyName];
        document.getElementById(`sub-${keyName}`).textContent =
            `Generates ${key.value}p per press${keyName === 'w' ? '. Can be held down.' : ''}`;
        document.getElementById(`cost-${keyName}`).textContent =
            `Upgrade cost: ${key.upgradeCost}`;
        document.getElementById(`change-${keyName}`).textContent =
            `${key.value}p → ${key.increment + key.value}p`;
        document.getElementById(`level-${keyName}`).textContent =
            `${key.level}x`;
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});
