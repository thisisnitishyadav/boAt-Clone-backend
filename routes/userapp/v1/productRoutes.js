const express = require("express");
const router = express.Router();
const productController = require("../../../controller/userapp/v1/productController");
const {PLATFORM} = require("../../../constants/authConstant");
const auth = require("../../../middleware/auth");


router.post('/list', productController.findAllProduct);
router.get('/get/:id', productController.getProduct);
router.post('/count',productController.getProductCount);
router.put('/update/:id',auth(PLATFORM.USERAPP), productController.updateProduct);


module.exports = router;


