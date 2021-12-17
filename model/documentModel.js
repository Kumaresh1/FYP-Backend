const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const DocumentInfoSchema=new Schema({

    name:[String],
    start_date:[String],
    expiry_date:[String],
    desc:[String],
    photo:[String],
})


const DocumentSchema = new Schema({
    
    userid:{
        type:String,
        unique:true
     },
     document:{
         type:[DocumentInfoSchema]

         //Contains 
         //{name,start_date,expiry_date,Description,photo}
     } 

}, {
    timestamps: true,
});
module.exports = mongoose.model("Documents", DocumentSchema);
