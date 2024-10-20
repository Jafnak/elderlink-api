const mongoose = require("mongoose")
const driverschema = mongoose.Schema(
    {
       
        "name":{type:String,required:true},
        "emailid":{type:String,required:true},
        "phone":{type:String,required:true},
        "location":{type:String,required:true},
        "gender":{type:String,required:true},
        "age":{type:String,required:true},
       
    
    }
)
let driverModel = mongoose.model("driverdata",driverschema)
module.exports={driverModel}