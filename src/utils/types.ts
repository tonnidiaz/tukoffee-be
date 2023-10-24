import { Request } from "express";

export interface Obj {[key: string]: any}
export interface IAddress  {

    place_name: String,
    center: [Number],
    street: String,
    suburb: String,
    city: String,
    line2: String,
    state: String,
    postcode: Number,
    phone: String,
    name: String,
}