const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
let idValidator = require('mongoose-id-validator');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require("bcrypt");
const {USER_TYPES} = require("../constants/authConstant");
const {convertObjectToEnum} = require("../utils/comon")

const myCustomLabels = {
    totalDocs: 'itemCount',
    docs: 'data',
    limit: 'perPage',
    page: 'currentPage',
    nextPage: 'next',
    prevPage: 'prev',
    totalPages: 'pageCount',
    pagingCounter: 'slNo',
    meta: 'paginator',
  };
 
  mongoosePaginate.paginate.options = {customLabels:myCustomLabels}
  const Schema = mongoose.Schema;

  const schema = new Schema({
    password: {
        type: String,
      },
      firstName:{type:String},
      lastName:{type:String},
      sex:{type:String},
      date:{type:String},
      email: {
        type: String,
      },
      phone: {
          type: Number,
        },
       country_code:{
        type: Number,
        default:91
       } ,
       address:[{
          locality : {type:String},
          city : {type:String},
          state : {type:String},
          country : {type:String},
          zipcode : {type:Number}
       }],
      
      userType: {
        type: Number,
        enum: convertObjectToEnum(USER_TYPES),
        required: true
      },
      languagePreference: {
        type: String,
        default: "en"
      },
      avatar: {
        type: String
      },

      resetPasswordLink: {
        code: String,
        expireTime: Date
      },
        loginRetryLimit: {
          type: Number,
          default: 0
        },
        loginReactiveTime: { type: Date },
        ssoAuth: { googleId: { type: String } },
      createdBy: {
        ref: 'user',
        type: Schema.Types.ObjectId
      },
      updatedBy: {
        ref: 'user',
        type: Schema.Types.ObjectId
      },
      isAppUser: { type: Boolean, default: true },
      isActive: { type: Boolean },
      isDeleted: { type: Boolean },
      createdAt: { type: Date },
      updatedAt: { type: Date },
   
  
    },
      {
        timestamps: {
          createdAt: 'createdAt',
          updatedAt: 'updatedAt'
        }
      }

  );

  schema.pre('save', async function (next) {
    this.isDeleted = false;
    this.isActive = true;
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 8);
    }
    next();
  });

  schema.pre('insertMany', async function (next, docs) {
    if (docs && docs.length) {
      for (let index = 0; index < docs.length; index++) {
        const element = docs[index];
        element.isDeleted = false;
        element.isActive = true;
      }
    }
    next();
  });

  schema.methods.isPasswordMatch = async function (password) {
    const user = this;
    console.log(password,"this user password");
    return bcrypt.compare(password, user.password);
  };

  schema.method('toJSON', function () {
    const {
      _id, __v, ...object
    } = this.toObject({ virtuals: true });
    object.id = _id;
    delete object.password;
    return object;
  });

schema.plugin(mongoosePaginate);
schema.plugin(idValidator);
schema.plugin(uniqueValidator, { message: 'Error, expected {VALUE} to be unique.' });
const user = mongoose.model('user', schema);

module.exports = user;