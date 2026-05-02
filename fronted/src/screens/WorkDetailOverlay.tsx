import { Icons } from "../components/Icons";
import type { ScreenType, Work } from "../app/types";

interface WorkDetailOverlayProps {
  selectedWork: Work;
  showMood: boolean;
  onClose: () => void;
  onNavigate: (screen: ScreenType) => void;
  onToggleMood: () => void;
}

export function WorkDetailOverlay({ selectedWork, showMood, onClose, onNavigate, onToggleMood }: WorkDetailOverlayProps) {
  return (
    <div className="video-detail-overlay overlay-animate">
      <div className="vd-hero" style={{ backgroundColor: `#${selectedWork.colorHex}` }}>
        <div className="vd-top-controls">
          <button className="vd-icon-btn" onClick={onClose}>
            <Icons.X />
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="vd-icon-btn">
              <Icons.Share />
            </button>
            <button className="vd-icon-btn">
              <Icons.Heart fill="#ff4b4b" />
            </button>
          </div>
        </div>
        <div className="vd-hero-gradient" />
      </div>

      <div className="vd-content">
        <div className="vd-header-row">
          <div>
            <h1 className="vd-title">{selectedWork.title}</h1>
            <div className="vd-date">{selectedWork.date}</div>
          </div>
          <div className="vd-mem-id">MEM-ID#{selectedWork.id.toUpperCase()}</div>
        </div>

        <p className="vd-desc">{selectedWork.description}</p>

        {!showMood ? (
          <button className="vd-mood-section" onClick={onToggleMood}>
            <span className="vd-mood-text">看看当时的心情</span>
          </button>
        ) : (
          <div className="vd-mood-expanded" onClick={onToggleMood}>
            <div className="vd-mood-header-expanded">
              <span className="vd-mood-text">看看当时的心情</span>
            </div>
            <div className="vd-mood-quote">"{selectedWork.moodText}"</div>
            <div className="vd-voice-memo">
              <div className="vd-voice-icon">
                <Icons.Message />
              </div>
              <div className="vd-voice-track">
                <div className="vd-voice-bar">
                  <div className="vd-voice-progress" />
                </div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono)", marginTop: "8px" }}>
                  VOICE_MEMO_01.MP3
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: "48px", textAlign: "center" }}>
          <h3 style={{ fontSize: "18px", color: "#fff", fontWeight: 500, marginBottom: "6px" }}>让物品重获新生</h3>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>选择一个方向开始创作</p>
        </div>

        <div className="vd-actions-grid">
          <button className="vd-action-btn" onClick={() => onNavigate("emoji-pack")}>
            <div className="vd-action-icon">
              <Icons.Message />
            </div>
            <span className="vd-action-label">表情包</span>
          </button>
          <button className="vd-action-btn" onClick={() => onNavigate("perler-pattern")}>
            <div className="vd-action-icon">
              <Icons.Pen />
            </div>
            <span className="vd-action-label">拼豆图纸</span>
          </button>
          <button className="vd-action-btn" onClick={() => onNavigate("guide-result")}>
            <div className="vd-action-icon">
              <Icons.Bulb />
            </div>
            <span className="vd-action-label">改造指南</span>
          </button>
        </div>
      </div>
    </div>
  );
}
