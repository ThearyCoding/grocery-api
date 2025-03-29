const mongoose = require('mongoose');

const mongo_url = process.env.MONGO_URL;

const connectDB = async () => {
    try {
        await mongoose.connect(mongo_url).then(()=> console.log("MongoDb connected successfully"));
    } catch (error) {
        console.log("MongoDb connection error");
    }
}

module.exports = connectDB;