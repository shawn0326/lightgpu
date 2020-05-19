export default class Buffer {
    
    constructor(gpu, typedArray, usage) {
        this.gpu = gpu;

        this.array = typedArray;
        this.usage = usage;

        this._gpuBuffer = null;
    }

    destroy() {
        this.gpu = null;

        this.array = null;
        this.usage = null;

        if (this._gpuBuffer) {
            this._gpuBuffer.destroy();
        }
    }

    $getGPUBuffer() {
        if (!this._gpuBuffer) {
            let { device } = this.gpu;
            let [gpuBuffer, mapping] = device.createBufferMapped({
                size: this.array.byteLength,
                usage: this.usage
            });
    
            new this.array.constructor(mapping).set(this.array);
            gpuBuffer.unmap();

            this._gpuBuffer = gpuBuffer;
        }

        return this._gpuBuffer;
    }

}