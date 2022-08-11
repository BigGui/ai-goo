import { Neuron } from './neuron.js';

export class Layer {
    constructor(params) {
        this.neurons = [];
        this.isInput = false;
        this.synapsesDatas = [];

        if (params && params.datas) {
            this.length = params.datas.neurons.length;
            this.createNeuronsFromDatas(params.datas.neurons);
            this.synapsesDatas = this.getSynapsesDatas(params.datas.neurons);
        } else {
            this.length = params.length || 10;
            this.createNeurons();
        }
    }

    getLength() {
        return this.length;
    }

    createNeurons() {
        for (let i = 0; i < this.length; i++) {
            const n = new Neuron(i);
            this.neurons.push(n);
        }
    }

    createNeuronsFromDatas(neuronsDatas) {
        neuronsDatas.forEach(datas => {
            const n = new Neuron(datas.index, {datas: datas});
            this.neurons.push(n);
        });
    }

    defineInputLayer(values) {
        values.forEach((v, i) => this.neurons[i].setOutput(v));
    }

    setExpectedOutputs(values) {
        values.forEach((v, i) => this.neurons[i].setExpectedOutput(v));
    }

    getRandomNeuron() {
        const r = parseInt(Math.random() * this.neurons.length);
        return this.neurons[r];
    }

    connectTo(nextlayer) {
        this.neurons.forEach(neuron => {
            nextlayer.neurons.forEach(n => {
                let weight;
                if (this.synapsesDatas.length) weight = this.synapsesDatas[neuron.index][n.index];
                neuron.connectTo(n, weight);
            });
        });
    }

    getOutputs() {
        return this.neurons.map(n => n.getOutput());
    }
    
    async getErrors() {
        return this.neurons.map(n => n.getError());
    }

    updateSynapses() {
        this.neurons.forEach(n => n.updateSynapses());
    }

    initialize() {
        this.neurons.forEach(n => n.initialize());
    }

    displayAll() {
        this.neurons.forEach(n => console.log(n));
    }

    exportDatas() {
        return {
            length: this.length,
            neurons: this.neurons.map(n => n.exportDatas())
        }
    }

    getSynapsesDatas(neuronsDatas) {
        const output = [];
        neuronsDatas.forEach(n => {
            n.synapses.forEach(s => {
                if (output[s.neuronFromIndex] === undefined) output[s.neuronFromIndex] = [];
                output[s.neuronFromIndex][s.neuronToIndex] = s.weight;
            })
        });

        return output;
    }
}