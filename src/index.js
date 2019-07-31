const express=require("express")

const router=require("./routers/userRouter.js")
const taskRouter = require('./routers/taskRouter')
const Initport=require("./config/port.js")

const app =express()
const port=Initport

app.use(express.json())
app.use(router)
app.use(taskRouter)

app.get("/",(req,res)=>{
    res.send(`<h1>WELCOME</h1>`)
})

app.listen(port,()=>{
    console.log("running di port :"+port)
})