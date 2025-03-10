const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }], 
  categories: [{ type: String, required: true }], 
  ingredients: [{ type: String, required: true }], 
  cookingTime: { type: Number, required: true }, 
});


module.exports = mongoose.model("Course", courseSchema);
