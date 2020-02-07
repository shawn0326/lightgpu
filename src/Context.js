export default class Context {

    constructor(canvas) {
        this.context = canvas.getContext('gpupresent');
        this.format = 'bgra8unorm';
        this.swapChain;
    }

    async init(device) {
        this.format = await this.context.getSwapChainPreferredFormat(device);
        this.swapChain = this.context.configureSwapChain({
            device,
            format: this.format,
            usage: GPUTextureUsage.OUTPUT_ATTACHMENT | GPUTextureUsage.COPY_DST
        });
    }
}