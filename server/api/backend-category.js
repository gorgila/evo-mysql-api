const moment = require('moment')
const mysql = require('../mysql')

const tableName = 'categories'
const general = require('./general')
const item = general.item
const modify = general.modify
const recover = general.recover
const deletes = general.deletes

exports.getList = (req, res) => {
    const listSQL = `SELECT * FROM ${tableName} ORDER BY cate_order DESC;`

    mysql.querySQL(listSQL).then(rows => {
        let json = {
            code: 200,
            data: {
                list: rows
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

exports.insert = (req, res) => {
    const cate_name = req.body.cate_name
    const cate_order = req.body.cate_order

    if (!cate_name || !cate_order) {
        res.json({
            code: -200,
            message: 'Please fill in category name and its expected order!!!'
        })
    } else {
        const createSQL = `INSERT INTO ${tableName} (cate_name, cate_order, create_date, update_date, is_delete, timestamp) VALUES ( 
            '${cate_name}', ` +
            `'${cate_order}',` +
            `'${moment().format('YYYY-MM-DD HH:mm:ss')}', 
            '${moment().format('YYYY-MM-DD HH:mm:ss')}', 
            0, 
            '${moment().format('X')}');`

        return mysql.querySQL(createSQL).then(result => {
            const selectSQL = `SELECT * FROM ${tableName} where id=${result.insertId};`

            return mysql.querySQL(selectSQL).then(rows => {
                res.json({
                    code: 200,
                    message: 'Added successfully!!!',
                    data: rows[0]
                })
            })
        })
    }
}

exports.modify = (req, res) => {
    let id = req.body.id,
        cate_name = req.body.cate_name,
        cate_order = req.body.cate_order

    modify(res, tableName, id, {
        cate_name,
        cate_order,
        update_date: moment().format('YYYY-MM-DD HH:mm:ss')
    })
}

exports.getItem = (req, res) => {
    item(req, res, tableName)
}

exports.deletes = (req, res) => {
    const id = parseInt(req.query.id)

    const deleteSQL = `UPDATE ${tableName} cates INNER JOIN articles arts ON cates.id=arts.categoryid SET cates.is_delete=1, cates.cate_num=0, arts.is_delete=1 where cates.id=${id};`

    mysql.querySQL(deleteSQL).then(() => {
        res.json({
            code: 200,
            message: 'Delete successfully!!!',
            data: 'success'
        })
    }).catch(err => {
        res.json({
            code: -200,
            message: err.sqlMessage
        })
    })
}

exports.recover = (req, res) => {
    recover(req, res, tableName)
}