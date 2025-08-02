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
        if (!this.startPress()) return 0;
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

    startPress() {
        if (this.locked || this.isPressed) return false;
        this.isPressed = true;
        return true;
    }

    endPress() {
        this.isPressed = false;
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

class WKey extends Key {
    constructor(){
        super('W',5,20,true);
        this.increment = 1;
    }
}




class Game {
    constructor() {
        this.points = 0;
        this.keys = {
            'q': new QKey(),
            'w': new WKey()
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
                    document.getElementById('upgrade-W').classList.remove('locked')
                    this.render();
                    // Force image update for W key
                    this.updateKeyImage('w');
                } else {
                    key.upgrade();
                    this.render();
                    // Force image update for W key
                    this.updateKeyImage('w');
                }

            }
        });


        this.setupMouseEvents('q');
        this.setupMouseEvents('w');
    }

    setupMouseEvents(keyName) {
        const element = document.getElementById(`key-${keyName}`);
        if (!element) return;

        // Mouse down (start press)
        element.addEventListener('mousedown', () => {
            const key = this.keys[keyName];
            if (!key.locked && key.startPress()) {
                this.points += key.value;
                this.highlightKey(keyName);
                this.render();
            }
        });

        // Mouse up (end press)
        element.addEventListener('mouseup', () => {
            this.keys[keyName].endPress();
        });

        // Mouse leave (cancel press if mouse leaves while pressed)
        element.addEventListener('mouseleave', () => {
            this.keys[keyName].endPress();
        });

        // For continuous pressing while mouse is held down
        element.addEventListener('mousemove', (e) => {
            if (e.buttons === 1) { // Left mouse button is pressed
                const key = this.keys[keyName];
                if (!key.locked && key.startPress()) {
                    this.points += key.value;
                    this.highlightKey(keyName);
                    this.render();
                    key.endPress(); // Allow immediate repress
                }
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
        document.getElementById('level-w').textContent = `${this.keys['w'].level}x`;


        // Update all key visuals
        this.updateKeyImage('q');
        this.updateKeyImage('w');
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});
