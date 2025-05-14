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