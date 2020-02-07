import glslangModule from '../node_modules/@webgpu/glslang/dist/web-devel/glslang.js';

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
            bindings: [{
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                type: 'uniform-buffer'
            }]
        });

        let layout = this.device.createPipelineLayout({
            bindGroupLayouts: [this.uniformGroupLayout]
        });

        let vsModule = this.device.createShaderModule({
            code: this.glslang.compileGLSL(vsCode, 'vertex')
        });

        let fsModule = this.device.createShaderModule({
            code: this.glslang.compileGLSL(fsCode, 'fragment')
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
                indexFormat: 'uint32',
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
        let vertexBuffer = this.device.createBuffer({
            size: vertexArray.length * 4,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        // vertexBuffer.setSubData(0, vertexArray);

        /**
         * In effect, GPUBuffer.setSubData() was removed from WebGPU spec, 
         * according to the spec we should use the following code 
         * to upload data to GPUBuffer, but it's really not easy to use.
         * And because GPUBuffer.setSubData() is used by majority WebGPU samples,
         * so acutally it is still supported by the implementation in Chrome Canary 
         * So here we will keep using it until
         * the work group find any other easy way to replace it.
         */ 

        // let [ vertexBuffer, buffer ] = this.device.createBufferMapped( {

        //     size: vxArray.length * 4,

        //     usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST

        // } );

        // let view = new Float32Array( buffer );

        // view.set( vxArray, 0 );

        // vertexBuffer.unmap();

        this.renderPassEncoder.setVertexBuffer(0, vertexBuffer);

        let indexBuffer = this.device.createBuffer({
            size: indexArray.length * 4,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        });

        // indexBuffer.setSubData(0, indexArray);

        this.renderPassEncoder.setIndexBuffer(indexBuffer);

        let uniformBuffer = this.device.createBuffer({
            size: uniformArray.length * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        // uniformBuffer.setSubData(0, uniformArray);

        let uniformBindGroup = this.device.createBindGroup({
            layout: this.uniformGroupLayout,
            bindings: [{
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
}