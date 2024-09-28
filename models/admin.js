const mongoose = require("mongoose")
const adminschema = mongoose.Schema(
    {
       
        emailid:{type:String,required:true},
        password:{type:String,required:true}
    
    }
)
let adminModel = mongoose.model("alogindata",adminschema)
module.exports={adminModel}