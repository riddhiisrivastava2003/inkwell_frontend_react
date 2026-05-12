import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import AppNavbar from '../components/common/AppNavbar';
import AppFooter from '../components/common/AppFooter';

function PublicLayout() {
  return (
    <>
      <AppNavbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <AppFooter />
    </>
  );
}

export default PublicLayout;

