const mongoose = require("mongoose")
const AppointmentSchema =  mongoose.Schema({
    doctorName: String,
    specialization: String,
    location: String,
    phone: String,
    fee: Number,
    date: String,
    time: String,
    emailId: String // Store emailId instead of userId
  });
  
  const Appointment = mongoose.model('Appointment', AppointmentSchema);
  module.exports={Appointment}