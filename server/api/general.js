const mysql = require('../mysql')

exports.list = (req, res, tableName, sort) => {
    sort = sort || 'id'
    let limit = req.query.limit,
        page = req.query.page

    page = parseInt(page, 10)
    limit = parseInt(limit, 10)

    if (!page) page = 1
    if (!limit) limit = 10

    const skip = (page - 1) * limit

    const searchSQL = `SELECT * FROM ${tableName} ORDER BY ${sort} DESC LIMIT ${limit} OFFSET ${skip}; SELECT COUNT(id) AS count FROM ${tableName};`
    mysql.querySQL(searchSQL).then(results => {
        let total = results[1][0].count
        let totalPages = Math.ceil(total / limit)

        let json = {
            code: 200,
            data: {
                list: results[0],
                total,
                hasNext: totalPages > page ? 1 : 0,
                hasPrev: page > 1 ? 1 : 0
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

exports.item = (req, res, tableName) => {
    let id = parseInt(req.query.id)

    if (!id) {
        res.json({
            code: -200,
            message: 'Wrong data!!!'
        })
    }

    const listSQL = `SELECT * FROM ${tableName} where id=${id};`
    mysql.querySQL(listSQL).then(result => {
        res.json({
            code: 200,
            data: result[0]
        })
    }).catch(err => {
        res.json({
            code: -200,
            message: err.sqlMessage
        })
    })
}

exports.deletes = (req, res, tableName) => {
    let id = parseInt(req.query.id)

    const deleteSQL = `UPDATE ${tableName} SET is_delete=1 WHERE id=${id};`
    mysql.querySQL(deleteSQL).then(result => {
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

exports.recover = (req, res, tableName) => {
    let id = parseInt(req.query.id)

    const recoverSQL = `UPDATE ${tableName} SET is_delete=0 WHERE id=${id};`
    mysql.querySQL(recoverSQL).then(result => {
        res.json({
            code: 200,
            message: 'Recover successfully!!!',
            data: 'success'
        })
    }).catch(err => {
        res.json({
            code: -200,
            message: err.sqlMessage
        })
    })
}

exports.modify = (res, tableName, id, data) => {
    const updateSQL = `UPDATE ${tableName} SET ? WHERE id=${id};`
    const selectSQL = `SELECT * FROM ${tableName} WHERE id=${id};`

    mysql.querySQL(updateSQL, data).then(() => {
        mysql.querySQL(selectSQL).then(rows => {
            res.json({
                code: 200,
                message: 'Update successfully!!!',
                data: rows[0]
            })
        })
    }).catch(err => {
        res.json({
            code: -200,
            message: err.sqlMessage
        })
    })
}