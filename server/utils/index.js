const fs = require('fs')

const fsExistsSync = path => {
    try {
        fs.accessSync(path, fs.F_OK)
    } catch (e) {
        return false
    }

    return true
}

exports.fsExistsSync = fsExistsSync

exports.strlen = str => {
    let charCode = -1,
        len = str.length,
        realLength = 0

    for (let i = 0; i < len; i++) {
        charCode = str.charCodeAt(i)
        if (charCode >= 0 && charCode <= 128) {
            realLength += 1
        } else {
            realLength += 2
        }
    }

    return realLength
}

exports.createSecret = () => {
    if (!fsExistsSync('./server/conifg/secret.js')) {
        const secretServer = Math.random() * 1000000
        const secretClient = Math.random() * 1000000

        const secret = `
            exports.secretServer = '${secretServer}'
            exports.secretClient = '${secretClient}'
        `
        fs.writeFileSync('./server/config/secret.js', secret)
    }
}