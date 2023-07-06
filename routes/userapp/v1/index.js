/** 
* index.js
* @discription :: index route file for userapp platform
*/

const express = require("express");
const router = express.Router();

router.use('/userapp/auth', require("./auth"));
router.use('/userapp/user',require('./userRoutes'));
router.use('/userapp/payment',require('./paymentRoutes'));
router.use('/userapp/product',require('./productRoutes'));
router.use('/userapp/cart',require('./cartRoutes'));
router.use('/userapp/order',require('./orderRoutes'));



module.exports = router;