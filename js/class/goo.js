import { Brain } from "./brain.js";

export class Goo {
    constructor(params) {
        this.world = params.world || null;
        this.brain = new Brain();
        this.element = null;
        this.color = [0, 0, 0];
        this.position = this.getRandomPosition();
        this.createDomElement();
        this.updatePosition();
        this.lastMove = [0, 0];
        this.movement = [0, 0];
        this.eyes = [0, 0, 0, 0, 0, 0, 0, 0];
        this.size = 1;
        this.isAlive = true;
        this.acuity = 10;
    } 

    kill() {
        this.isAlive = false;
        this.element.remove();
    }

    getRandomPosition() {
        return [Math.random()*100, Math.random()*100];
    }

    updateSize() {
        this.element.style.width = this.size+"%";
        this.element.style.marginLeft = parseInt(this.size/-2)+"%";
        this.element.style.marginTop = parseInt(this.size/-2)+"%";
    }

    increase() {
        this.size += .05;
        if (this.size > 10) this.size = 10;
        this.updateSize();
    }

    decrease() {
        this.size -= .2;
        if (this.size < 0) this.size = 0;
        this.updateSize();
    }

    createDomElement() {
        this.element = document.createElement("div");
        this.element.className = "goo";
        document.getElementById("world").appendChild(this.element);
        this.getRandomColor();
    }

    getPosition() {
        return this.position;
    }

    move(m) {
        this.lastMove = m;
        this.movement[0] = this.normalizeMovement(this.movement[0] + m[0]);
        this.movement[1] = this.normalizeMovement(this.movement[1] + m[1]);
        this.position[0] = this.normalizePosition(this.position[0] + this.movement[0]);
        this.position[1] = this.normalizePosition(this.position[1] + this.movement[1]);
        this.updateEyesDirection(this.getDirection(this.movement));
        this.updatePosition();
    }

    getDirection(move) {
        return (Math.atan2(move[1], move[0]) * 180 / Math.PI) + 180;
    }

    updateEyesDirection(angle) {
        this.element.style.transform = `rotate(${angle}deg)`;
    }

    normalizeMovement(value) {
        return value%2
    }

    normalizePosition(value) {
        return Math.max(Math.min(value, 100), 0);
    }

    updatePosition() {
        this.element.style.left = `${this.position[0]}%`;
        this.element.style.top = `${this.position[1]}%`;
    }

    getInput() {
        return [this.size, ...this.movement, ...this.lastMove, ...this.position.map(x => x/100), ...this.eyes];
    }

    async lookAround() {
        this.eyes = [0, 0, 0, 0, 0, 0, 0, 0];

        const posList = this.getGoosAroundMe(this.acuity).map(g => g.getPosition());

        if (posList.length === 0) return this.eyes;
    
        posList.forEach(pos => {
            const i = this.getIndexFromAngle(this.getAngleFromPos(pos));
            this.eyes[i] += 1 - (this.getDistanceFromPos(pos) / this.acuity);
        });

        return this.eyes;
    }

    getGoosAroundMe(distance) {
        return this.world.getGoosAround(this.getPosition(), distance).filter(g => g !== this);
    }

    getDistanceFromPos(pos) {
        return Math.sqrt(Math.pow(this.position[0] - pos[0], 2) + Math.pow(this.position[1] - pos[1], 2));
    }

    getAngleFromPos(pos) {
        return (Math.atan2(pos[1] - this.position[1], pos[0] - this.position[0]) * 180 / Math.PI) + 180;
    }

    getIndexFromAngle(angle) {
        const a = [45, 90, 135, 180, 225, 270, 315];
        for(const i in a) {
            if (angle < a[i]) return i;
        }
        return a.length;
    }

    async decideMove() {
        this.move(await this.brain.askAnswer(this.getInput()));

        if (this.getGoosAroundMe(this.acuity / 2).length > 0) {
            await this.runAway();
        }

        if (this.getGoosAroundMe(2).length > 0) {
            this.decrease();
        } else {
            this.increase();
        }
    }

    async runAway() {
        await this.brain.learn(this.getOpositeMove());
        // await this.brain.learn(this.moveAwayFromNearest().map(x => x < 0 ? x - Math.random() : x + Math.random()));
    }

    moveAwayFromNearest() {
        const nearestGoo = this.getNearestGoo();
        return [(nearestGoo.position[0] - this.position[0]) * -5, (nearestGoo.position[1] - this.position[1]) * -5];
    }

    getNearestGoo() {
        let minDist;
        let nearestGoo;
        this.world.goos.forEach(g => {
            if (g === this) return;
            const d = g.getDistanceFromPos(this.position);
            if (d < minDist || minDist === undefined) {
                nearestGoo = g;
                minDist = d;
            }
        });

        return nearestGoo;
    }

    getOpositeMove() {
        return this.lastMove.map(v => {
            v *= -6;
            if (v < 0) return v - Math.random();
            return v + Math.random();
        });
    }

    getRandomColor() {
        this.color = this.color.map(c => this.getRandomColorVal());
        this.displayColor();
    }

    displayColor() {
        this.element.style.backgroundColor = `rgb(${this.color.join(",")})`;
    }

    getRandomColorVal() {
        return parseInt(Math.random()*256);
    }

    changeColorRandom() {
        this.color = this.color.map(c => Math.min(Math.max(c * this.getPosOrNeg(), 0), 255));
        this.displayColor();
    }

    getPosOrNeg() {
        return this.getArrayRandomValue([.8, 1.2]);
    }

    getArrayRandomValue(array) {
        const i = parseInt(Math.random()*array.length);
        return array[i];
    }

    getCopy() {
        const copy = new Goo({world: this.world});
        copy.color = this.color;
        copy.changeColorRandom();
        this.size /= 2;
        copy.size = this.size;
        copy.brain = this.brain.getCopy();
        return copy;
    }
}
