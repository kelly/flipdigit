# Flip digit 

A basic library that implements many canvas-like functions for displaying graphics on a flip digit display e.g. [AlfaZeta 7-segment display](https://flipdots.com/en/products-services/small-7-segment-displays/). For full build and installation guide check out: [flipdisc.io](https://flipdisc.io)

## Features

- Automatically splits drawing data into vertical/horizontal segments.
- Support for lines, paths, shapes, images, and text
- Built-in effects and animations.

## Installation

Install the library via npm:

```bash
npm install flipdigit
```

## Usage

### Basic Setup

```javascript
import { createCanvas } from '../index.js'
import { layout, devices, options } from './config.js'

const canvas = createCanvas(layout, devices, options)
// layout, devices, options are the same as flipdisc library

// Clear the canvas
canvas.clear();
canvas.clearRect(10, 10, 50, 30); // Clears rectangle area

// Draw a circle
canvas.drawCircle(0, 0, 5) 

// Render a frame
canvas.render() 

```

To configure the `layout`, `devices`, `options` check out the [flipdisc README](https://github.com/kelly/flipdisc)


### Drawing Shapes

Use the built-in methods to draw shapes and manage paths:

```javascript
canvas.drawRect(10, 10, 50, 30, true, 2); // Filled rectangle with line width of 2

canvas.drawCircle(100, 100, 30, false, 1); // Circle outline with radius 30

canvas.drawArc(150, 150, 40, 0, Math.PI, 2); // Semi-circle with line width of 2

canvas.drawEllipse(200, 200, 50, 30, true, 1); // Filled ellipse

canvas.drawStar(250, 250, 20, 40, 5, 1); // Star with 5 points
```


### Drawing Paths

Support for creating complex paths using straight lines and curves:

#### Example: Drawing a Path

```javascript
canvas.beginPath();
canvas.moveTo(0, 0);
canvas.lineTo(50, 50);
canvas.quadraticCurveTo(75, 25, 100, 50);
canvas.bezierCurveTo(125, 75, 150, 25, 175, 50);
canvas.closePath();
canvas.stroke(2); // Stroke with line width of 2
```

### Drawing Lines

Draw lines with specified width:

```javascript
canvas.drawLine(0, 0, 10, 10, 2); // Draws a line with a width of 2
```

#### Example: Drawing a Polygon

```javascript
canvas.drawPolygon([
  { x: 10, y: 10 },
  { x: 20, y: 40 },
  { x: 40, y: 40 },
  { x: 50, y: 10 }
], 2); // Polygon outline with line width of 2
```

### Working with 3D Graphics

Methods for rendering 3D graphics and projecting them onto a 2D canvas:

#### Example: Drawing a 3D Line

```javascript
canvas.drawLine3D(0, 0, 0, 50, 50, 50, 30, 2); // Draws a 3D line with perspective
```

- `x0`, `y0`, `z0`: Start coordinates in 3D space.
- `x1`, `y1`, `z1`: End coordinates in 3D space.
- `d`: Distance factor for perspective.
- `lineWidth`: Optional width of the line.
- `applyRotation`: Whether to apply the current rotation matrix.

#### Example: Applying a Rotation Matrix

```javascript
canvas.setRotationMatrix({ x: Math.PI / 4, y: Math.PI / 4, z: 0 }); // Sets a 45-degree rotation on X and Y axes
```

- `x`, `y`, `z`: Rotation angles in radians.

#### Example: Projecting 3D Coordinates to 2D

```javascript
const projected = canvas.project3DTo2D(10, 20, 30, Math.PI / 3, 16 / 9);
console.log(projected); // Logs the projected 2D coordinates
```

- `x`, `y`, `z`: 3D coordinates to project.
- `fov`: Field of view in radians.
- `aspect`: Aspect ratio of the canvas.
- `near`, `far`: Near and far clipping planes (optional).

### Working with Images

Provides support for rendering images and animations:

#### Draw a Static Image

```javascript
canvas.drawImage('https://example.com/image.png', 'floyd-steinberg', 1);
canvas.drawImage('./local-image.png', 'bayer', 0.5);
```

- `resource`: The source of the image (remote URL or local file path).
- `dither`: Optional dithering method (`floyd-steinberg` or `bayer`).
- `scale`: Optional scale factor.

#### Play an Animated GIF

```javascript
canvas.playAnimatedGif('https://example.com/animation.gif', 'floyd-steinberg', 1);
```

- `resource`: The source of the GIF (remote URL or local file path).
- `dither`: Optional dithering method (`floyd-steinberg` or `bayer`).
- `scale`: Optional scale factor.

### Rendering and Animation

Provides methods for managing rendering and animations:

#### Example: Creating a Render Loop

```javascript
let x = 0;
canvas.animate(() => {
  canvas.clear();
  canvas.drawCircle(x, x, x);
  x = (x + 1) % 40;
});
// Stop the animation
canvas.stopAnimation();
```

#### Using a Fixed Interval for Rendering

```javascript
canvas.startRenderLoop(16); // Render every 16ms (~60 FPS)
canvas.stopRenderLoop();
```

### Applying Transformations

Provides methods for applying and managing transformations:

#### Example: Applying Transformations

```javascript
canvas.translate(10, 10); // Move the canvas by 10 units in x and y direction
canvas.rotate(Math.PI / 4); // Rotate the canvas by 45 degrees
canvas.scale(2, 2); // Scale the canvas by a factor of 2
```

#### Example: Saving and Restoring Transforms

```javascript
canvas.saveTransform();
canvas.translate(20, 20);
canvas.restoreTransform(); // Reverts back to the previous state
```

- `saveTransform()`: Saves the current transformation matrix.
- `restoreTransform()`: Restores the last saved transformation matrix.

#### Example: Clearing Transformations

```javascript
canvas.clearTransform(); // Resets all transformations
```

### Adding Effects

Special effects can be applied:

```javascript
canvas.addEffect(Effects.rainEffect);
canvas.addEffect(Effects.glowEffect);
```

Built-in effects include:

- `Effects.decayEffect`
- `Effects.rainEffect`
- `Effects.wavesEffect`
- `Effects.explodeEffect`
- `Effects.twinkleEffect`
- `Effects.scrollEffect`
- `Effects.rippleEffect`
- `Effects.spiralEffect`
- `Effects.fireEffect`
- `Effects.noiseEffect`
- `Effects.zoomEffect`
- `Effects.glowEffect`

Each effect can be applied to an `effectLayer` for dynamic rendering.

#### Example: Adding a Twinkle Effect

```javascript
canvas.addEffect(Effects.twinkleEffect);
canvas.updateDisplay(canvas.verticalFrameData, canvas.horizontalFrameData);
```

### Handling Text

Provides methods for rendering text:

#### Example: Drawing Text

```javascript
canvas.drawText('Hello', 10, 10, 2); // Draws scaled text
```

- `text`: The string to render.
- `x`, `y`: Coordinates for the text's starting position.
- `scale`: Optional scaling factor for the text (default is 1).


### Methods

#### `clear()`
Clears the canvas and resets transformations.

#### `updateDisplay(verticalFrameData, horizontalFrameData)`
Compares the frame data with the previous state and updates the display if changes are detected.

#### `applyEffect(effectName, options)`
Applies a specified effect to the canvas.

#### `addEffect(effectFn)`
Adds a custom effect to the canvas.

#### `clearEffects()`
Removes all effects and clears the effect layer.

#### `beginPath()`
Starts a new path.

#### `moveTo(x, y)`
Moves the current path to the specified coordinates.

#### `lineTo(x, y)`
Draws a line to the specified coordinates.

#### `quadraticCurveTo(cpx, cpy, x, y)`
Draws a quadratic curve to the specified point using a control point.

#### `bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y)`
Draws a bezier curve to the specified point using two control points.

#### `closePath()`
Closes the current path by connecting the last point to the first.

#### `stroke(lineWidth)`
Strokes the current path with the specified line width.

#### `drawRect(x, y, width, height, fill, lineWidth)`
Draws a rectangle at the specified position with optional fill and line width.

#### `drawCircle(cx, cy, radius, fill, lineWidth)`
Draws a circle with the specified radius, fill, and line width.

#### `drawArc(cx, cy, radius, startAngle, endAngle, lineWidth)`
Draws an arc with the specified radius and angles.

#### `drawEllipse(cx, cy, rx, ry, fill, lineWidth)`
Draws an ellipse with the specified radii, fill, and line width.

#### `drawPolygon(vertices, lineWidth)`
Draws a polygon using an array of vertices.

#### `drawStar(centerX, centerY, innerRadius, outerRadius, points, lineWidth)`
Draws a star with the specified parameters.

#### `clearRect(x, y, width, height)`
Clears a rectangular area on the canvas.

#### `drawLine3D(x0, y0, z0, x1, y1, z1, d, lineWidth, applyRotation)`
Draws a 3D line with perspective projection.

#### `setRotationMatrix({ x, y, z })`
Sets the rotation matrix for 3D transformations.

#### `project3DTo2D(x, y, z, fov, aspect, near, far)`
Projects 3D coordinates to 2D screen space.

#### `drawImage(resource, dither, scale)`
Draws a static image from a URL or local file path.

#### `playAnimatedGif(resource, dither, scale)`
Plays an animated GIF from a URL or local file path.

#### `startGifAnimation(interval, shouldLoop)`
Starts a GIF animation with a specified interval and looping behavior.

#### `stopGifAnimation()`
Stops the current GIF animation.

#### `drawText(text, x, y, scale)`
Renders text at the specified coordinates with an optional scaling factor.

#### `drawLine(x0, y0, x1, y1, lineWidth = 1)`
Draws a line between two points with an optional line width.

#### `rect(x, y, width, height)`
Creates a rectangle at the specified position.

#### `fill()`
Fills the current path or shape.

#### `stroke()`
Strokes the current path.

#### `translate(x, y)`
Translates the canvas by the given offsets.

#### `rotate(angle)`
Rotates the canvas by the specified angle (in radians).

#### `scale(x, y)`
Scales the canvas by the specified factors.

#### `saveTransform()`
Saves the current transformation state.

#### `restoreTransform()`
Restores the last saved transformation state.

#### `clearTransform()`
Clears all transformations and resets to the identity matrix.

#### `animate(callback)`
Creates a render loop calling the `callback` on each frame.

#### `stopAnimation()`
Stops the current animation loop.

#### `render(verticalData, horizontalData)`
Applies effects and updates the display with the given frame data.

#### `startRenderLoop(interval)`
Starts a rendering loop at the specified interval.

#### `stopRenderLoop()`
Stops the current rendering loop.

## License

This library is licensed under the BSD-3-Clause-Attribution License. See the `LICENSE` file for details.
