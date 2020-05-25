import Buffer from './Buffer.js';

export default class Texture extends Buffer {

    constructor(gpu, typedArray, width, height) {
        super(gpu, typedArray, GPUBufferUsage.COPY_SRC);

        this.width = width;
        this.height = height;

        this._texture = null;
    }

    destroy() {
        super.destroy();

        if (this._texture) {
            this._texture.destroy();
            this._texture = null;
        }
    }

    $update() {
        let uploadBuffer = super.$update();

        if (uploadBuffer) {
            this.gpu.commandEncoder.copyBufferToTexture({
                buffer: this.$getGPUBuffer(),
                bytesPerRow: this.width * 4,
                rowsPerImage: 0
            }, {
                texture: this._texture
            }, {
                width: this.width,
                height: this.height,
                depth: 1
            });
        } else {
            this.$getTexture();
        }

        return uploadBuffer;
    }

    $getTexture() {
        if (this._texture) {
            return this._texture;
        }

        let { device, commandEncoder } = this.gpu;

        let texture = device.createTexture({
            size: {
                width: this.width,
                height: this.height,
                depth: 1
            },
            format: 'rgba8unorm',
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.SAMPLED
        });

        commandEncoder.copyBufferToTexture({
            buffer: this.$getGPUBuffer(),
            bytesPerRow: this.width * 4,
            rowsPerImage: 0
        }, {
            texture
        }, {
            width: this.width,
            height: this.height,
            depth: 1
        });

        this._texture = texture;

        return texture;
    }

}