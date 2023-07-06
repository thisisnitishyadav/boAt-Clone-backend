/**
 * paymentValidation.js
 * @description :: validate each post and put request as per payment model
 */

const joi = require('joi');
const {
  options, isCountOnly, populate, select 
} = require('./comonFilterValidation');

/** validation keys and properties of payment */
exports.schemaKeys = joi.object({
  isDeleted: joi.boolean(),
  isActive: joi.boolean(),
  totalPayment: joi.number().integer().allow(0),
  currentPayment: joi.number().integer().allow(0),
  refId: joi.string().allow(null).allow(''),
  paymentStatus: joi.string().allow(null).allow('')
}).unknown(true);

/** validation keys and properties of payment for updation */
exports.updateSchemaKeys = joi.object({
  isDeleted: joi.boolean(),
  isActive: joi.boolean(),
  totalPayment: joi.number().integer().allow(0),
  currentPayment: joi.number().integer().allow(0),
  refId: joi.string().allow(null).allow(''),
  paymentStatus: joi.string().allow(null).allow(''),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);

let keys = ['query', 'where'];
/** validation keys and properties of payment for filter documents from collection */
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      isDeleted: joi.alternatives().try(joi.array().items(),joi.boolean(),joi.object()),
      isActive: joi.alternatives().try(joi.array().items(),joi.boolean(),joi.object()),
      totalPayment: joi.alternatives().try(joi.array().items(),joi.number().integer(),joi.object()),
      currentPayment: joi.alternatives().try(joi.array().items(),joi.number().integer(),joi.object()),
      refId: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      paymentStatus: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      id: joi.any(),
      _id: joi.alternatives().try(joi.array().items(),joi.string().regex(/^[0-9a-fA-F]{24}$/),joi.object())
    }).unknown(true),])
  ),
  isCountOnly: isCountOnly,
  populate: joi.array().items(populate),
  select: select
    
}).unknown(true);
