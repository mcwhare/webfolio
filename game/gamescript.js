class Key {
    constructor(name, baseValue, upgradeCost, locked) {
        this.name = name;
        this.baseValue = baseValue;
        this.value = baseValue;
        this.upgradeCost = upgradeCost;
        this.level = 1;
        this.locked = locked;
        this.isPressed = false;
        this.increment = 1;
    }

    press() {
        if (this.locked || this.isPressed) return 0;
        this.isPressed = true;
        return this.value;
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
    }

    unlock(){
        this.locked = false;
        return true;
    }

    getImagePath() {
        if (this.locked) {
            return `gameassets/lock.png`;
        }
        return `gameassets/${this.name}.png`;
    }

    getPressedImagePath() {
        return `gameassets/${this.name}-p.png`;
    }
}


class QKey extends Key{
    constructor(){
        super('Q',1,10,false);
        this.increment = 1;
    }

}
















class Game {
    constructor() {
        this.points = 0;
        this.keys = {
            'q': new Key('Q', 1, 10, false),
            'w': new Key('W', 5, 20, true)
        };
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (this.keys[key] && !this.keys[key].isPressed) {
                this.points += this.keys[key].press();
                this.highlightKey(key);
                this.render();
            }
        });

        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (this.keys[key]) {
                this.keys[key].release();
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

                if(key.locked){
                    key.unlock();
                    const wElement = document.getElementById('key-w');
                    wElement.src = 'gameassets/W.png';
                    wElement.classList.remove('locked');
                }
                key.upgrade();
                this.render();
                // Force image update for W key
                this.updateKeyImage('w');
            }
        });

        // Click events for keys
        document.getElementById('key-q').addEventListener('click', () => {
            if (!this.keys['q'].locked) {
                this.points += this.keys['q'].press();
                this.highlightKey('q');
                this.render();
            }
        });

        document.getElementById('key-w').addEventListener('click', () => {
            if (!this.keys['w'].locked) {
                this.points += this.keys['w'].press();
                this.highlightKey('w');
                this.render();
            }
        });
    }

    highlightKey(keyName) {
        const element = document.getElementById(`key-${keyName}`);
        if (!element) {
            console.error(`Element Key-${keyName} not found`);
            return;
        }

        // Show pressed image
        const pressedImg = this.keys[keyName].getPressedImagePath();
        console.log(`Showing pressed image: ${pressedImg}`);
        element.src = pressedImg + '?t=' + Date.now(); // Force reload

        // Revert after 200ms
        setTimeout(() => {
            const normalImg = this.keys[keyName].getImagePath();
            console.log(`Reverting to: ${normalImg}`);
            element.src = normalImg + '?t=' + Date.now();
        }, 100);
    }

    updateKeyImage(keyName) {
        const element = document.getElementById(`key-${keyName.toUpperCase()}`);
        if (!element) return;

        const key = this.keys[keyName];
        element.src = key.getImagePath();
        element.className = key.locked ? 'key locked' : 'key';
    }

    render() {
        document.getElementById('points-display').textContent = this.points;
        document.getElementById('sub-q').textContent = `Generates ${this.keys['q'].value}p per press`;
        document.getElementById('cost-q').textContent = `Upgrade cost: ${this.keys['q'].upgradeCost}`;
        document.getElementById('change-q').textContent = `${this.keys['q'].value}p -> ${this.keys['q'].increment + this.keys['q'].value}p`;
        document.getElementById('level-q').textContent = `${this.keys['q'].level}x`;

        document.getElementById('sub-w').textContent = `Generates ${this.keys['w'].value}p per press. Can be held down.`;
        document.getElementById('cost-w').textContent = `Upgrade cost: ${this.keys['w'].upgradeCost}`;
        document.getElementById('change-w').textContent = `${this.keys['w'].value}p -> ${this.keys['w'].increment + this.keys['w'].value}p`;
        document.getElementById('cost-w').textContent = `${this.keys['w'].level}x`;


        // Update all key visuals
        this.updateKeyImage('q');
        this.updateKeyImage('w');
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});
