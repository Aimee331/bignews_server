//导入所需模块
const express = require('express')
const conn = require('../util/sql.js')
//创建路由中间件
const router = express.Router()
//解析变量
router.use(express.urlencoded())

//导出模块
module.exports = router 