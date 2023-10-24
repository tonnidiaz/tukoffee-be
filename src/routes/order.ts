import express from "express";
import { Cart, Order, User, Product } from "../models";
import { auth } from "../utils/middleware";
import { OrderStatus } from "../utils/constants";
import { tunedErr } from "../utils/functions";
import io from "../utils/io";
import { Obj } from "../utils/types";
const router = express.Router();
 
const genOID = async () => {
    const oid = Math.floor(Math.random() * 999999) + 1;
    const exists = await Order.findOne({ oid }).exec();
    if (exists != null) return genOID();
    return oid;
};

router.post("/cancel", auth, async (req, res) => {
    const { ids, userId } = req.body;
    const { action } = req.query;
    try {
        for (let id of ids) {
            try {
                if (action == "delete") {
                    // Remove order from user document
                    const order = await Order.findById(id).exec();

                    const user = await User.findById(order?.customer).exec();
                    await Order.findByIdAndDelete(id).exec();
                    if (user) {
                        user.orders = user.orders.filter((o) => o != id);
                        await user.save();
                        console.log(`Order #${id} deleted!`);
                    }
                } else {
                    const order = await Order.findByIdAndUpdate(id, {
                        status: OrderStatus.cancelled,
                        last_modified: new Date(),
                    }).exec();
                    console.log(`Order #${id} cancelled!`);
                     //Update inventory
            for (let item of order!.products){
                await Product.findByIdAndUpdate(item.product._id, {$inc: {
                    quantity:  item.quantity
                }}).exec()
            }
                }
            } catch (e) {
                console.log(e);
                continue;
            }
        }

        const orders = userId
            ? await Order.find({ customer: userId }).exec()
            : await Order.find().exec();
        let populatedOrders = <Obj>[];
        for (let o of orders) {
            let ord = await (
                await o.populate("customer")
            ).populate("products.product");
            populatedOrders.push(ord);
        }
        res.json({ orders: populatedOrders.map((it) => it.toJSON()) });
    } catch (e) {
        console.log(e);
        return tunedErr(res, 500, 'Something went wrong')
    }
});
router.post("/create", auth, async (req, res) => {
    const { cartId, mode } = req.query;
    const { address, store, collector, yocoData, paystackData, form } = req.body;
    try {
        if (cartId) {
            // The customer has paid. so get the cart and create an order
            // Also delete the user cart
            console.log("Creating order for cart: " + cartId);
            let cart = await Cart.findById(cartId).exec();
            if (!cart) return tunedErr(res, 400, "Carr not found")
            const user = await User.findById(cart.customer).exec();
            if (!user)
                return tunedErr(res, 400, "Customer not found")
            
            cart = await cart.populate('products.product')
            
            const order = new Order();
            order.oid = await genOID();
            order.customer = user._id;
            order.products = cart.products;
            order.delivery_address = address;
            order.mode = Number(mode);
            order.store = store;
            order.collector = collector;
            order.yocoData = yocoData
            order.paystackData = paystackData
            if (form){
                for (let key of Object.keys(form)){
                order.set(key, form[key])
            }
            }
            
            await order.save();
            // add order to user's orders
            user.orders.push(order._id);
            await user.save();

            //Update inventory
            for (let item of order.products){
                await Product.findByIdAndUpdate(item.product._id, {$inc: {
                    quantity: - item.quantity
                }}).exec()
            }
            // delete the cart
            await Cart.findByIdAndUpdate(cartId, {$set: {
                products: []
            }}).exec()
            await cart.save()
            //user.cart = null
            //await user.save()
            console.log("Cart deleted");
            io.emit('order', order.oid)
            console.log("On order emitted")
            res.json({ order: { ...order.toJSON(), customer: null } });
        } else {
            res.status(400).json({ msg: "Provide cart id" });
        }
    } catch (e) {
        console.log(e);
        return tunedErr(res, 500, "Something went wrong")
    }
});

router.post('/edit', auth, async (req, res)=>{
    try{
        const { id } = req.query;
        const { body } = req
        const order = await Order.findById(id).exec()
        if (!order) return res.status(404).send("Order not found!");
        for (let key of Object.keys(body)){
            order[key] = body[key]
        }  
        order.last_modified = new Date()
        await order.save()
        res.json({id: order.oid})
    }
    catch(e){
        res.status(500).send("tuned:Something went wrong!")
    }
})
export default router;
