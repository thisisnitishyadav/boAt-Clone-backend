const express = require("express");
const router = express.Router();
const userController = require("../../../controller/userapp/v1/userController");
const {PLATFORM} = require("../../../constants/authConstant");
const auth = require("../../../middleware/auth");
const autherize = require("../../../middleware/authorize");


router.get('/me',auth(PLATFORM.USERAPP), userController.getLoggedInUserInfo);
router.put('/update/:id',auth(PLATFORM.USERAPP), autherize(PLATFORM.USERAPP), userController.updateUser);
router.delete('/soft-delete/:id',auth(PLATFORM.USERAPP), autherize(PLATFORM.USERAPP), userController.softDeleteUser);


module.exports = router;


