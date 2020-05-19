import glslangModule from '../node_modules/@webgpu/glslang/dist/web-devel/glslang.onefile.js';
import Buffer from './core/Buffer.js';
import RenderPipeline from './core/RenderPipeline.js';

export default class GPU {

    constructor() {
        this.adapter;
        this.device;
        this.glslang;

        this.commandEncoder;
        this.renderPassEncoder;
    }

    async init() {
        this.adapter = await navigator.gpu.requestAdapter({
            powerPerence: 'high-performance'
        });
        this.device = await this.adapter.requestDevice();
        this.glslang = await glslangModule(); 
    }

    createRenderPass(colorAttachment, clearColor, width, height) {
        this.commandEncoder = this.device.createCommandEncoder();

        let renderPassDescriptor = {
            colorAttachments: [{
                attachment: colorAttachment,
                loadValue: clearColor
            }]
        }

        this.renderPassEncoder = this.commandEncoder.beginRenderPass(renderPassDescriptor);
        this.renderPassEncoder.setViewport(0, 0, width, height, 0, 1);
    }

    setPipeline(pipeline) {
        this.renderPassEncoder.setPipeline(pipeline.$getRenderPipeline());
    }

    bindAttributes(options) {
        if (options.vertexBuffers) {
            options.vertexBuffers.forEach((buffer, location) => {
                this.renderPassEncoder.setVertexBuffer(location, buffer.$getGPUBuffer());
            })
        }
        if (options.indexBuffer) {
            this.renderPassEncoder.setIndexBuffer(options.indexBuffer.$getGPUBuffer());
        }
    }

    bindUniforms(uniformBuffer, pipeline) {
        let uniformBindGroup = this.device.createBindGroup({
            layout: pipeline.$getUniformGroupLayout(),
            entries: [{
                binding: 0,
                resource: { buffer: uniformBuffer.$getGPUBuffer() }
            }]
        });
        this.renderPassEncoder.setBindGroup(0, uniformBindGroup);
    }

    draw(indexCount) {
        this.renderPassEncoder.drawIndexed(indexCount, 1, 0, 0, 0);
    }

    present() {
        this.renderPassEncoder.endPass();
        this.device.defaultQueue.submit([this.commandEncoder.finish()]);
    }

    createBuffer(typedArray, usage = GPUBufferUsage.COPY_DST) {
        return new Buffer(this, typedArray, usage);
    }

    createRenderPipeline(vsCode, fsCode, format) {
        return new RenderPipeline(this, vsCode, fsCode, format);
    }
}