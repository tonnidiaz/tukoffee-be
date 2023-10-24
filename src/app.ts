import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import indexRouter from './routes/index';
import orderRouter from './routes/order';
import adminRouter from './routes/admin';
import usersRouter from './routes/users';
import messageRouter from './routes/message';
import ordersRouter from './routes/orders';
import productsRouter from './routes/products';
import authRouter from './routes/auth';
import searchRouter from './routes/search';
import storesRouter from './routes/stores';
import userRouter from './routes/user';
import hooksRouter from './routes/hooks';
const app = express();
import { default as mongoose } from 'mongoose';
import multer from 'multer';
import cors from 'cors';
import { DEV } from './utils/constants';

const envPath = DEV ? path.resolve(process.cwd(), '.env') : '/etc/secrets/prod.env'
require("dotenv").config({path: envPath});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');



app.use(cors()) 
 app.use(cors({
  origin: '*'
}))
/*------------------ mongodb ----------------------- */
async function connectMongo(){
    let mongoURL = process.env.MONGO_URL + "tukoffee"
    try {
        console.log(mongoURL);
      await mongoose.connect(mongoURL);
      console.log('Connection established'); 
    }
    catch(e) {
      console.log('Could not establish connection')
     console.log(e); 
    }
  }
  (async function(){await connectMongo()})()
  /*------------------ End mongodb ----------------------- */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const parser = multer().none();
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/order', orderRouter);
app.use('/orders', ordersRouter);
app.use('/hooks', hooksRouter);
app.use('/products', parser, productsRouter);
app.use('/auth', parser, authRouter);
app.use('/search', parser, searchRouter);
app.use('/user', parser, userRouter);
app.use('/stores', parser, storesRouter);
app.use('/message', parser, messageRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
