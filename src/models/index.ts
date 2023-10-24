import { ProductSchema } from "./product";
import { model } from "mongoose";
import { UserSchema } from "./user";
import { StoreSchema } from "./store";
import { OrderSchema } from "./order";
import { CartSchema } from "./cart";
import { ReviewSchema } from "./review";

const Product = model("Product", ProductSchema)
const User = model("User", UserSchema, )
const Order = model("Order", OrderSchema)
const Cart = model("Cart", CartSchema)
const Store = model("Store", StoreSchema)
const Review = model("Review", ReviewSchema)
export { Product, Order, User, Cart, Store, Review }