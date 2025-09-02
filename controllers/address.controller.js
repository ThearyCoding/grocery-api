const Address = require("../models/address");

exports.createAddress = async (req,res) => {
    try {
    const userId = req.user.id;

        if(req.body.isDefault){
            await Address.updateMany({userId},{isDefault: false});
        }

        const address = new Address({...req.body,userId});
        await address.save();

        res.status(201).json({success: true});
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message});
    }
}

exports.getAddresses = async (req,res) => {
    try {
        const userId = req.user.id;
        const addresses = await Address.find({userId});
        res.status(200).json({success: true, data: addresses});
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error getAddress: " + error.message});
    }
}