  
export default `
    #version 450
    layout(binding = 0) uniform Uniforms {
        mat4 uPMatrix;
        mat4 uMVMatrix;
    };
    layout(location = 0) in vec3 aVertexPosition;
    layout(location = 1) in vec2 uv;
    layout(location = 0) out vec2 fragUV;
    void main() {
        gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
        fragUV = uv;
    }
`;