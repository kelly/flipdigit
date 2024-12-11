export default class Shapes {
  // Shape drawing methods
  drawRect(x, y, width, height, fill = false, lineWidth = 1) {
    // Draw rectangle outline
    this.drawLine(x, y, x + width, y, lineWidth);               // top
    this.drawLine(x + width, y, x + width, y + height, lineWidth); // right
    this.drawLine(x + width, y + height, x, y + height, lineWidth); // bottom
    this.drawLine(x, y + height, x, y, lineWidth);              // left

    if (fill) {
      for (let py = y + 1; py < y + height - 1; py++) {
        for (let px = x + 1; px < x + width - 1; px++) {
          this._fillPixel(px, py, fill);
        }
      }
    }
  }

  drawCircle(cx, cy, radius, fill = false, lineWidth = 1) {
    [cx, cy] = this._transformPoint(cx, cy);
    const steps = Math.ceil(2 * Math.PI * radius);
    let prevX = cx + radius;
    let prevY = cy;

    for (let i = 1; i <= steps; i++) {
      const theta = (i / steps) * 2 * Math.PI;
      const x = cx + radius * Math.cos(theta);
      const y = cy + radius * Math.sin(theta);
      this.drawLine(prevX, prevY, x, y, lineWidth);
      prevX = x;
      prevY = y;
    }

    if (fill) {
      const minX = Math.floor(cx - radius);
      const maxX = Math.floor(cx + radius);
      const minY = Math.floor(cy - radius);
      const maxY = Math.floor(cy + radius);

      for (let py = minY; py <= maxY; py++) {
        for (let px = minX; px <= maxX; px++) {
          const dx = px - cx;
          const dy = py - cy;
          if (dx * dx + dy * dy <= radius * radius) {
            this._fillPixel(px, py, fill);
          }
        }
      }
    }
  }

  drawArc(cx, cy, radius, startAngle, endAngle, lineWidth = 1) {
    [cx, cy] = this._transformPoint(cx, cy);
    const angleDiff = endAngle - startAngle;
    const steps = Math.ceil(radius * Math.abs(angleDiff));
    let prevX = cx + radius * Math.cos(startAngle);
    let prevY = cy + radius * Math.sin(startAngle);

    for (let i = 1; i <= steps; i++) {
      const angle = startAngle + (i / steps) * angleDiff;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      this.drawLine(prevX, prevY, x, y, lineWidth);
      prevX = x;
      prevY = y;
    }
  }

  drawEllipse(cx, cy, rx, ry, fill = false, lineWidth = 1) {
    [cx, cy] = this._transformPoint(cx, cy);
    const steps = Math.ceil(2 * Math.PI * Math.max(rx, ry));
    let prevX = cx + rx;
    let prevY = cy;

    for (let i = 1; i <= steps; i++) {
      const theta = (i / steps) * 2 * Math.PI;
      const x = cx + rx * Math.cos(theta);
      const y = cy + ry * Math.sin(theta);
      this.drawLine(prevX, prevY, x, y, lineWidth);
      prevX = x;
      prevY = y;
    }

    if (fill) {
      const minX = Math.floor(cx - rx);
      const maxX = Math.floor(cx + rx);
      const minY = Math.floor(cy - ry);
      const maxY = Math.floor(cy + ry);

      for (let py = minY; py <= maxY; py++) {
        for (let px = minX; px <= maxX; px++) {
          const dx = (px - cx) / rx;
          const dy = (py - cy) / ry;
          if ((dx * dx + dy * dy) <= 1) {
            this._fillPixel(px, py, fill);
          }
        }
      }
    }
  }

  drawPolyline(points, fill = false, lineWidth = 1) {
    if (points.length === 0) return;
  
    // Draw the outline of the polyline
    let [prevX, prevY] = points[0];
    [prevX, prevY] = this._transformPoint(prevX, prevY);
  
    for (let i = 1; i < points.length; i++) {
      let [x, y] = points[i];
      [x, y] = this._transformPoint(x, y);
      this.drawLine(prevX, prevY, x, y, lineWidth);
      prevX = x;
      prevY = y;
    }
  
    if (fill) {
      const [startX, startY] = this._transformPoint(points[0][0], points[0][1]);
      this.drawLine(prevX, prevY, startX, startY, lineWidth);
        this._fillPolygon(points);
    }
  }

  _fillPolygon(points) {
    const transformedPoints = points.map(([x, y]) => this._transformPoint(x, y));
  
    const sortedPoints = transformedPoints.slice().sort((a, b) => a[1] - b[1]);
    const minY = Math.floor(sortedPoints[0][1]);
    const maxY = Math.ceil(sortedPoints[sortedPoints.length - 1][1]);
  
    // Loop over scanlines from minY to maxY
    for (let y = minY; y <= maxY; y++) {
      const intersections = [];
  
      // Find intersections with the edges of the polygon
      for (let i = 0; i < transformedPoints.length; i++) {
        const [x1, y1] = transformedPoints[i];
        const [x2, y2] = transformedPoints[(i + 1) % transformedPoints.length];
  
        // Check if the scanline intersects the edge
        if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
          const intersectionX = x1 + ((y - y1) * (x2 - x1)) / (y2 - y1);
          intersections.push(intersectionX);
        }
      }
  
      // Sort intersections by X coordinate
      intersections.sort((a, b) => a - b);
  
      // Fill pixels between pairs of intersections
      for (let i = 0; i < intersections.length; i += 2) {
        const startX = Math.ceil(intersections[i]);
        const endX = Math.floor(intersections[i + 1]);
  
        for (let x = startX; x <= endX; x++) {
          this._activatePixel(x, y); // Fill pixel
        }
      }
    }
  }
  

  drawSvgPolyline(pointsString, fill = false, lineWidth = 1) {
    const points = pointsString
      .trim()
      .split(/\s+/)
      .map(pair => {
        const [x, y] = pair.split(',').map(Number);
        return [x, y];
      });
    this.drawPolyline(points, fill, lineWidth);
  }


  // these use paths
  drawStar(centerX, centerY, innerRadius, outerRadius, points, lineWidth) {
    this.beginPath();
  
    const angleStep = (Math.PI * 2) / points;
  
    this.moveTo(
      centerX + outerRadius * Math.cos(0),
      centerY + outerRadius * Math.sin(0)
    );
  
    for (let i = 1; i <= points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = i * angleStep / 2;
  
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
  
      this.lineTo(x, y);
    }
  
    this.closePath();
    this.stroke(false, lineWidth);
  }
  
  drawPolygon(vertices, lineWidth) {
    this.beginPath();
    this.moveTo(vertices[0].x, vertices[0].y);
  
    for (let i = 1; i < vertices.length; i++) {
      this.lineTo(vertices[i].x, vertices[i].y);
    }
  
    this.closePath();
    this.stroke(false, lineWidth);
  }

  clearRect(x, y, width, height) {
    const [vStartX, vStartY] = this._mapToVerticalSegmentIndices(x, y);
    const [vEndX, vEndY] = this._mapToVerticalSegmentIndices(x + width, y + height);

    const [hStartX, hStartY] = this._mapToHorizontalSegmentIndices(x, y);
    const [hEndX, hEndY] = this._mapToHorizontalSegmentIndices(x + width, y + height);

    for (let i = Math.max(0, vStartY); i <= Math.min(this.verticalContentSize.height - 1, vEndY); i++) {
      for (let j = Math.max(0, vStartX); j <= Math.min(this.verticalContentSize.width - 1, vEndX); j++) {
        this.verticalFrameData[i][j] = 0;
      }
    }

    for (let i = Math.max(0, hStartY); i <= Math.min(this.horizontalContentSize.height - 1, hEndY); i++) {
      for (let j = Math.max(0, hStartX); j <= Math.min(this.horizontalContentSize.width - 1, hEndX); j++) {
        this.horizontalFrameData[i][j] = 0;
      }
    }
  }
}