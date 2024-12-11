import Canvas from './src/canvas.js';
import Effects from './src/effects.js';
import {Display, SegmentDisplay, createDisplay, Utils, Panels } from 'flipdisc';


const createCanvas = (layout, devices, options) => {
  if (!layout || !devices) {
    throw new Error('Missing layout or devices');
  }
  return new Canvas(createDisplay(layout, devices, options));
}

export { Canvas, Display, SegmentDisplay, createDisplay, Utils, Panels, createCanvas, Effects };