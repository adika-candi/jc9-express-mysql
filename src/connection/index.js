const mysql=require("mysql")

const conn=mysql.createConnection({
    user:"sicare",
    password:"193752468",
    host:"db4free.net",
    database:"jc9testdb",
    port:3306
})

module.exports=conn