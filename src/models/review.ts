import { Schema, Model } from "mongoose";

enum EReviewStatus {
    pending = 'pending',
    approved = 'approved',
    rejected = 'rejected',
    
}

const ReviewSchema = new Schema( {
    title: {type: String, required: true},
    name: {type: String, required: true},
    body: {type: String, required: true},
    reject_reason: {type: String},
    status: {type: String, default: EReviewStatus.pending, enum: [
        "pending", "approved", "rejected"
    ]},
    rating: {type: Number, required: true, default: 0},
    user: {type: Schema.ObjectId, ref: 'User', required: true},
    product: {type: Schema.ObjectId, ref: 'Product', required: true},
    date_created: {type: Date, default: new Date(), required: false},
    last_modified: {type: Date, default: new Date(), required: false},
})

export { ReviewSchema, EReviewStatus}