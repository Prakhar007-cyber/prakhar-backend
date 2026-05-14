// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import express from "express"


const app = express()

dotenv.config({
    path: './env'
})


connectDB()
    .then((result) => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at PORT : ${process.env.PORT}`);
        })
        app.on("error", (error) => {
            console.log("Error", error);
            throw error
        })
    }).catch((err) => {
        console.log("MONGO DB Connection Failed", err);

    });






/*
//                                                2nd Approach (Not Professional)
import express from "express"
const app = express()

( async () => {
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error", (error)=>{
        console.log("Error", error);
        throw error
       })

       app.listen(process.env.PORT, ()=> {
        console.log(`app is listening on PORT ${process.env.PORT}`);
       })
    } catch (error) {
        console.log("ERROR:",error);
        throw error
    }
})
*/