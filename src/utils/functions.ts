import { OTP } from "../models/otp";
import jwt from "jsonwebtoken";
const cloudinary = require('cloudinary').v2
import nodemailer from 'nodemailer';
import fs from 'fs';
const { env } = process
import {Response} from 'express'
function configCloudinary(){
    cloudinary.config({
    api_secret: env.CLOUDINARY_SECRET_KEY,
    api_key: env.CLOUDINARY_API_KEY,
    cloud_name: 'sketchi'
})
}

function randomInRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}


const genToken = (data: Obj, exp? : string | number | undefined) => {
    const { PRIVATE_KEY } = process.env;
    return exp
        ? jwt.sign(
              {
                  data,
              },
              PRIVATE_KEY!,
              { expiresIn: exp }
          )
        : jwt.sign({ payload: data }, PRIVATE_KEY!);
};
const genOTP = async (phone?: string, email?: string) => {
    const pin = randomInRange(1000, 9999);
    const otp = new OTP();
    otp.pin = pin;
    if (phone) otp.phone = phone;
    else otp.email = email;
    await otp.save();
    return otp;
};
const parseProducts = async (products: Obj[]) => {
    let data = <Obj>[];
    
    for (let prod of products){
        
        let rating : string | number = 0

        let revs = prod.reviews

        // Clear the reviews

        prod.reviews = []
      for (let revId of revs){
        
        const rev = await Review.findOne({_id: revId, status: EReviewStatus.approved}).exec()
        if (rev){
            rating += rev.rating;
            prod.reviews.push(rev._id)
        }
      }
      if (prod.reviews?.length){
            rating = (rating / (prod.reviews.length)).toFixed(1)
      }
      
      data.push({...prod.toJSON(), rating})
    }

    return data;
};
import axios from "axios";
import { Review } from "../models";
import { EReviewStatus } from "../models/review";
import { Obj } from "./types";
const sendSMS = async (number, message)=>{
    const encodedParams = new URLSearchParams();
    encodedParams.set("sms", number);
    encodedParams.set("message", message);
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
    return await axios.request(options)
}

const tunedErr = (res: Response, status: number, msg: string) => {
    return res.status(status).send(`tuned:${msg}`)
}

const delCloudinary = async (publicId: string)=>{
    configCloudinary()
    return await cloudinary.uploader.destroy(publicId)
}

const sendMail = async (subject: string, body: string, clients: string | string[], sender? : string) => {
    try {
      
      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        
        host: process.env.GMAIL_HOST, //"smtp.ethereal.email",
        port: Number(process.env.GMAIL_PORT),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL, //testAccount.user, // generated ethereal user
          pass: process.env.GMAIL_PASSWORD, //testAccount.pass, // generated ethereal password
        },
      });
  
      const storeDetails = getStoreDetails()
      // send mail with defined transport object
      const _sender =sender ?? storeDetails.store.email;
        console.log('SENDING FROM: ', _sender);
        console.log('SENDING MAIL TO: ', clients);
      let info = await transporter.sendMail({
        from: `"${storeDetails.store.name}" <${_sender}>`, // sender address
        to: `"${clients}"`, // list of receivers
        subject, // Subject line
        html: `<html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style type="text/css">
              .tb {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif  !important;
                margin: auto;
                padding: 10px;
                color: black;
              }
        
              .btn {
                cursor: pointer;
                display: inline-block;
                min-height: 1em;
                outline: 0;
                border: none;
                vertical-align: baseline;
                background: #e0e1e2 none;
                color: rgba(0, 0, 0, 0.6);
                font-family: Lato, "Helvetica Neue", Arial, Helvetica, sans-serif;
                margin: 0 0.25em 0 0;
                padding: 10px 16px;
                text-transform: none;
                text-shadow: none;
                font-weight: 600;
                line-height: 1em;
                font-style: normal;
                text-align: center;
                text-decoration: none;
                border-radius: 0.28571429rem;
                box-shadow: inset 0 0 0 1px transparent,
                  inset 0 0 0 0 rgba(34, 36, 38, 0.15);
                -webkit-user-select: none;
                -ms-user-select: none;
                user-select: none;
                transition: opacity 0.1s ease, background-color 0.1s ease,
                  color 0.1s ease, box-shadow 0.1s ease, background 0.1s ease;
                will-change: "";
                -webkit-tap-highlight-color: transparent;
              }
              .btn-primary {
                color: #fff !important;
                background-color: #0d6efd !important;
                border-color: #0d6efd !important;
              }
              .btn-danger {
                color: #fff !important;
                background-color: #fd950d !important;
                border-color: #fd950d !important;
              }
        a{
          color: #f08800 !important;
          font-weight: 600 !important;
        }
              table {
               
               
                width: 100%;
                
                border-radius: 10px !important;
                padding: 5px;
                border-collapse: collapse;
              }
        
              td,
              th {
                border: 2px solid #8f8f8f;
                text-align: left;
                padding: 8px;
              }
        
              tr:nth-child(even) {
                background-color: #e6e6e6;
              }
        
              .otp {
                background-color: #c4c4c4;
                border: 2px dashed #d37305;
                padding: 10px;
                border-radius: 5px;
                width: 150px;
                text-align: center;
                font-weight: 700;
                letter-spacing: 6;
                font-family: monospace;
                font-size: 20px;
              }
              .text-c{
                text-align: center !important;
              }

              .m-auto{
                margin: 0 auto;
              }
            </style>
          </head>
          <body>
  
              <div class="tb text-c">
              ${body}
              <p>For support please contact the Developer at <a href="mailto:${storeDetails.developer.email}">${storeDetails.developer.email}</a></p>
              </div>
  
          </body>
          </html>
                `, // html body
      });
  
      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      return "Email sent";
    } catch (err) {
      console.log(err);
      return null;
    }
  };
  const jsonPath = __dirname + '/../assets/store.json'
  const getStoreDetails = ()=>{
    const buff = fs.readFileSync(jsonPath, { encoding: "utf-8" });
    return JSON.parse(buff)
  }
  export { sendMail,getStoreDetails, genToken, delCloudinary, sendSMS, parseProducts, genOTP, randomInRange, tunedErr };
