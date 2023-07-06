/**
 * PaymentController.js
 * @description : exports action methods for Payment.
 */

const Payment = require('../../../model/payment');
const paymentSchemaKey = require('../../../utils/validation/paymentValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbServices');
const ObjectId = require('mongodb').ObjectId;
const utils = require('../../../utils/comon');
   
/**
 * @description : create document of Payment in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Payment. {status, message, data}
 */ 
const addPayment = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      paymentSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    dataToCreate.addedBy = req.user.id;
    dataToCreate = new Payment(dataToCreate);
    let createdPayment = await dbService.create(Payment,dataToCreate);
    return res.success({ data : createdPayment });
  } catch (error) {
    return res.internalServerError({ message:error.message }); 
  }
};

/**
 * @description : create multiple documents of Payment in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created Payments. {status, message, data}
 */
const bulkInsertPayment = async (req,res)=>{
    try {
      if (req.body && (!Array.isArray(req.body.data) || req.body.data.length < 1)) {
        return res.badRequest();
      }
      let dataToCreate = [ ...req.body.data ];
      for (let i = 0;i < dataToCreate.length;i++){
        dataToCreate[i] = {
          ...dataToCreate[i],
          addedBy: req.user.id
        };
      }
      let createdPayments = await dbService.create(Payment,dataToCreate);
      createdPayments = { count: createdPayments ? createdPayments.length : 0 };
      return res.success({ data:{ count:createdPayments.count || 0 } });
    } catch (error){
      return res.internalServerError({ message:error.message });
    }
  };


/**
 * @description : find all documents of Payment from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Payment(s). {status, message, data}
 */
const findAllPayment = async (req,res) => {
    try {
      let options = {};
      let query = {};
      let validateRequest = validation.validateFilterWithJoi(
        req.body,
        paymentSchemaKey.findFilterKeys,
        Payment.schema.obj
      );
      if (!validateRequest.isValid) {
        return res.validationError({ message: `${validateRequest.message}` });
      }
      if (typeof req.body.query === 'object' && req.body.query !== null) {
        query = { ...req.body.query };
      }
      if (req.body.isCountOnly){
        let totalRecords = await dbService.count(Payment, query);
        return res.success({ data: { totalRecords } });
      }
      if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
        options = { ...req.body.options };
      }
      let foundPayments = await dbService.paginate( Payment,query,options);
      if (!foundPayments || !foundPayments.data || !foundPayments.data.length){
        return res.recordNotFound(); 
      }
      return res.success({ data :foundPayments });
    } catch (error){
      return res.internalServerError({ message:error.message });
    }
  };


/**
 * @description : find document of Payment from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Payment. {status, message, data}
 */
const getPayment = async (req,res) => {
    try {
      let query = {};
      if (!ObjectId.isValid(req.params.id)) {
        return res.validationError({ message : 'invalid objectId.' });
      }
      query._id = req.params.id;
      let options = {};
      let foundPayment = await dbService.findOne(Payment,query, options);
      if (!foundPayment){
        return res.recordNotFound();
      }
      return res.success({ data :foundPayment });
    }
    catch (error){
      return res.internalServerError({ message:error.message });
    }
  };


  /**
 * @description : returns total number of documents of Payment.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getPaymentCount = async (req,res) => {
    try {
      let where = {};
      let validateRequest = validation.validateFilterWithJoi(
        req.body,
        paymentSchemaKey.findFilterKeys,
      );
      if (!validateRequest.isValid) {
        return res.validationError({ message: `${validateRequest.message}` });
      }
      if (typeof req.body.where === 'object' && req.body.where !== null) {
        where = { ...req.body.where };
      }
      let countedPayment = await dbService.count(Payment,where);
      return res.success({ data : { count: countedPayment } });
    } catch (error){
      return res.internalServerError({ message:error.message });
    }
  };

  /**
 * @description : update document of Payment with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Payment.
 * @return {Object} : updated Payment. {status, message, data}
 */
