//导入所需模块
const express = require('express')
const router = express.Router()
const conn = require('../util/sql.js')
    //解析变量
router.use(express.urlencoded())
    //文章评论搜索/get/admin/comment/search
router.get('/search', (req, res) => {
    let { page, perpage } = req.query
    if (!page) page = 1
    if (!perpage) perpage = 6
    let totalCount = ''
    let totalPage = ''
    conn.query(`select * from comments`, (err, result) => {
        if (err) return result.json({ msg: '服务器错误' })
        totalCount = result.length
        totalPage = Math.ceil(result.length / perpage)
        let arr = []
        conn.query(`select id,title from articles`, (err, result) => {
            if (err) return result.json({ msg: '服务器错误' })
            result.forEach(item => arr.push({ id: item.id, title: item.title }))
            conn.query(`select * from comments limit ${(page - 1)*perpage},${perpage}`, (err, result) => {
                if (err) return res.json({ msg: '服务器错误' })
                result.forEach(item => {
                    let obj = arr.find(option => option.id === item.articleId)
                    item.title = obj.title
                })
                res.json({ code: 200, msg: '数据获取成功', data: { totalCount: totalCount, totalPage: totalPage, data: result } })
            })
        })
    })
})

//评论审核通过/post/admin/comment/pass
router.post('/pass', (req, res) => {
    const { id } = req.body
    conn.query(`update comments set state='已通过' where id=${id}`, (err, result) => {
        if (err) return res.json({ msg: '服务器错误' })
        res.json({ msg: '设置成功' })
    })
})

//评论审核不通过/post/admin/comment/reject
router.post('/reject', (req, res) => {
    const { id } = req.body
    conn.query(`update comments set state='已拒绝' where id=${id}`, (err, result) => {
        if (err) return res.json({ msg: '服务器错误,设置失败' })
        res.json({ msg: '设置成功' })
    })
})

//删除评论/post/admin/comment/delete
router.post('/delete', (req, res) => {
    const { id } = req.body
    conn.query(`delete from comments where id=${id}`, (err, result) => {
        if (err) return res.json({ msg: '服务器错误,删除失败' })
        res.json({ msg: '删除成功' })
    })
})

//导出模块
module.exports = router