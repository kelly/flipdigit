import font6x7 from '../assets/fonts/font6x7.js'

export default class Text {
  drawText(text, x, y, scale = 1) {
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      this._drawChar(char, x, y, scale);
      x += (3 * scale) + scale;
    }
  }

  _drawChar(char, x, y, scale) {
    const glyph = font6x7[char.toUpperCase()];
    if (!glyph) return;

    for (let row = 0; row < glyph.length; row++) {
      for (let col = 0; col < glyph[row].length; col++) {
        if (glyph[row][col]) {
          for (let sy = 0; sy < scale; sy++) {
            for (let sx = 0; sx < scale; sx++) {
              const px = x + col * scale + sx;
              const py = y + row * scale + sy;
              const [hX, hY] = this._mapToHorizontalSegmentIndices(px, py);
              if (hY >= 0 && hY < this.horizontalContentSize.height && hX >= 0 && hX < this.horizontalContentSize.width) {
                this.horizontalFrameData[hY][hX] = 1;
              }
            }
          }
        }
      }
    }
  }

  drawImage(imageData, x, y) {
    for (let row = 0; row < imageData.length; row++) {
      for (let col = 0; col < imageData[row].length; col++) {
        if (imageData[row][col]) {
          const px = x + col;
          const py = y + row;
          const [hX, hY] = this._mapToHorizontalSegmentIndices(px, py);
          if (hY >= 0 && hY < this.horizontalContentSize.height && hX >= 0 && hX < this.horizontalContentSize.width) {
            this.horizontalFrameData[hY][hX] = 1;
          }
        }
      }
    }
  }
}

