import express, { Request } from 'express';

const router = express.Router();

import bcrypt from "bcrypt";
import { User } from "../../models";
import { genToken, genOTP, randomInRange, sendSMS, tunedErr, sendMail } from "../../utils/functions";
import { auth, lightAuth } from "../../utils/middleware";
import { UserPermissions } from "../../utils/constants";
import otpRouter from "./otp";
import passwordRouter from "./password";
const importantEmails = ["tonnidiazed@gmail.com", "clickbait4587@gmail.com", "openbytes@yahoo.com"];

router.post("/signup", async (req, res) => {
    try {
        const { body, query } = req;

        //Email not required / not yet verified
        //Find user by number and add the other fields
        //Save user ,gen token
        if (query.act == 'complete'){
            const user = await User.findOne({email: body.email}).exec()
            for (let k of Object.keys(body)){
                user!.set(k, body[k])
            }
            await user!.save();
            const token = genToken({ id: user!._id });
            return res.json({token})
        }
        // Delete existing user with unverified number
        await User.findOneAndDelete({phone: body.phone, phone_verified: false}).exec()
        
        // Delete existing user with unverified email
        await User.findOneAndDelete({email: body.email, email_verified: false}).exec()
        
        if (await User.findOne({phone: body.phone, phone_verified: true}).exec())
            return tunedErr(res, 400, 'User already with same number already exists')

        if (await User.findOne({email: body.email, email_verified: true}).exec())
            return tunedErr(res, 400, 'User already with same email already exists')
        const user = new User()
        for (let key of Object.keys(body)){
            if (key == 'password')
            user.password = bcrypt.hashSync(body[key], 10);
            else{
                user[key] = body[key]
            }
            
        }

        
        const otp = randomInRange(1000, 9999);
        console.log(otp)
        user.otp = otp;
        await sendMail("Tukoffee Verification Email",
                `<h2 style="font-weight: 500">Here is your signup verification One-Time-PIN:</h2>
                    <p style="font-size: 20px; font-weight: 600">${user.otp}</p>
                ` , user.email
               )
        // Send the otp && save user
        if (body.phone){
             const number = body.phone.startsWith("+")
            ? body.phone
            : "+27" + body.phone.slice(1);
        }
       

        // const smsRes = await sendSMS(number, `Tukoffee - your code is: ${otp}`)
        //console.log(smsRes.data)
        await user.save();
        res.json({ msg: "OTP Generated" });
        /* 
            Verify email route
            if (importantEmails.indexOf(email) != -1)
                user.permissions = UserPermissions.delete;
            await user.save(); */

    } catch (e) {
        console.log(e);
        res.status(500).send("tuned:Something went wrong");
    }
});

router.post("/login", lightAuth, async (req  : Request, res, next) => {
    try {
        const { email, password, phone } = req.body;
        if (req.user && !password) {
            //Loging in with token
            res.json({ user: { ...req.user.toJSON() } });
            return;
        } else if (phone && password) {
            let user = await User.findOne({ phone }).exec();
            if (user) {
                const passValid = bcrypt.compareSync(password, user.password);

                if (!passValid)
                    return res.status(401).send("tuned:Incorrect password.");
                const token = genToken({ id: user._id });
                res.json({ user: { ...user.toJSON() }, token });
            }
            else return tunedErr(res, 400, 'Account does not exist')
           
        } else if (email && password) {
            const user = await User.findOne({ email }).exec();
            if (!user)
                return res.status(401).send("tuned:Account does not exists.");
            const passValid = bcrypt.compareSync(password, user.password);

            if (!passValid)
                return res.status(401).send("tuned:Incorrect password.");

            const token = genToken({ id: user._id });
            res.json({ user: { ...user.toJSON(), password: password }, token });
        } else {
            res.status(400).send("tuned:Provide all fields");
        }
    } catch (e) {
        console.log(e);
        res.status(500).send("tuned:Something went wrong");
    }
});

router.post("/verify-email", async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email }).exec();
        if (!user) return tunedErr(res, 400, "Restart the signup process")

        if (!otp) {
            const pin = randomInRange(1000, 9999);
            //TODO: Send real pin
            console.log(pin)
            user.otp = pin;
        } else {
            if (user.otp == otp) {
                user.email_verified = true;
                if (importantEmails.includes(email))
                    user.permissions = UserPermissions.delete;
            } else {
                return res.status(400).send("tuned:Incorrect OTP");
            }
        }
        await user.save();
        res.json({user: user.toJSON()})
    } catch (e) {
        console.log(e)
        res.status(500).send('tuned:Something went wrong')
    }
});
router.use("/password", passwordRouter);

router.use("/otp", otpRouter);
export default router;
