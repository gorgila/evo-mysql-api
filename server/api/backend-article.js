const moment = require('moment')

const mysql = require('../mysql')
const articleTableName = 'articles'
const cateTableName = 'categories'
const general = require('./general')
const list = general.list
const item = general.item

const marked = require('marked')
const hljs = require('highlight.js')

marked.setOptions({
    highlight(code) {
        return hljs.highlightAuto(code).value
    },
    breaks: true
})

exports.getList = (req, res) => {
    list(req, res, articleTableName, 'update_date')
}

exports.getItem = (req, res) => {
    item(req, res, articleTableName)
}

exports.insert = (req, res) => {
    let categoryInfo = req.body.category,
        content = req.body.content,
        html = marked(content),
        title = req.body.title

    const arr_category = categoryInfo.split('|')
    const categoryid = parseInt(arr_category[0])
    const category_name = arr_category[1]

    const data = {
        title: title,
        categoryid: categoryid,
        category_name: category_name,
        content: content,
        html: html,
        visit: 0,
        like: 0,
        comment_count: 0,
        create_date: moment().format('YYYY-MM-DD HH:mm:ss'),
        update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
        is_delete: 0,
        timestamp: moment().format('X')
    }

    const insertSQL = `INSERT INTO ${articleTableName} SET ?;`
    mysql.querySQL(insertSQL, data).then(result => {
        const updateSQL = `UPDATE ${cateTableName} SET cate_num=cate_num+1 WHERE id=${categoryid}; SELECT * FROM ${articleTableName} where id=${result.insertId};`

        return mysql.querySQL(updateSQL).then(results => {
            return res.json({
                code: 200,
                message: 'Added article successfully!!!',
                data: results[1][0]
            })
        })
    }).catch(err => {
        res.json({
            code: -200,
            message: err.sqlMessage
        })
    })
}

exports.modify = (req, res) => {
    let category = req.body.category,
        category_old = req.body.category_old,
        content = req.body.content,
        html = marked(content),
        id = req.body.id

    let data = {
        title: req.body.title,
        categoryid: category,
        category_name: req.body.category_name,
        content: content,
        html: html,
        update_date: moment().format('YYYY-MM-DD HH:mm:ss')
    }

    const articleUpdateSQL = `UPDATE ${articleTableName} SET ? WHERE id=${id};`
    const articleSelectSQL = `SELECT * FROM ${articleTableName} WHERE id=${id};`

    mysql.querySQL(articleUpdateSQL, data).then(() => {
        mysql.querySQL(articleSelectSQL).then(rows => {
            if (category !== category_old) {
                const cateUpdateSQL = `UPDATE ${cateTableName} SET cate_num = CASE id WHEN ${category} THEN cate_num+1 WHEN ${category_old} THEN cate_num-1 END WHERE id IN (${category}, ${category_old});`

                mysql.querySQL(cateUpdateSQL).then(() => {
                    res.json({
                        code: 200,
                        message: 'Update successfully!!!',
                        data: rows[0]
                    })
                })
            } else {
                res.json({
                    code: 200,
                    message: 'Update successfully!!!',
                    data: rows[0]
                })
            }
        })
    }).catch(err => {
        res.json({
            code: -200,
            message: err.sqlMessage
        })
    })
}

exports.deletes = (req, res) => {
    let id = req.query.id

    const articleUpdateSQL = `UPDATE ${articleTableName} SET is_delete=1 WHERE id=${id};`
    mysql.querySQL(articleUpdateSQL).then(() => {
        const cateUpdateSQL = `UPDATE ${cateTableName} cates INNER JOIN ${articleTableName} articles ON cates.id=articles.categoryid SET cates.cate_num=cates.cate_num-1 where articles.id=${id}`

        return mysql.querySQL(cateUpdateSQL).then(() => {
            res.json({
                code: 200,
                message: 'Deleted article successfully!!!',
                data: 'success'
            })
        })
    }).catch(err => {
        res.json({
            code: -200,
            message: err.sqlMessage
        })
    })
}

exports.recover = (req, res) => {
    let id = req.query.id

    const articleUpdateSQL = `UPDATE ${articleTableName} SET is_delete=0 WHERE id=${id};`
    mysql.querySQL(articleUpdateSQL).then(() => {
        const cateUpdateSQL = `UPDATE ${cateTableName} cates INNER JOIN ${articleTableName} articles ON cates.id=articles.categoryid SET cates.cate_num=cates.cate_num+1, cates.is_delete=0 where articles.id=${id}`

        return mysql.querySQL(cateUpdateSQL).then(() => {
            res.json({
                code: 200,
                message: 'Recovered article successfully!!!',
                data: 'success'
            })
        })
    }).catch(err => {
        res.json({
            code: -200,
            message: err.sqlMessage
        })
    })
}