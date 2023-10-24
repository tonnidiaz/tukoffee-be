import express, { response } from "express";
import { Product, Order, Review } from "../models";
import { parseProducts, tunedErr } from "../utils/functions";
import { auth, lightAuth } from "../utils/middleware";
import { OrderStatus } from "../utils/constants";
import { EReviewStatus, IReview } from "../models/review";
const router = express.Router();

const genPID = async () => {
    const pid = Math.floor(Math.random() * 999999) + 1;
    const exists = await Product.findOne({ pid }).exec();
    if (exists != null) return genPID();
    return pid;
};

router.get("/", lightAuth, async (req, res, next) => {
    const args = req.query;
    const { pid, q } = args;

    try {
        let prods =
            pid && !q
                ? await Product.find({ pid }).exec()
                : await Product.find().exec();

        switch (q) {
            case "top-selling":
                prods = prods.filter((it) => it.top_selling);
                break;
            case "special":
                prods = prods.filter((it) => it.on_special);
                break;

            case "sale":
                prods = prods.filter((it) => it.on_sale);
                break;
            case "received":
                let orders = await Order.find({
                    customer: req.user!._id,
                    status:OrderStatus.completed,
                }).exec();
                orders = await Promise.all(
                    orders.map(
                        async (it) => (await it.populate("products.product")).populate('products.product.reviews')
                    )
                ); //

                return res.json(
                    orders.map((it) => {
                        return {
                            date: it.last_modified,
                            items: it.products
                                .map((p) => p.product)
                                .filter((it) => it),
                        };
                    })
                );
        }
        let data = await parseProducts(prods);

        res.json({ data });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Something went wrong" });
    }
});

router.post("/add", auth, async (req, res) => {
    try {
        const body = req.body;
        const prod = new Product();
        for (let key of Object.keys(body)) {
            prod[key] = body[key];
        }

        prod.pid = await genPID();
        await prod.save();
        console.log("Product added!");
        res.json({ pid: prod.pid });
    } catch (err) {
        console.log(err);
        res.status(500).send("tuned:Something went wrong");
    }
});

router.get("/reviews", lightAuth, async (req, res) => {
    try {
        const { id, pid, user, ids } = req.query;
        let reviews : IReview[]= [];
        if (pid) reviews = await Review.find({ product: pid }).exec();
        else if (id) reviews = [(await Review.findById(id).exec())!];
        else if (user) reviews = await Review.find({ user }).exec();
        else {
            reviews = await Review.find().exec();
        }

        reviews = await Promise.all(
            reviews.map(async (it) => (await it.populate("product")).toJSON())
        );
        res.json({ reviews });
    } catch (error) {
        console.log(error);
        return tunedErr(res, 500, "Something went wrong");
    }
});

router.post("/review", auth, async (req, res) => {
    try {
        const { act } = req.query;
        const { pid, id, review, ids } = req.body;

        if (act == "add") {
           
            const prod =
                (await Product.findOne({ pid }).exec()) ??
                (await Product.findById(id).exec());
            if (!prod) return tunedErr(res, 404, "Product not found");
            const _review = new Review();
            for (let key of Object.keys(review)) {
                _review.set(key, review[key]);
            }
            _review.product = prod._id;
        
            _review.user = req.user!._id;
            await _review.save();
            prod.reviews.push(_review._id);
            await prod.save();
           return res.json({ reviews: prod.reviews.map(e=> e.toJSON()) });
        } else if (act == "edit") {
            const rev = await Review.findById(id).exec();
            if (!rev) return res.status(400).send("Bad request")
            for (let key of Object.keys(review)) {
                rev.set(key, review[key]);
            }
        rev.status = EReviewStatus.pending
            rev.last_modified = new Date();
            await rev.save();
           
        }
        else if (act == 'del'){
            if (ids){
                for (let id of ids){
                    const rev = await Review.findById(id).exec()
                    await Review.findByIdAndDelete(id).exec()
                    const prod = await Product.findById(rev!.product).exec()  
                    prod!.reviews = prod!.reviews.filter(it => it != id)
                        await prod!.save()
                }
            }
            else
           { await Review.findByIdAndDelete(id).exec()}
        }
        let revs =  await Review.find().exec()
        revs = await Promise.all(revs.map(async it=> (await it.populate('product')).toJSON()))
        
        res.json({reviews: revs})
    } catch (e) {
        console.log(e)
        tunedErr(res, 500, "Something went wrong");
    }
});
router.post("/edit", auth, async (req, res) => {
    try {
        const { body } = req;

        const prod =
            (await Product.findOne({ pid: body.pid }).exec()) ??
            (await Product.findById(body.id).exec());
        if (!prod) return res.status(404).json({ msg: "Product not found" });

        for (let key of Object.keys(body)) {
            prod[key] = body[key];
        }
        prod.last_modified = new Date();
        await prod.save();
        console.log("Product edited!");
        res.json({ pid: prod.pid });
    } catch (err) {
        console.log(err);
        res.status(500).send("tuned:Something went wrong");
    }
});

router.post("/delete", auth, async (req, res) => {
    try {
        const { pid } = req.query;
        const { pids } = req.body;
        if (pid) {
            const product = await Product.findOneAndRemove({ pid }).exec();
            if (!product)
                return res.status(404).send("tuned:Product not found!");
            res.status(200).send("Product deleted successfully!");
        } else if (pids) {
            for (let _pid of pids) {
                try {
                    await Product.findOneAndRemove({ pid: _pid }).exec();
                } catch (e) {
                    console.log(e);
                    continue;
                }
            }

            const newProducts = await Product.find().exec();
            return res.json({ products: await parseProducts(newProducts) });
        }
    } catch (e) {
        console.log(e);
        res.status(500).send("tuned:Something went wrong!");
    }
});


export default router;
