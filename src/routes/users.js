const express = require('express');
const router = express.Router();
const { User, Cart, Order, Review } =  require("../models/index")
/* GET users listing. */
router.get('/', async function(req, res, next) {

    const { id } = req.query

    let users = []
    try{
    if (id){
        const user = await User.findById(id).exec()
        if (!user) return res.status(404).json({msg: "User not found"})
        console.log(user.address)
        users.push(user)
    }
    else {
        users = (await User.find().exec()).filter(it=> it.email_verified && it.first_name)
    }
  res.json({users: users.map(it=>it.toJSON())})}
  catch(e){
    console.log(e)
    res.status(500).json({msg: "Something went wrong!"})
  }
});

router.post('/delete', async (req, res)=>{
    try {
        const{ ids } = req.body;
        // Delete all users from the provided ids
        for (let id of ids){ 
            try{
                console.log(`Deleting ${id}`);
                
                await User.findByIdAndDelete(id).exec() 
                //Delete cart, orders, and reviews
                await Cart.findOneAndDelete({customer: id}).exec()
                await Order.findOneAndDelete({ customer: id }).exec()
                await Review.findOneAndDelete({user: id}).exec()
            }
             catch(e){
                console.log(e);
                continue
             }
        }
        res.send("Users deleted")
       
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: "Something went wrong"})
    }
})

module.exports = router;
