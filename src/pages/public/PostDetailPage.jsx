import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiHeart, FiSend, FiClock, FiEye, FiUser, FiMessageCircle, FiShare2, FiArrowLeft, FiBookmark } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import Loader from '../../components/common/Loader';
import ReadingProgressBar from '../../components/common/ReadingProgressBar';
import CommentThread from '../../components/comments/CommentThread';
import postService from '../../services/postService';
import commentService from '../../services/commentService';
import mediaService from '../../services/mediaService';
import authService from '../../services/authService';
import { sanitizeHtml } from '../../utils/sanitize';
import { useAuth } from '../../hooks/useAuth';

const REACTIONS = ['🔥', '❤️', '😂', '😮', '🎉'];
const REACTION_DEFAULT_COUNTS = REACTIONS.reduce((acc, emoji) => ({ ...acc, [emoji]: 0 }), {});

function PostDetailPage() {
  const { postId, slug } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [mediaItems, setMediaItems] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyParent, setReplyParent] = useState(null);
  const [liked, setLiked] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState('');
  const [reactionCounts, setReactionCounts] = useState(REACTION_DEFAULT_COUNTS);
  const [saving, setSaving] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const safeHtml = useMemo(() => sanitizeHtml(post?.content), [post?.content]);
  const featuredUrl = post?.featuredImageUrl || '';
  const featuredIsVideo = /\.(mp4|webm|ogg|mov)$/i.test(featuredUrl);
  const featuredIsAudio = /\.(mp3|wav|aac|m4a|flac|ogg)$/i.test(featuredUrl);

  const loadComments = async (id) => {
    try {
      const data = await commentService.getByPost(id);
      setComments(data || []);
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  };

  const loadMedia = async (id) => {
    try {
      const data = await mediaService.getByPost(id);
      setMediaItems(data || []);
    } catch (err) {
      console.error('Failed to load media', err);
    }
  };

  const loadPost = async () => {
    setLoading(true);
    try {
      const data = postId ? await postService.getPostById(postId) : await postService.getPostBySlug(slug);
      setPost(data);
      if (data?.id) {
        // Increment view count
        postService.viewPost(data.id, `session-${localStorage.getItem('ink_s') || Date.now()}`).catch(() => {});
        await Promise.all([loadComments(data.id), loadMedia(data.id)]);
      }
    } catch (err) {
      console.error('Failed to load post', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, slug]);

  useEffect(() => {
    if (!post?.id) return;
    setLiked(localStorage.getItem(`ink_like_${post.id}`) === '1');
    setSelectedReaction(localStorage.getItem(`ink_reaction_${post.id}`) || '');
    try {
      const stored = JSON.parse(localStorage.getItem(`ink_reaction_counts_${post.id}`) || '{}');
      setReactionCounts({ ...REACTION_DEFAULT_COUNTS, ...stored });
    } catch (_err) {
      setReactionCounts(REACTION_DEFAULT_COUNTS);
    }
  }, [post?.id]);

  useEffect(() => {
    const loadAuthorName = async () => {
      if (!post?.authorId) return;
      try {
        const profile = await authService.getUserById(post.authorId);
        setAuthorName(profile?.username || '');
      } catch (_err) {
        setAuthorName('');
      }
    };
    loadAuthorName();
  }, [post?.authorId]);

  useEffect(() => {
    const loadSaveState = async () => {
      if (!post?.id || !isAuthenticated) {
        setSaved(false);
        return;
      }
      try {
        const res = await postService.getSaveStatus(post.id);
        setSaved(Boolean(res?.saved));
      } catch (_err) {
        setSaved(false);
      }
    };
    loadSaveState();
  }, [post?.id, isAuthenticated]);

  const onLikePost = async () => {
    if (!post?.id || !isAuthenticated) return;
    const nextLike = !liked;
    try {
      const updated = await postService.likePost(post.id, nextLike);
      setPost(updated);
      setLiked(nextLike);
      localStorage.setItem(`ink_like_${post.id}`, nextLike ? '1' : '0');
    } catch (err) {
      console.error('Failed to like post', err);
    }
  };

  const onSelectReaction = (emoji) => {
    if (!post?.id) return;
    setReactionCounts((prev) => {
      const next = { ...prev };
      if (selectedReaction && next[selectedReaction] > 0) {
        next[selectedReaction] -= 1;
      }
      next[emoji] = (next[emoji] || 0) + 1;
      localStorage.setItem(`ink_reaction_counts_${post.id}`, JSON.stringify(next));
      return next;
    });
    setSelectedReaction(emoji);
    localStorage.setItem(`ink_reaction_${post.id}`, emoji);
  };

  const onToggleSave = async () => {
    if (!post?.id || !isAuthenticated) return;
    setSaveLoading(true);
    try {
      if (saved) {
        await postService.unsavePost(post.id);
        setSaved(false);
      } else {
        await postService.savePost(post.id);
        setSaved(true);
      }
    } catch (err) {
      console.error('Failed to toggle save post', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const onSubmitComment = async (event) => {
    event.preventDefault();
    if (!isAuthenticated || !commentText.trim()) return;

    setSaving(true);
    try {
      const actorUserId = Number(user?.id ?? user?.userId);
      if (!Number.isFinite(actorUserId)) {
        throw new Error('Missing valid user id for comment submission');
      }
      const payload = {
        postId: post.id,
        authorId: actorUserId,
        userId: actorUserId,
        content: commentText.trim(),
      };
      
      if (replyParent?.id) {
        payload.parentCommentId = replyParent.id;
      }

      await commentService.add(payload);

      setCommentText('');
      setReplyParent(null);
      await loadComments(post.id);
    } catch (err) {
      console.error('Failed to add comment', err);
      console.error('Comment API error details', err?.response?.status, err?.response?.data);
      alert('Failed to post comment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const onDeleteComment = async (comment) => {
    try {
      await commentService.remove(comment.id, user.id);
      await loadComments(post.id);
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  const onLikeComment = async (comment) => {
    if (!user?.id) return;
    try {
      await commentService.like(comment.id, user.id);
      await loadComments(post.id);
    } catch (err) {
      console.error('Failed to like comment', err);
    }
  };

  const onEditComment = async (comment) => {
    if (!user?.id) return;
    const nextContent = window.prompt('Edit your comment', comment.content || '');
    if (!nextContent || !nextContent.trim()) return;
    try {
      await commentService.update(comment.id, user.id, { content: nextContent.trim() });
      await loadComments(post.id);
    } catch (err) {
      console.error('Failed to edit comment', err);
    }
  };

  if (loading) return <Loader text="Loading post..." />;
  if (!post) return (
    <div className="text-center py-5">
      <h3 className="text-secondary">Post not found.</h3>
      <Link to="/" className="btn btn-primary mt-3">Go Home</Link>
    </div>
  );

  return (
    <PageTransition>
      <ReadingProgressBar />
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-8">
            {/* Header */}
            <header className="mb-5">
              <Link to="/" className="btn btn-outline-secondary btn-sm rounded-pill mb-4 d-inline-flex align-items-center gap-2">
                <FiArrowLeft /> Back to Feed
              </Link>
              
              <div className="d-flex align-items-center gap-2 mb-3">
                {post.categories?.map(cat => (
                  <Link key={cat.id} to={`/category/${cat.id}`} className="badge bg-primary text-decoration-none">
                    {cat.name}
                  </Link>
                ))}
              </div>

              <h1 className="display-4 fw-bold mb-4" style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {post.title}
              </h1>

              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 py-3 border-top border-bottom">
                <div className="d-flex align-items-center gap-3">
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--ink-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <FiUser size={24} className="text-muted" />
                  </div>
                  <div>
                    <Link to={`/author/${post.authorId}`} className="d-block fw-bold text-decoration-none text-dark">
                      {authorName || `Author #${post.authorId}`}
                    </Link>
                    <div className="d-flex align-items-center gap-3 text-secondary small">
                      <span className="d-flex align-items-center gap-1"><FiClock size={14} /> {post.readTimeMin || 1} min read</span>
                      <span className="d-flex align-items-center gap-1"><FiEye size={14} /> {post.viewCount || 0} views</span>
                    </div>
                  </div>
                </div>
                
                <div className="d-flex gap-2">
                  <button className={`btn btn-outline-danger btn-sm rounded-pill d-flex align-items-center gap-2 ${liked ? 'liked bg-danger text-white' : ''}`} onClick={onLikePost}>
                    <FiHeart fill={liked ? 'currentColor' : 'none'} /> {post.likesCount || 0}
                  </button>
                  {isAuthenticated && (
                    <button
                      className={`btn btn-sm rounded-pill d-flex align-items-center gap-2 ${saved ? 'btn-success' : 'btn-outline-success'}`}
                      onClick={onToggleSave}
                      disabled={saveLoading}
                    >
                      <FiBookmark /> {saveLoading ? 'Saving...' : saved ? 'Saved' : 'Save'}
                    </button>
                  )}
                  <button className="btn btn-outline-primary btn-sm rounded-pill d-flex align-items-center gap-2" onClick={() => navigator.share?.({ title: post.title, url: window.location.href })}>
                    <FiShare2 /> Share
                  </button>
                </div>
              </div>
            </header>

            {/* Featured Media */}
            <figure className="mb-5">
              {featuredUrl ? (
                featuredIsVideo ? (
                  <video src={featuredUrl} controls className="featured-image shadow-lg" style={{ width: '100%', borderRadius: 'var(--ink-radius-lg)' }} />
                ) : featuredIsAudio ? (
                  <div className="card glass-card p-4 border-0 shadow-lg text-center">
                    <audio src={featuredUrl} controls className="w-100" />
                  </div>
                ) : (
                  <img src={featuredUrl} alt={post.title} className="featured-image shadow-lg" style={{ width: '100%', borderRadius: 'var(--ink-radius-lg)', objectFit: 'cover', maxHeight: '600px' }} />
                )
              ) : null}
              {post.caption && <figcaption className="text-center text-muted small mt-2">{post.caption}</figcaption>}
            </figure>

            {/* Content */}
            <article className="post-content mb-5" dangerouslySetInnerHTML={{ __html: safeHtml }} />

            {/* Tags & Reactions */}
            <footer className="py-5 border-top border-bottom mb-5">
              <div className="row g-4 align-items-center">
                <div className="col-md-6">
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {post.tags?.map(tag => (
                      <Link key={tag.id} to={`/tag/${tag.id}`} className="badge text-bg-light text-decoration-none">
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="col-md-6 text-md-end">
                   <div className="reaction-bar d-inline-flex">
                    {REACTIONS.map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        className={`reaction-pill ${selectedReaction === emoji ? 'active' : ''}`}
                        onClick={() => onSelectReaction(emoji)}
                        style={{ padding: '0.4rem 1rem' }}
                      >
                        {emoji} {reactionCounts[emoji] || 0}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </footer>

            {/* Comments Section */}
            <section className="comments-section" id="comments">
              <div className="d-flex align-items-center gap-3 mb-4">
                <FiMessageCircle size={24} className="text-primary" />
                <h3 className="fw-bold mb-0">Discussion ({comments.length})</h3>
              </div>

              <div className="card border-0 shadow-sm p-4 mb-5" style={{ borderRadius: 'var(--ink-radius-md)' }}>
                {isAuthenticated ? (
                  <form onSubmit={onSubmitComment}>
                    {replyParent && (
                      <div className="alert alert-info py-2 d-flex justify-content-between align-items-center">
                        <span>Replying to <strong>{replyParent.authorName || 'comment'}</strong></span>
                        <button type="button" className="btn-close" onClick={() => setReplyParent(null)}></button>
                      </div>
                    )}
                    <textarea
                      className="form-control mb-3"
                      rows="4"
                      placeholder="Share your thoughts..."
                      style={{ resize: 'none', border: '1.5px solid var(--ink-border)' }}
                      value={commentText}
                      onChange={(event) => setCommentText(event.target.value)}
                    />
                    <div className="d-flex justify-content-end">
                      <button type="submit" className="btn btn-primary px-4 py-2" disabled={!commentText.trim() || saving}>
                        {saving ? 'Posting...' : <>Post Comment <FiSend className="ms-2" /></>}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-3">
                    <p className="text-secondary mb-3">Login to join the conversation.</p>
                    <Link to="/login" className="btn btn-outline-primary btn-sm rounded-pill px-4">Login</Link>
                  </div>
                )}
              </div>

              <CommentThread
                comments={comments}
                onReply={setReplyParent}
                onDelete={onDeleteComment}
                onLike={onLikeComment}
                onEdit={onEditComment}
              />
            </section>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default PostDetailPage;
