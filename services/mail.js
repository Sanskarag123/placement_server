require('dotenv').config()
const nodemailer = require('nodemailer');
let mail_account =  nodemailer.createTestAccount();
let transport = nodemailer.createTransport({
    service:'gmail',
  
    auth: {
      user: 'predatesan@gmail.com', // generated ethereal user
      pass: '!@#$%^&*sanskar123', // generated ethereal password
    },
});
let baseURL = "https://placement-portal-9c359.web.app/student/register/";
sendEmail = async (email, token) => {
  return await transport.sendMail({
    from: 'PlacementPortal', // sender address
    to: email, // list of receivers
    subject: "Signup", // Subject line
    text: "Signup Link to Placement Portal", // plain text body
    html: `<h4>Please click on signup link to register to portal</h4><br><p><a href="${baseURL}">${baseURL}${token}</a>`, // html body
  })
}
module.exports = sendEmail