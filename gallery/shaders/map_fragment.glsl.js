export default `
    #version 450
    layout(set = 0, binding = 1) uniform sampler diffuseSampler;
    layout(set = 0, binding = 2) uniform texture2D diffuseTexture;
    layout(location = 0) in vec2 fragUV;
    layout(location = 0) out vec4 outColor;
    void main(void) {
        outColor = texture(sampler2D(diffuseTexture, diffuseSampler), fragUV);
    }
`;