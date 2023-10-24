const express = require('express');
const { Cart, Order, User } = require('../models');
const router = express.Router();


router.get("/", async (req, res)=>{
    try{

        const { oid, user } = req.query
        let orders = [];
        if (oid){
            const order = await Order.findOne({oid}).exec()
            if (!order) return res.status(404).json({msg: "Order not found"})
            orders = [order]
        }
        else if (user){
            orders = await Order.find({customer: user}).exec()
        }
        else{
            orders = await Order.find().exec()
        }
        let populatedOrders = []
        for (let o of orders){
            if (oid){
                 let ord = await  (await o.populate("customer")).populate('store')
                populatedOrders.push({...ord.toJSON()})
            }else{
                populatedOrders.push(o.toJSON())
            }
           
        }
        orders = populatedOrders//.map(it=> it.toJSON())
        res.json({orders})
    }
    catch(e){
        console.log(e);
        res.status(500).json({msg: "Something went wrong!"})
    }
})
module.exports = router