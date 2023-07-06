
/**
 * CartController.js
 * @description : exports action methods for Cart.
 */

const Cart = require('../../../model/cart');
const dbService = require("../../../utils/dbServices");
const cartSchemaKey = require('../../../utils/validation/cartValidation');
const validation = require('../../../utils/validateRequest');
const ObjectId = require('mongodb').ObjectId;
const common = require('../../../utils/comon');


 /**
 * @description : create document of Cart in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Cart. {status, message, data}
 */ 
const addCart = async (req, res) => {
    try {
      let dataToCreate = { ...req.body || {} };
      let validateRequest = validation.validateParamsWithJoi(
        dataToCreate,
        cartSchemaKey.schemaKeys);
      if (!validateRequest.isValid) {
        return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
      }
      dataToCreate.addedBy = req.user.id;
      dataToCreate = new Cart(dataToCreate);
      let createdCart = await dbService.create(Cart,dataToCreate);
      return res.success({ data : createdCart });
    } catch (error) {
      return res.internalServerError({ message:error.message }); 
    }
  };
 
  /**
 * @description : create multiple documents of Cart in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created Carts. {status, message, data}
 */
const bulkInsertCart = async (req,res)=>{
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
    let createdCarts = await dbService.create(Cart,dataToCreate);
    createdCarts = { count: createdCarts ? createdCarts.length : 0 };
    return res.success({ data:{ count:createdCarts.count || 0 } });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

/**
 * @description : find all documents of Cart from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Cart(s). {status, message, data}
 */
const findAllCart = async (req,res) => {
  try {
    let options = {};
    let query = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      cartSchemaKey.findFilterKeys,
      Cart.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query };
    }
    if (req.body.isCountOnly){
      let totalRecords = await dbService.count(Cart, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    let foundCarts = await dbService.paginate( Cart,query,options);
    if (!foundCarts || !foundCarts.data || !foundCarts.data.length){
      return res.recordNotFound(); 
    }
    return res.success({ data :foundCarts });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};
 

/**
 * @description : find document of Cart from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Cart. {status, message, data}
 */
const getCart = async (req,res) => {
    try {
      let query = {};
      if (!ObjectId.isValid(req.params.id)) {
        return res.validationError({ message : 'invalid objectId.' });
      }
      query._id = req.params.id;
      let options = {};
      let foundCart = await dbService.findOne(Cart,query, options);
      if (!foundCart){
        return res.recordNotFound();
      }
      return res.success({ data :foundCart });
    }
    catch (error){
      return res.internalServerError({ message:error.message });
    }
  };


  /**
 * @description : returns total number of documents of Cart.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getCartCount = async (req,res) => {
  try {
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      cartSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedCart = await dbService.count(Cart,where);
    return res.success({ data : { count: countedCart } });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

  /**
 * @description : update document of Cart with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Cart.
 * @return {Object} : updated Cart. {status, message, data}
 */
const updateCart = async (req,res) => {
    try {
      let dataToUpdate = {
        ...req.body,
        updatedBy:req.user.id,
      };
      let validateRequest = validation.validateParamsWithJoi(
        dataToUpdate,
        cartSchemaKey.updateSchemaKeys
      );
      if (!validateRequest.isValid) {
        return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
      }
      const query = { _id:req.params.id };
      let updatedCart = await dbService.updateOne(Cart,query,dataToUpdate);
      if (!updatedCart){
        return res.recordNotFound();
      }
      return res.success({ data :updatedCart });
    } catch (error){
      return res.internalServerError({ message:error.message });
    }
  };

  /**
 * @description : update multiple records of Cart with data by filter.
 * @param {Object} req : request including filter and data in request body.
 * @param {Object} res : response of updated Carts.
 * @return {Object} : updated Carts. {status, message, data}
 */
const bulkUpdateCart = async (req,res)=>{
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
    let updatedCart = await dbService.updateMany(Cart,filter,dataToUpdate);
    if (!updatedCart){
      return res.recordNotFound();
    }
    return res.success({ data :{ count : updatedCart } });
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};

 /**
 * @description : deactivate document of Cart from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of Cart.
 * @return {Object} : deactivated Cart. {status, message, data}
 */
const softDeleteCart = async (req,res) => {
    try {
      if (!req.params.id){
        return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
      }
      let query = { _id:req.params.id };
      const updateBody = {
        isDeleted: true,
        updatedBy: req.user.id,
      };
      let updatedCart = await dbService.updateOne(Cart, query, updateBody);
      if (!updatedCart){
        return res.recordNotFound();
      }
      return res.success({ data:updatedCart });
    } catch (error){
      return res.internalServerError({ message:error.message }); 
    }
  };
      
/**
 * @description : delete document of Cart from table.
 * @param {Object} req : request including id as req param.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted Cart. {status, message, data}
 */
const deleteCart = async (req,res) => {
  try { 
    if (!req.params.id){
      return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
    }
    const query = { _id:req.params.id };
    const deletedCart = await dbService.deleteOne(Cart, query);
    if (!deletedCart){
      return res.recordNotFound();
    }
    return res.success({ data :deletedCart });
        
  }
  catch (error){
    return res.internalServerError({ message:error.message });
  }
};

/**
 * @description : delete documents of Cart in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of documents deleted.
 * @return {Object} : no of documents deleted. {status, message, data}
 */
const deleteManyCart = async (req, res) => {
  try {
    let ids = req.body.ids;
    if (!ids || !Array.isArray(ids) || ids.length < 1) {
      return res.badRequest();
    }
    const query = { _id:{ $in:ids } };
    const deletedCart = await dbService.deleteMany(Cart,query);
    if (!deletedCart){
      return res.recordNotFound();
    }
    return res.success({ data :{ count :deletedCart } });
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};
/**
 * @description : deactivate multiple documents of Cart from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated documents of Cart.
 * @return {Object} : number of deactivated documents of Cart. {status, message, data}
 */
const softDeleteManyCart = async (req,res) => {
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
    let updatedCart = await dbService.updateMany(Cart,query, updateBody);
    if (!updatedCart) {
      return res.recordNotFound();
    }
    return res.success({ data:{ count :updatedCart } });
        
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};



 
module.exports = {
  addCart,
  bulkInsertCart,
  findAllCart,
  getCart,
  getCartCount,
  updateCart,
  bulkUpdateCart,
  softDeleteCart,
  deleteCart,
  deleteManyCart,
  softDeleteManyCart    
};