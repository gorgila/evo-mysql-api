const mysql = require('../mysql')
const articleTableName = 'articles'
const likeTableName = 'likes'

exports.getList = (req, res) => {
    let by = req.query.by,
        id = parseInt(req.query.id),
        key = req.query.key,
        limit = req.query.limit,
        page = req.query.page

    page = parseInt(page, 10)
    limit = parseInt(limit, 10)

    if (!page) page = 1
    if (!limit) limit = 10

    let skip = (page - 1) * limit
    let sort = 'update_date'
    if (by) sort = by

    const searchCountSQL = `SELECT * FROM ${articleTableName} WHERE is_delete=0 ` + (id ? `AND categoryid=${id} ` : ``) + (key ? `AND title REGEXP '${key}' ` : ``) + `ORDER BY ${sort} DESC LIMIT ${limit} OFFSET ${skip}; SELECT COUNT(id) AS count FROM ${articleTableName} WHERE is_delete=0 ` + (id ? `AND categoryid=${id} ` : ``) + (key ? `AND title REGEXP '${key}'; ` : `;`)

    mysql.querySQL(searchCountSQL).then(([rows, total]) => {
        let arr = [],
            totalPage = Math.ceil(total[0].count / limit),
            user_id = parseInt(req.cookies.userid),
            data = {}

        data = rows.map(item => {
            item.content = item.content.substring(0, 500) + '...'
            return item
        })

        let json = {
            code: 200,
            data: {
                list: rows,
                total: total[0].count,
                hasNext: totalPage > page ? 1 : 0,
                hasPrev: page > 1
            }
        }

        if (user_id) {
            rows.forEach(item => {
                const likeSearchSQL = `SELECT * FROM ${likeTableName} WHERE articleid='${item.id}' and userid=${user_id};`
                arr.push(mysql.querySQL(likeSearchSQL))
            })

            Promise.all(arr).then(collc => {
                data = rows.map((item, index) => {
                    item.like_status = !!collc[index].length
                    return item
                })
                json.data.list = data
                res.json(json)
            }).catch(err => {
                res.json({
                    code: -200,
                    message: err.sqlMessage
                })
            })
        } else {
            data = rows.map(item => {
                item.like_status = false
                return item
            })

            json.data.list = data
            res.json(json)
        }
    }).catch(err => {
        res.json({
            code: -200,
            message: err.sqlMessage
        })
    })
}

exports.getItem = (req, res) => {
    let id = parseInt(req.query.id),
        user_id = parseInt(req.cookies.userid)

    if (!id) {
        res.json({
            code: -200,
            message: 'Data contains error!!!'
        })
    }

    const articleListSQL = `SELECT * FROM ${articleTableName} WHERE id=${id} and is_delete=0;`
    const likeListSQL = `SELECT * FROM ${likeTableName} WHERE articleid=${id} ` + (user_id ? `and userid=${user_id};` : `;`)
    const updateVisitSQL = `UPDATE ${articleTableName} SET visit=visit+1 WHERE id=${id};`

    Promise.all([
        mysql.querySQL(articleListSQL),
        mysql.querySQL(likeListSQL),
        mysql.querySQL(updateVisitSQL)
    ]).then(result => {
        let json = {}

        if (!result[0]) {
            json = {
                code: -200,
                message: 'Article does not existed!!!'
            }
        } else {
            if (user_id) {
                result[0][0].like_status = !!result[1].length
            } else {
                result[0][0].like_status = false
            }

            json = {
                code: 200,
                data: result[0][0]
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

exports.getTrending = (req, res) => {
    let limit = 5
    let data = { is_delete: 0 }

    const listSQL = `SELECT * FROM ${articleTableName} WHERE ? ORDER BY visit DESC LIMIT ${limit};`

    mysql.querySQL(listSQL, data).then(rows => {
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