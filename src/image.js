import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import fetch from 'node-fetch';
import gifuct from 'gifuct-js';
import isUrl from 'is-url';
const { parseGIF, decompressFrames } = gifuct;

const GIF_ANIMATION_INTERVAL_DEFAULT = 1000 / 60;
const DITHER_METHOD_DEFAULT = 'floyd-steinberg';

// since there are more or less pixels in the vertical and horizontal segments, we need to adjust the aspect ratio 
const HORIZONTAL_ASPECT_RATIO_LANDSCAPE = 12 / 7;
const VERTICAL_ASPECT_RATIO_LANDSCAPE = 8 / 14;
const HORIZONTAL_ASPECT_RATIO_PORTRAIT = 7 / 12;
const VERTICAL_ASPECT_RATIO_PORTRAIT = 14 / 8;

export default class Image {

  async drawImage(resource, dither = DITHER_METHOD_DEFAULT, scale = 1) {
    const buffer = await this._loadResource(resource);
    const image = await loadImage(buffer);
    await this._drawImage(image, dither, scale);
  }

  async playAnimatedGif(resource, dither = DITHER_METHOD_DEFAULT, scale = 1) {
    const buffer = await this._loadResource(resource);
    await this._playGif(buffer, dither, scale);
  }

  async _loadResource(resource) {
    if (isUrl(resource)) {
      const response = await fetch(resource);
      return await response.buffer();
    } else {
      return fs.readFileSync(resource);
    }
  }

  async _drawImage(image, dither, scale = 1) {
    const { horizontalBinary, verticalBinary } =  await this._scaleImage(image, dither, scale);
    this._writeBinaryFrameToData(horizontalBinary, this.horizontalFrameData);
    this._writeBinaryFrameToData(verticalBinary, this.verticalFrameData);
  }

  async _playGif(buffer, dither, scale) {
    let frames = await this._gifFramesFromBuffer(buffer);
    await this._drawGifFrames(frames, dither, scale);
    this.startGifAnimation();
  }

  startGifAnimation(interval = GIF_ANIMATION_INTERVAL_DEFAULT, shouldLoop = true) {
    let currentFrame = 0;
    const totalFrames = this.verticalFramesData.length;
    const render = () => {
      this.render(this.verticalFramesData[currentFrame], this.horizontalFramesData[currentFrame]);
      currentFrame = (currentFrame + 1) % totalFrames;

      if (shouldLoop && currentFrame == totalFrames - 1) {
        currentFrame = 0;
      }
      if (!shouldLoop && currentFrame == totalFrames - 1) {
        this.stopGifAnimation();
      }
    };

    this.animate(render, interval);
  }

  async _gifFramesFromBuffer(buffer) {
    const gif = parseGIF(buffer);
    let frames = decompressFrames(gif, true); 
    frames = frames.filter(f => f.delay); 

    const canvases = [];
    for (const frame of frames) {
      const canvas = createCanvas(frame.dims.width, frame.dims.height);
      const ctx = canvas.getContext('2d');
      const imageData = ctx.createImageData(frame.dims.width, frame.dims.height);
      imageData.data.set(frame.patch);
      ctx.putImageData(imageData, 0, 0);
      canvases.push(canvas);
    }

    return canvases;
  }

  async _drawGifFrames(frames, dither, scale) {
    this.horizontalFramesData = [];
    this.verticalFramesData = [];
    
    for (const frameCanvas of frames) {
      const { verticalBinary, horizontalBinary } = await this._scaleImage(frameCanvas, dither, scale);
      const horizontalFrameData = this._createFrameData(this.horizontalContentSize.height, this.horizontalContentSize.width);
      const verticalFrameData = this._createFrameData(this.verticalContentSize.height, this.verticalContentSize.width);
      this._writeBinaryFrameToData(horizontalBinary, horizontalFrameData);
      this._writeBinaryFrameToData(verticalBinary, verticalFrameData);
      this.horizontalFramesData.push(horizontalFrameData);
      this.verticalFramesData.push(verticalFrameData);
    }
  }

