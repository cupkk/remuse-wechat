import type { PlazaPost, ScreenType } from "../app/types";
import { resolveMediaUrl } from "../services/api";

interface PostDetailScreenProps {
  post: PlazaPost | null;
  onNavigate: (screen: ScreenType) => void;
}

export function PostDetailScreen({ post, onNavigate }: PostDetailScreenProps) {
  if (!post) {
    return (
      <div className="post-detail-view view-animate">
        <div className="detail-top-bar">
          <button className="detail-top-btn" onClick={() => onNavigate("square")} aria-label="返回广场">
            <BackIcon />
          </button>
        </div>
        <section className="post-detail-empty">
          <h1>作品不见了</h1>
          <button className="detail-btn detail-btn-primary" onClick={() => onNavigate("square")}>回广场</button>
        </section>
      </div>
    );
  }
  const imageUrl = resolveMediaUrl(post.imageUrl);

  return (
    <div className="post-detail-view view-animate">
      <div className="detail-top-bar">
        <button className="detail-top-btn" onClick={() => onNavigate("square")} aria-label="返回广场">
          <BackIcon />
        </button>
        <button className="detail-top-btn" aria-label="更多">
          <svg viewBox="0 0 24 24" stroke="none" fill="currentColor">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>

      <div className="detail-hero-img" style={{ background: post.bgColor }}>
        {imageUrl ? (
          <img src={imageUrl} alt={post.title} />
        ) : (
          <div className="sticker-placeholder">
            {post.category}
          </div>
        )}
      </div>

      <div className="detail-text-content">
        <h1 className="detail-title">{post.title}</h1>
        <p className="detail-meta">
          {post.category} · <span className="highlight">@{post.author}</span>
        </p>
        <p className="detail-desc">{post.description}</p>
      </div>

      <div className="detail-stats">
        <div className="stat-item">
          <svg viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {post.likes}
        </div>
        <div className="stat-item">
          <svg viewBox="0 0 24 24">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          {post.isOfficial ? "官方" : "入馆"}
        </div>
      </div>

      <div className="detail-actions">
        <button className="detail-btn detail-btn-primary" onClick={() => onNavigate("capture")}>
          <svg viewBox="0 0 24 24">
            <path d="M11 20A7 7 0 0 1 4 13V4h9a7 7 0 0 1 7 7v9h-9Z" />
            <path d="M4 20L20 4" />
          </svg>
          我也录入
        </button>
        <button className="detail-btn detail-btn-secondary" onClick={() => onNavigate("square")}>
          回广场
        </button>
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
