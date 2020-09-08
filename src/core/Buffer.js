export default class Buffer {
    
    constructor(gpu, typedArray, usage) {
        this.gpu = gpu;

        this.array = typedArray;
        this.usage = usage;

        this._gpuBuffer = null;
        this._dataDirty = true;
    }

    destroy() {
        this.gpu = null;

        this.array = null;
        this.usage = null;

        if (this._gpuBuffer) {
            this._gpuBuffer.destroy();
            this._gpuBuffer = null;
        }
    }

    dirty() {
        this._dataDirty = true;
    }

    $update() {
        if (!this._dataDirty || !this._gpuBuffer) {
            return null;
        }

        let { device, commandEncoder } = this.gpu;

        let uploadBuffer = device.createBuffer({
            size: this.array.byteLength,
            usage: this.usage | GPUBufferUsage.COPY_SRC,
            mappedAtCreation: true
        });

        new this.array.constructor(uploadBuffer.getMappedRange()).set(this.array);
        uploadBuffer.unmap();

        commandEncoder.copyBufferToBuffer(uploadBuffer, 0, this._gpuBuffer, 0, this.array.byteLength);

        this._dataDirty = false;

        return uploadBuffer;
    }

    $getGPUBuffer() {
        if (this._gpuBuffer) {
            return this._gpuBuffer;
        }

        let { device } = this.gpu;

        let gpuBuffer = device.createBuffer({
            size: this.array.byteLength,
            usage: this.usage | GPUBufferUsage.COPY_SRC,
            mappedAtCreation: true
        });

        new this.array.constructor(gpuBuffer.getMappedRange()).set(this.array);
        gpuBuffer.unmap();

        this._gpuBuffer = gpuBuffer;

        this._dataDirty = false;

        return gpuBuffer;
    }

}