const express = require('express');
const {
  createAssignment,
  getAssignments,
  getAssignment,
  deleteAssignment,
} = require('../controllers/assignmentController');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getAssignments);
router.get('/:id', getAssignment);
router.post('/', upload.single('questionFile'), createAssignment);
router.delete('/:id', deleteAssignment);

module.exports = router;