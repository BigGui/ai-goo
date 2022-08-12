import { Goo } from "./goo.js";

export class Hunter extends Goo {
    constructor(params) {
        super(params);
        this.acuity = 10;
        this.maxSpeed = 2;
        this.updateSize();
        this.increaseSpeed = .6;
        this.decreaseSpeed = .01;
        this.viewAngle = 90;
        this.viewAngleRange = [0, 0];
    }
    getCopy() {
        const copy = new Hunter({world: this.world});
        this.childrenNb++;
        return this.configCopy(copy);
    }

    async decideMove() {
        let x, y;
        [x, y, this.voice] = await this.brain.askAnswer(this.getInput());
        const intention = [x, y];
        this.move(intention);

        const preys = this.preysAround
            .filter(g => {
                return this.isAngleBetween(this.getAngleFromPos(g.getPosition()), this.viewAngleRange[0], this.viewAngleRange[1])
            })
            .sort((a, b) => {
                return this.getDistanceFromGoo(a) - this.getDistanceFromGoo(b);
            });

        this.expectedVoice = preys.length;

        if (preys.length > 0) {
            await this.learnToFollowPrey(preys[0]);

            if (this.getDistanceFromGoo(preys[0]) < (this.size + preys[0].size)/2) {
                return this.eatPrey(preys[0]);
            }
        }
        else if (this.movement[0] != intention[0] || this.movement[1] != intention[1] ) {
            await this.brain.learn([...this.moveToLearnIfStucked(intention), this.expectedVoice]);
        }
        
        if (this.isStatic() && this.isInACorner()) return this.decreaseMore();
        return this.decrease();
    }

    eatPrey(prey) {
        prey.kill();
        this.increase();
    }

    async learnToFollowPrey(prey) {
        await this.brain.learn([...this.getMoveToFollowPrey(prey), this.expectedVoice]);
    }

    getMoveToFollowPrey(prey) {
        return [(prey.position[0] - this.position[0] - this.lastMove[0]), (prey.position[1] - this.position[1] - this.lastMove[0])];
    }


    isPositionAvailable(position) {
        return this.world.goos.filter(g => g.isInMyBody(position) && g.getType() === "Hunter" && g !== this).length === 0;
    }
}