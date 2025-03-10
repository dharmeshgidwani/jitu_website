const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
 // images: [{ type: String }], 
  //categories: [{ type: String, required: true }], 
  ExtraDetails: { type: String, required: true },
  Details: { type: String, required: true }, 
  price: { type: String, required: true },  
});


module.exports = mongoose.model("Course", courseSchema);
