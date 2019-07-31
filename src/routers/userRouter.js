const conn=require("../connection")
const router=require("express").Router()
const isEmail=require("validator/lib/isEmail")
const bcrypt=require("bcrypt")
const mailVerify = require('../email/nodemailer')
const path=require("path")
const multer= require("multer")
const fs=require("fs")

const Initport=require("../config/port.js")
const rootDir=path.join(__dirname,"/../..")
const photosDir=path.join(rootDir,"/upload/photos")


const folder=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,photosDir)
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+file.fieldname+path.extname(file.originalname))
    }
})

const upstore=multer({
    storage:folder ,
    limits:{
        fileSize:10000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){ // will be error if the extension name is not one of these
            return cb(new Error('Please upload image file (jpg, jpeg, or png)')) 
        }

        cb(undefined, true)
    }

})

router.post('/users', (req, res) => {

    // tanda tanya akan di ganti oleh variabel data
    const sql = `INSERT INTO users SET ?`
    const sql2 = `SELECT id, name, email, username, verified FROM users WHERE id = ?`
    const data = req.body

    // Cek apakah email valid
    if(!isEmail(data.email)){
        return res.send('Email is not valid')
    }

    // Mengubah password dalam bentuk hash
    data.password = bcrypt.hashSync(data.password, 8)

    // Insert data
    conn.query(sql, data, (err, result1) => {
        // Terdapat error ketika insert
        if(err){
            return res.send(err)
        }

        // Read data by user id untuk di kirim sebagai respon
        conn.query(sql2, result1.insertId, (err, result2) => {
            if(err){
                return res.send(err)
            }

            var user = result2[0]

            mailVerify(user)


            res.send(result2)
        })
    })
})

router.post("/users/avatar",upstore.single("avatar"),(req,res)=>{
    const data=req.body.user
    const sql=`SELECT * FROM users WHERE username=?`
    const sql2=`UPDATE users SET avatar = "${req.file.filename}" WHERE username = "${req.body.user}"`
    

    conn.query(sql,data,(err,result)=>{
        if(err){
            return res.send(err)
        }

        const user=result[0]

        if(!user){
            return res.send("user not found")
        }

        conn.query(sql2,(err,result2)=>{
            if(err){
                return res.send(err)
            }
            res.send({
                message:"upload success",
                filename:req.file.filename
            })
        })
    })
})

// ACCESS IMAGE
router.get('/users/avatar/:image', (req, res) => {
    // Letak folder photo
    const options = {
        root: photosdir
    }

    // Filename / nama photo
    const fileName = req.params.image

    res.sendFile(fileName, options, function(err){
        if(err) return res.send(err)

    })

})

router.delete('/users/avatar', (req, res)=> {
    const sql = `SELECT * FROM users WHERE username = '${req.body.user}'`
    const sql2 = `UPDATE users SET avatar = null WHERE username = '${req.body.user}'`

    conn.query(sql, (err, result) => {
        if(err) return res.send(err)

        // nama file
        const fileName = result[0].avatar

        const imgpath = photosdir + '/' + fileName

        // delete image
        fs.unlink(imgpath, (err) => {
            if(err) return res.send(err)

            // ubah jadi null
            conn.query(sql2, (err, result2) => {
                if(err) res.send(err)

                res.send('Delete berhasil')
            })
        })
    })
})

router.get("/users/profile/:username",(req,res)=>{
    const sql=`SELECT username,name,email,avatar FROM users WHERE username=?`
    const data=req.params.username

    conn.query(sql,data,(err,result)=>{
        if(err){
            return res.send(err)
        }

        const user = result[0]

        // jika user tidak di temukan
        if(!user){
            return res.send('User not found')
        }

        res.send({
            user:user,
            avatar:`localhost:${Initport}/users/avatar/:"${user.avatar}"`
        })
    })
})

router.patch("/users/profile/:username",(req,res)=>{
    const sql =`UPDATE users SET ? WHERE username=?`
    const sql2=`SELECT username,name,email FROM users WHERE username="${req.params.username}"`
    const data=[req.body,req.params.username]

    conn.query(sql,data,(err,result)=>{
        if(err){
            return res.send(err)
        }
        conn.query(sql2,(err,result)=>{
            if(err){
                return res.send(err)
            }
            res.send(result[0])
        })
    })
})

// VERIFY USER
router.get('/verify', (req, res) => {
    const sql = `UPDATE users SET verified = true 
                WHERE username = '${req.query.uname}'`

    conn.query(sql, (err, result) => {
        if(err) return res.send(err)

        res.send('<h1>Verifikasi berhasil</h1>')
    })
})



module.exports=router