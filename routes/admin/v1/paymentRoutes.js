const express = require("express");
const router = express.Router();
const paymentController = require("../../../controller/admin/v1/paymentController");
const {PLATFORM} = require("../../../constants/authConstant");
const auth = require("../../../middleware/auth");


router.post('/create',auth(PLATFORM.ADMIN),paymentController.addPayment);
router.post('/addBulk',auth(PLATFORM.ADMIN),paymentController.bulkInsertPayment);
router.post('/list',auth(PLATFORM.ADMIN), paymentController.findAllPayment);
router.get('/get/:id',auth(PLATFORM.ADMIN), paymentController.getPayment);
router.post('/count',auth(PLATFORM.ADMIN),paymentController.getPaymentCount);
router.put('/update/:id',auth(PLATFORM.ADMIN), paymentController.updatePayment);
router.put('/updateBulk',auth(PLATFORM.ADMIN),paymentController.bulkUpdatePayment);
router.delete('/soft-delete/:id',auth(PLATFORM.ADMIN), paymentController.softDeletePayment);
router.delete('/delete/:id',auth(PLATFORM.ADMIN),paymentController.deletePayment);
router.post('/deleteMany',auth(PLATFORM.ADMIN),paymentController.deleteManyPayment);
router.put('/softDeleteMany',auth(PLATFORM.ADMIN),paymentController.softDeleteManyPayment);

module.exports = router;


