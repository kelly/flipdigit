export default class Path {
  beginPath() {
    this.currentPath = [];
  }

  moveTo(x, y) {
    [x, y] = this._transformPoint(x, y);
    this.currentPath.push({ type: 'moveTo', x, y });
  }

  lineTo(x, y) {
    [x, y] = this._transformPoint(x, y);
    this.currentPath.push({ type: 'lineTo', x, y });
  }

  quadraticCurveTo(cpx, cpy, x, y) {
    [cpx, cpy] = this._transformPoint(cpx, cpy);
    [x, y] = this._transformPoint(x, y);
    this.currentPath.push({ type: 'quadraticCurveTo', cpx, cpy, x, y });
  }

  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    [cp1x, cp1y] = this._transformPoint(cp1x, cp1y);
    [cp2x, cp2y] = this._transformPoint(cp2x, cp2y);
    [x, y] = this._transformPoint(x, y);
    this.currentPath.push({ type: 'bezierCurveTo', cp1x, cp1y, cp2x, cp2y, x, y });
  }

  closePath() {
    if (this.currentPath.length > 0) {
      const firstPoint = this.currentPath.find(cmd => cmd.type === 'moveTo' || cmd.type === 'lineTo');
      if (firstPoint) {
        this.currentPath.push({ type: 'lineTo', x: firstPoint.x, y: firstPoint.y });
      }
    }
  }

  // Stroke just draws the outlines
  stroke(lineWidth = 1) {
    let prevX = null;
    let prevY = null;

    for (const cmd of this.currentPath) {
      if (cmd.type === 'moveTo') {
        prevX = cmd.x;
        prevY = cmd.y;
      } else if (cmd.type === 'lineTo') {
        if (prevX !== null && prevY !== null) {
          this.drawLine(prevX, prevY, cmd.x, cmd.y, lineWidth);
        }
        prevX = cmd.x;
        prevY = cmd.y;
      } else if (cmd.type === 'quadraticCurveTo' || cmd.type === 'bezierCurveTo') {
        // Approximate curves by a line
        if (prevX !== null && prevY !== null) {
          this.drawLine(prevX, prevY, cmd.x, cmd.y, lineWidth);
          prevX = cmd.x;
          prevY = cmd.y;
        }
      }
    }
    this.currentPath = [];
  }

}