import { NavLink } from 'react-router-dom';
import {
  FiGrid, FiEdit3, FiFileText, FiMessageSquare, FiImage,
  FiTrendingUp, FiUsers, FiShield, FiTag, FiMail, FiBarChart2, FiBookOpen
} from 'react-icons/fi';

const ICON_MAP = {
  'Overview': <FiGrid />, 'Create Post': <FiEdit3 />, 'My Posts': <FiFileText />,
  'Comments': <FiMessageSquare />, 'Media': <FiImage />, 'Analytics': <FiBarChart2 />,
  'Users': <FiUsers />, 'Posts': <FiShield />, 'Categories & Tags': <FiTag />,
  'Newsletter': <FiMail />, 'Admin': <FiShield />, 'Dashboard': <FiGrid />,
  'Trending': <FiTrendingUp />, 'Reading List': <FiBookOpen />,
};

function DashboardSidebar({ items }) {
  return (
    <div className="inkwell-sidebar">
      <div style={{
        background: 'var(--ink-surface)',
        border: '1px solid var(--ink-border)',
        borderRadius: 'var(--ink-radius-md)',
        padding: '0.75rem',
        boxShadow: 'var(--ink-shadow-sm)',
      }}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{ICON_MAP[item.label] || <FiGrid />}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default DashboardSidebar;
