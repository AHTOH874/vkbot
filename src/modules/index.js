const wither = require('./wither')
const shedule = require('./shedule')
var modules = {}

modules.getWither = wither.getWither
modules.getShedule = shedule.getShedule
module.exports = modules
