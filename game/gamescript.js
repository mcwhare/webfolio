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

    getDesc() {
        return `Generates ${this.value}p per press`;
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

    getDesc() {
        return `Generates ${this.value}p per press. Can be held down.`;
    }
}

class EKey extends Key {
    constructor(game) {
        super('E', 0, 200, true);
        this.game = game;
        this.baseCooldownPerKey = 2000; // 2 seconds per key in ms
        this.cooldownReduction = 0; // Starts at 0, increases with upgrades
        this.currentCooldown = 0;
        this.cooldownEndTime = 0;
    }

    press() {
        if (this.locked || this.isOnCooldown()) return 0;

        // Count only unlocked keys (Q/W/E)
        const unlockedKeys = Object.values(this.game.keys).filter(
            key => !key.locked
        ).length;

        const totalCooldown = Math.max(
            200, // Minimum 1 second
            (this.baseCooldownPerKey - this.cooldownReduction) * unlockedKeys
        );

        this.perKeyCooldown = totalCooldown/unlockedKeys;
        this.startCooldown(totalCooldown);
        this.isPressed = true;

        // Calculate points from other unlocked keys (Q/W only)
        return this.calculateCombinedValue();
    }

    calculateCombinedValue() {
        let combinedValue = 0;
        for (const [keyName, key] of Object.entries(this.game.keys)) {
            if (keyName !== 'e' && !key.locked) {
                combinedValue += key.value;
            }
        }
        return combinedValue;
    }

    startCooldown(duration) {
        this.currentCooldown = duration;
        this.cooldownEndTime = performance.now() + duration;
    }

    isOnCooldown() {
        return performance.now() < this.cooldownEndTime;
    }

    update(deltaTime) {
        if (this.isOnCooldown()) {
            // Keep pressed during cooldown
            this.isPressed = true;
        } else if (this.isPressed) {
            // Release when cooldown ends
            this.isPressed = false;
        }
    }

    upgrade() {
        if (this.locked) {
            this.locked = false;
        } else {
            // Reduce cooldown by 200ms per upgrade
            this.cooldownReduction += 200;
            this.upgradeCost = Math.floor(this.upgradeCost * 1.5);
            this.level++;
        }
        this.updateVisualState();
    }
    updateVisualState() {
        super.updateVisualState();
        if (!this.element) return;

        // Add cooldown visual feedback
        if (this.isOnCooldown()) {
            const remaining = this.cooldownEndTime - performance.now();
            this.element.classList.add('on-cooldown');
            this.element.style.setProperty('--cooldown-duration', `${remaining}ms`);
        } else {
            this.element.classList.remove('on-cooldown');
            this.element.style.removeProperty('--cooldown-duration');
        }
    }

    getDesc() {
        return `Has a ${this.perKeyCooldown}s cooldown per key.`;
    }
}

class AKey extends Key {
    constructor() {
        super('A', 200, 1000, true);
        this.increment = 20;
    }

    press() {
        if (this.locked || this.isPressed) return 0;
        this.isPressed = true;

        let a = [0,1];
        let i = Math.floor(Math.random() * a.length);
        let r = a[i];
        if (r == 0){
            return this.value;
        } else {
            return -this.value;
        }
    }

    getDesc() {
        return `Gamble. Either +${this.value}p or -${this.value}p each press.`;
    }

    upgrade() {
        if (this.locked) {
            this.locked = false;
        } else {
            this.increment = Math.floor(this.increment * 1.2);
            this.value = Math.floor(this.increment + this.value);
            this.upgradeCost = Math.floor(this.upgradeCost * 1.5);
            this.level++;
        }
        this.updateVisualState();
    }
}




