import React from 'react';
import { Card, Row, Col, Container } from 'react-bootstrap';
import { useAuth } from '../utils/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Container>
      <h1 className="mb-4">Dashboard</h1>
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Welcome, {user?.name}!</Card.Title>
              <Card.Text>
                You are logged in as a <strong>{user?.role}</strong>.
                {user?.studentId && (
                  <span> Student ID: <strong>{user.studentId}</strong></span>
                )}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Quick Actions</Card.Title>
              <Card.Text>
                {user?.role === 'student' ? (
                  <>
                    • View assignments with question files<br />
                    • Upload answer files for submissions<br />
                    • Check grades and feedback
                  </>
                ) : (
                  <>
                    • Create assignments with question files<br />
                    • Review student answer files<br />
                    • Grade assignments
                  </>
                )}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;