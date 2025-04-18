const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    items:[
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required:true,
                unique: true
            },
            quantity: {type:Number, required:true},
            price:{type:Number, required: true}
        }
    ],
    totalPrice:{type:Number, required:true}
},
{
    timestamps:true
})

const Cart = mongoose.model("Cart", cartSchema)

module.exports = Cart