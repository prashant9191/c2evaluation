const express=require("express");
const {weatherRouter}=require("./routes/weather")
const {connection}=require("./config/db")
const {userRouter}=require("./routes/user")
const app=express();
const {authenticator}=require("./middleware/authentication")


require("dotenv").config();
app.use(express.json());
app.use("/user",userRouter);
 app.use(authenticator);
app.use("/weather",weatherRouter);

app.listen(process.env.port,async()=>{
    console.log("server is running at port 4500")
    await connection;
    console.log("mogodb connected")
   
})
