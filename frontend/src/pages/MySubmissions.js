import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import { submissionAPI, assignmentAPI } from '../services/api';
import { useAuth } from '../utils/AuthContext';

const MySubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const [submitForm, setSubmitForm] = useState({
    submissionText: '',
    submissionFile: null,
    studentId: user?._id,
  });

  useEffect(() => {
    if (user) {
      setSubmitForm(prev => ({ ...prev, studentId: user._id }));
      fetchMySubmissions();
      fetchAssignments();
    }
  }, [user]);

  const fetchMySubmissions = async () => {
    try {
      const response = await submissionAPI.getMySubmissions(user._id);
      setSubmissions(response.data);
    } catch (error) {
      setError('Failed to fetch submissions: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await assignmentAPI.getAssignments();
      setAssignments(response.data);
    } catch (error) {
      setError('Failed to fetch assignments: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmitClick = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmitForm({
      submissionText: '',
      submissionFile: null,
      studentId: user._id,
    });
    setShowSubmitModal(true);
  };

  const handleSubmissionFileChange = (e) => {
    setSubmitForm({
      ...submitForm,
      submissionFile: e.target.files[0]
    });
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitData = new FormData();
      submitData.append('submissionText', submitForm.submissionText || '');
      submitData.append('studentId', user._id);
      
      if (submitForm.submissionFile) {
        submitData.append('submissionFile', submitForm.submissionFile);
      }

      await submissionAPI.submitAssignment(selectedAssignment._id, submitData);
      setShowSubmitModal(false);
      setSelectedAssignment(null);
      setSubmitForm({
        submissionText: '',
        submissionFile: null,
        studentId: user._id,
      });
      fetchMySubmissions();
      fetchAssignments();
    } catch (error) {
      setError('Failed to submit assignment: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
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

  const isAssignmentSubmitted = (assignmentId) => {
    return submissions.some(sub => sub.assignment && sub.assignment._id === assignmentId);
  };

  const getSubmissionForAssignment = (assignmentId) => {
    return submissions.find(sub => sub.assignment && sub.assignment._id === assignmentId);
  };

  const viewQuestionFile = (assignment) => {
    if (assignment.questionFile) {
      const fileUrl = `http://localhost:5000/uploads/${assignment.questionFile.filename}`;
      window.open(fileUrl, '_blank');
    }
  };

  const viewSubmissionFile = (submission) => {
    if (submission.submissionFile) {
      const fileUrl = `http://localhost:5000/uploads/${submission.submissionFile.filename}`;
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <div>
      <h1 className="mb-4">My Submissions</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Available Assignments */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Available Assignments</h5>
        </Card.Header>
        <Card.Body>
          {assignments.length === 0 ? (
            <p className="text-center text-muted">No assignments available.</p>
          ) : (
            <Table responsive striped>
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Due Date</th>
                  <th>Points</th>
                  <th>Status</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => {
                  const submission = getSubmissionForAssignment(assignment._id);
                  const isSubmitted = isAssignmentSubmitted(assignment._id);
                  const isPastDue = new Date(assignment.dueDate) < new Date();

                  return (
                    <tr key={assignment._id}>
                      <td>
                        <div>
                          <strong>{assignment.title}</strong>
                          <div>
                            <small className="text-muted">
                              {assignment.description}
                            </small>
                          </div>
                          {assignment.questionFile && (
                            <div className="mt-1">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => viewQuestionFile(assignment)}
                                className="file-button"
                              >
                                📄 View Question
                              </Button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div>
                          {formatDate(assignment.dueDate)}
                          {isPastDue && !isSubmitted && (
                            <Badge bg="danger" className="ms-1">Past Due</Badge>
                          )}
                        </div>
                      </td>
                      <td>{assignment.maxPoints}</td>
                      <td>
                        {isSubmitted ? (
                          getStatusBadge(submission)
                        ) : (
                          <Badge bg="warning">Not Submitted</Badge>
                        )}
                      </td>
                      <td>
                        {submission?.grade ? (
                          `${submission.grade.points}/${assignment.maxPoints}`
                        ) : (
                          isSubmitted ? 'Pending' : '-'
                        )}
                      </td>
                      <td>
                        {!isSubmitted ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleSubmitClick(assignment)}
                            disabled={isPastDue}
                          >
                            {isPastDue ? 'Past Due' : 'Submit Answer'}
                          </Button>
                        ) : (
                          <Button variant="outline-secondary" size="sm" disabled>
                            Submitted
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Submission History */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Submission History</h5>
        </Card.Header>
        <Card.Body>
          {submissions.length === 0 ? (
            <p className="text-center text-muted">No submission history.</p>
          ) : (
            <Table responsive striped>
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Submitted At</th>
                  <th>Answer File</th>
                  <th>Status</th>
                  <th>Grade</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission._id}>
                    <td>{submission.assignment?.title}</td>
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
                      {submission.grade?.feedback || 'No feedback yet'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Submit Assignment Modal */}
      <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Submit Answer: {selectedAssignment?.title}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitAssignment}>
          <Modal.Body>
            {selectedAssignment && (
              <>
                <div className="mb-3">
                  <strong>Description:</strong>
                  <p>{selectedAssignment.description}</p>
                </div>
                {selectedAssignment.questionFile && (
                  <div className="mb-3">
                    <strong>Question File:</strong>
                    <div className="mt-1">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => viewQuestionFile(selectedAssignment)}
                        className="file-button"
                      >
                        📄 View Question File
                      </Button>
                    </div>
                  </div>
                )}
                <div className="mb-3">
                  <strong>Instructions:</strong>
                  <p>{selectedAssignment.instructions || 'No specific instructions provided.'}</p>
                </div>
                <div className="mb-3">
                  <strong>Due Date:</strong>
                  <p>{formatDate(selectedAssignment.dueDate)}</p>
                </div>
              </>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Answer Text (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="submissionText"
                value={submitForm.submissionText}
                onChange={(e) => setSubmitForm({
                  ...submitForm,
                  submissionText: e.target.value
                })}
                placeholder="Enter your answer text here..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Upload Answer File</Form.Label>
              <Form.Control
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.zip,.rar"
                onChange={handleSubmissionFileChange}
              />
              <Form.Text className="text-muted">
                Upload your answer file (PDF, Word, PowerPoint, Images, Text, ZIP, RAR) - Max: 10MB
              </Form.Text>
            </Form.Group>

            <Alert variant="info">
              <strong>Note:</strong> You can submit either text, a file, or both. At least one is required.
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowSubmitModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading || (!submitForm.submissionText && !submitForm.submissionFile)}
            >
              {loading ? 'Submitting...' : 'Submit Answer'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default MySubmissions;