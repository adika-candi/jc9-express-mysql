const conn=require("../connection")
const router=require("express").Router()
const isEmail=require("validator/lib/isEmail")
const bcrypt=require("bcrypt")
const path=require("path")
const multer= require("multer")

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
    const sql2 = `SELECT id, name, email, verified FROM users WHERE id = ?`
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



module.exports=router