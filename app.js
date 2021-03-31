//导入所需模块
const express = require('express')
const cors = require('cors')
const express_jwt = require('express-jwt')
//创建服务
const app = express()
//解决跨域问题
app.use(cors())

//统一验证token值
const jwt = require('express-jwt');
// app.use(jwt().unless());
// jwt() 用于解析token，并将 token 中保存的数据 赋值给 req.user
// unless() 约定某个接口不需要身份认证
app.use(express_jwt({
    secret: 'bignews1', // 生成token时的 钥匙，必须统一
    algorithms: ['HS256'] // 必填，加密算法，无需了解
}).unless({
    path: ['/api/login', '/api/register', /^\/uploads\/.*/] // 除了这两个接口，其他都需要认证
}));
//引入路由中间件
const api_router = require('./router/api_router')
const my_router = require('./router/my_router')

app.use('/api', api_router)
app.use('/my', my_router)

//错误中间件处理
app.use((err, req, res, next) => {
    console.log('有错误', err)
    if (err.name === 'UnauthorizedError') {
        // res.status(401).send('invalid token...');
        res.status(401).send({ code: 1, message: '身份认证失败！' });
    }
});

//启动服务
app.listen(9000, () => {
    console.log('app listening on port 9000');
})

