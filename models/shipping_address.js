const mongoose = require('mongoose');

const shippingAddressSchema = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },

    fullName: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    postalCode: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    }

});

const ShippingAddress = mongoose.model("ShippingAddress", shippingAddressSchema);

module.exports = ShippingAddress;