import { Hunter } from './hunter.js';
import { Prey } from './prey.js';

export class World {
    constructor(nbHunters, nbPreys) {
        this.goos = [];
        this.initStorage();
        this.createPopulation(nbHunters, nbPreys);
    }

    createPopulation(nbHunters, nbPreys) {
        this.createGooPopulation("Hunter", nbHunters);
        this.createGooPopulation("Prey", nbPreys);
    }

    createGooPopulation(type, nb) {
        let params = {};
        const storageLength = this.storage[type].length;
        for (let i = 0; i < nb; i++) {
            params = {world: this};
            if (storageLength > 0) params.datas = this.storage[type][i%storageLength];

            if (type === "Hunter") this.goos.push(new Hunter(params));
            else if (type === "Prey") this.goos.push(new Prey(params));
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

    addToStorage(gooDatas) {
        if (gooDatas.score < this.getMinScore(gooDatas.type)) return;
        this.storage[gooDatas.type].push(gooDatas);
        this.storage[gooDatas.type].sort(this.compareByScore);
        this.storage[gooDatas.type] = this.storage[gooDatas.type].slice(0, 10);
        this.updateLocalStorage();
        console.log(`New ${gooDatas.type} added to storage.`);
    }

    getMinScore(type) {
        return this.storage[type].reduce((a, b) => a.score < b.score ? a : b, 0).score;
    }

    compareByScore(a, b) {
        return b.score - a.score;
    }

    updateLocalStorage() {
        localStorage.setItem("ai-goo-storage", JSON.stringify(this.storage));
    }

    initStorage() {
        this.storage = JSON.parse(localStorage.getItem("ai-goo-storage"));
        if (!this.storage) {
            this.storage = {
                Hunter: [],
                Prey: []    
            };
        }
    }

}
