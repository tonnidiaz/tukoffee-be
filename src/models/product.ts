import { Schema } from "mongoose";


const ProductSchema = new Schema({
    pid : {
        type: Number,
        required: true,
        unique: true
    },
    name: { 
        type: String,
        required: true
    },
    images: {
        type: [{
            url: String,
            publicId: String
        }]
    },
    price: {
        type: Number,
        required: true
    },
    weight: {
        type: Number,
        default: 0
    },
    width: {
        type: Number,
        default: 0
    },
    height: {
        type: Number,
        default: 0
    },
    sale_price: {
        type: Number,
    },

   reviews: {
        type: [Schema.ObjectId],
        ref: 'Review',
        default: []
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    on_special: {type: Boolean, default: false},
    top_selling: {type: Boolean, default: false},
    on_sale: {type: Boolean, default: false},
    description: {
        type: String,
        required: true
    },
    ratings: {
        type: [{
            customer: { type: Schema.ObjectId, required: true},
            value: { type: Number, required: true}
        }],
        default: [],
        required: false
    },

    date_created: {
        type: Date,
        required: true,
        default: new Date()
    },

    last_modified: {
        type: Date,
        required: true,
        default: new Date()
    }
    
})

export { ProductSchema }