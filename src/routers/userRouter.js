const conn=require("../connection")
const router=require("express").Router()
const isEmail=require("validator/lib/isEmail")
const bcrypt=require("bcrypt")

router.post("/users",(req,res)=>{
    var {username,name,email,password}=req.body
    if(!isEmail(email)){
        return res.send("Email is not valid")
    }

    password=bcrypt.hashSync(password,8)

    const sql= `insert into users(username,name,email,password) values ("${username}","${name}","${email}","${password}") `

    conn.query(sql,(err,result)=>{
        if(err){
            return res.send(err)
        }
        res.send(result)
    })
})

module.exports=router