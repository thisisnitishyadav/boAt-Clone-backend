const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
let idValidator = require('mongoose-id-validator');
const uniqueValidator = require('mongoose-unique-validator');

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
      title :{
        shortTitle : {type:String},
        longTitle : {type:String},
      },
      category:{type:String},
      subCategory:{type:String},
      price:{
        mrp: {type:Number},
        discount: {type:String},
        cost: {type:Number}
      },
      tagLine: {type:String},
      image : {type:String},
      productImages : [
        {
          name:{type:String},
          path: {type:String}
        }
      ],
      productUrl: {type : String},
      addeddBy: {
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
    next();
  });
  
  schema.pre('insertMany', async function (next, docs) {
    if (docs && docs.length){
      for (let index = 0; index < docs.length; index++) {
        const element = docs[index];
        element.isDeleted = false;
        element.isActive = true;
      }
    }
    next();
  });
  
  schema.method('toJSON', function () {
    const {
      _id, __v, ...object 
    } = this.toObject({ virtuals:true });
    object.id = _id;
       
    return object;
  });
  schema.plugin(mongoosePaginate);
  schema.plugin(idValidator);
  const product = mongoose.model('product',schema);
  module.exports = product;