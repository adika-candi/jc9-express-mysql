const express=require("express")

const router=require("./routers/userRouter.js")

const app =express()
const port=2019

app.use(express.json())
app.use(router)

app.listen(port,()=>{
    console.log("running di port :"+port)
})