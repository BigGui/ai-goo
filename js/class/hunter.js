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
        return this.configCopy(copy);
    }

    async decideMove() {
        this.move(await this.brain.askAnswer(this.getInput()));

        const preys = this.getGoosAroundMe(this.acuity, "Prey")
            .filter(g => {
                return this.isAngleBetween(this.getAngleFromPos(g.getPosition()), this.viewAngleRange[0], this.viewAngleRange[1])
            })
            .sort((a, b) => {
                return this.getDistanceFromPos(a.getPosition()) - this.getDistanceFromPos(b.getPosition());
            });


        if (preys.length > 0) {
            await this.learnToFollowPrey(preys[0]);

            if (this.getDistanceFromPos(preys[0].getPosition()) < (this.size + preys[0].size)/2) {
                return this.eatPrey(preys[0]);
            }
        // } else if (this.getGoosAroundMe(this.acuity, "Hunter").filter(g => this.getDistanceFromPos(g.getPosition()) < (this.size + g.size)/2).length > 0) {
        //     await this.runAway();
        }
        else if (this.isStatic()) {
            await this.brain.learn(this.moveToCenter());
        }

        return this.decrease();
    }


    eatPrey(prey) {
        prey.kill();
        this.increase();
    }

    moveToCenter() {
        return this.position.map(x => Math.max(Math.min(50 - x, 2), -2));
    }

    async learnToFollowPrey(prey) {
        await this.brain.learn(this.getMoveToFollowPrey(prey));
    }

    getMoveToFollowPrey(prey) {
        return [(prey.position[0] - this.position[0] - this.lastMove[0]), (prey.position[1] - this.position[1] - this.lastMove[0])];
    }


    isPositionAvailable(position) {
        return this.world.goos.filter(g => g.isInMyBody(position) && g.getType() === "Hunter" && g !== this).length === 0;
    }
}