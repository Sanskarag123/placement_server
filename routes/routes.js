// Routes File
let express = require('express');
const bcrypt = require('bcrypt');
let router = express.Router();
let constants = require('../constants/constant')
let savedoc = require('../services/savedoc')
let db = require('../services/connection');
let student_Model = require('../models/studentModel')
let mail = require('../services/mail')
let multer = require('multer');
const saveDoc = require('../services/savedoc');
var upload = multer({storage:saveDoc})
let token = require('../services/token')
const {json} = require('body-parser');
const {createToken, verifyToken} = require('../services/token');
const {connection} = require('mongoose');
let BaseURL = 'http://localhost:3000/files/';
let saltRounds = 10;
// Verify Authorization
let VerifyAuth = async function (req) {

    try {
        let token_code = req.get('Authorization').split(' ')[1];
        return await token.verifyToken(token_code).then(async (value) => {
            return await studentDb.then(model => {
                return model.find({registrationNumber: req.registrationNumber}).then((data) => {
                    if (data.length == 1) {
                        return false;
                    } else {
                        return value.registrationNumber;
                    }
                }).catch(() => {
                    return false;
                })
            })

        })
    } catch(e) {
        return false;
    } 
}
    
router.get('/', function (req, res, next) {

    res.send('Connected to api');
    // Do whatever...
})
// Db connection
router.get('/placementportal/db', (req, res) => {
    db.connectTodb().then((model) => {
        res.send('Connected to db')
    }).catch(err => {
        res.send('Faliled to connect to db')
    })

})
router.get('/setupDB', (req, res) => {})

let studentDb = db.studentCol();
// Student Register
router.post('/students/register', (req, res, next) => {
    let credentials = req.body;
    studentDb.then(model => {
        model.find({registrationNumber: credentials.registrationNumber, email: credentials.email}).then((value) => {
            if (value.length == 0) {
                bcrypt.genSalt(saltRounds, function (err, salt) {
                    if (err) {} else {
                        bcrypt.hash(credentials.password, salt, (err, hash) => {
                            credentials.password = hash;
                            credentials.verified = false;
                            studentDb.then(model_1 => {
                                model_1(credentials).save().then(check => {
                                    mail(credentials.email, token.createToken(credentials.registrationNumber, 'student')).then(conf => {
                                        if (conf.response) {
                                            res.send({message: 'Register success', user: 'student'})
                                        } else {
                                            res.status(500).send({message: 'sending mail Failed'})
                                        }
                                    }).catch(err => {
                                        console.log(err)
                                    })
                                }).catch((err) => {
                                    res.status(500).send({message: 'Register Fail'})
                                })
                            })
                        })
                    }

                })
            } else {
                res.status(401).send({message: 'Already registered'});
            }

        }).catch((err) => {
            res.status(500).send({message: 'Internal Error'})
        })
    })


})
// email Verify 
router.post('/verifyemail', (req, res) => {
     let token = req.body.token;
     
     verifyToken(token).then( check => {
          studentDb.then( model => {
               
               model.updateOne({registrationNumber:check.registrationNumber},{$set:{verified:true}}).then( modify => {
                    if(modify.nModified == 1 || modify.n== 1) {
                         res.send({message:'verified'})
                    } else {
                         res.status(403).send({message:'Not verified'})
                    }
               }).catch( err => {
                    res.status(403).send({message:'Not verified'})
               })
          })
     }).catch( err => {
          res.status(401).send({message:'Unauthorized'})
     })
})
// Student Login
router.post('/students/login', (req, res, next) => {
    let credentials = req.body;
    studentDb.then(model => {
        model.find({registrationNumber: credentials.registrationNumber}).then((data) => {
            if (data.length == 0) {
                res.status(200).send({message: "UnRegistered"});
            } else {
                let value = data[0];
                if (value.verified == true) {
                    bcrypt.compare(credentials.password, value.password).then((auth) => {
                        if (auth) {
                            let token_code = createToken(credentials.registrationNumber, 'student');
                            res.send({message: 'success', token: token_code, user: 'student'})
                        } else {
                            res.status(200).send({message: 'password is Incorrect'});
                        }
                    }).catch(e => {
                        res.status(200).send({message: 'password is Incorrect'});
                    })
                } else {
                    mail(value.email, token.createToken(value.registrationNumber, 'student')).then(conf => {
                        if (conf.response) {
                            res.status(200).send({message: "Verify"});
                        } else {
                            res.status(500).send({message: 'sending mail Failed'})
                        }
                    }).catch(err => {
                        res.status(500).send({message: 'sending mail Failed'});
                    })

                }
            }
        }).catch(e => {
            res.status(500).send({message: 'login Failed'})
        })
    })

})
// Admin Register
// TODO
// Admin Login
// TODO

