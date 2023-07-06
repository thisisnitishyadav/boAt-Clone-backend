
const {
    LOGIN_ACCESS, PLATFORM
  } = require('../constants/authConstant');

/**
 * @description : autherize middleware for request.
 * @param {Object} req : request of route.
 * @param {Object} res : response of route.
 * @param {callback} next : executes the next middleware succeeding the current middleware.
 * @param {int} platform : platform
 */

const autherize = (platform) => async (req, res, next) => {
  try{
    if (platform == PLATFORM.USERAPP) {
            if(req.user.id.toString()!==req.params.id)
             return res.unAuthorized({ message: 'Unautherized User' });
         
          next();
    }
  }catch(error){
    return res.unAuthorized({ message: error.message });
  }
}

module.exports = autherize;