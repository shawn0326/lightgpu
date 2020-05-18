import glslangModule from '../node_modules/@webgpu/glslang/dist/web-devel/glslang.onefile.js';

export default class GPU {

    constructor() {
        this.adapter;
        this.device;
        this.glslang;

        this.commandEncoder;
        this.renderPassEncoder;
        this.renderPipeline;

        this.uniformGroupLayout;
    }

    async init() {
        this.adapter = await navigator.gpu.requestAdapter({
            powerPerence: 'high-performance'
        });
        this.device = await this.adapter.requestDevice();
        this.glslang = await glslangModule();
    }

    initRenderPass(colorAttachment, clearColor, width, height) {
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

    initPipeline(vsCode, fsCode, format) {
        this.uniformGroupLayout = this.device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                type: 'uniform-buffer'
            }]
        });

        let layout = this.device.createPipelineLayout({
            bindGroupLayouts: [this.uniformGroupLayout]
        });

        let vsModule = this.device.createShaderModule({
            code: this.glslang.compileGLSL(vsCode, 'vertex'),
            source: vsCode,
            transform: source => this.glslang.compileGLSL(source, 'vertex')
        });

        let fsModule = this.device.createShaderModule({
            code: this.glslang.compileGLSL(fsCode, 'fragment'),
            source: fsCode,
            transform: source => this.glslang.compileGLSL(source, 'vertex')
        });

        this.renderPipeline = this.device.createRenderPipeline({
            layout,
            vertexStage: {
                module: vsModule,
                entryPoint: 'main'
            },
            fragmentStage: {
                module: fsModule,
                entryPoint: 'main'
            },
            primitiveTopology: 'triangle-list',
            vertexState: {
                // indexFormat: 'uint32',
                vertexBuffers: [{
                    arrayStride: 4 * 3,
                    attributes: [
                        // position
                        {
                            shaderLocation: 0,
                            offset: 0,
                            format: 'float3'
                        }
                    ]
                }]
            },
            colorStates: [
                {
                    format
                }
            ]
        });

        this.renderPassEncoder.setPipeline(this.renderPipeline);
    }

    initGPUBuffer(vertexArray, indexArray, uniformArray) {
        let vertexBuffer = this._updateBufferData(vertexArray, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);
        this.renderPassEncoder.setVertexBuffer(0, vertexBuffer);

        let indexBuffer = this._updateBufferData(indexArray, GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST);
        this.renderPassEncoder.setIndexBuffer(indexBuffer);

        let uniformBuffer = this._updateBufferData(uniformArray, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
        let uniformBindGroup = this.device.createBindGroup({
            layout: this.uniformGroupLayout,
            entries: [{
                binding: 0,
                resource: { buffer: uniformBuffer }
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

    _updateBufferData(src, usage) {
        let [uploadBuffer, mapping] = this.device.createBufferMapped({
            size: src.byteLength,
            usage: usage
        });

        new src.constructor(mapping).set(src);
        uploadBuffer.unmap();

        return uploadBuffer;
    }
}