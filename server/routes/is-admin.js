const jwt = require('jsonwebtoken')
const config = require('../config')
const secret = config.secretServer

module.exports = (req, res, next) => {
    const token = req.cookies.b_user,
        userid = req.cookies.b_userid,
        username = req.cookies.b_username

    if (token) {
        jwt.verify(token, secret, function(err, decoded) {
            if (!err && decoded && decoded.id.toString() === userid.toString() && decoded.username === username) {
                req.decoded = decoded
                next()
            } else {
                res.cookie('b_user', '', { maxAge: 0 })
                res.cookie('b_userid', '', { maxAge: 0 })
                res.cookie('b_username', '', { maxAge: 0 })
                return res.json({
                    code: -500,
                    message: 'Login failed!!!',
                    data: ''
                })
            }
        })
    } else {
        return res.json({
            code: -500,
            message: 'Please login first!!!',
            data: ''
        })
    }
}