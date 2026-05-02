import type { ScreenType } from "../app/types";

interface CaptureScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export function CaptureScreen({ onNavigate }: CaptureScreenProps) {
  return (
    <div className="capture-detail-view view-animate">
      <div className="capture-top-bar">
        <button className="back-btn" onClick={() => onNavigate("home")}>
          <svg viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="titles">
          <h1>拍下旧物</h1>
          <p>说说它为什么值得留下</p>
        </div>
        <div className="capture-controls">
          <svg viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
            <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
          </svg>
          <div className="control-div" />
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
          </svg>
        </div>
      </div>

      <div className="photo-preview-container">
        <div className="photo-preview-placeholder">
          <div>旧奶茶袋照片</div>
          <div style={{ fontSize: "12px", marginTop: "6px", opacity: 0.6, fontWeight: 400 }}>真实 DOM 模拟层</div>
        </div>
      </div>

      <div className="recognition-info">
        <h3>
          识别为：<span>奶茶袋</span>
        </h3>
        <p>愿意说说它的故事吗？</p>
      </div>

      <hr className="divider" />

      <div className="voice-input-area">
        <div className="mic-btn-wrapper">
          <div className="mic-ripple mic-ripple-2" />
          <div className="mic-ripple mic-ripple-1" />
          <button className="mic-btn">
            <svg viewBox="0 0 24 24">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          </button>
        </div>
        <p>按住说话</p>
      </div>

      <div className="suggestion-chips">
        <button className="chip">
          <svg viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          它属于谁？
        </button>
        <button className="chip">
          <svg viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          什么时候得到的？
        </button>
      </div>

      <div className="draft-card-container">
        <div className="draft-header">故事草稿</div>
        <div className="draft-content">去年夏天，和朋友刚考完试后买的那杯奶茶，留下的是终于能松一口气的感觉。</div>
        <div className="draft-actions">
          <button className="draft-btn draft-btn-edit">
            <svg viewBox="0 0 24 24">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
            修改
          </button>
          <button className="draft-btn draft-btn-continue" onClick={() => onNavigate("result")}>
            继续分析
          </button>
        </div>
      </div>
    </div>
  );
}