class Game {
    constructor() {
        this.points = 0;
        this.keys = {
            'q': new QKey(),
            'w': new WKey(),
            'e': new EKey(this),
            'a': new AKey()
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
                    //document.getElementById('upgrade-W').classList.remove('locked');
                } else {
                    key.upgrade();
                }
                this.render();
            }
        });

        document.getElementById('upgrade-E').addEventListener('click', () => {
            const key = this.keys['e'];
            if (this.points >= key.upgradeCost) {
                this.points -= key.upgradeCost;
                if (key.locked) {
                    key.unlock();
                    //document.getElementById('upgrade-E').classList.remove('locked');
                } else {
                    key.upgrade();
                }
                this.render();
            }
        });

        document.getElementById('upgrade-A').addEventListener('click', () => {
            const key = this.keys['a'];
            if (this.points >= key.upgradeCost) {
                this.points -= key.upgradeCost;
                if (key.locked) {
                    key.unlock();
                    //document.getElementById('upgrade-E').classList.remove('locked');
                } else {
                    key.upgrade();
                }
                this.render();
            }
        });
    }

    gameLoop() {
        const now = performance.now();
        const deltaTime = now - this.lastUpdateTime;
        this.lastUpdateTime = now;

        // Update E key cooldown
        this.keys['e'].update(deltaTime);

        this.render()
        // Existing W key hold logic
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

        if(this.points <= 0){
            this.points = 0;
        }

        requestAnimationFrame(() => this.gameLoop());
    }

    render() {
        // Update points display
        document.getElementById('points-display').textContent = Math.floor(this.points);

        // Update key info displays
        this.updateKeyInfo('q');
        this.updateKeyInfo('w');
        this.updateKeyInfo('e');
        this.updateKeyInfo('a');

        this.updateUpgradeButtonStates();
    }

    updateUpgradeButtonStates() {
        // Check each upgrade button
        Object.entries(this.keys).forEach(([keyName, key]) => {
            const button = document.getElementById(`upgrade-${keyName.toUpperCase()}`);
            if (!button) return;

            if (this.points >= key.upgradeCost) {
                button.classList.remove('locked');
            } else {
                button.classList.add('locked');
            }
        });
    }

    updateKeyInfo(keyName) {
        const key = this.keys[keyName];

        // Existing Q and W key displays
        if (keyName === 'q' || keyName === 'w' || keyName === 'a') {
            document.getElementById(`sub-${keyName}`).textContent =
                `${key.getDesc()}`;
            document.getElementById(`cost-${keyName}`).textContent =
                `Upgrade cost: ${key.upgradeCost}`;
            document.getElementById(`change-${keyName}`).textContent =
                `${key.value}p → ${key.increment + key.value}p`;
            document.getElementById(`level-${keyName}`).textContent =
                `${key.level}x`;



        }

        // Enhanced E key display
        if (keyName === 'e') {
            const unlockedKeys = Object.values(this.keys).filter(k => !k.locked).length;
            const currentPerKey = (2000 - key.cooldownReduction) / 1000;
            const nextPerKey = Math.max(0.1, (currentPerKey - 0.2)).toFixed(1);
            const currentTotal = (2000 * unlockedKeys - key.cooldownReduction) / 1000;

            document.getElementById(`cost-${keyName}`).textContent =
                key.locked ? `Unlock cost: ${key.upgradeCost}` : `Upgrade cost: ${key.upgradeCost}`;
            document.getElementById(`change-${keyName}`).textContent =
                key.locked ? "Locked" : `${currentPerKey.toFixed(1)}s → ${nextPerKey}s per key`;
            document.getElementById(`level-${keyName}`).textContent =
                `${key.level}x`;

            // Update cooldown display
            const cooldownElement = document.getElementById(`cooldown-${keyName}`);
            if (key.isOnCooldown()) {
                const remaining = ((key.cooldownEndTime - performance.now()) / 1000).toFixed(1);
                cooldownElement.textContent = `Cooldown: ${remaining}s remaining (${unlockedKeys} keys)`;
            } else {
                cooldownElement.textContent = `Total cooldown: ${currentTotal.toFixed(1)}s`;
            }
        }
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});