// faculty Register
// TODO
// faculty Login
// TODO

router.post('/userdetail/update', (req, res, next) => {
    let userData = req.body;
    let email;
    studentDetails = 'sdjfhs';
    VerifyAuth(req).then((reg_no) => {
        registrationNumber = reg_no;
        if (registrationNumber) {
            console.log(reg_no)
            studentDb.then(model => {
                model.updateOne({
                    registrationNumber: registrationNumber
                }, {
                    $set: {
                        personalDetails: userData
                    }
                }).then((value) => {
                    if (value.nModified == 1) {
                        res.send({message: 'Update Successfull'})
                    } else {
                        res.status(403).send({message: 'Update Failed'})
                    }
                }).catch(e => {
                    res.status(401).send({message: 'email not found'});
                })
            })

        } else {
            res.status(401).send({message: 'Authentication Failed1'});
        }
    }).catch(e => {
        res.status(401).send({message: 'Authentication Failed'});
    })
})

//Get userPersonadetails
router.get("/userdetail/get", (req,res) => {

    VerifyAuth(req).then((reg_no) => {
        registrationNumber = reg_no;
        if (registrationNumber) {
            console.log(reg_no)
            studentDb.then(model => {
              model.findOne({registrationNumber:registrationNumber},{name:1,faculty:1,email:1,registrationNumber:1,number:1}).then( data => {
                  console.log(data);
                  if (data != {}) 
                    res.send(data);
              }).catch( err => {
                res.status(403).send({message: 'Database Error'});
              })
            })

        } else {
            res.status(401).send({message: 'Authentication Failed1'});
        }
    }).catch(e => {
        res.status(401).send({message: 'Authentication Failed'});
    })
})

