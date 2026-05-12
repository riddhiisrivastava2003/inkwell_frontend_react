import { Link } from 'react-router-dom';
import { FiFolder, FiHash } from 'react-icons/fi';

function SidebarFilters({ categories = [], tags = [] }) {
  return (
    <aside className="d-flex flex-column gap-4 inkwell-sidebar">
      <section className="card border-0 p-4">
        <h6 className="mb-4 d-flex align-items-center gap-2" style={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.85rem' }}>
          <FiFolder className="text-primary" /> Categories
        </h6>
        <div className="d-flex flex-column gap-2">
          {categories.length > 0 ? categories.map((category) => (
            <Link className="sidebar-link" key={category.id} to={`/category/${category.id}`}>
              <span style={{ fontWeight: 500 }}>{category.name}</span>
              <span className="badge bg-secondary rounded-pill">{category.postCount || 0}</span>
            </Link>
          )) : (
            <span className="text-secondary small">No categories found.</span>
          )}
        </div>
      </section>

      <section className="card border-0 p-4">
        <h6 className="mb-4 d-flex align-items-center gap-2" style={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.85rem' }}>
          <FiHash className="text-primary" /> Trending Tags
        </h6>
        <div className="d-flex flex-wrap gap-2">
          {tags.length > 0 ? tags.map((tag) => (
            <Link key={tag.id} className="badge text-bg-light" to={`/tag/${tag.id}`} style={{ padding: '0.5rem 0.8rem', fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--ink-primary)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--ink-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--ink-surface-2)'; e.currentTarget.style.color = 'var(--ink-primary)'; e.currentTarget.style.borderColor = 'var(--ink-border)'; }}
            >
              #{tag.name}
            </Link>
          )) : (
             <span className="text-secondary small">No tags found.</span>
          )}
        </div>
      </section>
    </aside>
  );
}

export default SidebarFilters;
