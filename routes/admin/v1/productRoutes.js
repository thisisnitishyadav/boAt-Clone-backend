const express = require("express");
const router = express.Router();
const productController = require("../../../controller/admin/v1/productController");
const {PLATFORM} = require("../../../constants/authConstant");
const auth = require("../../../middleware/auth");


router.post('/create',auth(PLATFORM.ADMIN),productController.addProduct);
router.post('/addBulk',auth(PLATFORM.ADMIN),productController.bulkInsertProduct);
router.post('/list',auth(PLATFORM.ADMIN), productController.findAllProduct);
router.get('/get/:id',auth(PLATFORM.ADMIN), productController.getProduct);
router.post('/count',auth(PLATFORM.ADMIN),productController.getProductCount);
router.put('/update/:id',auth(PLATFORM.ADMIN), productController.updateProduct);
router.put('/updateBulk',auth(PLATFORM.ADMIN),productController.bulkUpdateProduct);
router.delete('/soft-delete/:id',auth(PLATFORM.ADMIN), productController.softDeleteProduct);
router.delete('/delete/:id',auth(PLATFORM.ADMIN),productController.deleteProduct);
router.post('/deleteMany',auth(PLATFORM.ADMIN),productController.deleteManyProduct);
router.put('/softDeleteMany',auth(PLATFORM.ADMIN),productController.softDeleteManyProduct);

module.exports = router;


