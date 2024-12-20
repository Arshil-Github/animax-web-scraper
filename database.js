const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI + "Animax");

const timetableSchema = new mongoose.Schema({
  innateId: String,
  title: String,
  startDate: Date,
  startTime: String,
  CourseCode: String,
  FacultyName: String,
  Room: String,
  AttndColor: String,
});

const Timetable = mongoose.model("Timetable", timetableSchema);

module.exports = Timetable;
