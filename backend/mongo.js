import mongoose from 'mongoose'


export const connectDB =async()=>{
    try{
        const conn=await mongoose.connect(process.env.DB);
        console.log("Server Connected");
    } catch (error){
        console.log(error);
        process.exit(1);
    }
}

await connectDB();