const express=require("express");
const redis=require("redis");
const userRouter=express.Router();
const {userModel,blacklistModel}=require("../models/models");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");
const { json } = require("body-parser");
require("dotenv").config();


const redisClient=redis.createClient();
redisClient.on("error",(err)=>{
    console.log(err.message);
})
try {
     redisClient.connect();
    console.log("redis connected")
} catch (error) {
    console.log(error.message)
}



userRouter.get("/",(req,res)=>{
    res.send("this is default route")
})
userRouter.post("/register",async(req,res)=>{
    const {name,email,password}=req.body;
    try {
        bcrypt.hash(password,5,async(err,hash)=>{
            if(err){
                res.send({msg:"something went wrong",err:err})
            }else{
                const newuser=new userModel({name,email,password:hash});
                await newuser.save();
                res.send({msg:"new user has been registered"})
            }
        })
    } catch (error) {
        res.send({msg:"something went wrong",err:error}) 
    }
})

userRouter.post("/login",async(req,res)=>{
    try {
        const {email,password}=req.body;
        const isuserpresent=await userModel.findOne({email});
        if(!isuserpresent){
            return res.send({msg:"user not present in db , please register first"});
        }
        const correctpassword= await bcrypt.compareSync(password,isuserpresent.password);
        if(!correctpassword){
            return res.send({msg:"invalid credentials"})
        }
        
        const token= await jwt.sign({email,userid:isuserpresent._id},process.env.token_key,{expiresIn:"3m"})
        
        const refreshtoken= await jwt.sign({email,userid:isuserpresent._id},process.env.ref_token_key,{expiresIn:"6m"})
        res.send({msg:"Login successful",token,refreshtoken})
    } catch (error) {
        res.send({msg:"something went wrong",error:error.message})    
    } 
})

userRouter.get("/logout",async(req,res)=>{
    try {
        let  token=req.headers.authorization.split(" ")[1];
        redisClient.sadd('blacklistedTokens', token, (err, reply) => {
            if (err) {
              console.error(err);
              res.status(500).send('Error blacklisting token');
            } else {
              console.log(`${token} has been blacklisted`);
              res.status(200).send('Token blacklisted successfully');
            }
          });
    } catch (error) {
        res.send({msg:"something went wrong",error:error.message}) 
    }
})

userRouter.get("/getnewtoken",async(req,res)=>{
    const refreshToken=req.headers.authorization.split(" ")[1];
    if(!refreshToken) res.send({msg:"plz login again"})

    jwt.verify(refreshToken,process.env.ref_token_key,async(err,decoded)=>{
        if(!decoded){
            res.send({msg:"plz login again",error:err})
        }else{
            const token = await jwt.sign({email:decoded.email,userid:decoded.userid},process.env.token_key,{ expiresIn: "3m" });
            res.send({msg:"Login Successfull and New token genrated successfully",Token:token})
        }
    })
})

module.exports={
    userRouter,redisClient
}