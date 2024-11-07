const mongoose = require ('mongoose')

const colorStockSchema = new mongoose.Schema({
    color:{
        type: String,
        enum :['white','black','blue'],
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min:0
    },
    status: {
        type: String,
        enum: ["Available", "Out of stock", "Discontinued", "In stock"],
        required : true,
        default: "In stock"
    },

})


const productSchema = new mongoose.Schema({
    productName : {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    additionalInfo :{
        type: String,
        required: true,
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    regularPrice: {
        type: Number,
        required: true
    },
    salePrice: {
        type: Number,
        default : 0
    },
    productOffer: {
        type: Number,
        default : 0
    },
    colorStock:[colorStockSchema],
    
    productImage: {
        type: [String],
        required: true
    },
    tags:{
        type :[String],
        enum: ['Noise cancellation', 'High battery power', 'Waterproof', 'Gaming', 'Limited edition'],
        default :[]

    },

    isBlocked: {
        type: Boolean,
        default: false
    },
    
  

} , {timestamps: true});


module.exports = mongoose.model ('Product', productSchema)

// const productSchema = new mongoose.Schema({
//     productName : {
//         type: String,
//         required: true
//     },
//     description: {
//         type: String,
//         required: true,
//     },
//     additionalInfo: {
//         type: String,
//         required: true
//     },
//     brand: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Brand",
//         required: true
//     },
//     category: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Category",
//         required: true
//     },
//     regularPrice: {
//         type: Number,
//         required: true
//     },
//     salePrice: {
//         type: Number,
//         default : 0
//     },
//     productOffer: {
//         type: Number,
//         default : 0
//     },
  
//     isBlocked: {
//         type: Boolean,
//         default: false
//     },

//     variants:[
//         {
//             color:{
//                 type: String,
//                 enum: ["white", "black", "red", "blue", "grey"],
//                 required: true
//             },
//             quantity: {
//                 type: Number,
//                 default : 1
//             },
//             sku :{
//                 type: String,
//                 required: true
//             },
//             status: {
//                 type: String,
//                 enum: ["Available", "Out of stock", "Discontinued", "In stock"],
//                 required : true,
//                 default: "In stock"
//             },
//              images: {
//                 type: [String],
//                 required: true // Array of image URLs for each color
//             },     
//         }

//     ]
  

// } , {timestamps: true});


module.exports = mongoose.model ('Product', productSchema)

