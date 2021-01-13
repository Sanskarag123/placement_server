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
let BaseURL = 'http://localhost:4000/files/';
let saltRounds = 10;
let education = {
    school :{
        X:{
            percentage:"null",
            url:"",
            verified:"",

        },
        XII:{
            percentage:"null",
            url:"",
            verified:"",
        }
    },
    college:{
        one:{
            percentage:"null",
            url:"",
            verified:"",
        },
        two:{
            percentage:"null",
            url:"",
            verified:"",
        },
        three:{
            percentage:"null",
            url:"",
            verified:"",
        },
        four:{
            percentage:"null",
            url:"",
            verified:"",
        },

    }
}

// Verify Authorization
let VerifyAuth = async function (req) {

    try {
        let token_code = req.get('Authorization').split(' ')[1];
        return await token.verifyToken(token_code).then(async (value) => {
            return await studentDb.then(model => {
                return model.find({registrationNumber: value.registrationNumber}).then((data) => {
                    if (data) {
                        return value.registrationNumber;;
                    } else {
                        return false;
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
    
router.get('/', function (req, res) {

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
router.post('/students/register', (req, res) => {
    let credentials = req.body;
    
    studentDb.then(model => {
        model.find({registrationNumber: credentials.registrationNumber, email: credentials.email}).then((value) => {
            if (value.length == 0) {
                bcrypt.genSalt(saltRounds, function (err, salt) {
                    if (err) {} else {
                        bcrypt.hash(credentials.password, salt, (err, hash) => {
                            credentials.password = hash;
                            credentials.verified = false;
                            credentials.educationDetails =  education;
                            studentDb.then(model_1 => {
                                model_1(credentials).save().then( check => {
                                    mail(credentials.email, token.createToken(credentials.registrationNumber, 'student')).then(conf => {
                                        if (conf.response) {
                                            res.send({message: 'Register success', user: 'student'})
                                        } else {
                                            res.status(500).send({message: 'sending mail Failed'})
                                        }
                                    }).catch(err => {
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
router.post('/students/login', (req, res) => {
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

router.post('/userdetail/update', (req, res) => {
    let userData = req.body;
    let email;
    studentDetails = 'sdjfhs';
    VerifyAuth(req).then((reg_no) => {
        registrationNumber = reg_no;
        if (registrationNumber) {
            
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
router.post('/skills/update', (req, res) => {
    let userData = req.body;
   
  
    VerifyAuth(req).then((reg_no) => {
        registrationNumber = reg_no;
        if (registrationNumber) {
            
            studentDb.then(model => {
                model.updateOne({
                    registrationNumber: registrationNumber
                }, {
                    $push: {
                        skills: userData
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
router.post('/collegescholl/update', (req, res) => {
    let userData = req.body;
   
  
    VerifyAuth(req).then((reg_no) => {
        registrationNumber = reg_no;
        if (registrationNumber) {
            
            studentDb.then(model => {
                model.updateOne({
                    registrationNumber: registrationNumber
                }, {[req.body.sem]:req.body.response
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
            
            studentDb.then(model => {
              model.findOne({registrationNumber:registrationNumber},{name:1,faculty:1,email:1,registrationNumber:1,number:1,CGPA:1,profile_url:1,dob:1,section:1,specilization:1,gender:1,dept:1}).then( data => {
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
router.post('/schooleducation/update', (req, res) => {
    let userData = req.body;
    
    VerifyAuth(req).then((reg_no) => {
        registrationNumber = reg_no;
        if (registrationNumber) {
            
            studentDb.then(model => {
                model.updateOne({
                    registrationNumber: registrationNumber
                }, {
                    $set: {
                        'educationDetails.school': userData
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
router.post('/collegeducation/update', (req, res) => {
    let userData = req.body;
    
    VerifyAuth(req).then((reg_no) => {
        registrationNumber = reg_no;
        if (registrationNumber) {
            
            studentDb.then(model => {
                model.updateOne({
                    registrationNumber: registrationNumber
                }, {
                    $set: {
                        'educationDetails.college': userData
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

router.post("/file/upload",upload.single('certificates'), (req,res) => {
 

      console.log(req.body);
       
           res.send({fileurl:BaseURL+req.file.originalname});

       
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
            ;
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
    router.get("/skills/get", (req,res) => {

        VerifyAuth(req).then((reg_no) => {
            registrationNumber = reg_no;
            
            if (registrationNumber) {
                studentDb.then(model => {
                  model.findOne({registrationNumber:registrationNumber},{'skills':1}).then( data => {
                      if(data!={})
                    res.send(data.skills);
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
    router.get("/education/get", (req,res) => {
    
        VerifyAuth(req).then((reg_no) => {
            registrationNumber = reg_no;
            if (registrationNumber) {
                studentDb.then(model => {
                  model.findOne({registrationNumber:registrationNumber},{educationDetails:1,arrears:1,standingarrears:1}).then( data => {
                    let senddata = {...data.educationDetails,arrears:data.arrears,standingarrears:data.standingarrears}
                    res.send(senddata);
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
    });
    router.get("/achievements/get", (req,res) => {
    
        VerifyAuth(req).then((reg_no) => {
            registrationNumber = reg_no;
            if (registrationNumber) {
                studentDb.then(model => {
                  model.findOne({registrationNumber:registrationNumber},{achivements:1}).then( data => {
                    let senddata = {...data.achivements}
                    res.send(senddata);
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
    });
    router.post('/courses/add', (req, res) => {
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
    router.post('/projects/add', (req, res) => {
        let userData = req.body;
        VerifyAuth(req).then((reg_no) => {
            registrationNumber = reg_no;
            if (registrationNumber) {
                studentDb.then(model => {
                    model.updateOne({
                        registrationNumber: registrationNumber
                    }, {
                        $push: {
                            'achivements.project': userData
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
    router.post('/placements/add', (req, res) => {
        let userData = req.body;
        VerifyAuth(req).then((reg_no) => {
            registrationNumber = reg_no;
            if (registrationNumber) {
                studentDb.then(model => {
                    model.updateOne({
                        registrationNumber: registrationNumber
                    }, {
                        $push: {
                        placementDetails: userData
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
    router.post('/workshops/add', (req, res) => {
        let userData = req.body;
        let email;
        VerifyAuth(req).then((reg_no) => {
            registrationNumber = reg_no;
            if (registrationNumber) {
                
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
    router.post('/placements/add', (req, res) => {
        let userData = req.body;
        let email;
        VerifyAuth(req).then((reg_no) => {
            registrationNumber = reg_no;
            if (registrationNumber) {
                
                studentDb.then(model => {
                    model.updateOne({
                        registrationNumber: registrationNumber
                    }, {
                        $push: {
                            'placementDetails': userData
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
    router.get("/placements/get", (req,res) => {
    
        VerifyAuth(req).then((reg_no) => {
            registrationNumber = reg_no;
            if (registrationNumber) {
                studentDb.then(model => {
                  model.findOne({registrationNumber:registrationNumber},{placementDetails:1}).then( data => {
                    res.send(data.placementDetails);
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
    
    // router.post('/postmarks',(req,res)=> {
    //     let userData = req.body;
    //     let email;
    //     VerifyAuth(req).then((reg_no) => {
    //         registrationNumber = reg_no;
    //         if (registrationNumber) {
                
    //             studentDb.then(model => {
    //                 model.updateOne({
    //                     registrationNumber: registrationNumber
    //                 }, {
    //                     "":req.body.value
    //                 }).then((value) => {
    //                     if (value.nModified == 1) {
    //                         res.send({message: 'Update Successfull'})
    //                     } else {
    //                         res.status(403).send({message: 'Update Failed'})
    //                     }
    //                 }).catch(e => {
    //                     res.status(401).send({message: 'email not found'});
    //                 })
    //             })
    
    //         } else {
    //             res.status(401).send({message: 'Authentication Failed1'});
    //         }
    //     }).catch(e => {
    //         res.status(401).send({message: 'Authentication Failed'});
    //     })
    // })
// Courses Add  //TODO
// router.post('/courses/add', (req, res) => {
//      let userData = req.body;
//      let email ;
//      VerifyAuth(req).then((reg_no) => {
//           registrationNumber = reg_no;
//      if ( registrationNumber) {
//           
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
// router.post('/marksheet/update', (req, res) => {

// })
// router.post('/photo/upload',upload.single('img1'),(req,re) => {
//      storage.bucket('placement-portal-9c359.appspot.com').upload('uploads/ok2.jpeg', {
//           metadata:     {
//                cacheControl: 'public, max-age=31536000',
//           }
//      })
//      VerifyAuth(req).then((email_extracted) => {
//           if ( email) {
//                

//           } else {
//           res.status(401).send({message:'Authentication Failed'});
//           }
//      }).catch(e => {
//      res.status(500).send({message:'Internal error'});
// })
// })
/**********************************************************
 *  Faculty Data retrieve
 * ********************************************************/
let facultyDb = db.facultyCol();
let VerifyAuthFaculty = async function (req) {

    try {
        let token_code = req.get('Authorization').split(' ')[1];
        return await token.verifyToken(token_code).then(async (value) => {
            return await facultyDb.then(model => {
                return model.find({facultyId: value.registrationNumber}).then((data) => {
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
router.post('/faculty/register', (req, res) => {
    let credentials = req.body;
    
    facultyDb.then(model => {
        model.find({facultyId: credentials.registrationNumber, email: credentials.email}).then((value) => {
            if (value.length == 0) {
                bcrypt.genSalt(saltRounds, function (err, salt) {
                    if (err) {} else {
                        bcrypt.hash(credentials.password, salt, (err, hash) => {
                            credentials.password = hash;
                            credentials.verified = false;
                            credentials.educationDetails =  education;
                            facultyDb.then(model_1 => {
                                model_1(credentials).save().then( check => {
                                    if(check){
                                        res.send({message: 'Register success', user: 'faculty'})
                                    }
                                    }).catch((err) => {
                                    res.status(500).send({message: 'Register Failed'})
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
    })});


    router.post('/faculty/login', (req, res ) => {
        let credentials = req.body;
        
        facultyDb.then(model => {
            
            model.findOne({facultyId : credentials.facultyId}).then((data) => {
                if (data.length == 0) {
                    res.status(200).send({message: "UnRegistered"});
                } else {
                    
                        bcrypt.compare(credentials.password, data.password).then((auth) => {
                            if (auth) {
                                let token_code = createToken(credentials.facultyId, 'faculty');
                                res.send({message: 'success', token: token_code, user: 'faculty',id:credentials.facultyId})
                            } else {
                                res.status(200).send({message: 'password is Incorrect'});
                            }
                        }).catch(e => {
                            res.status(200).send({message: 'password is Incorrect'});
                        })
                    } 
                
            }).catch(e => {
                res.status(500).send({message: 'login Failed'})
            })
        }).catch( e => {    
            res.status(500).send({message: 'Database Error'})
        })
    
    })




router.post("/facultystudent/get", (req,res) => {
    
            studentDb.then(model => {
              model.aggregate([{$match:{facultyId:req.body.facultyId}},{$project:{name:1,registrationNumber:1,"X":"$educationDetails.school.X.percentage","XII":"$educationDetails.school.XII.percentage",CGPA:1,arrears:1,gender:1}}]).then( data => {
                  if (data != {}) 
                    res.send(data);
              }).catch( err => {
                res.status(403).send({message: 'Database Error'});
              })
            })
})
router.post("/registered/get", (req,res) => {
    
            studentDb.then(model => {
              model.find({facultyId:req.body.facultyId}).countDocuments().then( data => {
                 
                    res.send({count:data});
              }).catch( err => {
                res.status(403).send({message: 'Database Error'});
              })
            })
})
router.post("/verification/get", (req,res) => {
    
            studentDb.then(model => {
              model.find({facultyId:req.body.facultyId,verified:false}).countDocuments().then( data => {
                 
                    res.send({count:data});
              }).catch( err => {
                res.status(403).send({message: 'Database Error'});
              })
            })
})

router.post("/twelve/get", (req,res) => {
    
            studentDb.then(model => {
              model.aggregate([{$match:{facultyId:req.body.facultyId,'educationDetails.school.XII.verified':"pending"}},{$project:{name:1,reg:'$registrationNumber',"percentage":"$educationDetails.school.XII.percentage","attachment":"$educationDetails.school.XII.url"}}]).then( data => {
                  if (data != {}) 
                    res.send(data);
              }).catch( err => {
                res.status(403).send({message: 'Database Error'});
              })
            })
})
router.post("/tenth/get", (req,res) => {
    
            studentDb.then(model => {
              model.aggregate([{$match:{facultyId:req.body.facultyId,'educationDetails.school.X.verified':"pending"}},{$project:{name:1,reg:'$registrationNumber',"percentage":"$educationDetails.school.X.percentage","attachment":"$educationDetails.school.X.url"}}]).then( data => {
                  if (data != {}) 
                    res.send(data);
              }).catch( err => {
                res.status(403).send({message: 'Database Error'});
              })
            })
})
router.post("/placementverify/get", (req,res) => {
    
            studentDb.then(model => {
              model.find({facultyId:req.body.facultyId,placementDetails:{$elemMatch:{verified:'pending'}}},{name:1,registrationNumber:1,placementDetails:1}).then( data => {
                  if (data != {}) 
                    res.send(data);
              }).catch( err => {
                res.status(403).send({message: 'Database Error'});
              })
            })
})
router.post("/collegesem/get", (req,res) => {
   
            studentDb.then(model => {
              model.aggregate([{$match:{facultyId:req.body.facultyId}},{$project:{name:1,reg:'$registrationNumber'  ,college:'$educationDetails.college'}}]).then( data => {
                  if (data != {}) 
                    res.send(data);
              }).catch( err => {
                res.status(403).send({message: 'Database Error'});
              })
            })
})
router.post("/collegesem2/get", (req,res) => {
    
            studentDb.then(model => {
              model.aggregate([{$match:{facultyId:req.body.facultyId,'educationDetails.two.verified':"pending"}},{$project:{name:1,registrationNumber:1,"X":"$educationDetails.college.X.percentage","XII":"$educationDetails.school.XII.percentage",cgpa:1}}]).then( data => {
                  if (data != {}) 
                    res.send(data);
              }).catch( err => {
                res.status(403).send({message: 'Database Error'});
              })
            })
})
router.post("/collegesem3/get", (req,res) => {
    
            studentDb.then(model => {
              model.aggregate([{$match:{facultyId:req.body.facultyId,'educationDetails.three.verified':"pending"}},{$project:{name:1,registrationNumber:1,"X":"$educationDetails.school.X.percentage","XII":"$educationDetails.school.XII.percentage",cgpa:1}}]).then( data => {
                  if (data != {}) 
                    res.send(data);
              }).catch( err => {
                res.status(403).send({message: 'Database Error'});
              })
            })
})
router.post("/collegesem4/get", (req,res) => {
    
            studentDb.then(model => {
              model.aggregate([{$match:{facultyId:req.body.facultyId,'educationDetails.four.verified':"pending"}},{$project:{name:1,registrationNumber:1,"X":"$educationDetails.school.X.percentage","XII":"$educationDetails.school.XII.percentage",cgpa:1}}]).then( data => {
                  if (data != {}) 
                    res.send(data);
              }).catch( err => {
                res.status(403).send({message: 'Database Error'});
              })
            })
})
router.post("/placement/get", (req,res) => {
    studentDb.then(model => {
      model.find({facultyId:req.body.facultyId,'placementDetails$.verified':""},{placementDetails:1}).then( data => {
          if (data != {}) 
            res.send(data);
      }).catch( err => {
        res.status(403).send({message: 'Database Error'});
      })
    })
})
router.post("/faculty/get", (req,res) => {
            
            facultyDb.then(model => {
              model.findOne({facultyId:req.body.facultyId},{name:1,email:1,number:1,facultyId:1,totalstudents:1}).then( data => {
                  if (data != {}) 
                    res.send(data);
              }).catch( err => {
                res.status(403).send({message: 'Database Error'});
              })
            }).catch( e => {
                
            })

       
    
})
router.post("/college/get", (req,res) => {
            
    facultyDb.then(model => {
      model.findOne({facultyId:req.body.facultyId},{name:1,email:1,number:1,facultyId:1}).then( data => {
          if (data != {}) 
            res.send(data);
      }).catch( err => {
        res.status(403).send({message: 'Database Error'});
      })
    }).catch( e => {
        
    })
})

/***************************************************
 * Verify
 *************************************************/
router.post("/placement/verify", (req,res) => {
    
            studentDb.then(model => {
              model.updateOne({facultyId:req.body.facultyId,registrationNumber:req.body.reg,'placementDetails.name':req.body.company},{'placementDetails.$.verified':req.body.response}).then( data => {
                  if(data.nModified = 1)
                  res.send({message:"Update Successfull"})
              }).catch( err => {
                res.status(403).send({message: 'Database Error'});
              })
            })
})

router.post("/twelve/verify", (req,res) => {
    
            studentDb.then(model => {
              model.updateOne({facultyId:req.body.facultyId,registrationNumber:req.body.reg},{'educationDetails.school.XII.verified':req.body.response}).then( data => {
                  if(data.nModified = 1)
                  res.send({message:"Update Successfull"})
              }).catch( err => {
                res.status(403).send({message: 'Database Error'});
              })
            })
})
router.post("/ten/verify", (req,res) => {
    
            studentDb.then(model => {
              model.updateOne({facultyId:req.body.facultyId,registrationNumber:req.body.reg},{'educationDetails.school.X.verified':req.body.response}).then( data => {
                  if(data.nModified = 1)
                  res.send({message:"Update Successfull"})
              }).catch( err => {
                res.status(403).send({message: 'Database Error'});
              })
            })
})
router.post("/college/verify", (req,res) => {
    
    let sem;
 
    if(req.body.sem == 1  )
        sem = 'educationDetails.college.one.verified'
        if(req.body.sem == 2  )
        sem =  'educationDetails.college.two.verified'
        if(req.body.sem == 3  )
        sem ='educationDetails.college.three.verified'
        if(req.body.sem == 4  )
        sem = 'educationDetails.college.four.verified'
  
 
  
            studentDb.then(model => {
              model.updateOne({facultyId:req.body.facultyId,registrationNumber:req.body.reg},{[sem]:req.body.response}).then( data => {
                  if(data.nModified = 1)
                  res.send({message:"Update Successfull"})
              }).catch( err => {
                res.status(403).send({message: 'Database Error'});
              })
            })
})
router.post("/faculty/access", (req,res) => {
    
            studentDb.then(model => {
              model.findOne({facultyId:req.body.facultyId,registrationNumber:req.body.reg}).then( data => {
                  if(data ){
                      let token = createToken(req.body.reg,'student');
                      res.send({token:token});
                  }
              }).catch( err => {
                res.status(403).send({message: 'Database Error'});
              })
            })
})




module.exports = router;
