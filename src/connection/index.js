const mysql=require("mysql")

const conn=mysql.createConnection({
    user:"universal",
    password:"Mysql123",
    host:"localhost",
    database:"jc9sql",
    port:3306
})

module.exports=conn