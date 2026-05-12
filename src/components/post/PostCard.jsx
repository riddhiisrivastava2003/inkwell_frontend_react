import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEye, FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiArrowRight } from 'react-icons/fi';
import postService from '../../services/postService';
import authService from '../../services/authService';
import commentService from '../../services/commentService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

function PostCard({ post }) {
  const { isAuthenticated, user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const authorName = post.author?.fullName || post.author?.username || post.authorName;
  const commentCount = post.commentsCount || 0;
  const featuredUrl = post.featuredImageUrl || '';
  const category = post.categories?.[0]?.name || 'Story';
  const authorAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`;

  useEffect(() => {
    const loadFollowStatus = async () => {
      if (!isAuthenticated || !user?.id || !post?.authorId || String(user.id) === String(post.authorId)) {
        setIsFollowing(false);
        return;
      }
      try {
        const state = await authService.getFollowStatus(post.authorId);
        setIsFollowing(Boolean(state?.following));
      } catch (_err) {
        setIsFollowing(false);
      }
    };
    loadFollowStatus();
  }, [isAuthenticated, user?.id, post?.authorId]);

  const handleLike = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      if (isLiked) {
        await postService.unlikePost(post.id);
        setLikesCount((prev) => prev - 1);
      } else {
        await postService.likePost(post.id);
        setLikesCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (_err) {
      toast.error('Could not update like');
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
    toast.success('Link copied to clipboard!');
  };

  const handleFollowToggle = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to follow authors');
      return;
    }
    if (!post?.authorId || String(user?.id) === String(post.authorId)) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await authService.unfollowAuthor(post.authorId);
        setIsFollowing(false);
      } else {
        await authService.followAuthor(post.authorId);
        setIsFollowing(true);
      }
    } catch (_err) {
      toast.error('Could not update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <motion.article
      className="card post-card-premium border-0 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="card-author-header p-3 border-0">
        <motion.img 
          src={authorAvatar} 
          alt="author" 
          className="author-avatar" 
          whileHover={{ scale: 1.1 }}
          style={{ width: 42, height: 42 }}
        />
        <div className="d-flex flex-column">
          <Link to={`/author/${post.authorId}`} className="fw-bold text-dark text-decoration-none" style={{ fontSize: '0.95rem' }}>
            {authorName || `Author #${post.authorId}`}
          </Link>
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>
            {category} • {post.readTimeMin || 1} min read
          </span>
        </div>
        <div className="ms-auto">
          {isAuthenticated && String(user?.id) !== String(post.authorId) ? (
            <motion.button
              type="button"
              className={`btn btn-sm rounded-pill px-3 ${isFollowing ? 'btn-outline-secondary' : 'btn-primary'}`}
              onClick={handleFollowToggle}
              whileTap={{ scale: 0.95 }}
              disabled={followLoading}
              style={{ fontSize: '0.8rem' }}
            >
              {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
            </motion.button>
          ) : (
            <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
              <FiBookmark className="text-muted cursor-pointer hover-text-primary" />
            </motion.div>
          )}
        </div>
      </div>

      <Link to={post.slug ? `/posts/slug/${post.slug}` : `/posts/${post.id}`} className="text-decoration-none">
        <div className="post-card-img-wrapper">
          {featuredUrl ? (
            <img src={featuredUrl} className="post-card-img" alt={post.title} />
          ) : (
            <div className="post-card-img d-flex align-items-center justify-content-center bg-light">
              <span className="serif text-muted opacity-20 h2">InkWell</span>
            </div>
          )}
        </div>
      </Link>

      <div className="card-body p-4">
        <Link to={post.slug ? `/posts/slug/${post.slug}` : `/posts/${post.id}`} className="text-decoration-none text-dark">
          <h3 className="serif fw-bold h4 mb-3" style={{ lineHeight: '1.4' }}>{post.title}</h3>
          <p className="text-secondary mb-4 line-clamp-3" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
            {post.excerpt || 'Dive into this unique perspective and explore the narrative shared by our talented community of writers.'}
          </p>
        </Link>

        <div className="d-flex align-items-center justify-content-between pt-2">
          <div className="d-flex gap-4">
            <motion.div 
              className={`d-flex align-items-center gap-2 cursor-pointer ${isLiked ? 'text-danger' : 'text-muted'}`}
              onClick={handleLike}
              whileTap={{ scale: 1.2 }}
            >
              <FiHeart size={18} fill={isLiked ? 'currentColor' : 'none'} />
              <span className="small fw-600">{likesCount}</span>
            </motion.div>
            <Link 
              to={post.slug ? `/posts/slug/${post.slug}#comments` : `/posts/${post.id}#comments`} 
              className="d-flex align-items-center gap-2 text-muted text-decoration-none"
            >
              <FiMessageCircle size={18} />
              <span className="small fw-600">{commentCount}</span>
            </Link>
          </div>
          <div className="d-flex gap-3 text-muted">
            <FiEye size={18} />
            <span className="small fw-600">{post.viewCount || 0}</span>
            <motion.div 
              className="cursor-pointer hover-text-primary ms-2"
              onClick={handleShare}
              whileHover={{ scale: 1.1 }}
            >
              <FiShare2 size={18} />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default PostCard;
