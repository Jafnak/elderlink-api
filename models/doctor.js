const mongoose = require("mongoose")
const doctorschema = mongoose.Schema(
    {
       
        "name":{type:String,required:true},
        "emailid":{type:String,required:true},
        "specialization":{type:String,required:true},
        "location":{type:String,required:true},
        "phone":{type:String,required:true},
        "date":{type:String,required:true},
        "time":{type:String,required:true},
        "availability":{type:String}
       
    
    }
)
let doctorModel = mongoose.model("doctordata",doctorschema)
module.exports={doctorModel}