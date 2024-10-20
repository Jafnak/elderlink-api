const mongoose = require("mongoose")
const doctorschema = mongoose.Schema(
    {
       
        "name":{type:String,required:true},
        "emailid":{type:String,required:true},
        "specialization":{type:String,required:true},
        "location":{type:String,required:true},
        "phone":{type:String,required:true}
        
       
    
    }
)
let doctorModel = mongoose.model("doctordata",doctorschema)
module.exports={doctorModel}