const express = require("express");
const router = express.Router();
const orderController = require("../../../controller/admin/v1/orderController");
const {PLATFORM} = require("../../../constants/authConstant");
const auth = require("../../../middleware/auth");


router.post('/create',auth(PLATFORM.ADMIN),orderController.addOrder);
router.post('/addBulk',auth(PLATFORM.ADMIN),orderController.bulkInsertOrder);
router.get('/get/:id',auth(PLATFORM.ADMIN), orderController.getOrder);
router.post('/list',auth(PLATFORM.ADMIN), orderController.findAllOrder);
router.post('/count',auth(PLATFORM.ADMIN),orderController.getOrderCount);
router.put('/update/:id',auth(PLATFORM.ADMIN), orderController.updateOrder);
router.put('/updateBulk',auth(PLATFORM.ADMIN),orderController.bulkUpdateOrder);
router.delete('/soft-delete/:id',auth(PLATFORM.ADMIN), orderController.softDeleteOrder);
router.delete('/delete/:id',auth(PLATFORM.ADMIN),orderController.deleteOrder);
router.post('/deleteMany',auth(PLATFORM.ADMIN),orderController.deleteManyOrder);
router.put('/softDeleteMany',auth(PLATFORM.ADMIN),orderController.softDeleteManyOrder);


module.exports = router;


