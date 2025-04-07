const mongoose = require('mongoose')

const ordersSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    orderItems:[
        {
            productId:{
                type: mongoose.Schema.Types.ObjectId,
                ref:"Product",
                required: true
            },
            quantity:{type:Number, required:true},
            price:{type:Number, required:true},
        }
    ],
    totalAmount:{type:Number, required:true},
    status:{type:String, required:true},
    paymentMethod:{type:String, required:true},
    shippingAddress:{type:String, required:true}
},
{
    timestamps:true
})

const Orders = mongoose.model("Orders", ordersSchema)

module.exports = Orders