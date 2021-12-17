"use strict";

const { nanoid } = require('nanoid');
const mongoose= require('mongoose');
const bcrypt = require('bcrypt');
const database = require('../services/mongodb');
const { IDSIZE, DBERROR } = require('../util/constants');
const jwt = require('jsonwebtoken');

const User = require('../model/userModel');

const { AUTHSECRET} = require('../config/secrets');
const { TOKENEXPIRE } = require('../util/constants')



//User sign up
exports.Signup = function (req, res, next) {
    //encrypting the plain password 
    bcrypt.hash(req.body.password, 10).then(
        (hash) => {
            let id = nanoid(IDSIZE);
            let uuid = mongoose.Types.ObjectId(id);
            
            let User = new User({
                userid:uuid, 
                email:req.body.email,
                password:hash,
                name:req.body.name, 
                phone:req.body.phone,
                
            }); 




            database.saveUser(User).then((val) => {
                if (val == null) {
                    throw Error("Error while setting account");
                } else {
                    
                    res.status(201).json({
                        message: "seller account successfully created."
                    });
                }
            }).catch((err) => {
                console.log(err);
                res.status(401).json({
                    error: DBERROR
                });
            });
        }
    ).catch((err) => {
        console.log(err);
        return res.status(401).json({
            error: "Bad Request"
        });
    });
}


//User Login

exports.Signin = async function (req, res, next) {
    var dbuser = null;
    const email = req.body.email
    try {
        //finding the seller in database from the email provided.
        await database.readUserByEmail(email).then((val) => {
            dbuser = val;
        }).catch((e) => {
            console.log("Error while getting user from email");
            return res.status(401).json({
                error: DBERROR
            });
        });

        if (dbuser != null) {
            //if user exists with the current email than comparing the hash with the password field.
            await bcrypt.compare(req.body.password, dbuser.password, function (err, result) {
                if (result) {  
                    let data = {
                        id:dbuser.userid
                    };
                    let auth_data={
                        userid:dbuser.userid,
                        name:dbuser.name,
                        email:dbuser.email,
                        phone:dbuser.phone,
                        };
                    //generating and sending the auth token as it will be required for furthur requests.
                    let authToken = jwt.sign(data, AUTHSECRET, { expiresIn: TOKENEXPIRE });

                    dbuser.fcm_token=req.body.fcm_token;
                   

                    dbuser.save().then((result)=>{ 
                    return res.status(200).json({
                        message: "Successfully logged in",
                        details: authToken, 
                        user:auth_data
                    });
                    });
                } else {
                    return res.status(401).json({
                        error: "Invalid credentials"
                    });
                }
            });
        } else {
            throw "no user found";
        }
    } catch (e) {
        console.log(e);
        return res.status(401).json({
            error: "Bad Request"
        });
    }
};
