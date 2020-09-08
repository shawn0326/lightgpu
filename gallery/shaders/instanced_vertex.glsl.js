  
export default `
    #version 450
    #define MAX_NUM_INSTANCES 100
    layout(binding = 0) uniform Uniforms {
        mat4 uPMatrix;
    };
    layout(binding = 1) uniform Uniforms1 {
        mat4 uMVMatrix[MAX_NUM_INSTANCES];
    };
    layout(location = 0) in vec3 aVertexPosition;
    layout(location = 1) in vec2 uv;
    layout(location = 0) out vec2 fragUV;
    void main() {
        gl_Position = uPMatrix * uMVMatrix[gl_InstanceIndex] * vec4(aVertexPosition, 1.0);
        fragUV = uv;
    }
`;