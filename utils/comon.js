/**
 * common.js
 * @description: exports helper methods for project.
 */

/**
 * convertObjectToEnum : converts object to enum
 * @param {Object} obj : object to be converted
 * @return {Array} : converted Array
 */

const dbService = require("../utils/dbServices");
const axios = require('axios');


function convertObjectToEnum(obj) {
    const enumArr = [];
    Object.values(obj).map((val) => enumArr.push(val));
    return enumArr;
  }

  /**
 * checkUniqueFieldsInDatabase: check unique fields in database for insert or update operation.
 * @param {Object} model : mongoose model instance of collection
 * @param {Array} fieldsToCheck : array of fields to check in database.
 * @param {Object} data : data to insert or update.
 * @param {String} operation : operation identification.
 * @param {Object} filter : filter for query.
 * @return {Object} : information about duplicate fields.
 */
const checkUniqueFieldsInDatabase = async (model, fieldsToCheck, data, operation, filter = {}) => {
  switch (operation) {
    case 'REGISTER':
      for (const field of fieldsToCheck) {
        //Add unique field and it's value in filter.
        let query;
      
          query = {
            ...filter,
            [field]: data[field]
          };
        
        console.log(query, 'query');
        let found = await dbService.findOne(model, query);
        console.log(found, 'found');
        if (found) {
          return {
            isDuplicate: true,
            field: field,
            value: data[field]
          };
        }
      }
      //cross field validation required when login with multiple fields are present, to prevent wrong user logged in. 
      
   
      break;
    default:
      return { isDuplicate: false };
      break;
  }
  return { isDuplicate: false };
};

function getDifferenceOfTwoDatesInTime(currentDate, toDate) {
  let hours = toDate.diff(currentDate, 'hour');
  currentDate = currentDate.add(hours, 'hour');
  let minutes = toDate.diff(currentDate, 'minute');
  currentDate = currentDate.add(minutes, 'minute');
  let seconds = toDate.diff(currentDate, 'second');
  currentDate = currentDate.add(seconds, 'second');
  if (hours) {
    return `${hours} hour, ${minutes} minute and ${seconds} second`;
  }
  return `${minutes} minute and ${seconds} second`;
}

async function getAddressFromLocation(coordinates) {
  let lng = coordinates[0];
  let lat = coordinates[1];
  let url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_API_KEY}`;
  let { data } = await axios.get(url);
  console.log(data);
  return getAddressComponents(data.results)
}

function getAddressComponents(data) {
  let address = {}
  let { address_components } = data[0]
  address_components.map(c => {
    switch (c.types[0]) {
      case "postal_code":
        address.postal_code = c.long_name
        break;
      case "country":
        address.country = c.long_name
        break;
      case "locality":
        address.locality = c.long_name
        break;
      case "administrative_area_level_1":
        address.state = c.long_name
        break;
      default:
        break;
    }
  })
  address.full_address = data[0].formatted_address
  return address
}

  module.exports = {convertObjectToEnum,checkUniqueFieldsInDatabase,getDifferenceOfTwoDatesInTime,getAddressFromLocation}