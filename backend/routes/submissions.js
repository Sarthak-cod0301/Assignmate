const express = require('express');
const {
  submitAssignment,
  getSubmissions,
  getMySubmissions,
  gradeSubmission,
} = require('../controllers/submissionController');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getSubmissions);
router.get('/my-submissions/:studentId', getMySubmissions);
router.post('/:assignmentId', upload.single('submissionFile'), submitAssignment);
router.put('/:id/grade', gradeSubmission);

module.exports = router;