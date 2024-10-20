const mongoose = require("mongoose")
const caretakerschema = mongoose.Schema(
    {
       
        "name":{type:String,required:true},
        "emailid":{type:String,required:true},
        "phone":{type:String,required:true},
        "address":{type:String,required:true},
        "gender":{type:String,required:true},
        "role":{type:String,required:true}
    
    }
)
let caretakerModel = mongoose.model("caretakerdata",caretakerschema)
module.exports={caretakerModel}