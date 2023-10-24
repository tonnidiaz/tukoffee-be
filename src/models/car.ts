import { Schema, model } from "mongoose";

export enum CarColor {
    red = 'red', green = 'green', blue = 'blue'
}
const CarSchema = new Schema({
    name: {type: String, required: true},
    speed: {type: Number, required: true},
    color: {type: String, enum: CarColor},
})

export const Car = model("Car", CarSchema)