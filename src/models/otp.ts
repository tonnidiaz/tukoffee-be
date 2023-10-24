import { Schema, model } from "mongoose";


const OTPSchema: Schema = new Schema({
    phone: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    pin: {
        type: Number,
        required: true
    }
})
const OTP = model("OTP", OTPSchema)
export {OTPSchema, OTP}