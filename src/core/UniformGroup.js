import Buffer from './Buffer.js';

export default class UniformGroup {
    
    constructor(pipeline, typedArray) {
        this.pipeline = pipeline;
        this.buffer = new Buffer(pipeline.gpu, typedArray, GPUBufferUsage.UNIFORM);

        this._bindGroup = null;
    }

    destroy() {
        this.buffer.destroy();
        // todo destroy bindGroup
    }

    $getBindGroup() {
        if (!this._bindGroup) {
            let bindGroup = this.pipeline.gpu.device.createBindGroup({
                layout: this.pipeline.$getUniformGroupLayout(),
                entries: [{
                    binding: 0,
                    resource: { buffer: this.buffer.$getGPUBuffer() }
                }]
            });
            this._bindGroup = bindGroup;
        }

        return this._bindGroup;
    }

}