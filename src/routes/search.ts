import express from 'express';
import { tunedErr } from '../utils/functions';
import { Product } from '../models';
import { IProduct } from '../models/product';
const router = express.Router();

router.get('/',async (req, res)=>{
    try {
        const {q, by} = req.query;
        console.log(q)
        let products : IProduct[] = []

        if (by == "pid"){
            products = await Product.find({pid: q}).exec()
        }
        else{
            products = await Product.find({name: {$regex: q, $options: 'i'}}).exec()
        products = [...products, ...await Product.find({description: {$regex: q, $options: 'i'}}).exec()]
        products  = [...new Set(products)]
        }
         
        res.json({products: products.map(it=> it.toJSON())})
    } catch (e) {
        return tunedErr(res, 500, "Something went wrong")
    }
})
export default router