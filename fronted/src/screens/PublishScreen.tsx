import type { GeneratedAssetRecord, ItemRecord, ScreenType } from "../app/types";

interface PublishScreenProps {
  allowExchange: boolean;
  allowSameStyle: boolean;
  currentItem: ItemRecord | null;
  generatedAsset: GeneratedAssetRecord | null;
  onNavigate: (screen: ScreenType) => void;
  onToggleExchange: () => void;
  onToggleSameStyle: () => void;
}

export function PublishScreen({
  allowExchange,
  allowSameStyle,
  currentItem,
  generatedAsset,
  onNavigate,
  onToggleExchange,
  onToggleSameStyle
}: PublishScreenProps) {
  const payload = parsePayload(generatedAsset?.payloadJson);
  const previewUrl = typeof payload.imageUrl === "string" ? payload.imageUrl : currentItem?.imageUrl || "";
  const title = generatedAsset?.title || currentItem?.name || "";

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
        </div>
        <div className="capture-top-spacer" />
      </div>

      <div className="publish-preview-img">
        {previewUrl ? <img src={previewUrl} alt={title || "发布预览"} /> : <span>预览</span>}
      </div>

      <div className="form-group">
        <label className="form-label">标题</label>
        <div className="form-input-container">
          <input type="text" className="form-input" placeholder="输入标题" defaultValue={title} />
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
      </div>
    </div>
  );
}

function parsePayload(payloadJson?: string) {
  if (!payloadJson) return {} as Record<string, unknown>;
  try {
    return JSON.parse(payloadJson) as Record<string, unknown>;
  } catch {
    return {};
  }
}
