import { useMemo } from 'react';
import { FiCornerDownRight, FiEdit2, FiHeart, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

function CommentThread({ comments, onReply, onDelete, onLike, onEdit }) {
  const { user } = useAuth();

  const tree = useMemo(() => {
    const byParent = new Map();
    comments.forEach((comment) => {
      const key = comment.parentCommentId || 'root';
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key).push(comment);
    });
    return byParent;
  }, [comments]);

  const renderNodes = (parentKey = 'root', level = 0) => {
    const nodes = tree.get(parentKey) || [];
    return nodes.map((comment) => (
      <div key={comment.id} className={`comment-item level-${level}`}>
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div>
            <strong>User #{comment.authorId}</strong>
            <p className="mb-1 mt-1">{comment.content}</p>
            <small className="text-secondary">Status: {comment.status}</small>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-light" onClick={() => onLike(comment)}>
              <FiHeart /> {comment.likesCount || 0}
            </button>
            {user?.id === comment.authorId ? (
              <>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => onEdit(comment)}>
                  <FiEdit2 />
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(comment)}>
                  <FiTrash2 />
                </button>
              </>
            ) : null}
          </div>
        </div>
        {level === 0 ? (
          <button className="btn btn-link btn-sm p-0 mt-2" onClick={() => onReply(comment)}>
            <FiCornerDownRight /> Reply
          </button>
        ) : null}
        <div className="mt-2">{renderNodes(comment.id, level + 1)}</div>
      </div>
    ));
  };

  return <div className="d-flex flex-column gap-3">{renderNodes()}</div>;
}

export default CommentThread;
