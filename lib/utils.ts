exports.generateRandomName = function():string {

  return `${String(Math.round(Math.random() * 1e6))}-${Date.now()}`
}