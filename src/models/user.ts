import { Schema, InferSchemaType, Document } from "mongoose";
import { UserPermissions } from "../utils/constants";
import { IAddress } from "../utils/types";

const UserSchema = new Schema({
    first_name: {
        type: String,
    },
    last_name: {
        type: String,
    },
    phone_verified: {
        type: Boolean,
        default: false
    },
    otp:{type: Number},
    email_verified: {
        type: Boolean,
        default: false
    },
    new_email_verified: {
        type: Boolean,
        default: false
    },
    phone: {
        type: String,
        required: false
    },
    permissions: {
        type: Number,
        default: UserPermissions.read,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    new_email: {
        type: String
    },
    password: {
        type: String,
        required: true,
    },
    deviceID: {
        type:String,
        required: false
    },
    delivery_addresses: {
        type:  [<IAddress>{}]
    },
    address: {
        type: <IAddress>{}
    },

    cart: {
        type: Schema.ObjectId, ref: "Cart"
    },
    orders: {
        type: [Schema.ObjectId], ref: "Order"
    }
})

export interface IUser extends Document, InferSchemaType<typeof UserSchema> {
    
}
export { UserSchema}