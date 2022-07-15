import { Goo } from './goo.js';

export class World {
    constructor(population) {
        this.goos = [];
        this.createPopulation(population);
    }

    createPopulation(nb) {
        for (let i = 0; i < nb; i++) {
            this.goos.push(new Goo({world: this}));
        }
    }

    run() {
        setInterval(() => {
            this.displayNbOfGoos();
            this.goos.forEach(async (g, i) => {
                await g.lookAround();
                await g.decideMove();
            });
            this.killSmallestGoos();
            this.copyBiggestGoos();
            this.burryDeadGoos();
        }, 50)
    }

    displayNbOfGoos() {
        this.addChart(this.goos.length);
    }

    killSmallestGoos() {
        this.goos.filter(g => g.size < 0.01).forEach(g => g.kill());
    }

    copyBiggestGoos() {
        this.goos.filter(g => g.size > 8).forEach(g => this.addGoo(g.getCopy()));
    }

    addGoo(goo) {
        this.goos.push(goo);
    }

    burryDeadGoos() {
        this.goos = this.goos.filter(g => g.isAlive);
    }

    getGoosAt(pos) {
        return this.getGoosAround(pos, 2);
    }
    getGoosNear(pos) {
        return this.getGoosAround(pos, 5);
    }

    getGoosAround(pos, distance) {
        return this.goos.filter(g => g.getDistanceFromPos(pos) < distance);
    }

    addChart(value) {
        document.getElementById("nb").textContent = value;
        const chart = document.getElementById("chart");
        const li = document.createElement("li");
        li.className = "chart-bar";
        li.style.height = value +"px";
        li.setAttribute("title", value);
        chart.appendChild(li);
        if (chart.children.length > 200) {
            chart.firstChild.remove();
        }
    }
}
