let jwt = require('jsonwebtoken');
let createToken = function(id, user) {
    token = jwt.sign({key:id, user:user},process.env.key)
    return token;
}
let verifyToken =async function (token)  {
    let email;
    let user;
    console.log(email);
    await jwt.verify(token,process.env.key, (err, decode) => {
        email = decode.key;
        console.log(email);
        user = decode.user;
    })
    return {registrationNumber:email,user:user};
  }
module.exports = {createToken,verifyToken}