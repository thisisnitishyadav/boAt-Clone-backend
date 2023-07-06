const express = require("express");
const router = express.Router();
const cartController = require("../../../controller/admin/v1/cartController");
const {PLATFORM} = require("../../../constants/authConstant");
const auth = require("../../../middleware/auth");


router.post('/create',auth(PLATFORM.ADMIN),cartController.addCart);
router.post('/addBulk',auth(PLATFORM.ADMIN),cartController.bulkInsertCart);
router.get('/get/:id',auth(PLATFORM.ADMIN), cartController.getCart);
router.post('/list',auth(PLATFORM.ADMIN), cartController.findAllCart);
router.post('/count',auth(PLATFORM.ADMIN),cartController.getCartCount);
router.put('/update/:id',auth(PLATFORM.ADMIN), cartController.updateCart);
router.put('/updateBulk',auth(PLATFORM.ADMIN),cartController.bulkUpdateCart);
router.delete('/soft-delete/:id',auth(PLATFORM.ADMIN), cartController.softDeleteCart);
router.delete('/delete/:id',auth(PLATFORM.ADMIN),cartController.deleteCart);
router.post('/deleteMany',auth(PLATFORM.ADMIN),cartController.deleteManyCart);
router.put('/softDeleteMany',auth(PLATFORM.ADMIN),cartController.softDeleteManyCart);


module.exports = router;


