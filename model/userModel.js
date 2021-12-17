const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    
    
     userid:{
         type:String,
         unique:true
     } ,
     name: {
        type: String,
        required:true
     },
      
    phone:{
        type:String,
        unique:true
     }, 

     email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String
    },
    fcm_token:{
        type:String
    },

     

}, {
    timestamps: true,
});
module.exports = mongoose.model("Users", UserSchema);
