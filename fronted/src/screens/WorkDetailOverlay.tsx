import { Icons } from "../components/Icons";
import type { GenerationKind, Work } from "../app/types";
import { resolveMediaUrl } from "../services/api";

interface WorkDetailOverlayProps {
  selectedWork: Work;
  showMood: boolean;
  onClose: () => void;
  onStartGeneration: (kind: GenerationKind) => void;
  onToggleMood: () => void;
}

export function WorkDetailOverlay({
  selectedWork,
  showMood,
  onClose,
  onStartGeneration,
  onToggleMood
}: WorkDetailOverlayProps) {
  const hasImage = Boolean(selectedWork.imageUrl);
  const story = selectedWork.story?.trim() || "故事还在路上。";
  const biography = selectedWork.biography?.trim() || selectedWork.description || "这件旧物已经被收入展馆。";
  const voiceText = selectedWork.voiceText?.trim() || selectedWork.story?.trim() || "";
  const imageUrl = resolveMediaUrl(selectedWork.imageUrl);

  return (
    <div className={`video-detail-overlay vd-archive-detail ${selectedWork.isPlaceholder ? "is-placeholder" : ""} overlay-animate`}>
      <div className="vd-hero" style={{ backgroundColor: `#${selectedWork.colorHex}` }}>
        <div className="vd-top-controls">
          <button className="vd-icon-btn" onClick={onClose}>
            <Icons.X />
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="vd-icon-btn">
              <Icons.Share />
            </button>
          </div>
        </div>
        {hasImage ? (
          <img className="vd-hero-image" src={imageUrl} alt={selectedWork.title} />
        ) : (
          <div className="vd-empty-card" aria-hidden="true">
            <span />
          </div>
        )}
        <div className="vd-hero-gradient" />
      </div>

      <div className="vd-content">
        <div className="vd-header-row">
          <div>
            <h1 className="vd-title">{selectedWork.title}</h1>
            <div className="vd-date">
              {selectedWork.category || "旧物"} · {selectedWork.date || "空展位"}
            </div>
          </div>
        </div>

        <section className="vd-story-block">
          <span>小传</span>
          <p>{biography}</p>
        </section>

        <section className="vd-story-block vd-user-story">
          <span>故事</span>
          <p>{story}</p>
        </section>

        {voiceText && (
          <button className={`vd-voice-card ${showMood ? "is-open" : ""}`} onClick={onToggleMood}>
            <div className="vd-voice-icon">
              <Icons.Message />
            </div>
            <div className="vd-voice-track">
              <div className="vd-voice-row">
                <strong>语音记录</strong>
                <span>{showMood ? "收起" : "转写"}</span>
              </div>
              <div className="vd-voice-bar">
                <div className="vd-voice-progress" />
              </div>
              {showMood && <p>{voiceText}</p>}
            </div>
          </button>
        )}

        {!selectedWork.isPlaceholder && (
          <div className="vd-actions-grid">
            <button className="vd-action-btn" onClick={() => onStartGeneration("emoji")}>
              <div className="vd-action-icon">
                <Icons.Message />
              </div>
              <span className="vd-action-label">表情包</span>
            </button>
            <button className="vd-action-btn" onClick={() => onStartGeneration("guide")}>
              <div className="vd-action-icon">
                <Icons.Bulb />
              </div>
              <span className="vd-action-label">改造</span>
            </button>
            <button className="vd-action-btn" onClick={() => onStartGeneration("perler")}>
              <div className="vd-action-icon">
                <Icons.Pen />
              </div>
              <span className="vd-action-label">拼豆</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
