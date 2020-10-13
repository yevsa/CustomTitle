class Param {
  constructor(optionsOrText, priority = 1, values) {
    const { enabled = true, text } = optionsOrText;
    
    this.enabled = !!enabled;
    this.values = values?.reduce((obj, pair) => {
      obj[pair[0]] = pair[1];
    }, {}) ?? {};
  }
}
