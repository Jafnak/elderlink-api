const mongoose = require("mongoose");

const feedbackSchema = mongoose.Schema({
    email: { type: String, required: true },
    message: { type: String, required: true },
});

const feedbackModel = mongoose.model("feedbackdata", feedbackSchema);
module.exports = feedbackModel;