const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const User = require('../models/User');

exports.getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('assignment', 'title dueDate maxPoints questionFile')
      .populate('student', 'name email studentId')
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMySubmissions = async (req, res) => {
  try {
    const { studentId } = req.params;
    const submissions = await Submission.find({ student: studentId })
      .populate('assignment', 'title dueDate maxPoints questionFile')
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const studentId = req.body.studentId;
    const submissionText = req.body.submissionText || '';

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(400).json({ message: 'Student not found' });
    }

    const existingSubmission = await Submission.findOne({
      assignment: req.params.assignmentId,
      student: studentId,
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    const submissionData = {
      assignment: req.params.assignmentId,
      student: studentId,
      submissionText: submissionText,
    };

    if (req.file) {
      submissionData.submissionFile = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
      };
    }

    if (!submissionData.submissionText && !submissionData.submissionFile) {
      return res.status(400).json({ message: 'Either submission text or file is required' });
    }

    if (new Date() > assignment.dueDate) {
      submissionData.status = 'late';
    }

    const submission = new Submission(submissionData);
    const savedSubmission = await submission.save();
    
    await savedSubmission.populate('assignment', 'title dueDate maxPoints');
    await savedSubmission.populate('student', 'name email studentId');

    res.status(201).json(savedSubmission);
  } catch (error) {
    console.error('Error in submitAssignment:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.gradeSubmission = async (req, res) => {
  try {
    const { points, feedback } = req.body;
    
    const submission = await Submission.findById(req.params.id)
      .populate('assignment', 'maxPoints');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.grade = {
      points,
      feedback,
      gradedAt: new Date(),
    };
    submission.status = 'graded';

    const updatedSubmission = await submission.save();
    res.json(updatedSubmission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};