const jwt = require('jsonwebtoken')
const config = require('../config')
const secret = config.secretClient

module.exports = (req, res, next) => {
    const token = req.cookies.user,
        userid = req.cookies.userid,
        username = req.cookies.username

    if (token) {
        jwt.verify(token, secret, function(err, decoded) {
            if (!err && decoded && decoded.id.toString() === userid.toString() && decoded.username === username) {
                req.decoded = decoded
                next()
            } else {
                res.cookie('user', '', { maxAge: 0 })
                res.cookie('userid', '', { maxAge: 0 })
                res.cookie('username', '', { maxAge: 0 })

                return res.json({
                    code: -400,
                    message: 'Login failed!!!',
                    data: ''
                })
            }
        })
    } else {
        return res.json({
            code: -400,
            message: 'Please login first!!!',
            data: ''
        })
    }
}