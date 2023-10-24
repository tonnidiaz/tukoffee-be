import { IAddress } from "../utils/types";
import { Schema } from "mongoose";

const StoreSchema = new Schema({
    address: {
        type: <IAddress>{},
        required: true
    },
   
    open_time: {
        type: String,
        required: true
    },
    close_time: {
        type: String,
        required: true
    },

    open_time_weekend: {
        type: String,
        required: true
    },
    close_time_weekend: {
        type: String,
        required: true
    },
})



export {StoreSchema}