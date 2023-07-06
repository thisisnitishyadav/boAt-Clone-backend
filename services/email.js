const nodemailer = require('nodemailer');
const SibApiV3Sdk = require("sib-api-v3-sdk")
const ejs = require('ejs');
const sesTransport = require('nodemailer-ses-transport');
const dotenv = require('dotenv');
dotenv.config({path:".env"});


// SendInBlue Setup to send email
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'] ;
apiKey.apiKey = process.env.SIB_API_KEY;
const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const sendMail =  async (obj) => {

  let htmlText = '';
  if (obj.template){
    htmlText = await ejs.renderFile(`${__basedir}${obj.template}/html.ejs`, {data:obj.data || null});
  }

  const sender ={
    email:process.env.COMPANY_EMAIL,
    name:process.env.COMPANY_NAME
  }
  
  const receivers = [
    {
      email: obj.to
    }
  ]
console.log(sender,'sender');
console.log(receivers,'reciever');

  return tranEmailApi.sendTransacEmail({
    sender,
    to:receivers,
    subject: "Welcome To Nsfashion",
    htmlContent: htmlText
  }).then(console.log).catch(console.log)


};

module.exports = { sendMail };
