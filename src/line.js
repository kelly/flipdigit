export default class Line {
  drawLine(x0, y0, x1, y1, lineWidth = 1) {
    [x0, y0] = this._transformPoint(x0, y0);
    [x1, y1] = this._transformPoint(x1, y1);

    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    let x = x0;
    let y = y0;
    let prevX = x;
    let prevY = y;

    while (true) {
      if (x === x1 && y === y1) break;

      const e2 = 2 * err;
      let movedHorizontally = false;
      let movedVertically = false;
      let firstMove = null;

      if (e2 > -dy) {
        err -= dy;
        x += sx;
        movedHorizontally = true;
        if (!firstMove) firstMove = 'horizontal';
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
        movedVertically = true;
        if (!firstMove) firstMove = 'vertical';
      }

      // If diagonal: choose direction based on slope
      if (movedHorizontally && !movedVertically) {
        this._placeHorizontalSegment(prevX, prevY, x, y, lineWidth);
      } else if (movedVertically && !movedHorizontally) {
        this._placeVerticalSegment(prevX, prevY, x, y, lineWidth);
      } else if (movedHorizontally && movedVertically) {
        // Diagonal step
        if (dx >= dy) {
          // More horizontal, place horizontal only
          this._placeHorizontalSegment(prevX, prevY, x, y, lineWidth);
        } else {
          // More vertical, place vertical only
          this._placeVerticalSegment(prevX, prevY, x, y, lineWidth);
        }
      }

      prevX = x;
      prevY = y;
    }
  }

  _getLineOffsets(lineWidth) {
    const half = Math.floor(lineWidth / 2);
    const offsets = [];
    for (let i = -half; i <= half; i++) {
      offsets.push(i);
    }
    return offsets;
  }

  _placeHorizontalSegment(prevX, prevY, x, y, lineWidth) {
    const segX = Math.min(prevX, x);
    const segY = prevY;
    const [hX, hY] = this._mapToHorizontalSegmentIndices(segX, segY);
    this._drawHorizontalSegment(hX, hY, lineWidth);
  }

  _placeVerticalSegment(prevX, prevY, x, y, lineWidth) {
    const segX = prevX;
    const segY = Math.min(prevY, y);
    const [vX, vY] = this._mapToVerticalSegmentIndices(segX, segY);
    this._drawVerticalSegment(vX, vY, lineWidth);
  }

  _drawHorizontalSegment(hX, hY, lineWidth) {
    const offsets = this._getLineOffsets(lineWidth);
    for (const offset of offsets) {
      const ny = hY + offset;
      if (ny >= 0 && ny < this.horizontalContentSize.height && hX >= 0 && hX < this.horizontalContentSize.width) {
        this.horizontalFrameData[ny][hX] = 1;
      }
    }
  }

  _drawVerticalSegment(vX, vY, lineWidth) {
    const offsets = this._getLineOffsets(lineWidth);
    for (const offset of offsets) {
      const nx = vX + offset;
      if (vY >= 0 && vY < this.verticalContentSize.height && nx >= 0 && nx < this.verticalContentSize.width) {
        this.verticalFrameData[vY][nx] = 1;
      }
    }
  }

  _mapToVerticalSegmentIndices(x, y) {
    const indexX = (x / this.width) * this.verticalContentSize.width;
    let indexY = (y / this.height) * this.verticalContentSize.height;
    indexY = Math.floor(indexY);
    if (indexY < 0) indexY = 0; 
    const vX = Math.floor(indexX);
    return [vX, indexY];
  }

  _mapToHorizontalSegmentIndices(x, y) {
    const indexX = (x / this.width) * this.horizontalContentSize.width;
    const indexY = (y / this.height) * this.horizontalContentSize.height;
    return [Math.floor(indexX), Math.floor(indexY)];
  }

}