const { Store } = require('../models');
const { tunedErr } = require('../utils/functions')
const { auth} = require('../utils/middleware')
const router = require('express').Router()

router.get('/', async (req, res)=>{
    let stores = await Store.find().exec()
            stores = stores.map(it=>it.toJSON())
        res.json({stores})
})

router.post('/add',  auth, async (req, res)=>{
    try {
        const { body} = req;
        const store = new Store()

        for (let key of Object.keys(body)){
            store[key] = body[key]
        }
        await store.save()
        let stores = await Store.find().exec()
            stores = stores.map(it=>it.toJSON())
        res.json({stores})
    } catch (e) { 
        console.log(e)
        tunedErr(res, 500, "Something went wrong")
    }
})
router.post('/del',  auth, async (req, res)=>{
    try {
        const { id} = req.query;
        const store = await  Store.findByIdAndDelete(id).exec()
        if (!store) return tunedErr(res, 404, 'Store does not exist')

        let stores = await Store.find().exec()
            stores = stores.map(it=>it.toJSON())
        res.json({stores})
    } catch (e) { 
        console.log(e)
        tunedErr(res, 500, "Something went wrong")
    }
})
module.exports = router