const updatePayment = async (req,res) => {
    try {
      let dataToUpdate = {
        ...req.body,
        updatedBy:req.user.id,
      };
      let validateRequest = validation.validateParamsWithJoi(
        dataToUpdate,
        paymentSchemaKey.updateSchemaKeys
      );
      if (!validateRequest.isValid) {
        return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
      }
      const query = { _id:req.params.id };
      let updatedPayment = await dbService.updateOne(Payment,query,dataToUpdate);
      if (!updatedPayment){
        return res.recordNotFound();
      }
      return res.success({ data :updatedPayment });
    } catch (error){
      return res.internalServerError({ message:error.message });
    }
  };

  /**
 * @description : update multiple records of Payment with data by filter.
 * @param {Object} req : request including filter and data in request body.
 * @param {Object} res : response of updated Payments.
 * @return {Object} : updated Payments. {status, message, data}
 */
const bulkUpdatePayment = async (req,res)=>{
    try {
      let filter = req.body && req.body.filter ? { ...req.body.filter } : {};
      let dataToUpdate = {};
      delete dataToUpdate['addedBy'];
      if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
        dataToUpdate = { 
          ...req.body.data,
          updatedBy : req.user.id
        };
      }
      let updatedPayment = await dbService.updateMany(Payment,filter,dataToUpdate);
      if (!updatedPayment){
        return res.recordNotFound();
      }
      return res.success({ data :{ count : updatedPayment } });
    } catch (error){
      return res.internalServerError({ message:error.message }); 
    }
  };

  /**
 * @description : deactivate document of Payment from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of Payment.
 * @return {Object} : deactivated Payment. {status, message, data}
 */
const softDeletePayment = async (req,res) => {
    try {
      if (!req.params.id){
        return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
      }
      let query = { _id:req.params.id };
      const updateBody = {
        isDeleted: true,
        updatedBy: req.user.id,
      };
      let updatedPayment = await dbService.updateOne(Payment, query, updateBody);
      if (!updatedPayment){
        return res.recordNotFound();
      }
      return res.success({ data:updatedPayment });
    } catch (error){
      return res.internalServerError({ message:error.message }); 
    }
  };

 

  /**
 * @description : delete document of Payment from table.
 * @param {Object} req : request including id as req param.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted Payment. {status, message, data}
 */
const deletePayment = async (req,res) => {
    try { 
      if (!req.params.id){
        return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
      }
      const query = { _id:req.params.id };
      const deletedPayment = await dbService.deleteOne(Payment, query);
      if (!deletedPayment){
        return res.recordNotFound();
      }
      return res.success({ data :deletedPayment });
          
    }
    catch (error){
      return res.internalServerError({ message:error.message });
    }
  };

  /**
 * @description : delete documents of Payment in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of documents deleted.
 * @return {Object} : no of documents deleted. {status, message, data}
 */
const deleteManyPayment = async (req, res) => {
    try {
      let ids = req.body.ids;
      if (!ids || !Array.isArray(ids) || ids.length < 1) {
        return res.badRequest();
      }
      const query = { _id:{ $in:ids } };
      const deletedPayment = await dbService.deleteMany(Payment,query);
      if (!deletedPayment){
        return res.recordNotFound();
      }
      return res.success({ data :{ count :deletedPayment } });
    } catch (error){
      return res.internalServerError({ message:error.message }); 
    }
  };

   /**
 * @description : deactivate multiple documents of Payment from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated documents of Payment.
 * @return {Object} : number of deactivated documents of Payment. {status, message, data}
 */
const softDeleteManyPayment = async (req,res) => {
  try {
    let ids = req.body.ids;
    if (!ids || !Array.isArray(ids) || ids.length < 1) {
      return res.badRequest();
    }
    const query = { _id:{ $in:ids } };
    const updateBody = {
      isDeleted: true,
      updatedBy: req.user.id,
    };
    let updatedPayment = await dbService.updateMany(Payment,query, updateBody);
    if (!updatedPayment) {
      return res.recordNotFound();
    }
    return res.success({ data:{ count :updatedPayment } });
        
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};


  module.exports = {
    addPayment,
    bulkInsertPayment,
    findAllPayment,
    getPayment,
    getPaymentCount,
    updatePayment,
    bulkUpdatePayment,
    softDeletePayment,
    deletePayment,
    deleteManyPayment,
    softDeleteManyPayment    
  };