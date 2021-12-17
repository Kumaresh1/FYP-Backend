const mongoose = require('mongoose');

//MODELS
const UserInfo = require('../model/userModel');
const UserDocuments = require('../model/documentModel');


const { json } = require('express');


/*****************************Read Queries*************************************************/

async function readUserByIds(ids) {

    var data={};
    if (ids) {
        data = {
            userid: ids
        };
    }  
    var queryModel;

        console.log(data)
    queryModel = UserInfo
    
   
 return  await queryModel.find(data, function (err, result) {
        if (err) {
          return [];
        } else { 
            console.log(result)
            return result;
        }
    }).clone().catch((e) => {
        console.log("This is the error while reading");
        console.log(e);
        return [];
    }); 
}

async function readUserByEmail(email) {

    var user = null;
    var data = {
        email: email
    };
    var queryModel;

        queryModel = UserInfo

   return await queryModel.findOne(data, function (err, result) {
        if (err) { 
            return [];
        } else {  
            return result;
        }
    }).catch((e) => {
        console.log(e);
        return [];
    }); 
}


async function readDocumentById(Id) {
   
    var data = {
        userid: Id
    };
    var queryModel;

        queryModel = UserDocuments;

   return await queryModel.find(data, function (err, result) {
        if (err) { 
            return [];
        } else {  
            return result;
        }
    }).catch((e) => {
        console.log(e);
        return [];
    }); 
}


/*****************************Write Queries*************************************************/

async function saveUser(user) {
    var db_user;
    await user.save().then((user) => {
        console.log("User saved successfully");
        db_user = user;
        return user;
    }).catch((err) => {
        console.log("Error while adding user to db")
        throw new Error(err);
        return null;
    });
    return db_user;
}





async function createDocument(document) {
    var document_details;
    await document.save().then((doc) => {
       
        console.log("Document Created successfully");
        document_details=doc;
       
       
    }).catch((err) => {
        console.log("Error while  Creating Document")
        throw new Error(err);
        return null;
    });
    return document_details;
}

  
module.exports = {
    //read query
    readUserByIds,
    readUserByEmail,
    //write query
    saveUser,
    createDocument
}