//Submit education details
router.post('/education/update', (req, res, next) => {
    let userData = req.body;
    let email;
    
    VerifyAuth(req).then((reg_no) => {
        registrationNumber = reg_no;
        if (registrationNumber) {
            console.log(reg_no)
            studentDb.then(model => {
                model.updateOne({
                    registrationNumber: registrationNumber
                }, {
                    $set: {
                        educationDetails: userData
                    }
                }).then((value) => {
                    if (value.nModified == 1) {
                        res.send({message: 'Update Successfull'})
                    } else {
                        res.status(403).send({message: 'Update Failed'})
                    }
                }).catch(e => {
                    res.status(401).send({message: 'email not found'});
                })
            })

        } else {
            res.status(401).send({message: 'Authentication Failed1'});
        }
    }).catch(e => {
        res.status(401).send({message: 'Authentication Failed'});
    })
})
//get Education Details
router.get("/education/get", (req,res) => {

    VerifyAuth(req).then((reg_no) => {
        registrationNumber = reg_no;
        if (registrationNumber) {
            studentDb.then(model => {
              model.findOne({registrationNumber:registrationNumber},{educationDetails:1}).then( data => {
                  console.log(data);
                  if (data != {}) 
                    res.send(data);
              }).catch( err => {
                res.status(403).send({message: 'Database Error'});
              })
            })

        } else {
            res.status(401).send({message: 'Authentication Failed1'});
        }
    }).catch(e => {
        res.status(401).send({message: 'Authentication Failed'});
    })
})
router.post("/file/upload",upload.single('certificates'), (req,res) => {

VerifyAuth(req).then((reg_no) => {
        registrationNumber = reg_no;
        if (registrationNumber) {
           res.send({fileurl:BaseURL+req.file.originalname});

        } else {
            res.status(401).send({message: 'Authentication Failed1'});
        }
    }).catch(e => {
        res.status(401).send({message: 'Authentication Failed'});
    })
})
router.post("/file/upload",upload.single(), (req,res) => {

    VerifyAuth(req).then((reg_no) => {
            registrationNumber = reg_no;
            if (registrationNumber) {
               studentDb.then( model => {
                   model.update({registrationNumber:registrationNumber})
               })
    
            } else {
                res.status(401).send({message: 'Authentication Failed1'});
            }
        }).catch(e => {
            res.status(401).send({message: 'Authentication Failed'});
        })
    })

    router.get("/courses/get", (req,res) => {

        VerifyAuth(req).then((reg_no) => {
            registrationNumber = reg_no;
            console.log(reg_no);
            if (registrationNumber) {
                studentDb.then(model => {
                  model.findOne({registrationNumber:registrationNumber},{'certificationDetails.courses':1}).then( data => {
                    res.send(data.certificationDetails);
                  }).catch( err => {
                    res.status(403).send({message: 'Database Error'});
                  })
                })
            } else {
                res.status(401).send({message: 'Authentication Failed1'});
            }
        }).catch(e => {
            res.status(401).send({message: 'Authentication Failed'});
        })
    })
    router.get("/workshops/get", (req,res) => {

        VerifyAuth(req).then((reg_no) => {
            registrationNumber = reg_no;
            if (registrationNumber) {
                studentDb.then(model => {
                  model.findOne({registrationNumber:registrationNumber},{'certificationDetails.workshops':1}).then( data => {
                    res.send(data.certificationDetails);
                  }).catch( err => {
                    res.status(403).send({message: 'Database Error'});
                  })
                })
    
            } else {
                res.status(401).send({message: 'Authentication Failed1'});
            }
        }).catch(e => {
            res.status(401).send({message: 'Authentication Failed'});
        })
    })
    router.post('/courses/add', (req, res, next) => {
        let userData = req.body;
        VerifyAuth(req).then((reg_no) => {
            registrationNumber = reg_no;
            if (registrationNumber) {
                studentDb.then(model => {
                    model.updateOne({
                        registrationNumber: registrationNumber
                    }, {
                        $push: {
                            'certificationDetails.courses': userData
                        }
                    }).then((value) => {
                        console.log(value);
                        if (value.nModified == 1) {
                            res.send({message: 'Update Successfull'})
                        } else {
                            res.status(403).send({message: 'Update Failed'})
                        }
                    }).catch(e => {
                        res.status(401).send({message: 'email not found'});
                    })
                })
    
            } else {
                res.status(401).send({message: 'Authentication Failed1'});
            }
        }).catch(e => {
            res.status(401).send({message: 'Authentication Failed'});
        })
    })
    router.post('/workshops/add', (req, res, next) => {
        let userData = req.body;
        let email;
        VerifyAuth(req).then((reg_no) => {
            registrationNumber = reg_no;
            if (registrationNumber) {
                console.log(reg_no)
                studentDb.then(model => {
                    model.updateOne({
                        registrationNumber: registrationNumber
                    }, {
                        $push: {
                            'certificationDetails.workshops': userData
                        }
                    }).then((value) => {
                        if (value.nModified == 1) {
                            res.send({message: 'Update Successfull'})
                        } else {
                            res.status(403).send({message: 'Update Failed'})
                        }
                    }).catch(e => {
                        res.status(401).send({message: 'email not found'});
                    })
                })
    
            } else {
                res.status(401).send({message: 'Authentication Failed1'});
            }
        }).catch(e => {
            res.status(401).send({message: 'Authentication Failed'});
        })
    })
// Courses Add  //TODO
// router.post('/courses/add', (req, res, next) => {
//      let userData = req.body;
//      let email ;
//      VerifyAuth(req).then((reg_no) => {
//           registrationNumber = reg_no;
//      if ( registrationNumber) {
//           console.log(reg_no)
//           studentDb.then( model => {
//                model.updateOne({registrationNumber:registrationNumber},{$set:{course:userData}}).then((value) => {
//                     if(value.nModified == 1) {
//                          res.send({message:'Update Successfull'})
//                     } else {
//                          res.status(403).send({message:'Update Failed'})
//                     }
//                }).catch(e => {
//                     res.status(401).send({message:'email not found'});
//                })
//           })

//      } else {
//           res.status(401).send({message:'Authentication Failed1'});
//      }
// }).catch(e => {
//      res.status(401).send({message:'Authentication Failed'});
// })
// })
// router.post('/marksheet/update', (req, res, next) => {

// })
// router.post('/photo/upload',upload.single('img1'),(req,res,next) => {
//      storage.bucket('placement-portal-9c359.appspot.com').upload('uploads/ok2.jpeg', {
//           metadata:     {
//                cacheControl: 'public, max-age=31536000',
//           }
//      })
//      VerifyAuth(req).then((email_extracted) => {
//           if ( email) {
//                console.log(req.body);

//           } else {
//           res.status(401).send({message:'Authentication Failed'});
//           }
//      }).catch(e => {
//      res.status(500).send({message:'Internal error'});
// })
// })


module.exports = router;
