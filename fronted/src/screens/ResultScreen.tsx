import type { ScreenType } from "../app/types";

interface ResultScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

const recommendations: Array<{ label: string; title: string; target: ScreenType }> = [
  { label: "主推荐", title: "生成专属贴纸", target: "sticker-result" },
  { label: "备选", title: "表情包", target: "emoji-pack" },
  { label: "备选", title: "拼豆图纸", target: "perler-pattern" },
  { label: "备选", title: "改造指南", target: "guide-result" }
];

export function ResultScreen({ onNavigate }: ResultScreenProps) {
  return (
    <div className="result-view view-animate">
      <div className="result-top-bar">
        <button className="back-btn" onClick={() => onNavigate("capture")}>
          <svg viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="result-top-title">remuse 再生博物馆</div>
        <div className="capture-controls">
          <svg viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
          </svg>
          <div className="control-div" />
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
          </svg>
        </div>
      </div>

      <h1 className="result-heading">
        它适合这样继续存在
        <svg viewBox="0 0 24 24">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
        </svg>
      </h1>

      <div className="gen-card">
        <div className="gen-card-left">
          <div className="gen-logo">
            <svg viewBox="0 0 24 24">
              <path d="M12 22V10M12 10C8 10 5 7 5 3M12 10C16 10 19 7 19 3" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div className="gen-logo-text">
              <strong>remuse</strong> 再生博物馆
            </div>
          </div>
          <h2 className="gen-title">夏日小坐标</h2>
          <div className="gen-divider" />
          <p className="gen-desc">
            2024/06/18
            <br />
            考完试后的那杯奶茶
          </p>
          <div className="gen-leaf-decor">
            <svg viewBox="0 0 100 40">
              <path d="M10,30 Q30,10 50,30 T90,20" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <ellipse cx="25" cy="15" rx="5" ry="2" transform="rotate(-30 25 15)" />
              <ellipse cx="40" cy="25" rx="6" ry="2" transform="rotate(20 40 25)" />
              <ellipse cx="65" cy="15" rx="5" ry="2" transform="rotate(-40 65 15)" />
              <ellipse cx="80" cy="25" rx="4" ry="1.5" transform="rotate(10 80 25)" />
            </svg>
          </div>
        </div>

        <div className="gen-card-right">
          <div className="simulated-bag">
            <div className="bag-tape" />
            <div className="bag-logo">
              1<span>点点</span>
            </div>
            <div className="bag-text">奶茶在手 天生有戏</div>
            <div className="bag-url">www.alittle-tea.com</div>
          </div>
        </div>
      </div>

      <div className="info-list">
        <div className="info-card">
          <div className="info-icon">
            <svg viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <line x1="9" y1="10" x2="15" y2="10" />
              <line x1="9" y1="14" x2="11" y2="14" />
            </svg>
          </div>
          <div className="info-content">
            <span className="info-label">故事摘要：</span>考完试后的那杯奶茶，留下的是一起松一口气的夏天。
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">
            <svg viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <div className="info-content">
            <span className="info-label">情绪回应：</span>它像那段轻松时刻的小坐标。
          </div>
        </div>

        {recommendations.map((item) => (
          <button className="info-card info-card-clickable" key={item.title} onClick={() => onNavigate(item.target)}>
            <div className="info-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
              </svg>
            </div>
            <div className="info-content">
              <span className="info-label">{item.label}：</span>
              {item.title}
            </div>
            <div className="info-arrow">
              <svg viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      <div className="result-actions">
        <button className="action-btn btn-outline" onClick={() => onNavigate("gallery")}>
          <svg viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          保存到展馆
        </button>
        <button className="action-btn btn-solid" onClick={() => onNavigate("publish")}>
          <svg viewBox="0 0 24 24">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          发布到广场
        </button>
      </div>
    </div>
  );
}
