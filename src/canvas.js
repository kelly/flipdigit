import Utils from './utils.js'
import Transform from './transform.js'
import Path from './path.js'
import Shapes from './shapes.js'
import Line from './line.js'
import Render from './render.js'
import Text from './text.js'
import Three from './three.js'
import Image from './image.js'
import Effects from './effects.js'

class Canvas {
  constructor(display) {
    const { width, height, verticalContentSize, horizontalContentSize} = display;
    Object.assign(this,  { width, height, verticalContentSize, horizontalContentSize })
    this.send = display.sendSegmentData.bind(display)
    this.currentPath = [];
    this.effects = [];
    this.animationFrameId = null;
    this.renderIntervalId = null;
    this.transformStack = [this.transformIdentityMatrix];
    this.rotationMatrix = this.rotationIdentityMatrix;

    this.prevVerticalFrameData = this._createFrameData(verticalContentSize.height, verticalContentSize.width);
    this.prevHorizontalFrameData = this._createFrameData(horizontalContentSize.height, horizontalContentSize.width);
    this.verticalFrameData = this._createFrameData(verticalContentSize.height, verticalContentSize.width);
    this.horizontalFrameData = this._createFrameData(horizontalContentSize.height, horizontalContentSize.width);
    this.effectLayer = this._createFrameData(this.height, this.width)
  }

  _createFrameData(height, width) {
    return Array.from({ length: height }, () => Array(width).fill(0));
  }

  // Clone frame data for caching checks
  _cloneFrameData(frameData) {
    return frameData.map(row => row.slice());
  }

  // Check differences and send data if changed
  updateDisplay(verticalFrameData, horizontalFrameData) {    
    const verticalChanges = this._getFrameDataDifferences(this.prevVerticalFrameData, verticalFrameData);
    const horizontalChanges = this._getFrameDataDifferences(this.prevHorizontalFrameData, horizontalFrameData);

    if (verticalChanges || horizontalChanges) {
      this.send(verticalFrameData, horizontalFrameData);
      this.prevVerticalFrameData = this._cloneFrameData(verticalFrameData);
      this.prevHorizontalFrameData = this._cloneFrameData(horizontalFrameData);
    }
  }

  _getFrameDataDifferences(prevData, currentData) {
    for (let y = 0; y < currentData.length; y++) {
      for (let x = 0; x < currentData[y].length; x++) {
        if (prevData[y][x] !== currentData[y][x]) {
          return true;
        }
      }
    }
    return false;
  }

  _fillPixel(px, py, fill) {
    if (!fill) return; // no fill for interior if fill is false
    const horizontal = (fill === true || fill === 'horizontal');
    const vertical = (fill === true || fill === 'vertical');

    if (horizontal) {
      const [hX, hY] = this._mapToHorizontalSegmentIndices(px, py);
      if (hY >= 0 && hY < this.horizontalContentSize.height && hX >= 0 && hX < this.horizontalContentSize.width) {
        this.horizontalFrameData[hY][hX] = 1;
      }
    }

    if (vertical) {
      const [vX, vY] = this._mapToVerticalSegmentIndices(px, py);
      if (vY >= 0 && vY < this.verticalContentSize.height && vX >= 0 && vX < this.verticalContentSize.width) {
        this.verticalFrameData[vY][vX] = 1;
      }
    }
  }

  clear() {
    this.verticalFrameData = this._createFrameData(this.verticalContentSize.height, this.verticalContentSize.width);
    this.horizontalFrameData = this._createFrameData(this.horizontalContentSize.height, this.horizontalContentSize.width)

    this.clearTransform();
  }
}

Utils.applyMixins(Canvas, [Transform, Path, Shapes, Line, Render, Text, Three, Image, Effects]);

export default Canvas;
