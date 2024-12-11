function requestAnimationFrame(callback) {
  setTimeout(callback, 1000 / 60); 
}

export default class Render {
  animate(callback) {
    const loop = () => {
      if (typeof callback === 'function') callback();
      this.render();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  stopAnimation() {
    if (this.animationFrameId !== null) {
      clearTimeout(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  render(verticalFrameData = this.verticalFrameData, horizontalFrameData = this.horizontalFrameData) {
    for (const effect of this.effects) {
      effect(this.effectLayer);
    }

    const verticalData = this._applyEffectsToFrame(verticalFrameData, this.effectLayer);
    const horizontalData = this._applyEffectsToFrame(horizontalFrameData, this.effectLayer);

    this.updateDisplay(verticalData, horizontalData);
  }

  startRenderLoop(interval) {
    if (this.renderIntervalId) return;
    this.renderIntervalId = setInterval(() => {
      this.render();
    }, interval);
  }

  stopRenderLoop() {
    if (this.renderIntervalId !== null) {
      clearInterval(this.renderIntervalId);
      this.renderIntervalId = null;
    }
  }
}