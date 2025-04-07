const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {type: String, required:true},
    mainCategory: {type:String, required: true},
    subCategory: {type:String},
    image: {type:String, required:true},
    ratings: {
        type:String,
        min: 0,
        max: 5,
        default: 0,
    },
    noOfRatings: {type:String},
    discountPrice: {type:String},
    actualPrice: {type:String},
}, 
{
    timestamps: true
})


const Product = mongoose.model('Product', productSchema)

module.exports = Product