  async _scaleImage(image, dither, userScale = 1) {
    userScale = Math.max(0, userScale);
    const { width: hW, height: hH } = this.horizontalContentSize;
    const { width: vW, height: vH } = this.verticalContentSize;
    const imgW = image.width;
    const imgH = image.height;
    const { finalW, finalH, isLandscape } = this._getScaledDimensions(imgW, imgH, userScale);
    const finalCanvas = this._resizeImage(image, finalW, finalH);
    const scaleY = imgH / imgW;
    const scaleX = imgW / imgH;
    let horizontalBinary, verticalBinary;
    const hA = isLandscape ? HORIZONTAL_ASPECT_RATIO_LANDSCAPE : HORIZONTAL_ASPECT_RATIO_PORTRAIT;
    const vA = isLandscape ? VERTICAL_ASPECT_RATIO_LANDSCAPE : VERTICAL_ASPECT_RATIO_PORTRAIT;

    if (isLandscape) {
      horizontalBinary = this._processImage(finalCanvas, hW, Math.round(hW * scaleY * hA), dither);
      verticalBinary = this._processImage(finalCanvas, vW, Math.round(vW * scaleY * vA), dither);
    } else {
      horizontalBinary = this._processImage(finalCanvas, Math.round(hH * scaleX * hA), hH, dither);
      verticalBinary = this._processImage(finalCanvas, Math.round(vH * scaleX * vA), vH, dither);
    }

    return {
      horizontalBinary,
      verticalBinary,
    }
  }

  _getScaledDimensions(imgW, imgH, userScale) {
    const fitScale = (imgW / imgH > this.width / this.height) ? this.width / imgW : this.height / imgH;
    const isLandscape = imgW >= imgH;
    const finalScale = fitScale * userScale;
    const finalW = Math.max(1, Math.round(imgW * finalScale));
    const finalH = Math.max(1, Math.round(imgH * finalScale));
    return { finalW, finalH, isLandscape };
  }

  _resizeImage(image, targetWidth, targetHeight) {
    const canvas = createCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
    return canvas;
  }

  _processImage(imageOrCanvas, targetWidth, targetHeight, dither) {
    const canvas = createCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(imageOrCanvas, 0, 0, targetWidth, targetHeight);
    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const grayscale = this._convertToGrayscale(imageData.data, targetWidth, targetHeight);

    switch (dither) {
      case 'floyd-steinberg':
        this._applyFloydSteinbergDithering(grayscale, targetWidth, targetHeight);
        break;
      case 'bayer':
        this._applyBayerDithering(grayscale, targetWidth, targetHeight);
        break;
    }

    const binaryMatrix = new Array(targetHeight);
    for (let y = 0; y < targetHeight; y++) {
      const row = new Array(targetWidth);
      for (let x = 0; x < targetWidth; x++) {
        row[x] = (grayscale[y * targetWidth + x] > 0.5) ? 1 : 0;
      }
      binaryMatrix[y] = row;
    }
    return binaryMatrix;
  }

  _convertToGrayscale(data, width, height) {
    const length = width * height;
    const grayscale = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      grayscale[i] = (r + g + b) / (3 * 255);
    }
    return grayscale;
  }

  _applyFloydSteinbergDithering(grayscale, width, height) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        const oldPixel = grayscale[i];
        const newPixel = oldPixel > 0.5 ? 1 : 0;
        grayscale[i] = newPixel;
        const error = oldPixel - newPixel;
        if (x + 1 < width) grayscale[i + 1] += error * (7 / 16);
        if (y + 1 < height) {
          if (x > 0) grayscale[i + width - 1] += error * (3 / 16);
          grayscale[i + width] += error * (5 / 16);
          if (x + 1 < width) grayscale[i + width + 1] += error * (1 / 16);
        }
      }
    }
  }

  _applyBayerDithering(grayscale, width, height) {
    const bayerMatrix = [
      [0, 8, 2, 10],
      [12,4,14,6],
      [3,11,1,9],
      [15,7,13,5],
    ];
    const size = 4;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const threshold = bayerMatrix[y % size][x % size] / 16;
        const i = y * width + x;
        grayscale[i] = grayscale[i] > threshold ? 1 : 0;
      }
    }
  }

  _writeBinaryFrameToData(binaryFrame, frameData) {
    const frameHeight = frameData.length;
    const frameWidth = frameData[0].length;
    const binaryHeight = binaryFrame.length;
    const binaryWidth = binaryFrame[0].length;
    const { xOffset, yOffset } = this._calculateOffsets(frameWidth, frameHeight, binaryWidth, binaryHeight);
    for (let y = 0; y < binaryHeight; y++) {
      for (let x = 0; x < binaryWidth; x++) {
        const frameX = x + xOffset;
        const frameY = y + yOffset;
        if (frameX >= 0 && frameX < frameWidth && frameY >= 0 && frameY < frameHeight) {
          frameData[frameY][frameX] = binaryFrame[y][x];
        }
      }
    }
  }

  _calculateOffsets(frameWidth, frameHeight, contentWidth, contentHeight) {
    const xOffset = Math.floor((frameWidth - contentWidth) / 2);
    const yOffset = Math.floor((frameHeight - contentHeight) / 2);
    return { xOffset, yOffset };
  }

}
