/** 
* index.js
* @discription :: index route file for userapp platform
*/

const express = require("express");
const router = express.Router();

router.use('/admin/auth', require("./auth"));
router.use('/admin/user',require('./userRoutes'));
router.use('/admin/payment',require('./paymentRoutes'));
router.use('/admin/product',require('./productRoutes'));
router.use('/admin/cart',require('./cartRoutes'));
router.use('/admin/order',require('./orderRoutes'));
router.use('/admin/file',require('./uploadRoutes'));


module.exports = router;