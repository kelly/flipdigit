import Canvas from '../index.js'
import { createDisplay } from 'flipdisc'
import { layout, devices, options } from './_config.js'

const display = createDisplay(layout, devices, options);
const canvas = new Canvas(display);

canvas.addEffect(Canvas.noiseEffect);
// canvas.addEffect(Canvas.wavesEffect);

const imageURL = 'https://m.media-amazon.com/images/I/71Rh0pdZY-L._UF200,200_QL80_.jpg';

async function loadAndDrawImage() {
  try {
    canvas.clear();

    await canvas.drawImageFromURL(imageURL, 'floyd-steinberg', 1)

    canvas.animate(() => {
      canvas.render(); 
    });
  } catch (error) {
    console.error('Error loading image:', error);
  }
}

// Start the process
loadAndDrawImage();