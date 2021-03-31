// 创建数据库连接以及定义sql语句执行方法
module.exports = {
    query: function (sql, callback) {
        const mysql = require('mysql');
        const conn = mysql.createConnection({
            host: 'localhost',   // 你要连接的数据库服务器的地址
            user: 'root',        // 连接数据库服务器需要的用户名
            password: 'root',        // 连接数据库服务器需要的密码
            database: 'bignews1'      //你要连接的数据库的名字
        });
        conn.connect();
        // 完成增删改查
        conn.query(sql, callback);
        // 手动关闭连接
        conn.end();
    }
}