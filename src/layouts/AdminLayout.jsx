import { Outlet } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import AppNavbar from '../components/common/AppNavbar';
import AppFooter from '../components/common/AppFooter';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';

const items = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/posts', label: 'Posts' },
  { to: '/admin/taxonomy', label: 'Categories & Tags' },
  { to: '/admin/comments', label: 'Comments' },
  { to: '/admin/newsletter', label: 'Newsletter' },
  { to: '/admin/media', label: 'Media' },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/audit-logs', label: 'Audit Logs' },
];

function AdminLayout() {
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

export default AdminLayout;

