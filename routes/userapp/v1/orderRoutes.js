const express = require("express");
const router = express.Router();
const orderController = require("../../../controller/userapp/v1/orderController");
const {PLATFORM} = require("../../../constants/authConstant");
const auth = require("../../../middleware/auth");


router.post('/create',auth(PLATFORM.USERAPP),orderController.addOrder);
router.post('/list',auth(PLATFORM.USERAPP), orderController.findAllOrder);
router.get('/get/:id',auth(PLATFORM.USERAPP), orderController.getOrder);
router.put('/update/:id',auth(PLATFORM.USERAPP), orderController.updateOrder);
router.delete('/soft-delete/:id',auth(PLATFORM.USERAPP), orderController.softDeleteOrder);


module.exports = router;


