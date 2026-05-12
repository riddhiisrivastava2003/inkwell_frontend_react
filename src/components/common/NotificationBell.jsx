import { useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FiBell } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';

function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const [local, setLocal] = useState([]);

  useEffect(() => {
    setLocal(notifications.slice(0, 8));
  }, [notifications]);

  const resolveNotificationLink = (item) => {
    const type = String(item?.relatedType || '').toUpperCase();
    const notifType = String(item?.type || '').toUpperCase();
    const relatedId = item?.relatedId;

    if (type === 'POST' && relatedId) {
      if (notifType === 'NEW_POST') {
        return `/posts/${relatedId}`;
      }
      return `/posts/${relatedId}#comments`;
    }
    if (type === 'COMMENT' && relatedId) {
      return `/posts/${relatedId}#comments`;
    }
    return null;
  };

  const onNotificationClick = async (item) => {
    try {
      await markRead(item.id);
    } catch (_err) {
      // Keep navigation best-effort.
    }

    const target = resolveNotificationLink(item);
    if (target) {
      navigate(target);
    }
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="outline-secondary" className="position-relative">
        <FiBell />
        {unreadCount > 0 ? (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount}
          </span>
        ) : null}
      </Dropdown.Toggle>
      <Dropdown.Menu className="notification-menu shadow-lg border-0">
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
          <strong>Notifications</strong>
          <button type="button" className="btn btn-link btn-sm" onClick={markAllRead}>
            Mark all read
          </button>
        </div>
        {local.length === 0 ? (
          <p className="text-secondary px-3 py-3 mb-0">No notifications yet.</p>
        ) : (
          local.map((item) => (
            <Dropdown.Item key={item.id} className="py-2" onClick={() => onNotificationClick(item)}>
              <div className="small fw-semibold">{item.title || 'Notification'}</div>
              <div className="small text-secondary">{item.message || '-'}</div>
            </Dropdown.Item>
          ))
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default NotificationBell;
