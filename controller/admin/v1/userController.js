

const User = require('../../../model/user');
const dbService = require("../../../utils/dbServices");
const userSchemaKey = require('../../../utils/validation/userValidation');
const validation = require('../../../utils/validateRequest');
const ObjectId = require('mongodb').ObjectId;
const common = require('../../../utils/comon');

 /**
 * @description : get information of logged-in User.
 * @param {Object} req : authentication token is required
 * @param {Object} res : Logged-in user information
 * @return {Object} : Logged-in user information {status, message, data}
 */
 const getLoggedInUserInfo = async (req, res) => {
  try {
    const query = {
      _id: req.user.id,
      isDeleted: false
    };
    query.isActive = true;
    let foundUser = await dbService.findOne(User, query);
    if (!foundUser) {
      return res.recordNotFound();
    }
    return res.success({ data: foundUser });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};


  /**
 * @description : create document of User in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created User. {status, message, data}
 */ 
const addUser = async (req, res) => {
  try {
    let {
      phone,email,createdBy
    } = req.body;
    if (!createdBy || !email && !phone) {
      return res.badRequest({ message: 'Insufficient request parameters! email or phone and admin  is required.' });
    }
    
    if(req.user.id.toString()!==createdBy.toString())
    return res.unAuthorized({ message: 'Unautherized User' });

    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      userSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }

     // check data availble in database or not
    
     if(req.body.email){
      let checkUniqueFields = await common.checkUniqueFieldsInDatabase(User,['email'],dataToCreate,'REGISTER');
      if (checkUniqueFields.isDuplicate){
        return res.validationError({ message : `${checkUniqueFields.value} already exists.Unique ${checkUniqueFields.field} are allowed.` });
      }
  }
  if(req.body.phone){
      let checkUniqueFields = await common.checkUniqueFieldsInDatabase(User,['phone'],dataToCreate,'REGISTER');
    if (checkUniqueFields.isDuplicate){
      return res.validationError({ message : `${checkUniqueFields.value} already exists.Unique ${checkUniqueFields.field} are allowed.` });
    }
  }

  if (req.body.lng && req.body.lat) {
    dataToCreate.registeredLocation = {
      "type": "Point",
      "coordinates": [req.body.lng, req.body.lat]
    }
    dataToCreate.address = await common.getAddressFromLocation(dataToCreate.registeredLocation.coordinates);
  }

    dataToCreate = new User(dataToCreate);
    let createdUser = await dbService.create(User,dataToCreate);
  
    return res.success({ data : createdUser });
  } catch (error) {
    return res.internalServerError({ message:error.message }); 
  }
};
 

/**
 * @description : find document of User from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found User. {status, message, data}
 */
const getUser = async (req,res) => {
  try {
    if (!req.params.id) {
      return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    let query = {};
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message : 'invalid objectId.' });
    }
    query._id = req.params.id;
    let options = {};
    let foundUser = await dbService.findOne(User,query, options);
    if (!foundUser){
      return res.recordNotFound();
    }
    return res.success({ data :foundUser });
  }
  catch (error){
    return res.internalServerError({ message:error.message });
  }
};

  /**
 * @description : update document of User with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated User.
 * @return {Object} : updated User. {status, message, data}
 */
const updateUser = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
          }
        if(req.body.password)
        return res.validationError({ message: `Password is not update this method` });

        // if(req.params.id){
        //     if(req.user.id.toString()!==req.params.id)
        //         return res.unAuthorized({ message: 'Unautherized User' });
        //   }

      let dataToUpdate = { ...req.body, };
      let validateRequest = validation.validateParamsWithJoi(
        dataToUpdate,
        userSchemaKey.updateSchemaKeys
      );
      if (!validateRequest.isValid) {
        return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
      }
        // check data availble in database or not
    
      //   if(req.body.email){
      //     let checkUniqueFields = await common.checkUniqueFieldsInDatabase(User,['email'],dataToUpdate,'REGISTER');
      //     if (checkUniqueFields.isDuplicate){
      //       return res.validationError({ message : `${checkUniqueFields.value} already exists.Unique ${checkUniqueFields.field} are allowed.` });
      //     }
      // }
      // if(req.body.phone){
      //     let checkUniqueFields = await common.checkUniqueFieldsInDatabase(User,['phone'],dataToUpdate,'REGISTER');
      //   if (checkUniqueFields.isDuplicate){
      //     return res.validationError({ message : `${checkUniqueFields.value} already exists.Unique ${checkUniqueFields.field} are allowed.` });
      //   }
      // }
  
      const query = { _id: req.params.id };
      let updatedUser = await dbService.updateOne(User, query, dataToUpdate);
      if (!updatedUser) {
        return res.recordNotFound();
      }
      return res.success({ data: updatedUser });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  };

  /**
 * @description : deactivate document of User from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of User.
 * @return {Object} : deactivated User. {status, message, data}
 */
const softDeleteUser = async (req, res) => {
    try {
      if (!req.params.id) {
        return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
      }
      // if(req.params.id){
      //   if(req.user.id.toString()!==req.params.id)
      //       return res.unAuthorized({ message: 'Unautherized User' });
      // }
      const query = { _id: req.params.id };
      const updateBody = { isDeleted: true, isActive:false };
      let updatedUser = await dbService.updateOne(User, query, updateBody);
      if (!updatedUser) {
        return res.recordNotFound();
      }
      return res.success({ data: updatedUser });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  };

    /**
 * @description : delete document of Product from table.
 * @param {Object} req : request including id as req param.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted Product. {status, message, data}
 */
const deleteUser = async (req,res) => {
  try { 
    if (!req.params.id){
      return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
    }
    const query = { _id:req.params.id };
    const deletedUser = await dbService.deleteOne(User, query);
    if (!deletedUser){
      return res.recordNotFound();
    }
    return res.success({ data :deletedUser });
        
  }
  catch (error){
    return res.internalServerError({ message:error.message });
  }
};
      
/**
 * @description : find all documents of User from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found User(s). {status, message, data}
 */
const findAllUser = async (req,res) => {
  try {
    let options = {};
    let query = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      userSchemaKey.findFilterKeys,
      User.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query };
    }
    query._id = { $ne: req.user.id };
    if (req.body && req.body.query && req.body.query._id) {
      query._id.$in = [req.body.query._id];
    }
    console.log(query)
    if (req.body.isCountOnly){
      let totalRecords = await dbService.count(User, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    let foundUsers = await dbService.paginate( User,query,options);
    if (!foundUsers || !foundUsers.data || !foundUsers.data.length){
      return res.recordNotFound(); 
    }
    return res.success({ data :foundUsers });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};
   
/**
 * @description : returns total number of documents of User.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getUserCount = async (req,res) => {
  try {
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      userSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedUser = await dbService.count(User,where);
    return res.success({ data : { count: countedUser } });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

  module.exports = {
    getLoggedInUserInfo,
    addUser, 
    getUser,
    updateUser,
    softDeleteUser,
    findAllUser,
    getUserCount,
    deleteUser
}