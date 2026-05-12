import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FiUsers, FiTarget, FiHeart } from 'react-icons/fi';

const AboutPage = () => {
  return (
    <Container className="py-5 mt-5">
      <div className="text-center mb-5">
        <h1 className="serif fw-800 display-4 mb-3">About InkWell</h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
          A premium home for readers, authors, and visionaries. We believe in the power of narratives to change the world.
        </p>
      </div>

      <Row className="g-4 mb-5">
        {[
          { icon: FiUsers, title: 'Community First', text: 'We build spaces where storytellers and readers connect deeply.' },
          { icon: FiTarget, title: 'Our Mission', text: 'To empower voices that deserve to be heard through high-quality editorial standards.' },
          { icon: FiHeart, title: 'Passion Driven', text: 'Every story on InkWell is curated with care and passion for the craft.' }
        ].map((item, i) => (
          <Col md={4} key={i}>
            <div className="p-4 rounded-4 bg-white border h-100 transition-hover shadow-sm">
              <div className="bg-primary-soft p-3 rounded-circle d-inline-flex mb-3 text-primary">
                <item.icon size={24} />
              </div>
              <h5 className="fw-700 mb-2">{item.title}</h5>
              <p className="text-muted small mb-0">{item.text}</p>
            </div>
          </Col>
        ))}
      </Row>

      <div className="p-5 rounded-4 bg-dark text-white text-center">
        <h2 className="serif fw-700 mb-3">Want to join our journey?</h2>
        <p className="opacity-75 mb-4">We are always looking for visionary authors to share their unique perspectives.</p>
        <button className="btn btn-primary px-4 py-2 fw-600">Start Writing</button>
      </div>
    </Container>
  );
};

export default AboutPage;
