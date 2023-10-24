import { Schema } from "mongoose"
import { OrderStatus, OrderMode } from "../utils/constants"
import { IAddress } from "../utils/types"


const OrderSchema = new Schema({
    oid: {type: Number, required: true},
    customer: {
        type: Schema.ObjectId, ref: "User", required: true
    },
    mode: {type: Number, default: OrderMode.delivery},
    store: { type: Schema.ObjectId, ref: "Store"},
    collector: {type: {name: String, phone: String}} ,
    collection_time: {
        type: String
    },
    delivery_time: {
        type: String
    },
    yocoData: {type: Object},
    paystackData: {type: Object},
    shiplogic: {type: Object},
    products: {
        type: [{
            product: {type: Object,},
            quantity: {type:Number, default: 1}
        }], default: []
    },
    status: {
        type: typeof OrderStatus.pending, default: OrderStatus.pending, required: true, enum: OrderStatus
    },
   delivery_address: {
        type:  <IAddress>{}, required: false
    },
    fee: {
        type: Number, 
        default: 0
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
    },
    date_delivered: {
        type: Date,
        required: false,
    },
})

export {OrderSchema}