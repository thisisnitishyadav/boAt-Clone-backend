/**
 * packageValidation.js
 * @description :: validate each post and put request as per package model
 */

const joi = require('joi');
const {
  options, isCountOnly, populate, select 
} = require('./comonFilterValidation');

/** validation keys and properties of package */
exports.schemaKeys = joi.object({
  name: joi.string().allow(null).allow(''),
  isDeleted: joi.boolean(),
  isActive: joi.boolean(),
  cost: joi.string().allow(null).allow(''),
  durationMonths: joi.number().integer().allow(0),
  maxDuration: joi.number().integer().allow(0),
}).unknown(true);

/** validation keys and properties of package for updation */
exports.updateSchemaKeys = joi.object({
  name: joi.string().allow(null).allow(''),
  isDeleted: joi.boolean(),
  isActive: joi.boolean(),
  cost: joi.string().allow(null).allow(''),
  durationMonths: joi.number().integer().allow(0),
  maxDuration: joi.number().integer().allow(0),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);

let keys = ['query', 'where'];
/** validation keys and properties of package for filter documents from collection */
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      name: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      isDeleted: joi.alternatives().try(joi.array().items(),joi.boolean(),joi.object()),
      isActive: joi.alternatives().try(joi.array().items(),joi.boolean(),joi.object()),
      cost: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      durationMonths: joi.alternatives().try(joi.array().items(),joi.number().integer(),joi.object()),
      maxDuration: joi.alternatives().try(joi.array().items(),joi.number().integer(),joi.object()),
      id: joi.any(),
      _id: joi.alternatives().try(joi.array().items(),joi.string().regex(/^[0-9a-fA-F]{24}$/),joi.object())
    }).unknown(true),])
  ),
  isCountOnly: isCountOnly,
  populate: joi.array().items(populate),
  select: select
    
}).unknown(true);
