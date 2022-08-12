import { Brain } from "./brain.js";

export class Goo {
    constructor(params) {
        this.world = params.world || null;
        this.id = this.world.getNewGooId();
        this.element = null;
        this.color = [0, 0, 0];
        this.prevPosition = [0, 0];
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
        this.voice = 0;
        this.expectedVoice = 0;
        this.preysAround = [];
        this.huntersAround = [];
        this.gooDistances = {};
        
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

    async execute() {
        this.gooDistances = {};
        await this.lookAround();
        await this.decideMove();
        this.cloneOrDieIfNecessary();
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

    decreaseMore() {
        this.size -= this.decreaseSpeed * 4;
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

    move(m) {
        this.prevPosition = [...this.position];
        this.lastMove = [...this.movement];

        this.movement = [
            this.normalizeMovement(this.movement[0] + m[0], this.position[0]),
            this.normalizeMovement(this.movement[1] + m[1], this.position[1])
        ];

        this.setNewPosition(this.movement);

        this.updateEyesDirection(this.getDirection(this.movement));
        this.updatePosition();
    }

    setNewPosition(movement) {
        this.position = this.position.map((x, i) => this.normalizePosition(x + movement[i]));
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

    moveToLearnIfStucked(intention) {
        return intention.map((x, i) => x != this.movement[i] ? x * -1 : x);
    }

    normalizePosition(value) {
        return Math.max(Math.min(value, 100), 0);
    }

    moveRandomly() {
        const randPos = this.getRandomPosition();
        return [Math.max(Math.min(this.position[0] - this.position[0], 2), -2), Math.max(Math.min(this.position[1] - this.position[1], 2), -2)];
    }

    getInput() {
        return [this.size, ...this.movement, ...this.lastMove, ...this.position.map(x => x/100), this.direction, ...this.eyes, this.getVoiceFromNearestGoo()];
    }

    async lookAround() {
        this.preysAround = this.getGoosAroundMe("Prey");
        this.huntersAround = this.getGoosAroundMe("Hunter");

        this.eyes = [...this.lookAroundFromGoosList(this.preysAround), ...this.lookAroundFromGoosList(this.huntersAround)];
        return this.eyes;
    }

    lookAroundFromGoosList(goos) {
        const eyes = [0, 0, 0, 0, 0, 0, 0, 0];
        if (goos.length === 0) return eyes;

        const views = this.getViewAngles();

        goos.forEach(goo => {
            const a = this.getAngleFromPos(goo.getPosition());
            if (!this.isAngleBetween(a, views[0], views[7])) return;
            const i = this.getIndexFromAngleViews(a, views);
            if (eyes[i] === undefined) return;
            eyes[i] += 1 - (this.getDistanceFromGoo(goo) / this.acuity);
        });

        return eyes;
    }

    getGoosAroundMe(type) {
        return this.world.goos.filter(g => g !== this && g.isAlive && (g.getType() === type || type === undefined) && this.getDistanceFromGoo(g) < this.acuity);
    }

    getDistanceFromGoo(goo) {
        if (this.gooDistances[goo.id] !== undefined) return this.gooDistances[goo.id];

        this.gooDistances[goo.id] = this.getDistanceFromPos(goo.getPosition());
        return this.getDistanceFromGoo(goo);
    }

    getDistanceFromPos(pos) {
        return Math.hypot(...this.position.map((a, i) => a - pos[i]));
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

    getVoiceFromNearestGoo() {
        const goosToHear = this.getGoosAroundMe(this.getType()).sort((a, b) => {
            return this.getDistanceFromGoo(a) - this.getDistanceFromGoo(b);
        });
        const hear = goosToHear.length > 0 ? goosToHear[0].voice : 0;
        return hear;
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
        return Math.max(...this.lastMove) < 0.01;
    }

    isInACorner() {
        return this.position.map(x => [0, 100].includes(x)).reduce((a, b) => a && b);
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
