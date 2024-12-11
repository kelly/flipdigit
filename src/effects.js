function generateGaussianNoise(mean = 0, stddev = 1) {
  let u1 = Math.random();
  let u2 = Math.random();
  let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stddev + mean;
}

export default class Effects {
  addEffect(effectFn) {
    this.effects.push(effectFn);
  }

  clearEffects() {
    this.effects = [];
    this.effectLayer = this.effectLayer.map((row) => row.map(() => 0));
  }

  _applyEffectsToFrame(frameData, effectLayer) {
    return frameData.map((row, y) =>
      row.map((value, x) => Math.min(1, value + effectLayer[y][x]))
    );
  }

  static decayEffect = (effectLayer) => {
    const decayRate = 0.9;
    for (let y = 0; y < effectLayer.length; y++) {
      for (let x = 0; x < effectLayer[y].length; x++) {
        effectLayer[y][x] *= decayRate;
      }
    }
  };

  static rainEffect = (effectLayer) => {
    const rainProbability = 0.1;
    for (let x = 0; x < effectLayer[0].length; x++) {
      if (Math.random() < rainProbability) {
        effectLayer[0][x] = 1; // Add rain at the top row
      }
    }

    for (let y = effectLayer.length - 1; y > 0; y--) {
      for (let x = 0; x < effectLayer[y].length; x++) {
        effectLayer[y][x] = effectLayer[y - 1][x];
      }
    }

    // Clear the top row
    effectLayer[0].fill(0);
  };

  // Waves: Add a sine wave effect to the layer
  static wavesEffect = (effectLayer) => {
    const time = Date.now() / 1000; // Time in seconds
    const frequency = 0.1;
    const amplitude = 0.5;

    for (let y = 0; y < effectLayer.length; y++) {
      for (let x = 0; x < effectLayer[y].length; x++) {
        effectLayer[y][x] = amplitude * Math.sin(frequency * x + time);
      }
    }
  };

  // Explode: Move pixels outward from the center
  static explodeEffect = (effectLayer) => {
    const centerX = Math.floor(effectLayer[0].length / 2);
    const centerY = Math.floor(effectLayer.length / 2);
    const velocity = 0.1;

    for (let y = 0; y < effectLayer.length; y++) {
      for (let x = 0; x < effectLayer[y].length; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const offset = Math.round(velocity * distance);

        if (y + offset < effectLayer.length && x + offset < effectLayer[y].length) {
          effectLayer[y + offset][x + offset] = effectLayer[y][x];
          effectLayer[y][x] = 0;
        }
      }
    }
  };

  static twinkleEffect = (effectLayer) => {
    const twinkleRate = 0.05; // Probability of a pixel twinkling
    for (let y = 0; y < effectLayer.length; y++) {
      for (let x = 0; x < effectLayer[y].length; x++) {
        effectLayer[y][x] = Math.random() < twinkleRate ? Math.random() : effectLayer[y][x];
      }
    }
  };

  static scrollEffect = (effectLayer) => {
    for (let y = 0; y < effectLayer.length; y++) {
      const last = effectLayer[y].pop(); // Remove the last element
      effectLayer[y].unshift(last); // Add it to the beginning
    }
  };

  static rippleEffect = (effectLayer) => {
    const time = Date.now() / 500; // Time for animation
    const centerX = Math.floor(effectLayer[0].length / 2);
    const centerY = Math.floor(effectLayer.length / 2);
    const frequency = 0.2;
  
    for (let y = 0; y < effectLayer.length; y++) {
      for (let x = 0; x < effectLayer[y].length; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        effectLayer[y][x] = 0.5 + 0.5 * Math.sin(distance * frequency - time);
      }
    }
  };

  static spiralEffect = (effectLayer) => {
    const time = Date.now() / 1000; // Time for animation
    const centerX = Math.floor(effectLayer[0].length / 2);
    const centerY = Math.floor(effectLayer.length / 2);
  
    for (let y = 0; y < effectLayer.length; y++) {
      for (let x = 0; x < effectLayer[y].length; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const angle = Math.atan2(dy, dx) + time;
        const distance = Math.sqrt(dx * dx + dy * dy);
        effectLayer[y][x] = Math.sin(distance + angle) > 0 ? 1 : 0;
      }
    }
  };

  static fireEffect = (effectLayer) => {
    for (let y = effectLayer.length - 1; y > 0; y--) {
      for (let x = 0; x < effectLayer[y].length; x++) {
        effectLayer[y][x] = (effectLayer[y - 1][x] + effectLayer[y][x]) * 0.5;
      }
    }
    effectLayer[0] = effectLayer[0].map(() => (Math.random() < 0.2 ? 1 : 0));
  };

  static noiseEffect = (effectLayer, mean = 0, stddev = 0.1) => {
    for (let y = 0; y < effectLayer.length; y++) {
      for (let x = 0; x < effectLayer[y].length; x++) {
        // Add Gaussian noise to each pixel
        const noise = generateGaussianNoise(mean, stddev);
        effectLayer[y][x] = Math.max(0, Math.min(1, effectLayer[y][x] + noise));
      }
    }
  };

  static zoomEffect = (effectLayer) => {
    const centerX = Math.floor(effectLayer[0].length / 2);
    const centerY = Math.floor(effectLayer.length / 2);
    const zoomFactor = 1 + Math.sin(Date.now() / 1000) * 0.2;
  
    const zoomed = effectLayer.map((row, y) =>
      row.map((value, x) => {
        const dx = Math.round((x - centerX) / zoomFactor + centerX);
        const dy = Math.round((y - centerY) / zoomFactor + centerY);
        return effectLayer[dy]?.[dx] || 0;
      })
    );
  
    for (let y = 0; y < effectLayer.length; y++) {
      for (let x = 0; x < effectLayer[y].length; x++) {
        effectLayer[y][x] = zoomed[y][x];
      }
    }
  };

  static glowEffect = (effectLayer) => {
    const glowLayer = effectLayer.map((row) => row.slice());
  
    for (let y = 1; y < effectLayer.length - 1; y++) {
      for (let x = 1; x < effectLayer[y].length - 1; x++) {
        if (effectLayer[y][x] > 0) {
          glowLayer[y - 1][x] = 1;
          glowLayer[y + 1][x] = 1;
          glowLayer[y][x - 1] = 1;
          glowLayer[y][x + 1] = 1;
        }
      }
    }
  
    for (let y = 0; y < effectLayer.length; y++) {
      for (let x = 0; x < effectLayer[y].length; x++) {
        effectLayer[y][x] = Math.max(effectLayer[y][x], glowLayer[y][x]);
      }
    }
  };
  
}