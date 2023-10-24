import express from "express";
import multer from "multer";
import { Order, Cart, User, Product, Review, Store } from "../models";
import { genToken, tunedErr, delCloudinary } from "../utils/functions";
var router = express.Router();
import fs from "fs";
import os from "os";
import { parser, OrderStatus } from "../utils/constants";
import { auth } from "../utils/middleware";
import axios from "axios";
import { Car, CarColor } from "../models/car";


/* GET home page. */
router.get("/", function (req, res, next) {
    console.log(os.arch());
    res.render("index", { title: "Express" });
});

router.get('/map', (req,res)=>{
    res.render("map")
})
router.get("/payment", async (req, res) => {
    res.render("payment");
});
router.get("/clean", async (req, res) => {
    try {
        const { cancelled } = req.query
        
        // clean carts
        console.log("Cleaning carts");
        const carts = await Cart.find().exec();
        for (let cart of carts) {
            const user = await User.findById(cart.customer).exec();
            if (!user) await Cart.findByIdAndDelete(cart._id).exec();
            else {
                cart.products = (
                    await cart.populate("products")
                ).products.filter((it) => it.product != null);
                await cart.save();
            }
        }
        // clean orders
        console.log("Cleaning orders");
        const orders = await Order.find().exec();
        for (let order of orders) {
            const user = await User.findById(order.customer).exec();
            if (!user) await Order.findByIdAndDelete(order._id).exec();
            if (cancelled && order.status == OrderStatus.cancelled){
                //console.log(order._id)
                const u = await User.findById(order.customer).exec()
                if (!u) continue;
                const newOrders = u.orders?.filter(o=> {return o.toString() != order._id.toString()})
                await Order.findByIdAndDelete(order._id).exec()
                u.orders = newOrders
                await u.save()
               
            }
            else {
                order.products = (
                    await order.populate("products")
                ).products.filter((it) => it.product != null);
                await order.save();
            }
        }

       console.log('Cleaning products')
        
        for (let prod of await Product.find().exec()){
            const revs = prod.reviews ?? [];
            for (let rev of revs){
                // Search for review with the id, if no exist, rm it from product
                if (!(await Review.findById(rev).exec())){
                    prod.reviews = prod.reviews.filter(it=> it != rev)
                }
            }

            await prod.save()
        }
        res.send("cleanup complete!");
    } catch (e) {
        console.log(e)
        res.status(500).json({ msg: "something went wrong" });
    }
});
router.post("/update-field", multer().none(), async (req, res) => {
    const { coll } = req.query;
    const { fields, f } = req.body;
    try {
        let db;
        switch (coll) {
            case "order":
                db = Order;
                break;
            case "cart":
                db = Cart;
                break;
            case "user":
                db = User;
                break;
            case "address":
                break;
            case "product":
                db = Product;
                break;
        }
        console.log(db);
        if (db) {
            /*"delivery_address.town" : "delivery_address.surbub",
    "delivery_address.province" : "delivery_address.state" */
            await db
                .updateMany(
                    {},
                    {
                        $rename: JSON.parse(fields),
                    }
                )
                .exec();
        }

        res.send("Ok");
    } catch (e) {
        console.log(e);
        res.status(500).json({ msg: "something went wrong" });
    }
});
const jsonPath = __dirname + '/../assets/store.json' //path.join(__dirname, "assets", "store.json");
router.get("/store", async (req, res) => {
    const buff = fs.readFileSync(jsonPath, { encoding: "utf-8" });
    res.json(JSON.parse(buff));
});
router.post("/store/update", auth, async (req, res) => {
    try {
        const { data } = req.body;
        const buff = fs.readFileSync(jsonPath, { encoding: "utf-8" });
        const details = JSON.parse(buff);
        for (let key of Object.keys(data)) { 
            details[key] = data[key];
        }
        fs.writeFileSync(jsonPath, JSON.stringify(details));
        res.json({
            store: JSON.parse(fs.readFileSync(jsonPath, { encoding: "utf-8" })),
        });
    } catch (e) {
        console.log(e);
        res.status(500).send("Something went wrong");
    }
});

router.post("/encode", parser, async (req, res) => {
    try {
        const data = req.body;
        console.log(data);
        const token = genToken(data);
        res.send(token);
    } catch (e) {
        console.log(e);
        res.status(500).send("swr");
    }
});



router.get("/send-sms", async (req, res) => {
    try {
        const encodedParams = new URLSearchParams();
        encodedParams.set("sms", "+27726013383");
        encodedParams.set("message", "Tukoffe - Your verification code is: 45784");
        encodedParams.set("key", "B486ED40-95DB-DCA4-E62D-7F395776F89B");
        encodedParams.set("username", "clickbait4587");

        const options = {
            method: "POST",
            url: "https://inteltech.p.rapidapi.com/send.php",
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "X-RapidAPI-Key":
                    process.env.INTELTECH_API_KEY,
                "X-RapidAPI-Host": "inteltech.p.rapidapi.com",
            },
            data: encodedParams,
        };
            const response = await axios.request(options);
            console.log(response.data);
 
        res.send("ok");
    } catch (e) {
        console.log(e);
        return res.status(500).send("tuned:Something went wrong");
    }
});

router.post('/cloudinary', auth, async (req, res)=>{
    try{

        const { act, publicId, product } = req.body
       
        if (act == 'del'){
           const r = await delCloudinary(publicId)
           console.log(r)
           if (product){
            const _product = await Product.findById(product).exec()
            _product!.images = _product!.images.filter(it=> it.publicId != publicId)
            await _product!.save()
           }
        }
        res.send('Ok')
        
    }catch(e){
        console.log(e)
        return tunedErr(res, 500, 'Something went wrong')
    }
})

router.get('/migrate', async (req, res)=>{
    try{
        const stores = await Store.find().exec()
        //let ord = await Order.findOne({status: }).exec()
//await Order.deleteMany({status: OrderStatus.cancelled}).exec()
        for (let store of stores){
           /*  store.open_time_weekend = store.open_time_weekends
            store.close_time_weekend = store.close_time_weekends */
            
            await store.save()
        }
        res.send('OK')
    }
    catch(e){
        console.log(e)
        return tunedErr(res, 500, 'Failed to migrate')
    }
})

router.get('/cars', async (req, res)=>{
    const cars = await Car.find().exec()
   res.json({cars: cars.map(c=>c.toJSON())})
})
router.post('/car', async (req, res)=>{
    try{

        const car =  new Car()
        for (let key of Object.keys(req.body)){
            car[key] = req.body[key]
        }
    await car.save()
    res.send("CAR GOT")
    }
    catch(e){
        console.log(e)
        return tunedErr(res, 500, 'Failed to migrate')
    }
})


export default router;


