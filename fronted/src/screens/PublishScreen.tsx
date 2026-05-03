import { useEffect, useState } from "react";
import type { GeneratedAssetRecord, ItemRecord, PlazaPost, ScreenType } from "../app/types";
import { resolveMediaUrl } from "../services/api";

interface PublishScreenProps {
  allowExchange: boolean;
  allowSameStyle: boolean;
  items: ItemRecord[];
  currentItem: ItemRecord | null;
  generatedAsset: GeneratedAssetRecord | null;
  onSelectItem: (item: ItemRecord) => void;
  onNavigate: (screen: ScreenType) => void;
  onPublish: (input: {
    itemId: string;
    generatedAssetId?: string | null;
    title?: string;
    allowSameStyle: boolean;
    allowExchange: boolean;
  }) => Promise<PlazaPost>;
  onToggleExchange: () => void;
  onToggleSameStyle: () => void;
}

export function PublishScreen({
  allowExchange,
  allowSameStyle,
  items,
  currentItem,
  generatedAsset,
  onSelectItem,
  onNavigate,
  onPublish,
  onToggleExchange,
  onToggleSameStyle
}: PublishScreenProps) {
  const selectedItem = currentItem && items.some((item) => item.id === currentItem.id) ? currentItem : items[0] ?? null;
  const payload = parsePayload(generatedAsset?.payloadJson);
  const generatedImageUrl = generatedAsset?.itemId === selectedItem?.id && typeof payload.imageUrl === "string" ? payload.imageUrl : "";
  const previewUrl = resolveMediaUrl(generatedImageUrl || selectedItem?.coverImageUrl || selectedItem?.imageUrl || "");
  const defaultTitle = selectedItem?.name || "";
  const [title, setTitle] = useState(defaultTitle);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorText, setErrorText] = useState("");
  const kindLabel = generatedAsset?.itemId === selectedItem?.id ? getKindLabel(generatedAsset?.kind) : selectedItem?.category || "藏品";
  const canPublish = Boolean(selectedItem) && !isPublishing;

  useEffect(() => {
    setTitle(defaultTitle);
    setErrorText("");
  }, [defaultTitle]);

  const submit = async () => {
    if (!selectedItem || isPublishing) return;
    setIsPublishing(true);
    setErrorText("");
    try {
      const generatedAssetId = generatedAsset?.itemId === selectedItem.id ? generatedAsset.id : undefined;
      await onPublish({
        itemId: selectedItem.id,
        ...(generatedAssetId ? { generatedAssetId } : {}),
        title: title.trim() || selectedItem.name,
        allowSameStyle,
        allowExchange
      });
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "发布没有成功，请再试一次。");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="publish-view view-animate">
      <div className="publish-top-bar">
        <button className="back-btn" onClick={() => onNavigate("square")} aria-label="返回广场">
          <svg viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="titles">
          <h1>发布</h1>
        </div>
        <div className="capture-top-spacer" />
      </div>

      {selectedItem ? (
        <>
          <div className="publish-preview-img">
            {previewUrl ? <img src={previewUrl} alt={title || "发布预览"} /> : <span>藏品</span>}
            <div className="publish-preview-meta">
              <span>{kindLabel}</span>
              <strong>{title || "旧物"}</strong>
            </div>
          </div>

          <section className="publish-picker">
            <div className="publish-picker-head">
              <span>选择藏品</span>
              <small>{items.length} 件</small>
            </div>
            <div className="publish-item-list">
              {items.map((item) => (
                <button
                  className={`publish-item-option ${selectedItem.id === item.id ? "is-selected" : ""}`}
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                >
                  <span className="publish-item-thumb">
                    {resolveMediaUrl(item.coverImageUrl || item.imageUrl) ? (
                      <img src={resolveMediaUrl(item.coverImageUrl || item.imageUrl)} alt={item.name} />
                    ) : (
                      item.name.slice(0, 1)
                    )}
                  </span>
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.category}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <div className="form-group">
            <label className="form-label">标题</label>
            <div className="form-input-container">
              <input
                type="text"
                className="form-input"
                placeholder="输入标题"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="toggle-row">
              <span className="toggle-label">允许同款</span>
              <button className={`toggle-switch ${allowSameStyle ? "active" : ""}`} onClick={onToggleSameStyle} type="button">
                <div className="toggle-knob" />
              </button>
            </div>
            <div className="toggle-row">
              <span className="toggle-label">可交换</span>
              <button className={`toggle-switch ${allowExchange ? "active" : ""}`} onClick={onToggleExchange} type="button">
                <div className="toggle-knob" />
              </button>
            </div>
          </div>
          {errorText && <p className="publish-error">{errorText}</p>}
        </>
      ) : (
        <section className="publish-empty">
          <div className="publish-empty-orb" />
          <h2>先放入一件藏品</h2>
          <button onClick={() => onNavigate("capture")}>去上传</button>
        </section>
      )}

      <div className="publish-actions">
        <button className="btn-publish" disabled={!canPublish} onClick={() => void submit()}>
          {isPublishing ? "发布中" : "发布"}
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

function getKindLabel(kind?: string) {
  if (kind === "guide") return "改造";
  if (kind === "perler") return "拼豆";
  if (kind === "emoji") return "表情包";
  return "藏品";
}
