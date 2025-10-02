import express from "express";
import cors from 'cors'

const App=express();
const port=3000
App.use(cors())

App.listen(port,()=>{
    console.log("Listening to port 3000")
});

App.post('/signup',async(req,res)=>{
    const {email,password}=req.body()
    if (!email || !password){
        res.status(404).json({success:false,message:"Empty Input"})
    }
    user= await User.findOne({email})
    if (user){
        res.status(404).json({success:false,message:"User Already Exists"})
    }
    else{
        await new User({email,password})
        res.status(200).json({success:true,message:"User Created Successfully"})
    }
})
