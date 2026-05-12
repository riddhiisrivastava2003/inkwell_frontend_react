import { Outlet } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import AppNavbar from '../components/common/AppNavbar';
import AppFooter from '../components/common/AppFooter';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';

const items = [
  { to: '/dashboard', label: 'Overview', end: true },
  { to: '/dashboard/posts/new', label: 'Create Post' },
  { to: '/dashboard/posts', label: 'My Posts' },
  { to: '/dashboard/comments', label: 'Comments' },
  { to: '/dashboard/media', label: 'Media' },
  { to: '/dashboard/analytics', label: 'Analytics' },
];

function DashboardLayout() {
  return (
    <>
      <AppNavbar />
      <Container className="py-4">
        <Row className="g-4">
          <Col lg={3}>
            <DashboardSidebar items={items} />
          </Col>
          <Col lg={9}>
            <Outlet />
          </Col>
        </Row>
      </Container>
      <AppFooter />
    </>
  );
}

export default DashboardLayout;

