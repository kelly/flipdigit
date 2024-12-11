import { createCanvas } from '../index.js'
import { layout, devices, options } from './_config.js'

const canvas = createCanvas(layout, devices, options);

const pyramidVertices = [
  { x: 0,   y: -10,  z: 15 }, 
  { x: 10,  y: 10,   z: -10 },
  { x: 10,  y: 10,   z: 10 },
  { x: -10, y: 10,   z: 10 },
  { x: -10, y: 10,   z: -10 }
];

const pyramidEdges = [
  [0,1], [0,2], [0,3], [0,4],
  [1,2], [2,3], [3,4], [4,1]
];

function drawPyramid(rotationAngles) {
  canvas.setRotationMatrix(rotationAngles);

  const transformedVertices = pyramidVertices.map(vertex =>
    canvas.applyRotationMatrix(vertex)
  );

  const lineWidth = 1;
  const distance = 30;

  for (let [start, end] of pyramidEdges) {
    const v1 = transformedVertices[start];
    const v2 = transformedVertices[end];
    canvas.drawLine3D(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, distance, lineWidth);
  }
}

let angleX = 0;
let angleY = 0;
let angleZ = 0;

canvas.animate(() => {
  canvas.clear();
  angleX += 0.0;
  angleY += 0.02;
  angleZ += 0.0;

  drawPyramid({ x: angleX, y: angleY, z: angleZ });
});