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




//Save Document
exports.SaveDocument = function (req, res, next) {
  

            
    let document = new Document({
       userid:req.body.userid,
       document:req.body.document
   }); 



   database.saveDocument(document).then((val) => {
       if (val == null) {
           throw Error("Error while saving Document");
       } else {

           res.status(201).json({
               message: "Document created successfully."
           });

       }
   }).catch((err) => {
       console.log(err);
       res.status(401).json({
           error: DBERROR
       });
   });

}

//Read Document
exports.ReadDocument = function (req, res, next) {
  

            
   database.readDocumentById(req.body.userid).then((document_list) => {
       if (val == null) {
           throw Error("Error while reading document");
       } else {

           console.log(document_list);
           
           return res.status(200).json({
            documents:document_list
        });

       }
   }).catch((err) => {
       console.log(err);
       res.status(401).json({
           error: DBERROR
       });
   });

}





  
