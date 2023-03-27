const jwt=require("jsonwebtoken");
const {redisClient}=require("../routes/user")
const {blacklistModel, userModel}=require("../models/models");
require("dotenv").config();

const authenticator=async(req,res,next)=>{
    const Token=req.headers?.authorization?.split(" ")[1];
    try {
        if(!Token){
            return res.status(401).send({msg:"please login first"});
        }
        const validtoken=await jwt.verify(Token,process.env.token_key);
        if(!validtoken){
            return res.status(403).send({msg:"Authentication failed , please try again with valid token"})
        }
        redisClient.sismember('blacklistedTokens', Token, (err, reply) => {
            if (err) {
              console.error(err);
              res.status(500).send('Error checking token');
            } else if (reply === 1) {
              console.log(`${Token} is blacklisted`);
              res.status(401).send('token is blacklisted');
            } else {
              console.log(`${Token} is authorized`);
              next();
            }
          });
    } catch (error) {
        res.send({msg:"something went wrong",error})
    }
}

module.exports={
    authenticator
}