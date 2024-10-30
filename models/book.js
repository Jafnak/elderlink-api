const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    emailid: { type: String, required: true },
    services: { type: String, required: true },
    name: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true }
});

const bookModel = mongoose.model("booking", bookingSchema); // Ensure the model name is 'Booking'
module.exports = {bookModel};
