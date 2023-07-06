const express = require("express");
const router = express.Router();
const userController = require("../../../controller/admin/v1/userController");
const {PLATFORM} = require("../../../constants/authConstant");
const auth = require("../../../middleware/auth");

router.get('/me',auth(PLATFORM.ADMIN), userController.getLoggedInUserInfo);
router.post('/create',auth(PLATFORM.ADMIN),userController.addUser);
router.get('/get/:id',auth(PLATFORM.ADMIN), userController.getUser);
router.post('/list',auth(PLATFORM.ADMIN), userController.findAllUser);
router.post('/count',auth(PLATFORM.ADMIN),userController.getUserCount);
router.put('/update/:id',auth(PLATFORM.ADMIN), userController.updateUser);
router.delete('/soft-delete/:id',auth(PLATFORM.ADMIN), userController.softDeleteUser);
router.delete('/delete/:id',auth(PLATFORM.ADMIN),userController.deleteUser);



module.exports = router;


