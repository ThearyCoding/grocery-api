const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    title:{
        type: String,
        enum: ["MR","MS"],
    },
    name:{
        type: String,
        required: true,
    },
    phoneNumber:{
        type: String,
        required: true,
    },
    location:{
        lat: {type: Number,required: true},
        lng: {type: Number,required: true},
    },
    detail: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        require: true,
    },
    isDefault:{
        type: Boolean,
        default: false
    },
    tag: {
        type: String,
        enum: ["Home","Office","School","Other"],
        default: "Home",
    },
    photos: [
        {
            type: String,
        }
    ]
},{
    timestamps: true
});

const Address = mongoose.model("Address",addressSchema);
module.exports = Address;