import { Brain } from "./brain.js";

export class Goo {
    constructor(params) {
        this.world = params.world || null;
        this.element = null;
        this.color = [0, 0, 0];
        this.position = this.getRandomPosition();
        this.createDomElement();
        this.updatePosition();
        this.lastMove = [0, 0];
        this.movement = [0, 0];
        this.eyes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.size = 3;
        this.isAlive = true;
        this.acuity = 10;
        const d = new Date();
        this.lastClone = d.getTime();
        this.direction = 0
        this.birth = new Date();
        this.childrenNb = 0;
        
        if (params.datas) {
            this.importDatas(params.datas);
            this.brain = new Brain({datas: params.datas.brain});
            return;
        }

        this.brain = new Brain();
    } 

    getType() {
        return this.constructor.name;
    }

    getAge() {
        return parseInt((new Date() - this.birth) / 1000);
    }

    kill() {
        this.isAlive = false;
        this.element.remove();
        this.world.addToStorage(this.exportDatas());
        this.world.burryDeadGoos();
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
        this.size += this.increaseSpeed;
        this.size = Math.min(this.size, 6.5);
        this.updateSize();
    }

    decrease() {
        this.size -= this.decreaseSpeed;
        if (this.size < 0) this.size = 0;
        this.updateSize();
    }

    createDomElement() {
        this.element = document.createElement("div");
        this.element.classList.add("goo")
        this.element.classList.add(this.getType().toLowerCase())
        document.getElementById("world").appendChild(this.element);
        this.getRandomColor();
    }

    getPosition() {
        return this.position;
    }

    setPosition(position) {
        this.position = position;
        this.updatePosition();
    }

    updatePosition() {
        this.element.style.left = `${this.position[0]}%`;
        this.element.style.top = `${this.position[1]}%`;
    }

    isPositionAvailable(position) {
        return this.world.goos.filter(g => g.isInMyBody(position) && g !== this).length === 0;
    }

    move(m) {
        this.lastMove = [...this.movement];

        this.movement = [
            this.normalizeMovement(this.movement[0] + m[0], this.position[0]),
            this.normalizeMovement(this.movement[1] + m[1], this.position[1])
        ];

        this.position = this.getNewPosition(this.movement);

        this.updateEyesDirection(this.getDirection(this.movement));
        this.updatePosition();

        return this.movement.map((x, i) => x - this.lastMove[i]);
    }

    getNewPosition(movement) {
        return this.position.map((x, i) => this.normalizePosition(x + movement[i]));
    }

    getDirection(move) {
        this.direction = (Math.atan2(move[1], move[0]) * 180 / Math.PI) + 180;
        return this.direction;
    }

    normalizeAngle(angle) {
        if (angle < 0) return this.normalizeAngle(360 + angle%360);
        return angle%360;
    }

    updateEyesDirection(angle) {
        this.element.style.transform = `rotate(${angle}deg)`;
    }

    normalizeMovement(move, position) {
        if (position + move < 0) move = position * -1;
        else if (position + move > 100) move = 100 - position;
        
        return move%this.maxSpeed;
    }

    normalizePosition(value) {
        return Math.max(Math.min(value, 100), 0);
    }

    getInput() {
        return [this.size, ...this.movement, ...this.lastMove, ...this.position.map(x => x/100), ...this.eyes];
    }

    async lookAround() {
        this.eyes = [...this.lookAroundForType("Prey"), ...this.lookAroundForType("Hunter")];
        return this.eyes;
    }

    lookAroundForType(type) {
        const eyes = [0, 0, 0, 0, 0, 0, 0, 0];
        const posList = this.getGoosAroundMe(this.acuity, type).map(g => g.getPosition());
    
        if (posList.length === 0) return eyes;

        const views = this.getViewAngles();

        posList.forEach(pos => {
            const a = this.getAngleFromPos(pos);
            if (!this.isAngleBetween(a, views[0], views[7])) return;
            const i = this.getIndexFromAngleViews(a, views);
            if (eyes[i] === undefined) return;
            eyes[i] += 1 - (this.getDistanceFromPos(pos) / this.acuity);
        });

        return eyes;
    }

    getGoosAroundMe(distance, type) {
        const goos = this.world.getGoosAround(this.getPosition(), distance).filter(g => g !== this && g.isAlive);
        if (type === undefined) return goos;
        return goos.filter(g => g.getType() === type);
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

    getIndexFromAngleViews(angle, views) {
        const firstAngle = views[0];
        angle = this.normalizeAngle(angle - firstAngle);
        views = views.map(a => this.normalizeAngle(a - firstAngle))
        for(const i in views) {
            if (angle < views[i]) return i;
        }
    }

    getViewAngles() {
        const l = [];
        let a = this.viewAngle / -2;
        while(l.length < 8) {
            l.push(this.normalizeAngle(a + this.direction));
            a += this.viewAngle / 8;
        }

        this.viewAngleRange = [l[0], l[l.length - 1]];
        return l
    }

    isAngleBetween(angle, min, max) {
        return this.normalizeAngle(angle - min) <= this.normalizeAngle(max - min);
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
        this.color = this.color.map(c => {
            c += this.getMoreOrLess();
            if (c < 0) return 256 + c;
            return c%256;
        });
        this.displayColor();
    }

    getMoreOrLess() {
        return this.getArrayRandomValue([-5, 5]);
    }

    getArrayRandomValue(array) {
        return array[parseInt(Math.random()*array.length)];
    }

    getRandomMove() {
        return this.position.map(v => {
            if (v === 0) return Math.random() * 3;
            if (v === 100) return Math.random() * -3;
            return v + (Math.random() * (v / Math.abs(v))) || 0;
        });
    }

    isStatic() {
        return this.lastMove[0] < 0.01 && this.lastMove[1] < 0.01;
    }

    configCopy(copy) {
        const d = new Date();
        this.lastClone = d.getTime();
        copy.color = this.color;
        copy.changeColorRandom();
        this.size /= 2;
        copy.size = this.size;
        copy.setPosition(this.position.map(x => this.normalizePosition(x + Math.random() * 8 - 4)));
        copy.brain = this.brain.getCopy();
        return copy;
    }

    cloneOrDieIfNecessary() {
        if (!this.isAlive) return;

        if (this.size < 0.01) {
            this.kill();
            return;
        }

        const d = new Date();
        if (this.size < 6 || d.getTime() - this.lastClone  < 2000 || this.world.isFull()) return;
        
        this.world.addGoo(this.getCopy());
    }

    isInMyBody(position) {
        return this.getDistanceFromPos(position) < this.size / 2;
    }

    async runAway() {
        await this.brain.learn(this.getOpositeMove());
    }

    getOpositeMove() {
        return this.lastMove.map((v, i) => {
            if (this.position[i] === 0) return Math.abs(v) + Math.random();
            if (this.position[i] === 100) return (Math.abs(v) + Math.random()) * -1;
            return v + (Math.random() * (v / Math.abs(v))) || 0;
        });
    }

    exportDatas() {
        return {
            type: this.getType(),
            color: this.color,
            size: this.size,
            acuity: this.acuity,
            increaseSpeed: this.increaseSpeed,
            decreaseSpeed: this.decreaseSpeed,
            brain: this.brain.exportDatas(),
            age: this.getAge(),
            score: this.getScore()
        }
    }

    getScore() {
        return this.getAge() * (this.childrenNb + 1);
    }

    importDatas(datas) {
        this.color = datas.color;
        this.displayColor();
        this.acuity = datas.acuity;
        this.increaseSpeed = datas.increaseSpeed;
        this.decreaseSpeed = datas.decreaseSpeed;
    }
}
