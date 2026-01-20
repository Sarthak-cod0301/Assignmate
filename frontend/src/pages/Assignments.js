import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Row, Col, Alert, Badge, Table } from 'react-bootstrap';
import { assignmentAPI, submissionAPI } from '../services/api';
import { useAuth } from '../utils/AuthContext';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxPoints: 100,
    instructions: '',
    teacherId: user?._id,
  });

  const [questionFile, setQuestionFile] = useState(null);
  const [submitForm, setSubmitForm] = useState({
    submissionText: '',
    submissionFile: null,
    studentId: user?._id,
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, teacherId: user._id }));
      setSubmitForm(prev => ({ ...prev, studentId: user._id }));
      fetchAssignments();
    }
  }, [user]);

  const fetchAssignments = async () => {
    try {
      const response = await assignmentAPI.getAssignments();
      setAssignments(response.data);
    } catch (error) {
      setError('Failed to fetch assignments');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('dueDate', formData.dueDate);
      submitData.append('maxPoints', formData.maxPoints);
      submitData.append('instructions', formData.instructions);
      submitData.append('teacherId', formData.teacherId);
      
      if (questionFile) {
        submitData.append('questionFile', questionFile);
      }

      await assignmentAPI.createAssignment(submitData);
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        maxPoints: 100,
        instructions: '',
        teacherId: user._id,
      });
      setQuestionFile(null);
      fetchAssignments();
    } catch (error) {
      setError('Failed to create assignment: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setQuestionFile(e.target.files[0]);
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
      fetchAssignments();
    } catch (error) {
      setError('Failed to submit assignment: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isPastDue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const deleteAssignment = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await assignmentAPI.deleteAssignment(id);
        fetchAssignments();
      } catch (error) {
        setError('Failed to delete assignment');
      }
    }
  };

  const viewQuestionFile = (assignment) => {
    if (assignment.questionFile) {
      const fileUrl = `https://assignmate-backend-76bd.onrender.com/uploads/${assignment.questionFile.filename}`;
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Assignments</h1>
        {user?.role === 'teacher' && (
          <Button onClick={() => setShowModal(true)}>
            Create Assignment
          </Button>
        )}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {user?.role === 'teacher' ? (
        <Card>
          <Card.Body>
            {assignments.length === 0 ? (
              <p className="text-center text-muted">No assignments created yet.</p>
            ) : (
              <Table responsive striped>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Due Date</th>
                    <th>Max Points</th>
                    <th>Question File</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr key={assignment._id}>
                      <td>
                        <strong>{assignment.title}</strong>
                      </td>
                      <td>{assignment.description}</td>
                      <td>
                        {formatDate(assignment.dueDate)}
                        {isPastDue(assignment.dueDate) && (
                          <Badge bg="danger" className="ms-2">Past Due</Badge>
                        )}
                      </td>
                      <td>{assignment.maxPoints}</td>
                      <td>
                        {assignment.questionFile ? (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => viewQuestionFile(assignment)}
                            className="file-button"
                          >
                            📄 View Question
                          </Button>
                        ) : (
                          <span className="text-muted">No file</span>
                        )}
                      </td>
                      <td>
                        <Badge bg={isPastDue(assignment.dueDate) ? 'danger' : 'success'}>
                          {isPastDue(assignment.dueDate) ? 'Closed' : 'Active'}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => deleteAssignment(assignment._id)}
                          className="file-button"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {assignments.map((assignment) => (
            <Col md={6} lg={4} key={assignment._id} className="mb-3">
              <Card className="assignment-card">
                <Card.Body>
                  <Card.Title>{assignment.title}</Card.Title>
                  <Card.Text>{assignment.description}</Card.Text>
                  
                  {assignment.questionFile && (
                    <div className="mb-3">
                      <strong>Question File:</strong>
                      <div className="mt-1">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => viewQuestionFile(assignment)}
                          className="file-button"
                        >
                          📄 View Question File
                        </Button>
                        <small className="d-block text-muted mt-1">
                          {assignment.questionFile.originalName}
                        </small>
                      </div>
                    </div>
                  )}

                  <div className="mb-2">
                    <strong>Due:</strong> {formatDate(assignment.dueDate)}
                    {isPastDue(assignment.dueDate) && (
                      <Badge bg="danger" className="ms-2">Past Due</Badge>
                    )}
                  </div>
                  <div className="mb-2">
                    <strong>Points:</strong> {assignment.maxPoints}
                  </div>
                  {assignment.instructions && (
                    <div className="mb-2">
                      <strong>Instructions:</strong>
                      <small className="d-block text-muted">
                        {assignment.instructions}
                      </small>
                    </div>
                  )}
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => handleSubmitClick(assignment)}
                    disabled={isPastDue(assignment.dueDate)}
                  >
                    {isPastDue(assignment.dueDate) ? 'Past Due' : 'Submit Answer'}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Create Assignment Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Assignment</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="datetime-local"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Maximum Points</Form.Label>
              <Form.Control
                type="number"
                name="maxPoints"
                value={formData.maxPoints}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Instructions</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Question File (Optional)</Form.Label>
              <Form.Control
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.zip,.rar"
                onChange={handleFileChange}
              />
              <Form.Text className="text-muted">
                Upload question file (PDF, Word, PowerPoint, Images, Text, ZIP, RAR) - Max: 10MB
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Assignment'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

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

export default Assignments;
