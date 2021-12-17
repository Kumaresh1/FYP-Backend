const express = require('express');

const DocumentController = require('./controller/Document');
const UserController = require('./controller/User');
const UserAuthController = require('./controller/UserAuth');


const auth = require('./util/authorisation');


module.exports= function(app){
    
    //initialising api routes
    const apiRoutes = express.Router();



    //********************User Auth APIs**************************    

    apiRoutes.post('/user/signup',UserAuthController.Signup);
    apiRoutes.post('/user/signin',UserAuthController.Signin);


    //********************User APIs**************************    
    
    apiRoutes.post('/user/save',UserController.NewUser);
    apiRoutes.post('/user/getuser',UserController.ReadUser);


    //********************Document APIs************************** 
    //Save Document
    apiRoutes.get('/document/save',auth.AuthManager,DocumentController.SaveDocument);
    //Get Document
    apiRoutes.post('/document/get',auth.AuthManager,DocumentController.ReadDocument);
    


    app.use('/api',apiRoutes);
    
    app.use((req, res) => {
        res.status(404).send("Invalid request");
    });
    
    
}