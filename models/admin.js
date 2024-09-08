const mongoose = require("mongoose")
const schema = mongoose.Schema(
    {
       
        "email":{type:String,required:true},
        "password":{type:String,required:true}
    
    }
)
let aloginModel = mongoose.model("alogindata",schema)
module.exports={aloginModel}