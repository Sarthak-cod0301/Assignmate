import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Badge, Alert } from 'react-bootstrap';
import { submissionAPI } from '../services/api';
import { useAuth } from '../utils/AuthContext';

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gradeForm, setGradeForm] = useState({
    points: '',
    feedback: ''
  });

  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'teacher') {
      fetchSubmissions();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    try {
      const response = await submissionAPI.getSubmissions();
      setSubmissions(response.data);
    } catch (error) {
      setError('Failed to fetch submissions: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleGradeClick = (submission) => {
    setSelectedSubmission(submission);
    setGradeForm({
      points: submission.grade?.points || '',
      feedback: submission.grade?.feedback || ''
    });
    setShowGradeModal(true);
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await submissionAPI.gradeSubmission(selectedSubmission._id, gradeForm);
      setShowGradeModal(false);
      setSelectedSubmission(null);
      setGradeForm({
        points: '',
        feedback: ''
      });
      fetchSubmissions();
    } catch (error) {
      setError('Failed to grade submission: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (e) => {
    setGradeForm({
      ...gradeForm,
      [e.target.name]: e.target.value
    });
  };

  const getStatusBadge = (submission) => {
    const statusColors = {
      submitted: 'info',
      graded: 'success',
      late: 'danger'
    };
    
    return (
      <Badge bg={statusColors[submission.status]}>
        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const viewSubmissionFile = (submission) => {
    if (submission.submissionFile) {
      const fileUrl = `http://localhost:5000/uploads/${submission.submissionFile.filename}`;
      window.open(fileUrl, '_blank');
    }
  };

  const viewQuestionFile = (assignment) => {
    if (assignment.questionFile) {
      const fileUrl = `http://localhost:5000/uploads/${assignment.questionFile.filename}`;
      window.open(fileUrl, '_blank');
    }
  };

  if (user?.role !== 'teacher') {
    return (
      <div className="text-center mt-5">
        <Alert variant="warning">
          You don't have permission to access this page.
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4">Student Submissions</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          {submissions.length === 0 ? (
            <p className="text-center text-muted">No submissions found.</p>
          ) : (
            <Table responsive striped>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assignment</th>
                  <th>Submitted At</th>
                  <th>Answer File</th>
                  <th>Status</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission._id}>
                    <td>
                      <div>
                        {submission.student?.name}
                        {submission.student?.studentId && (
                          <div>
                            <small className="text-muted">
                              ID: {submission.student.studentId}
                            </small>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        {submission.assignment?.title}
                        {submission.assignment?.questionFile && (
                          <div className="mt-1">
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => viewQuestionFile(submission.assignment)}
                              className="file-button"
                            >
                              📄 Question
                            </Button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{formatDate(submission.submittedAt)}</td>
                    <td>
                      {submission.submissionFile ? (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => viewSubmissionFile(submission)}
                          className="file-button"
                        >
                          📎 View Answer
                        </Button>
                      ) : (
                        <span className="text-muted">No file</span>
                      )}
                    </td>
                    <td>{getStatusBadge(submission)}</td>
                    <td>
                      {submission.grade ? (
                        `${submission.grade.points}/${submission.assignment?.maxPoints}`
                      ) : (
                        'Not graded'
                      )}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleGradeClick(submission)}
                        className="file-button"
                      >
                        {submission.grade ? 'Update Grade' : 'Grade'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Grade Submission Modal */}
      <Modal show={showGradeModal} onHide={() => setShowGradeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Grade Submission - {selectedSubmission?.student?.name}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleGradeSubmit}>
          <Modal.Body>
            {selectedSubmission && (
              <>
                <div className="mb-3">
                  <strong>Assignment:</strong> {selectedSubmission.assignment?.title}
                </div>
                {selectedSubmission.submissionText && (
                  <div className="mb-3">
                    <strong>Answer Text:</strong>
                    <div className="border p-2 bg-light">
                      {selectedSubmission.submissionText}
                    </div>
                  </div>
                )}
                {selectedSubmission.submissionFile && (
                  <div className="mb-3">
                    <strong>Answer File:</strong>
                    <div className="mt-1">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => viewSubmissionFile(selectedSubmission)}
                        className="file-button"
                      >
                        📎 View Answer File
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
            <Form.Group className="mb-3">
              <Form.Label>
                Points (Max: {selectedSubmission?.assignment?.maxPoints})
              </Form.Label>
              <Form.Control
                type="number"
                name="points"
                value={gradeForm.points}
                onChange={handleGradeChange}
                min="0"
                max={selectedSubmission?.assignment?.maxPoints}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Feedback</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="feedback"
                value={gradeForm.feedback}
                onChange={handleGradeChange}
                placeholder="Provide feedback to the student..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowGradeModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Grading...' : 'Submit Grade'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Submissions;