const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  maxPoints: {
    type: Number,
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  instructions: {
    type: String,
  },
  questionFile: {
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Assignment', assignmentSchema);