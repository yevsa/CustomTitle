export function generateIdFromArray(array) {
  if (!Array.isArray(array)) {
    throw new TypeError(`${array} is not array`)
  }
  
  if (!array.length) {
    return 1;
  }
  
  return array.map(el => el.id).sort((a, b) => a.id - b.id).slice(-1)[0] + 1;
}
