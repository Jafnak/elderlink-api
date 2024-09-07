const mongoose = require("mongoose")
const schema = mongoose.Schema(
    {
        "name":{type:String,required:true},
        "email":{type:String,required:true},
        "phone":{type:String,required:true},
        "address":{type:String,required:true},
        "gender":{type:String,required:true},
        "age":{type:String,required:true},
        "password":{type:String,required:true},
        "cpass":{type:String,required:true}
    }
)
let elderModel = mongoose.model("users",schema)
module.exports={elderModel}