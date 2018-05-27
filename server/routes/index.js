const express = require('express')
const router = express.Router()
const multipart = require('connect-multiparty')
const multipartMiddleware = multipart()

const backendUser = require('../api/backend-user'),
    backendCategory = require('../api/backend-category'),
    backendArticle = require('../api/backend-article'),
    frontendUser = require('../api/frontend-user'),
    frontendArticle = require('../api/frontend-article'),
    frontendLike = require('../api/frontend-like'),
    frontendComment = require('../api/frontend-comment'),
    isAdmin = require('./is-admin'),
    isUser = require('./is-user')

router.get('/backend', (req, res) => {
    res.render('admin-add.html', { title: 'add administrator', message: '' })
})

router.post('/backend', (req, res, next) => {
    backendUser.insert(req, res, next)
})

//==============================backend===========================================================================

router.post('/backend/admin/login', multipartMiddleware, backendUser.login)
router.get('/backend/admin/list', isAdmin, backendUser.getList)
router.get('/backend/admin/item', isAdmin, backendUser.getItem)
router.post('/backend/admin/modify', isAdmin, multipartMiddleware, backendUser.modify)
router.get('/backend/admin/delete', isAdmin, backendUser.deletes)
router.get('/backend/admin/recover', isAdmin, backendUser.recover)

router.get('/backend/category/list', backendCategory.getList)
router.get('/backend/category/item', backendCategory.getItem)
router.post('/backend/category/insert', multipartMiddleware, isAdmin, backendCategory.insert)
router.get('/backend/category/delete', isAdmin, backendCategory.deletes)
router.get('/backend/category/recover', isAdmin, backendCategory.recover)
router.post('/backend/category/modify', isAdmin, multipartMiddleware, backendCategory.modify)

router.get('/backend/article/list', isAdmin, backendArticle.getList)
router.get('/backend/article/item', isAdmin, backendArticle.getItem)
router.post('/backend/article/insert', isAdmin, multipartMiddleware, backendArticle.insert)
router.get('/backend/article/delete', isAdmin, backendArticle.deletes)
router.get('/backend/article/recover', isAdmin, backendArticle.recover)
router.post('/backend/article/modify', isAdmin, multipartMiddleware, backendArticle.modify)

router.get('/backend/user/list', isAdmin, frontendUser.getList)
router.get('/backend/user/delete', isAdmin, frontendUser.deletes)
router.get('/backend/user/recover', isAdmin, frontendUser.recover)
router.get('/backend/user/item', isAdmin, frontendUser.getItem)
router.post('/backend/user/modify', isAdmin, multipartMiddleware, frontendUser.modify)

router.get('/frontend/comment/delete', isAdmin, frontendComment.deletes)
router.get('/frontend/comment/recover', isAdmin, frontendComment.recover)

//=============================frontend===========================================================================

router.post('/frontend/user/insert', multipartMiddleware, frontendUser.insert)
router.post('/frontend/user/login', multipartMiddleware, frontendUser.login)
router.post('/frontend/user/logout', isUser, frontendUser.logout)
router.get('/frontend/user/account', isUser, frontendUser.getItem)
router.post('/frontend/user/account', isUser, multipartMiddleware, frontendUser.account)
router.post('/frontend/user/password', isUser, multipartMiddleware, frontendUser.password)

router.get('/frontend/article/list', frontendArticle.getList)
router.get('/frontend/article/item', frontendArticle.getItem)
router.get('/frontend/trending', frontendArticle.getTrending)

router.get('/frontend/like', isUser, frontendLike.like)
router.get('/frontend/unlike', isUser, frontendLike.unlike)

router.get('/frontend/comment/list', frontendComment.getList)
router.post('/frontend/comment/insert', isUser, multipartMiddleware, frontendComment.insert)

router.get('*', (req, res) => {
    res.json({
        code: -200,
        message: 'no page found...'
    })
})

module.exports = router