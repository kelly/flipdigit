export default class Three {
  drawLine3D(x0, y0, z0, x1, y1, z1, d = 30, lineWidth = 1, applyRotation = true) {
    let rx0, ry0, rz0, rx1, ry1, rz1;

    if (applyRotation) {
      ({ x: rx0, y: ry0, z: rz0 } = this.applyRotationMatrix({ x: x0, y: y0, z: z0 }));
      ({ x: rx1, y: ry1, z: rz1 } = this.applyRotationMatrix({ x: x1, y: y1, z: z1 }));
    } else {
      [rx0, ry0, rz0] = [x0, y0, z0];
      [rx1, ry1, rz1] = [x1, y1, z1];
    }
  

    const px0 = rx0 * d / (d - rz0) + this.width / 2;
    const py0 = ry0 * d / (d - rz0) + this.height / 2;
  
    const px1 = rx1 * d / (d - rz1) + this.width / 2;
    const py1 = ry1 * d / (d - rz1) + this.height / 2;
  
    this.drawLine(px0, py0, px1, py1, lineWidth);
  }
  

  applyRotationMatrix(vertex, rotationMatrix = null) {
    const { x, y, z } = vertex;
    const matrix = rotationMatrix || this.rotationMatrix;
  
    if (!matrix) {
      throw new Error("Rotation matrix is not set. Call setRotationMatrix first.");
    }
  
    return {
      x: matrix[0][0] * x + matrix[0][1] * y + matrix[0][2] * z,
      y: matrix[1][0] * x + matrix[1][1] * y + matrix[1][2] * z,
      z: matrix[2][0] * x + matrix[2][1] * y + matrix[2][2] * z,
    };
  }

  project3DTo2D(x, y, z, fov, aspect, near = 1, far = 100) {
    if (z < near || z > far) {
      return { x: NaN, y: NaN, z: NaN }; // Mark as invalid
    }
  
    const fovScale = 1 / Math.tan(fov / 2);
  
    const px = (x * fovScale) / z; // Scale by depth (z)
    const py = (y * fovScale) / z;
  
    // Map to screen space
    return {
      x: (px * this.width) / 2 + this.width / 2,  // Center horizontally
      y: (py * this.height) / 2 + this.height / 2, // Center vertically
      z, // Keep z for potential depth sorting
    };
  }

  setRotationMatrix({ x = 0, y = 0, z = 0 } = {}) {
    if (typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number') {
      throw new Error("Invalid input: x, y, and z must be numbers.");
    }
  
    const cosX = Math.cos(x), sinX = Math.sin(x);
    const cosY = Math.cos(y), sinY = Math.sin(y);
    const cosZ = Math.cos(z), sinZ = Math.sin(z);
  
    const rotationX = [
      [1, 0, 0],
      [0, cosX, -sinX],
      [0, sinX, cosX],
    ];
  
    const rotationY = [
      [cosY, 0, sinY],
      [0, 1, 0],
      [-sinY, 0, cosY],
    ];
  
    const rotationZ = [
      [cosZ, -sinZ, 0],
      [sinZ, cosZ, 0],
      [0, 0, 1],
    ];
  
    this.rotationMatrix = this._multiplyMatrices(
      this._multiplyMatrices(rotationZ, rotationY),
      rotationX
    );
  
    return this.rotationMatrix;
  }

  _multiplyMatrices(a, b) {
    const result = Array(3).fill(null).map(() => Array(3).fill(0));
  
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++) {
          result[i][j] += a[i][k] * b[k][j];
        }
      }
    }
  
    return result;
  }
  

  get rotationIdentityMatrix() {
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ]   
  }

  get rotationXMatrix() {
    const angleX = Math.PI / 4; 
    return [
      [1, 0, 0],
      [0, Math.cos(angleX), -Math.sin(angleX)],
      [0, Math.sin(angleX), Math.cos(angleX)],
    ];
  }

  get rotationYMatrix() {
    const angleY = Math.PI / 4; // Example: 45 degrees
    return [
      [Math.cos(angleY), 0, Math.sin(angleY)],
      [0, 1, 0],
      [-Math.sin(angleY), 0, Math.cos(angleY)],
    ];
  }

  get rotationZMatrix() {
    const angleZ = Math.PI / 4; // Example: 45 degrees
    return [
      [Math.cos(angleZ), -Math.sin(angleZ), 0],
      [Math.sin(angleZ), Math.cos(angleZ), 0],
      [0, 0, 1],
    ];
  }

  get rotationIsometricMatrix() {
    return [
      [Math.sqrt(3) / 2, 0, -Math.sqrt(3) / 2],
      [0.5, 1, 0.5],
      [Math.sqrt(3) / 2, 0, Math.sqrt(3) / 2],
    ];
  }

  get rotationXYZMatrix() {
    const angle = Math.PI / 4; // 45 degrees
    return [
      [Math.cos(angle), -Math.sin(angle), 0],
      [Math.sin(angle), Math.cos(angle), 0],
      [0, 0, 1],
    ];
  }
}