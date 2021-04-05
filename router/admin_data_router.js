//导入所需模块
const express = require('express')
const router = express.Router()
const conn = require('../util/sql.js')

//解析变量
router.use(express.urlencoded())

//获取统计数据/get/admin/data/info
router.get('/info', (req, res) => {
    conn.query(`select  SUM(1) as total from articles`, (err, result) => {
        if (err) return res.json({ msg: '服务器错误' })
        let today = new Date()
        today = today.toJSON().substr(0, 10)
        let totalArticle = result[0].total
        conn.query(`select  SUM(1) as total from articles where date="${today}"`, (err, result) => {
            if (err) return res.json({ msg: '服务器错误' })
            let dayArticle = result[0].total
            conn.query(`select  SUM(1) as total from comments`, (err, result) => {
                if (err) return res.json({ msg: '服务器错误' })
                let totalComment = result[0].total
                conn.query(`select  SUM(1) as total from comments where date="${today}"`, (err, result) => {
                    if (err) return res.json({ msg: '服务器错误' })
                    let dayComment = result[0].total
                    res.json({ totalArticle: totalArticle, dayArticle: dayArticle, totalComment: totalComment, dayComment: dayComment })
                })
            })
        })
    })
})

//日新增文章数量统计/get/admin/data/article
router.get('/article', (req, res) => {
    conn.query(`select date from articles order by date asc`, (err, result) => {
        if (err) return res.json({ msg: '服务器错误' })
        let arr = []
        result.forEach(item => arr.push(item.date))
            // res.json(arr)
        let set = new Set(arr)
            // res.json([...set])
        let date = []
        arr = [...set]
        console.log(arr);
        (function loop(index) {
            conn.query(`select sum(1) as count from articles where date="${arr[index]}"`, (err, result) => {
                if (err) return res.json({ msg: '服务器错误' })
                date.push({ date: arr[index], count: result[0].count })
                if (++index < arr.length) {
                    loop(index)
                } else {
                    res.json({ code: 200, msg: '获取成功', date: date })
                }
            })
        })(0);
    })
})

//各类型文章数量统计/get/admin/data/category
router.get('/category', (req, res) => {
    const sqlStr = `select distinct categories.\`name\`,(select count(1) from articles where categories.id=articles.categoryId) articles from categories
     left join articles on categories.id=articles.categoryId`
    conn.query(sqlStr, (err, result) => {
        console.log(err);
        if (err) return res.json({ msg: '服务器错误' })
        res.json({ code: 200, msg: '获取成功', date: result })
    })
})

//日文章访问量/get/admin/data/visit
router.get('/visit', (req, res) => {
        conn.query(`select date from articles order by date asc`, (err, result) => {
            if (err) return res.json({ msg: '服务器错误' })
            let arr = []
            result.forEach(item => arr.push(item.date))
            let set = new Set(arr)
            arr = [...set]
            let date = {}
            console.log(arr);
            (function loop(index) {
                conn.query(`select sum(\`read\`) as total from articles where date="${arr[index]}"`, (err, result) => {
                    if (err) return res.json({ msg: '服务器错误' })
                    date[arr[index]] = result[0].total
                    if (++index < arr.length) {
                        loop(index)
                    } else {
                        res.json({ code: 200, msg: '日访问量统计数据获取成功', data: date })
                    }
                })
            })(arr.length - 7)
        })
    })
    //用递归思想解决数组遍历里面含异步函数的问题
    // var arr = ["a", "b", "c"];
    // (function loop(index) {
    //     setTimeout(function () {//用setTimeout模拟异步函数
    //         console.log(arr[index]);
    //         if (++index < arr.length) {
    //             loop(index);
    //         } else {
    //             console.log("全部执行完毕");
    //         }
    //     }, 500);
    // })(0);
    //导出模块
module.exports = router