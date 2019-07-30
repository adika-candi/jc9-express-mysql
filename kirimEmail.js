const nodemailer= require ("nodemailer")

const transporter=nodemailer.createTransport(
    {
        service:"gmail",
        auth:{
            type:"Oauth2",
            user:"adika.t.c@gmail.com",
            clientId:"818496066042-iraj33f6sqnuubnpt6uvsgsmkfm7t6hs.apps.googleusercontent.com",
            clientSecret:"s7QxyTt52tJk7-GG8S1IagUQ",
            refreshToken:"1/usP_tmzU9pah3b0U76gdhJo5vV2OBBjc2NDhV-8HM34"
        }
    }
)

const mail={
    from:"Adika Tandiono <adika.t.c@gmail.com>",
    to:"adika.t.c@gmail.com",
    subject:"anything",
    html:`<h1>Hey!</h1>`
}

transporter.sendMail(mail,(err,result)=>{
    if(err){
        return console.log(err.message)
    }
    console.log("sent")
})