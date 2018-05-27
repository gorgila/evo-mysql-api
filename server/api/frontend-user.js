const md5 = require('md5')
const moment = require('moment')
const jwt = require('jsonwebtoken')

const mysql = require('../mysql')
const tableName = 'users'

const config = require('../config')
const md5Pre = config.md5Pre
const secret = config.secretClient

const strlen = require('../utils').strlen

const general = require('./general')
const list = general.list
const modify = general.modify
const deletes = general.deletes
const recover = general.recover

exports.insert = (req, res) => {
    let email = req.body.email,
        username = req.body.username,
        password = req.body.password

    if (!username || !password || !email) {
        res.json({
            code: -200,
            message: 'Please fill in all requires!!!'
        })
    } else if (strlen(username) < 4) {
        res.json({
            code: -200,
            message: 'Username at least has 4 characters!!!'
        })
    } else if (strlen(password) < 8) {
        res.json({
            code: -200,
            message: 'Password at least has 8 characters!!!'
        })
    } else {
        const checkExistSQL = `SELECT * FROM ${tableName} WHERE username='${username}';`
        mysql.querySQL(checkExistSQL).then(result => {
            if (result.length) {
                res.json({
                    code: -200,
                    message: 'This username already exists!!!'
                })
            } else {
                const insertUserSQL = `INSERT INTO ${tableName} (username, email, password, create_date, update_date, is_delete, timestamp) VALUES (
                    '${username}', 
                    '${email}', 
                    '${md5(md5Pre + password)}',
                    '${moment().format('YYYY-MM-DD HH:mm:ss')}', 
                    '${moment().format('YYYY-MM-DD HH:mm:ss')}', 
                    0, 
                    '${moment().format('X')}');`

                return mysql.querySQL(insertUserSQL).then(() => {
                    res.json({
                        code: 200,
                        message: 'Register successfully!!!',
                        data: 'success'
                    })
                }).catch(err => {
                    res.json({
                        code: -200,
                        message: err.sqlMessage
                    })
                })
            }
        }).catch(err => {
            res.json({
                code: -200,
                message: err.sqlMessage
            })
        })
    }
}

exports.login = (req, res) => {
    let json = {},
        username = req.body.username,
        password = req.body.password

    if (username === '' || password === '') {
        json = {
            code: -200,
            message: 'Please enter username and password!!!'
        }
        res.json(json)
    }

    const checkExistSQL = `SELECT * FROM ${tableName} WHERE username='${username}' and password='${md5(md5Pre + password)}' and is_delete=0;`

    mysql.querySQL(checkExistSQL).then(result => {
        if (result.length) {
            let id = result[0].id
            let remember_me = 2592000000
            username = encodeURI(username)

            let token = jwt.sign({ id, username }, secret, { expiresIn: 60 * 60 * 24 * 30 })
            res.cookie('user', token, { maxAge: remember_me })
            res.cookie('userid', id, { maxAge: remember_me })
            res.cookie('username', username, { maxAge: remember_me })

            json = {
                code: 200,
                message: 'Login successfully!!!',
                data: token
            }
        } else {
            json = {
                code: -200,
                message: 'Username or password is not right!!!'
            }
        }
        res.json(json)
    }).catch(err => {
        res.json({
            code: -200,
            message: err.sqlMessage
        })
    })
}

exports.logout = (req, res) => {
    res.cookie('user', '', { maxAge: -1 })
    res.cookie('userid', '', { maxAge: -1 })
    res.cookie('username', '', { maxAge: -1 })

    res.json({
        code: 200,
        message: 'Logout successfully!!!',
        data: ''
    })
}

exports.getList = (req, res) => {
    list(req, res, tableName)
}

exports.deletes = (req, res) => {
    deletes(req, res, tableName)
}

exports.recover = (req, res) => {
    recover(req, res, tableName)
}

exports.getItem = (req, res) => {
    let json, userid = req.query.id || req.cookies.userid
    userid = parseInt(userid)

    const selectSQL = `SELECT * FROM ${tableName} WHERE id=${userid} and is_delete=0;`
    mysql.querySQL(selectSQL).then(rows => {
        if (rows.length) {
            json = {
                code: 200,
                data: rows[0]
            }
        } else {
            json = {
                code: -200,
                message: 'Please login first, or data has error!!!'
            }
        }
        res.json(json)
    }).catch(err => {
        res.json({
            code: -200,
            message: err.sqlMessage
        })
    })
}

exports.modify = (req, res) => {
    let id = req.body.id,
        email = req.body.email,
        username = req.body.username,
        password = req.body.password

    let data = {
        email,
        username,
        update_date: moment().format('YYYY-MM-DD HH:mm:ss')
    }

    if (password) data.password = md5(md5Pre + password)
    modify(res, tableName, id, data)
}

exports.account = (req, res) => {
    let email = req.body.email,
        username = req.body.username,
        userid = req.body.id || req.cookies.userid

    userid = parseInt(userid)

    if (strlen(username) < 4) {
        res.json({
            code: -200,
            message: 'Username at least has 4 characters!!!'
        })
    } else {
        if (userid) {
            const selectSQL = `SELECT * FROM ${tableName} WHERE id=${userid} and is_delete=0;`
            mysql.querySQL(selectSQL).then(rows => {
                if (rows.length) {
                    const updateSQL = `UPDATE ${tableName} SET email='${email}', username='${username}' WHERE id=${userid};`
                    mysql.querySQL(updateSQL).then(() => {
                        res.json({
                            code: 200,
                            message: 'Update successfully!!!',
                            data: 'success'
                        })
                    }).catch(err => {
                        res.json({
                            code: -200,
                            message: err.sqlMessage
                        })
                    })
                } else {
                    res.json({
                        code: -200,
                        message: 'Data error!!!'
                    })
                }
            })
        } else {
            res.json({
                code: -200,
                message: 'Do not have authority!!!'
            })
        }
    }
}

exports.password = (req, res) => {
    let old_password = req.body.old_password,
        password = req.body.password,
        userid = req.body.id || req.cookies.userid

    userid = parseInt(userid)

    if (strlen(password) < 8) {
        res.json({
            code: -200,
            message: 'Password at least has 8 characters!!!'
        })
    } else {
        if (userid) {
            const selectSQL = `SELECT * FROM ${tableName} WHERE id=${userid} and password='${md5(md5Pre + old_password)}' and is_delete=0;`
            mysql.querySQL(selectSQL).then(rows => {
                if (rows.length) {
                    const updateUserSQL = `UPDATE ${tableName} SET password='${md5(md5Pre + password)}' WHERE id=${userid};`
                    mysql.querySQL(updateUserSQL).then(() => {
                        res.json({
                            code: 200,
                            message: 'Update password successfully!!!',
                            data: 'success'
                        })
                    }).catch(err => {
                        res.json({
                            code: -200,
                            message: err.sqlMessage
                        })
                    })
                } else {
                    res.json({
                        code: -200,
                        message: 'Old password is wrong!!!'
                    })
                }
            })
        } else {
            res.json({
                code: -200,
                message: 'Do not have authority!!!'
            })
        }
    }
}