import { Synapse } from './synapse.js';

export class Neuron {
    constructor(index, params) {
        this.index = index;
        this.synpases = [];
        this.backSynapses = [];
        this.act = {a:1, b:0};
        this.isInput = false;
        this.isOutput = false;
        this.initialize();

        if (params && params.datas && !this.dice(100)) {
            this.act.a = params.datas.activation.a;
            this.act.b = params.datas.activation.b;
        } else {
            this.setRandomActivation();
        }
    }

    initialize() {
        this.output = null;
        this.expectedOutput = null;
        this.error = null;
        this.backpropErrors = null;
        this.totalSynapses = null;
    }

    dice(nb) {
        return (Math.random()*nb) <= 1;
    }

    setRandomActivation() {
        this.act.a = Math.random() * 2 - 1;
        this.act.b = Math.random() * 2 - 1;
    }
    setCustomActivation(a, b) {
        this.act.a = a;
        this.act.b = b;
    }

    setOutput(value) {
        this.isInput = true;
        this.output = value;
    }

    setExpectedOutput(value) {
        this.isOutput = true;
        this.expectedOutput = value;
    }

    getBackpropErrors() {
        if (this.backpropErrors !== null) return this.backpropErrors;
        
        // This is the output : difference betwwen expected output and real output
        if (this.isOutput) this.backpropErrors = this.getOutput() - this.expectedOutput;

        // No back synapse : nothing to do
        else if (this.backSynapses.length === 0) this.backpropErrors = 0;
        
        // Sum of errors return by all back synpases
        else this.backpropErrors = this.backSynapses.map(s => s.getBackError()).reduce((a, b) => a + b);

        return this.backpropErrors;
    }

    getError() {
        if (this.error !== null) return this.error;
        this.error = this.getActivationDerivResult(this.getTotalSynapses()) * this.getBackpropErrors();
        return this.error;
    }

    addSynapse(synpase) {
        this.synpases.push(synpase);
    }

    addBackSynapse(synpase) {
        this.backSynapses.push(synpase);
    }

    connectTo(neuron, weight) {
        const s = new Synapse({
            neuronFrom: this,
            neuronTo: neuron,
            weight: weight || 0
        });
        if (weight === undefined) s.setRandomWeight();
        this.addBackSynapse(s);
        neuron.addSynapse(s);
    }

    getActivationResult(x) {
        return Math.tanh(this.act.a * x + this.act.b);
    }

    getActivationDerivResult(x) {
        return this.act.a / Math.pow(Math.cosh(this.act.a * x + this.act.b), 2);
    }

    getTotalSynapses() {
        if (this.totalSynapses !== null) return this.totalSynapses;

        if (this.synpases.length === 0) return 0;
        this.totalSynapses = this.synpases.map(s => s.getOutput()).reduce((a, b) => a + b);
        
        return this.totalSynapses;
    }
    
    getOutput() {
        if (this.output !== null) return this.output;

        this.output = this.getActivationResult(this.getTotalSynapses());

        return this.output;
    }

    updateSynapses() {
        this.backSynapses.forEach(synapse => synapse.updateWeight())
    }

    exportDatas() {
        return {
            index: this.index,
            activation: this.act,
            synapses: this.synpases.map(s => s.exportDatas())
        }
    }

}