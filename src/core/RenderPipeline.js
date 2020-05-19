export default class RenderPipeline {

    constructor(gpu, vsCode, fsCode, format) {
        this.gpu = gpu;

        this.vsCode = vsCode;
        this.fsCode = fsCode;
        this.format = format;

        this._uniformGroupLayout = null;
        this._renderPipeline = null;
    }

    destroy() {
        this.gpu = null;
        this.vsCode = null;
        this.fsCode = null;
        this.format = null;
        if(this._renderPipeline) {
            // todo destroy pipleline & uniformGroupLayout
        }
    }

    $getRenderPipeline() {
        if (!this._renderPipeline) {
            this._generateRenderPipleline();
        }

        return this._renderPipeline;
    }

    $getUniformGroupLayout() {
        if (!this._renderPipeline) {
            this._generateRenderPipleline();
        }

        return this._uniformGroupLayout;
    }

    _generateRenderPipleline() {
        let { device, glslang } = this.gpu;
        let { vsCode, fsCode, format }  = this;

        let uniformGroupLayout = device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                type: 'uniform-buffer'
            }]
        });

        let layout = device.createPipelineLayout({
            bindGroupLayouts: [uniformGroupLayout]
        });

        let vsModule = device.createShaderModule({
            code: glslang.compileGLSL(vsCode, 'vertex'),
            source: vsCode,
            transform: source => glslang.compileGLSL(source, 'vertex')
        });

        let fsModule = device.createShaderModule({
            code: glslang.compileGLSL(fsCode, 'fragment'),
            source: fsCode,
            transform: source => glslang.compileGLSL(source, 'vertex')
        });

        let renderPipeline = device.createRenderPipeline({
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

        this._uniformGroupLayout = uniformGroupLayout;
        this._renderPipeline = renderPipeline;
    }

}