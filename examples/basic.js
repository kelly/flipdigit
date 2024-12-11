import { createCanvas } from '../index.js'
import { layout, devices, options } from './_config.js'

const canvas = createCanvas(layout, devices, options)

let x = 0;
canvas.animate(() => {
  canvas.clear();
  canvas.drawCircle(x, x, x);
  x = (x + 1) % 40;
});