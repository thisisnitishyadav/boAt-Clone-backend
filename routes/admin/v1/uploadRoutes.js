/**
 * uploadRoutes.js
 * @description :: routes of upload/download attachment
 */

const express = require('express');
const router = express.Router();
const fileUploadController = require('../../../controller/admin/v1/fileUploadController');
const auth = require('../../../middleware/auth');
const { PLATFORM } =  require('../../../constants/authConstant'); 

router.post('/upload',fileUploadController.upload);

router.post('/generate-pre-signed-url',fileUploadController.generatePreSignedURL);

module.exports = router;