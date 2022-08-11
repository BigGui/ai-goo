import { Goo } from "./goo.js";

export class Prey extends Goo {
    constructor(params) {
        super(params);
        this.acuity = 20;
        this.maxSpeed = 2;
        this.updateSize()
        this.increaseSpeed = .15;
        this.decreaseSpeed = .05;
        this.viewAngle = 360;
        this.viewAngleRange = [0, 0];
    }

    getCopy() {
        const copy = new Prey({world: this.world});
        this.childrenNb++;
        return this.configCopy(copy);
    }

    async decideMove() {
        const intention = await this.brain.askAnswer(this.getInput());
        this.move(intention);

        const hunters = this.getGoosAroundMe(this.acuity, "Hunter").sort((a, b) => {
            return this.getDistanceFromPos(a.getPosition()) - this.getDistanceFromPos(b.getPosition());
        });
        
        if (hunters.length > 0 && this.getDistanceFromPos(hunters[0].getPosition()) < this.acuity / 2) {
            await this.learnToRunAwayHunter(hunters[0]);
        }
        else if (this.movement[0] != intention[0] || this.movement[1] != intention[1] ) {
            await this.brain.learn(this.moveToLearnIfStucked(intention));
        }

        if (this.isStatic() && this.isInACorner()) return this.decreaseMore();
        if (this.isStatic()) return this.decrease();
        this.increase();
    }

    async learnToRunAwayHunter(hunter) {
        await this.brain.learn(this.getMoveToRunAwayHunter(hunter));
    }
    
    getMoveToRunAwayHunter(hunter) {
        const move = [hunter.position[0] - this.position[0] - this.lastMove[0], hunter.position[1] - this.position[1] - this.lastMove[1]];
        return move.map(m => (m/Math.abs(m) * -1) || 0);
    }
}