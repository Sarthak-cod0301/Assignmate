const Assignment = require('../models/Assignment');

exports.createAssignment = async (req, res) => {
  try {
    const assignmentData = {
      ...req.body,
      teacher: req.body.teacherId,
    };

    if (req.file) {
      assignmentData.questionFile = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
      };
    }

    const assignment = new Assignment(assignmentData);
    const savedAssignment = await assignment.save();
    
    await savedAssignment.populate('teacher', 'name email');
    
    res.status(201).json(savedAssignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('teacher', 'name email')
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('teacher', 'name email');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    res.json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};