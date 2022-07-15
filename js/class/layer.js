import { Neuron } from './neuron.js';

export class Layer {
    constructor(params) {
        this.neurons = [];
        this.length = params.length || 10;
        this.isInput = false;
        this.createNeurons();
    }

    getLength() {
        return this.length;
    }

    createNeurons() {
        for (let i = 0; i < this.length; i++) {
            const n = new Neuron();
            this.neurons.push(n);
        }
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
            nextlayer.neurons.forEach(n => neuron.connectTo(n));
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
}