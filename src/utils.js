function applyMixins(targetClass, mixins) {
  mixins.forEach((mixin) => {
    Object.getOwnPropertyNames(mixin.prototype).forEach((name) => {
      if (name !== 'constructor') {
        targetClass.prototype[name] = mixin.prototype[name];
      }
    });
  });
}

export default { applyMixins };