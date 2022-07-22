export class Synapse {
    constructor(params) {
        this.neuronFrom = params.neuronFrom;
        this.neuronTo = params.neuronTo;
        this.weight = params.weight || 1;
    }

    getOutput() {
        return this.neuronFrom.getOutput() * this.weight;
    }

    getBackError() {
        return this.neuronTo.getError() * this.weight;
    }

    setRandomWeight() {
        this.weight = Math.random();
    }

    updateWeight(error) {
        this.weight -= .5 * this.neuronTo.getError() * this.neuronFrom.getOutput();
    }
    
    exportDatas() {
        return {
            weight: this.weight,
            neuronFromIndex: this.neuronFrom.index,
            neuronToIndex: this.neuronTo.index
        }
    }
}