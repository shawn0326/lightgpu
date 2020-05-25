export async function loadImage(src) {
    let image = new Image();
    image.src = src;
    await image.decode();

    let canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.width;

    let context2D = canvas.getContext('2d');
    context2D.drawImage(image, 0, 0, image.width, image.height);

    let imageData = context2D.getImageData(0, 0, image.width, image.height);

    return { 
        data: new Uint8Array(imageData.data.buffer),
        width: image.width,
        height: image.height
    };
}