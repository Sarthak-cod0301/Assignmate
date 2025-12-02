const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  submissionText: {
    type: String,
  },
  submissionFile: {
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  grade: {
    points: Number,
    feedback: String,
    gradedAt: Date,
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'late'],
    default: 'submitted',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Submission', submissionSchema);