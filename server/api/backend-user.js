const md5 = require('md5')
const fs = require('fs')
const moment = require('moment')
const jwt = require('jsonwebtoken')

const mysql = require('../mysql')
const fsExistsSync = require('../utils').fsExistsSync
const config = require('../config')
const md5Pre = config.md5Pre
const secret = config.secretServer

const tableName = 'admins'
const general = require('./general')
const list = general.list
const item = general.item
const modify = general.modify
const deletes = general.deletes
const recover = general.recover

exports.insert = (req, res, next) => {
    let email = req.body.email,
        username = req.body.username,
        password = req.body.password

    if (fsExistsSync('./admin.lock')) {
        return res.render('admin-add.html', { message: 'Please delete admin.lock first!!!' })
    }

    if (!username || !password || !email) {
        return res.render('admin-add.html', { message: 'Please complete all requires first!!!' })
    }

    const checkExistSQL = `SELECT * FROM ${tableName} WHERE username='${username}';`

    mysql.querySQL(checkExistSQL).then(result => {
        if (result.length) return 'This user already exist!!!'

        const insertAdminSQL = `INSERT INTO ${tableName} (username, email, password, create_date, update_date, is_delete, timestamp) VALUES (
            '${username}', 
            '${email}', 
            '${md5(md5Pre + password)}',
            '${moment().format('YYYY-MM-DD HH:mm:ss')}', 
            '${moment().format('YYYY-MM-DD HH:mm:ss')}', 
            0, 
            '${moment().format('X')}');`

        return mysql.querySQL(insertAdminSQL).then(() => {
            fs.writeFileSync('./admin.lock', username)
            return 'Add user successfully!!! username: ' + username + ', password: ' + password
        })
    }).then(message => {
        res.render('admin-add.html', { message })
    }).catch(err => next(err))
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
        return res.json(json)
    }

    const checkExistSQL = `SELECT * FROM ${tableName} WHERE username='${username}' and password='${md5(md5Pre + password)}' and is_delete=0;`
    mysql.querySQL(checkExistSQL).then(result => {
        if (result.length) {
            let id = result[0].id
            let remember_me = 2592000000
            username = encodeURI(username)

            let token = jwt.sign({ id, username }, secret, { expiresIn: 60 * 60 * 24 * 30 })
            res.cookie('b_user', token, { maxAge: remember_me })
            res.cookie('b_userid', id, { maxAge: remember_me })
            res.cookie('b_username', username, { maxAge: remember_me })

            return res.json({
                code: 200,
                message: 'Login successfully!!!',
                data: token
            })
        }

        return res.json({
            code: -200,
            message: 'Username or password is not right!!!'
        })
    }).catch(err => {
        res.json({
            code: -200,
            message: err.sqlMessage
        })
    })
}

exports.getList = (req, res) => {
    list(req, res, tableName)
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

exports.getItem = (req, res) => {
    item(req, res, tableName)
}

exports.deletes = (req, res) => {
    deletes(req, res, tableName)
}

exports.recover = (req, res) => {
    recover(req, res, tableName)
}