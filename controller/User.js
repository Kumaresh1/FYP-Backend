"use strict";

const { nanoid } = require('nanoid');
const mongoose= require('mongoose');
const bcrypt = require('bcrypt');
const database = require('../services/mongodb');
const { IDSIZE, DBERROR } = require('../util/constants');
const jwt = require('jsonwebtoken');


const User = require('../model/userModel');
const Document = require('../model/documentModel');

const { AUTHSECRET } = require('../config/secrets');
const { TOKENEXPIRE } = require('../util/constants')



//Create User
exports.NewUser = async function (req, res, next) {
  

            let id = nanoid(IDSIZE);
            let uuid = mongoose.Types.ObjectId(id);
             let user = new User({
                userid:uuid, 
                email:req.body.email,
                name:req.body.name, 
                phone:req.body.phone,
            }); 



            await database.saveUser(user).then((val) => {
                if (val == null) {
                    throw Error("Error while setting user account");
                } else {

                    res.status(201).json({
                        message: "user account successfully created."
                    });

                }
            }).catch((err) => {
                console.log(err);
                res.status(401).json({
                    error: DBERROR
                });
            });
     
}

//Read User
exports.ReadUser =  async function (req, res, next) {
  

            
    await database.readUserByIds(req.body.userid).then((user) => {
        if (user == null) {
            console.log(user,"here")
            throw Error("Error while reading user");
        } else {
 
            console.log(user);
            
            return res.status(200).json(user);
 
        }
    }).catch((err) => {
        console.log(err);
        res.status(401).json({
            error: DBERROR
        });
    });
 
 }
   
