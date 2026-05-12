import React from 'react';
import { Container, Accordion } from 'react-bootstrap';
import { FiShield, FiLock, FiEye } from 'react-icons/fi';

const PrivacyPage = () => {
  return (
    <Container className="py-5 mt-5" style={{ maxWidth: '800px' }}>
      <div className="text-center mb-5">
        <div className="bg-success-soft p-3 rounded-circle d-inline-flex mb-3 text-success">
          <FiShield size={32} />
        </div>
        <h1 className="serif fw-800 mb-3">Privacy Policy</h1>
        <p className="text-muted">Last Updated: May 2026</p>
      </div>

      <Accordion defaultActiveKey="0" className="shadow-sm rounded-4 overflow-hidden border">
        <Accordion.Item eventKey="0">
          <Accordion.Header className="fw-700">1. Information Collection</Accordion.Header>
          <Accordion.Body>
            We collect information you provide directly to us when you create an account, publish a story, or communicate with us. This may include your name, email address, and profile information.
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header className="fw-700">2. How We Use Information</Accordion.Header>
          <Accordion.Body>
            We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect InkWell and our users.
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="2">
          <Accordion.Header className="fw-700">3. Data Security</Accordion.Header>
          <Accordion.Body>
            We take reasonable measures to protect your personal information from loss, theft, misuse, and unauthorized access. Your data is encrypted and stored securely.
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="3">
          <Accordion.Header className="fw-700">4. Your Choices</Accordion.Header>
          <Accordion.Body>
            You may update or delete your account information at any time by logging into your account settings. You can also opt-out of promotional communications.
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <div className="mt-5 p-4 rounded-4 bg-light border border-dashed text-center">
        <p className="small text-muted mb-0">
          If you have any questions about this Privacy Policy, please contact us at <a href="mailto:inkwelloperational@gmail.com" className="fw-600 text-primary">inkwelloperational@gmail.com</a>
        </p>
      </div>
    </Container>
  );
};

export default PrivacyPage;
