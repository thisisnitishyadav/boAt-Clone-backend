/**
 * userValidation.js
 * @description :: validate each post and put request as per user model
 */

const joi = require('joi');
const {
  options, isCountOnly, populate, select
} = require('./comonFilterValidation');

/** validation keys and properties of user */
exports.schemaKeys = joi.object({
    password: joi.string().allow(null).allow(''),
    email: joi.string().email({ tlds: { allow: false } }),
    phone: joi.number().integer().allow(0),
    userType: joi.number().allow(0),
    isActive: joi.boolean(),
    isDeleted: joi.boolean(),
  }).unknown(true);

/** validation keys and properties of user for updation */
exports.updateSchemaKeys = joi.object({
    email: joi.string().email({ tlds: { allow: false } }),
    phone: joi.number().integer().allow(0),
    userType: joi.number().allow(0),
    isActive: joi.boolean(),
    isDeleted: joi.boolean(),
  }).unknown(true);

  let keys = ['query', 'where'];
/** validation keys and properties of user for filter documents from collection */
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      password: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      email: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      isActive: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      isDeleted: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      phone: joi.alternatives().try(joi.array().items(), joi.number().integer(), joi.object()),
      userType: joi.alternatives().try(joi.array().items(), joi.number().integer(), joi.object()),
      id: joi.any(),
      _id: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object())
    }).unknown(true),])
  ),
  isCountOnly: isCountOnly,
  populate: joi.array().items(populate),
  select: select

}).unknown(true);