export default class Transform {
  saveTransform() {
    const m = this.transformStack[this.transformStack.length - 1].slice();
    this.transformStack.push(m);
  }

  restoreTransform() {
    if (this.transformStack.length > 1) {
      this.transformStack.pop();
    }
  }

  translate(dx, dy) {
    const m = this.transformStack[this.transformStack.length - 1];
    m[4] += dx;
    m[5] += dy;
  }

  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const m = this.transformStack[this.transformStack.length - 1];
    const [a, b, c, d] = m;

    m[0] = a * cos + c * sin;
    m[1] = b * cos + d * sin;
    m[2] = a * -sin + c * cos;
    m[3] = b * -sin + d * cos;
  }

  scale(sx, sy) {
    const m = this.transformStack[this.transformStack.length - 1];
    m[0] *= sx;
    m[1] *= sx;
    m[2] *= sy;
    m[3] *= sy;
  }

  _transformPoint(x, y) {
    const m = this.transformStack[this.transformStack.length - 1];
    const tx = m[0] * x + m[2] * y + m[4];
    const ty = m[1] * x + m[3] * y + m[5];
    return [tx, ty];
  }

  clearTransform() {
    this.transformStack = [this.transformIdentityMatrix];
  }

  get transformIdentityMatrix() {
    return [1, 0, 0, 1, 0, 0];
  }
}