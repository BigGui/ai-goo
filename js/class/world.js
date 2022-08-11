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
        // for (let i = 0; i < nbHunters; i++) {
        //     this.goos.push(new Hunter({world: this}));
        // }
        // for (let i = 0; i < nbPreys; i++) {
        //     this.goos.push(new Prey({world: this}));
        // }
    }

    createGooPopulation(type, nb) {
        for (let i = 0; i < nb; i++) {
            if (this.storage[type].length > 0) this.goos.push(this.getNewGooFromDatas(type));
            else if (type === "Hunter") this.goos.push(new Hunter({world: this}));
            else if (type === "Prey") this.goos.push(new Prey({world: this}));
        }
    }
    
    getNewGooFromDatas(type) {
        let goo;
        if (type === "Hunter") goo = new Hunter({world: this});
        else if (type === "Prey") goo = new Prey({world: this});

        goo.importDatas(this.getRandomDataFromStorage(type));

        return goo;
    }

    getRandomDataFromStorage(type) {
        const i = parseInt(this.storage[type].length * Math.random());
        return this.storage[type][i];
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
        this.storage[gooDatas.type].push(gooDatas);
        this.storage[gooDatas.type].sort(this.compareByAge);
        this.storage[gooDatas.type] = this.storage[gooDatas.type].slice(0, 10);
        // console.log(gooDatas.type, this.storage[gooDatas.type].map(g => g.age));
        this.updateLocalStorage();
    }

    compareByAge(a, b) {
        return b.age - a.age;
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
