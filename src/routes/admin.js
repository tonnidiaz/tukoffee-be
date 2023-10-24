const express = require('express');
const { Product, User, Order, Store, Review } = require('../models');
const { parseProducts } = require('../utils/functions');
const router = express.Router();

/* GET home page. */
router.get('/dash', async function(req, res, next) {

    let products = await Product.find().exec()
    let customers = (await User.find().exec()).filter(it=> it.email_verified && it.first_name)
    customers = customers.map(it=>it.toJSON())
    let orders = await Order.find().exec()
    orders = orders.map(it=>it.toJSON())
    let reviews = await Review.find().exec()
    reviews = reviews.map(it=>it.toJSON())
    let stores = await Store.find().exec()
    stores = stores.map(it=>it.toJSON())
  
    const data = {products: await parseProducts(products), customers, orders, reviews, stores};
  res.json(data)
});

module.exports = router;
