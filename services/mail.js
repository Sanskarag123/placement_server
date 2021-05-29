require('dotenv').config()
const nodemailer = require('nodemailer');
let mail_account =  nodemailer.createTestAccount();
let transport = nodemailer.createTransport({
  service: 'gmail',//smtp.gmail.com  //in place of service use host...
  secure: false,//true
  port: 25,//465
  auth: {
    user: 'predatesan@gmail.com',
    pass: '!@#$%^&*sanskar123'
  }, tls: {
    rejectUnauthorized: false
  }
});
let baseURL = "https://placement-portal-9c359.web.app/student/register/";
sendEmail = async (email, token) => {
  console.log(email,token);
  try{
  let response = await transport.sendMail({
    from: 'PlacementPortal', // sender address
    to: email, // list of receivers
    subject: "Signup", // Subject line
    text: "Signup Link to Placement Portal", // plain text body
    html: `<h4>Please click on signup link to register to portal</h4><br><p><a href="${baseURL}">${baseURL}${token}</a>`, // html body
  })
  return response;
} catch(err){
  console.log(err)
  return err.message;
}
  
}
module.exports = sendEmail