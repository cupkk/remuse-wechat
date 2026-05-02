import type { ScreenType } from "../app/types";

interface PublishScreenProps {
  allowExchange: boolean;
  allowSameStyle: boolean;
  onNavigate: (screen: ScreenType) => void;
  onToggleExchange: () => void;
  onToggleSameStyle: () => void;
}

export function PublishScreen({
  allowExchange,
  allowSameStyle,
  onNavigate,
  onToggleExchange,
  onToggleSameStyle
}: PublishScreenProps) {
  return (
    <div className="publish-view view-animate">
      <div className="publish-top-bar">
        <button className="back-btn" onClick={() => onNavigate("result")}>
          <svg viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="titles">
          <h1>发布作品</h1>
          <p>把这件旧物的新生命放进广场</p>
        </div>
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

      <div className="publish-preview-img">
        <div className="nayuki-sticker">
          <div className="nayuki-logo">
            夏日
            <br />
            小坐标
          </div>
          <div className="nayuki-text">REMUSE</div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">标题</label>
        <div className="form-input-container">
          <input type="text" className="form-input" placeholder="输入标题..." defaultValue="一只奶茶袋留下的夏天" />
          <span className="form-char-count">11/30</span>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">标签</label>
        <div className="form-tags">
          <button className="form-tag-btn active">贴纸</button>
          <button className="form-tag-btn">卡片</button>
          <button className="form-tag-btn">拼豆</button>
          <button className="form-tag-btn">交换</button>
        </div>
      </div>

      <div className="form-group">
        <div className="toggle-row">
          <span className="toggle-label">允许同款</span>
          <div className={`toggle-switch ${allowSameStyle ? "active" : ""}`} onClick={onToggleSameStyle}>
            <div className="toggle-knob" />
          </div>
        </div>
        <div className="toggle-row">
          <span className="toggle-label">可交换</span>
          <div className={`toggle-switch ${allowExchange ? "active" : ""}`} onClick={onToggleExchange}>
            <div className="toggle-knob" />
          </div>
        </div>
      </div>

      <div className="publish-actions">
        <button className="btn-publish" onClick={() => onNavigate("square")}>
          发布
        </button>
        <button className="btn-save-draft">存草稿</button>
      </div>
    </div>
  );
}
