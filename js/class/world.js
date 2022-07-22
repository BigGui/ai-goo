import { Hunter } from './hunter.js';
import { Prey } from './prey.js';

export class World {
    constructor(nbHunters, nbPreys) {
        this.goos = [];
        this.createPopulation(nbHunters, nbPreys);
    }

    createPopulation(nbHunters, nbPreys) {
        for (let i = 0; i < nbHunters; i++) {
            this.goos.push(new Hunter({world: this}));
        }
        for (let i = 0; i < nbPreys; i++) {
            this.goos.push(new Prey({world: this}));
        }
    }

    async run() {
        setInterval(() => {
            this.displayNbOfGoos();
            this.goos.forEach(async (g, i) => {
                await g.lookAround();
                await g.decideMove();
                g.cloneOrDieIfNecessary();
            });
        }, 50)
    }

    displayNbOfGoos() {
        this.addChart(this.getNbHunters(), this.getNbPreys());
    }

    getNbHunters() {
        return this.goos.filter(g => g.getType() === "Hunter").length;
    }
    getNbPreys() {
        return this.goos.filter(g => g.getType() === "Prey").length;
    }

    addGoo(goo) {
        this.goos.push(goo);
    }

    burryDeadGoos() {
        this.goos = this.goos.filter(g => g.isAlive);
    }

    getGoosAround(pos, distance) {
        return this.goos.filter(g => g.getDistanceFromPos(pos) < distance);
    }

    addChart(nbHunters, nbPreys) {
        this.addChartHunters(nbHunters);
        this.addChartPreys(nbPreys);
    }

    
    addChartHunters(value) {
        document.getElementById("nb-hunters").textContent = value;
        const chart = document.getElementById("chart-h");
        const li = document.createElement("li");
        li.className = "chart-bar";
        li.style.height = value +"px";
        li.setAttribute("title", value);
        chart.appendChild(li);
        if (chart.children.length > 200) {
            chart.firstChild.remove();
        }
    }
    
    addChartPreys(value) {
        document.getElementById("nb-preys").textContent = value;
        const chart = document.getElementById("chart-p");
        const li = document.createElement("li");
        li.className = "chart-bar";
        li.style.height = value +"px";
        li.setAttribute("title", value);
        chart.appendChild(li);
        if (chart.children.length > 200) {
            chart.firstChild.remove();
        }
    }

    isFull() {
        return this.goos.length > 200;
    }

}
