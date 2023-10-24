const router = require("express").Router();
import { User } from "../../models";
import { DEV } from "../../utils/constants";
import { tunedErr, randomInRange, genToken, sendMail, getStoreDetails } from "../../utils/functions";
router.post("/resend", async (req, res) => {
    try {
        const {phone, email} = req.body
        const user =
        phone ? (await User.findOne({ phone }).exec()) : email ?
        (await User.findOne({ email }).exec()) : null;

      if (!user) {return tunedErr(res, 400, "User does not exist")}
            const otp = randomInRange(1000, 9999)
            
            user.otp = otp
            if (DEV)
                console.log(otp)
        
            const storeDetails = getStoreDetails()
            await sendMail(`${storeDetails.store.name} Verification Email`,
                `<h2 style="font-weight: 500">Here is your Email verification One-Time-PIN:</h2>
                    <p class='otp m-auto' style="font-size: 20px; font-weight: 600">${otp}</p>
                ` , email
               )
            await user.save();
        
        res.send("OTP endpoint");
    } catch (e) {
        console.log(e)
        return tunedErr(res, 500, "Something went wrong")
    }
});
router.post("/verify", async (req, res) => {
    const { phone, email, otp, new_email } = req.body;
    console.log(email)
    let user;
    if (!otp) return res.status(400).send("tuned:Please provide OTP.");
    if (phone) {
        // Phone verification
        user = await User.findOne({ phone }).exec();
        if (!user)
            return res
                .status(404)
                .send(`tuned:Account with number: ${phone} does not exist!`);
        if (user.otp != otp)
            return res.status(400).send("tuned:Incorrect OTP.");
        user.phone_verified = true;
        user.otp = null
    } else if (email) {
        // Email verification
        
        user = await User.findOne({ email }).exec();
        if (!user)
            return tunedErr(res, 400, `Account with email: ${email} does not exist!`)
        if (user.otp != otp)
            return tunedErr(res, 400, "tuned:Incorrect OTP.");
        user.email_verified = true;
        
    }
    else if (new_email){
        user = await User.findOne({new_email}).exec()
        if (!user)
        return tunedErr(res, 400, `Incorrect credentials!`)
        if (user.otp != otp)
        return tunedErr(res, 400, "tuned:Incorrect OTP");
        // Asign new email to email
        user.email = new_email

    }
    await user.save();
    const token = genToken({ id: user._id });
                res.json({ user: { ...user.toJSON() }, token });
});
export default router;
