const mongoose=require("mongoose");
const userSchema=mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true}
})
const userModel=mongoose.model("user",userSchema);
const blacklistSchema=mongoose.Schema({
    token:{type:String,required:true}
    
})
const blacklistModel=mongoose.model("blacklist",blacklistSchema)
module.exports={
    userModel,blacklistModel
}