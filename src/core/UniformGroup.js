import Buffer from './Buffer.js';

export default class UniformGroup {
    
    constructor(pipeline, resources) {
        this.pipeline = pipeline;

        this.resources = resources;

        this._bindGroup = null;
    }

    destroy() {
        // todo destroy bindGroup
    }

    $getBindGroup() {
        if (!this._bindGroup) {
            let entries = this.pipeline.bindGroupLayout.entries.map(entry => {
                let resource = this.resources[entry.binding];
                if (entry.type === "uniform-buffer") {
                    resource = { buffer: resource.$getGPUBuffer() };
                } else if (entry.type === "sampler") {
                    // resource = { }; // TODO
                } else if (entry.type === "sampled-texture") {
                    resource = resource.$getTexture().createView();
                }
                return {
                    binding: entry.binding,
                    resource
                };
            });
            let bindGroup = this.pipeline.gpu.device.createBindGroup({
                layout: this.pipeline.$getUniformGroupLayout(),
                entries
            });
            this._bindGroup = bindGroup;
        }

        return this._bindGroup;
    }

}