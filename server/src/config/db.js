import mongoose from "mongoose";

//Function to connect to MongoDB
export const connectDB = async () => {
    try {

        mongoose.connection.on("connected", () => console.log
            ("Connected to MongoDB"))

        await mongoose.connect(`${process.env.MONGODB_URI}/green-rent`)


    } catch (error) {
        console.log("Error connecting to MongoDB", error);

    }
}