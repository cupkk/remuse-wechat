import type { ScreenType } from "../app/types";

interface PostDetailScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export function PostDetailScreen({ onNavigate }: PostDetailScreenProps) {
  return (
    <div className="post-detail-view view-animate">
      <div className="detail-top-bar">
        <button className="detail-top-btn" onClick={() => onNavigate("square")}>
          <svg viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button className="detail-top-btn">
          <svg viewBox="0 0 24 24" stroke="none" fill="currentColor">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>

      <div className="detail-hero-img">
        <div className="sticker-placeholder">
          图片占位
          <br />
          <span style={{ fontSize: "12px", opacity: 0.7, fontWeight: 400, marginTop: "4px" }}>演唱会票根贴纸</span>
        </div>
      </div>

      <div className="detail-text-content">
        <h1 className="detail-title">一张票根做成了春天贴纸</h1>
        <p className="detail-meta">
          来自演唱会票根 · <span className="highlight">@旧物收藏家</span>
        </p>
        <p className="detail-desc">这张票根是去年春天留下的，后来被做成了一张可以保存、也可以分享的记忆贴纸。</p>
      </div>

      <div className="detail-stats">
        <div className="stat-item">
          <svg viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          128
        </div>
        <div className="stat-item">
          <svg viewBox="0 0 24 24">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          89
        </div>
        <div className="stat-item">
          <svg viewBox="0 0 24 24">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          26
        </div>
      </div>

      <div className="detail-actions">
        <button className="detail-btn detail-btn-primary" onClick={() => onNavigate("capture")}>
          <svg viewBox="0 0 24 24">
            <path d="M11 20A7 7 0 0 1 4 13V4h9a7 7 0 0 1 7 7v9h-9Z" />
            <path d="M4 20L20 4" />
          </svg>
          一键同款
        </button>
        <button className="detail-btn detail-btn-secondary">
          <svg viewBox="0 0 24 24">
            <path d="M17 2.1l4 4-4 4" />
            <path d="M3 12.2v-2a4 4 0 0 1 4-4h14" />
            <path d="M7 21.9l-4-4 4-4" />
            <path d="M21 11.8v2a4 4 0 0 1-4 4H3" />
          </svg>
          我想交换
        </button>
      </div>
    </div>
  );
}
