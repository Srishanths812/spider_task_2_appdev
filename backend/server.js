import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { connectDB } from './mongo.js';
import bcrypt from 'bcrypt';
import mongoose, { trusted } from 'mongoose';
import multer from 'multer';

const upload=multer({
    limits:{fileSize:5*1024*1024},
    storage:multer.memoryStorage(),
});

const app = express();
const port = process.env.PORT||3000;
const JWTKey=process.env.JWTKey

app.use(express.json({limit:'5mb'}));
app.use(cors());

await connectDB( );

const userSchema= new mongoose.Schema({
    username: {
        type:String, 
        unique:true,
        required: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    friends: {
        type: [String],
        default: [],
    },
    friendrequest: {
        type: [String],
        default: [],
    },
    groups: {
        type: [String],
        default: [],
    },
    dp: {
        type: [String],
        default: ["https://static.thenounproject.com/png/65090-200.png"],
    }
});
//this makes it easy to remove the username when account is deleted
userSchema.pre('deleteOne',{ document: true, query: false }, async function (next){
    const username_remove=this.username;
     try {
        await this.model('UsersV2').updateMany(
            { $or: [{ friends: username_remove }, { friendrequest:username_remove }] },
            {
                $pull: {
                    friends: username_remove,
                    friendrequest: username_remove
                }
            }
        );
        next();
    } catch (err) {
        next(err);
    }
});
const User= mongoose.model('UsersV2',userSchema);

const groupSchema= new mongoose.Schema({
    groupId :{
        type: String,
        unique: true,
        required: true
    },
    groupName:{
        type: String,
        required: true
    },
    groupAdmin:{
        type: String,
        required: true
    },
    members: [
        {
            username: {
                type: String,
                required: true,
            },
            amount: {
                type: Number,
                required: true,
                default:0
            }
        }
    ],
    expenses: [
        {
            expenseId:{
                type:String,
                required: true,
                unique:true,
            },
            description: {
                type: String,
                required: true
            },
            category: {
                type: String,
                required: true
            },
            paidBy: {
                type: String,
                required: true
            },
            cost:{
                type:Number,
                required:true
            },
            splits: [
                {
                    username: {
                        type: String,
                        required: true
                    },
                    amount: {
                        type: Number,
                        required: true
                    }
                }
            ],
            Day: {
                type: Date,
                default: Date.now
            }
        }
    ]
});
const Group=mongoose.model("GroupsV2",groupSchema);

//for authorizing all pages using JWT
function verify(req,res,next){
    const token=req.headers['authorization'];
    if (!token){
        return res.status(401).json({message: 'No token given'});
    }
    jwt.verify(token, JWTKey,(erro,decoded)=>{
        if (erro){
            return res.status(403).json({message: 'Bro! Who you tryna hack?!'});
        }
        req.user=decoded;
        next();
    });
}

//create account
app.post('/signup',async(req,res)=>{
    let {username,password,email}=req.body;
    username=username.toLowerCase();
    email=email.toLowerCase();

    const user_exist=await User.findOne({username});
    if (user_exist){
        return res.json({
            success:false,
            message:'User already exist'
        });
    }
    const email_exist=await User.findOne({email});
    if (email_exist){
        return res.json({
            success:false,
            message:'Email already exist'
        });
    }
     //change salt rounds when necessary
    password=await bcrypt.hash(password,12);
    await new User({username,email,password}).save();
    const token=jwt.sign({username},JWTKey,{expiresIn:'1h'});
    res.json({
        success:true,
        message:"User created successfully",
        token
    });
});

//login account
app.post('/login',async (req,res)=>{
    let {username,password}=req.body;
    username=username.toLowerCase();
    const user_cred=await User.findOne({
        $or:[{username:username},{email:username}]
    });
    if (!user_cred){
        return res.json({
            success:false,
            message:'Invalid credentials'
        });
    }
    const match=await bcrypt.compare(password,user_cred.password);
    if (!match) 
        {
            return res.json({
            success:false,
            message:"Invalid credentials"
            });
        }
    username=user_cred.username;
    const token=jwt.sign({username},JWTKey,{expiresIn:'1h'});
    res.json({
        success:true,
        token,
        username
    });
});

app.post('/update_profile_details',upload.single('dp'),async(req,res)=>{
    let {username,newusername,password}=req.body;
    try{
        if(newusername&&newusername.toLowerCase()!==username.toLowerCase()){
            const exist=await User.findOne({username:newusername.toLowerCase()});
            if(exist){
                return res.json({success:false});
            }
            await User.updateMany(
                {friends:username},
                {$set:{"friends.$[elem]":newusername.toLowerCase()}},
                {arrayFilters:[{"elem":username}]}
            );
            await User.updateMany(
                {friendrequest:username},
                {$set:{"friendrequest.$[elem]":newusername.toLowerCase()}},
                {arrayFilters:[{"elem":username}]}
            );
            await Group.updateMany(
                {"members.username":username},
                {$set:{"members.$[elem].username":newusername.toLowerCase()}},
                {arrayFilters:[{"elem.username":username}]}
            );
            await Group.updateMany(
                {"expenses.paidBy":username},
                {$set:{"expenses.$[elem].paidBy":newusername.toLowerCase()}},
                {arrayFilters:[{"elem.paidBy":username}]}
            );
            await Group.updateMany(
                {"expenses.splits.username":username},
                {$set:{"expenses.$[exp].splits.$[split].username":newusername.toLowerCase()}},
                {
                    arrayFilters:[
                        {"exp.splits":{$elemMatch:{username:username}}},
                        {"split.username":username}
                    ]
                }
            );
        }
        const update={};
        if(newusername) update.username=newusername.toLowerCase();
        if(req.file){
            const dp=`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            update.dp=[dp];
        }
        if(password){
            const hash=await bcrypt.hash(password,12);
            update.password=hash;
        }
        await User.updateOne({username},{$set:update});
        return res.json({success:true});
    }catch(err){
        return res.status(500).json({success:false});
    }
});


app.post('/passwordcheck',async(req,res)=>{
    let {username,password}=req.body;
    username=username.toLowerCase();
    const user_cred=await User.findOne({username});
    const match=await bcrypt.compare(password,user_cred.password);
    if (!match) 
        {
            return res.json({
            success:false,
            });
        }
    else{
        return res.json({success:true});
    }
});

app.get('/main',verify,(req,res)=>{
    res.json({
        success:true,
        message: "Welcome to Bill Split"
    });
})

app.post('/search', async(req,res)=>{
    const {username}=req.body;
    if (!username){
        return res.status(400).json({message:"Missing username"});
    }
    const users=await User.find({
        username:{$regex: `^${username}`, $options: 'i'}
    }).limit(10);

    const results=users.map(user=>user.username);
    res.json(results);
})

app.post('/addfriend', async(req,res)=>{
    const {name,myname}=req.body;
    if (!name){
        return res.status(400).json({message:"Missing username"});
    }
    const user=await User.findOne({username:myname})
    if (user.friends.includes(name)){
        res.json({
            success:false,
        })
    }
    else{
        await User.updateOne(
            {username: name},
            {$addToSet:{friendrequest:myname}}
        );
        res.json({
            success:true,
        })
    }
})

app.post('/delete', async(req,res)=>{
    const {myname}=req.body;
    if (!myname){
        return res.status(400).json({message:"Missing username"});
    }
    const result= await User.findOne({username:myname});
    if (result){
        await result.deleteOne();
    }
    res.json({success:true});
})


app.listen(port,()=>{
    console.log(`Working on port ${port}.....`);
});

app.post('/friend',async(req,res)=>{
    const {username}=req.body;
    if (!username){
        return res.status(400).json({message:"Missing username"});
    }
    const users=await User.findOne({username});
    if (!users) return res.status(404).json({message:"User not found"})
    res.json(users.friendrequest);
})

app.post('/friendlist',async(req,res)=>{
    const {username}=req.body;
    if (!username){
        return res.status(400).json({message:"Missing username"});
    }
    const users=await User.findOne({username});
    if (!users) return res.status(404).json({message:"User not found"})
    res.json(users.friends);
})

app.post('/acceptfriend', async(req,res)=>{
    const {name, myname}=req.body;
    if (!myname || !name){
        return res.status(400).json({success:false, message:"Missing names"});
    }
    try{
        await User.updateOne(
            {username: myname},
            {
                $pull: {friendrequest: name},
                $addToSet: {friends: name}
            }
        );
        await User.updateOne(
            {username: name},
            {$addToSet: {friends: myname}}
        );
        res.json({success:true})
    }catch(err){
        res.status(500).json({success:false,message:'Error'})
    }
});

app.post('/deletefriendinv', async(req,res)=>{
    const {name,myname}=req.body;
    if (!myname || !name){
        return res.status(400).json({success:false, message:"Missing names"});
    }
    try{
        await User.updateOne(
            {username: myname},
            {
                $pull: {friendrequest: name},
            }
        );
        res.json({success:true})
    }catch(err){
        res.status(500).json({success:false,message:'Error'})
    }
})

app.post('/deletefriend', async(req,res)=>{
    const {name, myname}=req.body;
    if (!myname || !name){
        return res.status(400).json({success:false, message:"Missing names"});
    }
    try{
        await User.updateOne(
            {username: myname},
            {$pull: {friends: name}}
        );
        await User.updateOne(
            {username: name},
            {$pull: {friends: myname}}
        );
        res.json({success:true})
    }catch(err){
        res.status(500).json({success:false,message:'Error'})
    }
});

app.post('/creategroup', async(req,res)=>{
    const {groupName,groupAdmin,members}=req.body;
    //below function is to create a slight delay so that 
    //there arent too many requests to database
    const delay =ms => new Promise(resolve => setTimeout(resolve,ms));
    if (!groupAdmin||!groupName||!members){
        return res.status(400).json({sucess:false,message:"Missing values"});
    }
    const usernames=members.map(m=>m.username);
    let groupId=''
    while(1){
        groupId=Math.random().toString().substring(2,12);
        if (!await Group.findOne({groupId})){
            break;
        }
        delay(10);
    }
    await new Group({groupId,groupName,groupAdmin,members}).save();
    for (let i=0; i<usernames.length;i++){
        await User.updateOne(
            {username: usernames[i]},
            {$addToSet: {groups:groupId}}
        );
    }
    res.json({success:true,});
})

app.post("/deletegroup", async(req,res)=>{
    const {groupId}=req.body;
    const group= await Group.findOne({groupId});
    if (!group){
        return res.status(404).json({message: 'Group not found'},{sucess:false});
    }
    const username=group.members.map(member=> member.username);

    await Group.deleteOne({groupId});
    await User.updateMany(
        {username: {$in:username}},
        {$pull: {groups: groupId}}
    );
    res.json({success: true});
});

app.post("/removemember",async(req,res)=>{
    const {groupId, username}=req.body;
    if (!groupId||!username){
        return res.status(400).json({sucess:false,message:"Missing values"});
    }
    try{
        await Group.updateOne(
            {groupId},
            {$pull:{members:{username}}}
        )
        await User.updateOne(
            {username},
            {$pull:{groups:groupId}}
        );
        res.json({success:true});
    }catch(error){
        res.status(500).json({success:false},{message:"error"});
    }
});


app.post("/main_page_group_details", async(req,res)=>{
    const {username}= req.body;
    if (!username){
        return res.status(400).json({message:"Missing username"});
    }
    const users=await User.findOne({username});
    if (!users) return res.status(404).json({message:"User not found"});
    const groupIds= users.groups;
    const groups=await Group.find({groupId:{$in:groupIds}});
    const data=groups.map(group=>{
        const amount=group.members.find(m=> m.username==username)?.amount??0;
        return{
            groupName: group.groupName,
            amount:amount,
            groupId: group.groupId,
            expenses: group.expenses,
        };
    });
    return res.status(200).json(data);
})

app.post("/group_all_details", async(req,res)=>{
    const {groupId}= req.body;
    if (!groupId){
        return res.status(400).json({message:"Missing ID"});
    }
    const data=await Group.findOne({groupId})
    return res.status(200).json(data);
})

app.post("/addexpense", async(req,res)=>{
    try{
        const {groupId,split,description,paidBy,total,category}=req.body;
        const cost=Math.round(total*100)/100||0;
        let expenseId=''
        while(1){
            expenseId=Math.random().toString().substring(2,12);
            if (!await Group.findOne({groupId,'expenses.expenseId':expenseId})){
                break;
            }
            delay(10);
        }
        const splits=Object.entries(split).map(([username,amount])=>({
            username,
            amount:Math.round(Number(amount)*total)/100
        }))
        await Group.updateOne(
            {groupId},
            {$push:{
                expenses:{
                    expenseId,
                    description,
                    category,
                    paidBy,
                    cost,
                    splits
                }
            }}
        );
        const write=splits.map(({username,amount})=>({
            updateOne:{
                filter:{
                    groupId,
                    "members.username":username
                },
                update:{
                    $inc:{
                        "members.$.amount":amount
                    }
                }
            }
        }));
        await Group.bulkWrite(write);
        res.status(200).json({success:true});
    }catch(error){
        res.status(500).json({success:false});
    }
})

app.post("/expense_details", async(req,res)=>{
    const {groupId}=req.body;
    try{
        const group=await Group.findOne({groupId});
        if (!group){
            return res.status(404).json({success:false});
        }
       const data=group.expenses.sort((a,b)=> new Date(b.Day)-new Date(a.Day));
       res.status(200).json(data);
    }catch(error){
        res.status(500).json({success:false});
    }
})

app.post("/profile_details",async(req,res)=>{
    const {username}=req.body;
    try{
        const data=await User.findOne({username});
        if (!data){
            return res.status(404).json({success:false});
        }
        res.status(200).json(data);
    }catch(error){
        res.status(500).json({success:false});
    }
})

app.post("/profile_picture",async(req,res)=>{
    const {username}=req.body;
    try{
        const data=await Group.findOne({username});
        if (!data){
            return res.status(404).json({success:false});
        }
        res.status(200).json(data.dp);
    }catch(error){
        res.status(500).json({success:false});
    }
})



app.post("/delete_expense", async(req,res)=>{
    const {groupId,expenseId}=req.body;
    try{
        const group=await Group.findOne({groupId});
        const expdel=group.expenses.find(exp=>exp.expenseId===expenseId);
        const update=expdel.splits.map(split=>({
            updateOne:{
                filter:{groupId,"members.username": split.username},
                update: {$inc:{"members.$.amount":-split.amount}}
            }
        }));
        await Group.bulkWrite(update);
        await Group.updateOne({groupId},{$pull:{expenses:{expenseId}}});
        res.status(200).json({success:true});
    }catch(error){
        console.log(error)
        res.status(500).json({success:false});
    }
})