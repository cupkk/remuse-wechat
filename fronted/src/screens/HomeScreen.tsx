import { useState } from "react";
import type { ScreenType } from "../app/types";

interface HomeScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className={`home-view view-animate ${accepted ? "fortune-accepted" : ""}`}>
      <header className="home-header">
        <div className="home-header-left">
          <div className="logo">remuse</div>
          <h1 className="title">今日幸运好物</h1>
        </div>
        <div className="home-header-right">
          <div className="date-main">05 / 24</div>
          <div className="date-sub">周六 · 五月廿七</div>
        </div>
      </header>

      <div className="ambient-glow" />
      <div className="fortune-sparkles" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <section className="showcase" onClick={() => onNavigate("gallery")}>
        <div className="main-image">
          <span>图片占位区域</span>
          <span style={{ fontSize: "11px", marginTop: "6px", opacity: 0.8 }}>原图为奶茶袋</span>
        </div>
        <div className="pedestal" />
      </section>

      <section className="item-details">
        <h2>夏天的奶茶袋</h2>
        <p className="quote">它提醒你，松一口气也是一种前进。</p>
        <p className="context">来自一段去年夏天的故事</p>
      </section>

      <div className="home-actions-wrap">
        <div className="actions-row">
          <button className="btn btn-primary" onClick={() => setAccepted(true)}>
            {accepted ? "好运已收下" : "收下好运"}
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate("gallery")}>
            查看详情
          </button>
        </div>

        <button className="capture-card" onClick={() => onNavigate("capture")}>
          <div className="capture-icon">
            <svg viewBox="0 0 24 24">
              <rect x="3" y="6" width="18" height="14" rx="2" ry="2" />
              <circle cx="12" cy="13" r="4" />
              <line x1="7" y1="9" x2="9" y2="9" />
            </svg>
          </div>
          <div className="capture-text">
            <h3>拍下今天的物品</h3>
            <p>一张照片，一段故事。</p>
          </div>
          <div className="capture-arrow">
            <svg viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}
