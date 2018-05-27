require('../utils').createSecret()
const secret = require('./secret.js')

exports.md5Pre = "!@#$%(*&^)"
exports.secretServer = secret.secretServer
exports.secretClient = secret.secretServer