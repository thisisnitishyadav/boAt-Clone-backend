const express = require("express");
const router = express.Router();
const cartController = require("../../../controller/userapp/v1/cartController");
const {PLATFORM} = require("../../../constants/authConstant");
const auth = require("../../../middleware/auth");


router.post('/create',auth(PLATFORM.USERAPP),cartController.addCart);
router.post('/list',auth(PLATFORM.USERAPP), cartController.findAllCart);
router.get('/get/:id',auth(PLATFORM.USERAPP), cartController.getCart);
router.put('/update/:id',auth(PLATFORM.USERAPP), cartController.updateCart);
router.delete('/delete/:id',auth(PLATFORM.USERAPP), cartController.deleteCart);
router.delete('/soft-delete/:id',auth(PLATFORM.USERAPP), cartController.softDeleteCart);


module.exports = router;


