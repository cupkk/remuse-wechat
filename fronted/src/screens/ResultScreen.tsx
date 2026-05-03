import type { GenerationKind, ItemAnalysisResult, ItemRecord, ScreenType } from "../app/types";
import { resolveMediaUrl } from "../services/api";

interface ResultScreenProps {
  currentItem: ItemRecord | null;
  analysis: ItemAnalysisResult | null;
  onNavigate: (screen: ScreenType) => void;
  onStartGeneration: (kind: GenerationKind) => void;
}

const quickActions: Array<{ kind: GenerationKind; title: string; className: string }> = [
  { kind: "emoji", title: "表情包", className: "action-emoji" },
  { kind: "perler", title: "拼豆", className: "action-perler" },
  { kind: "guide", title: "改造", className: "action-guide" }
];

const recommendationLabels: Record<GenerationKind, string> = {
  sticker: "表情包",
  emoji: "6 张表情包",
  perler: "拼豆图纸",
  guide: "改造指南"
};

export function ResultScreen({ currentItem, analysis, onNavigate, onStartGeneration }: ResultScreenProps) {
  const itemName = analysis?.itemRecognition.name || currentItem?.name || "等待上传的旧物";
  const story = analysis?.storySummary || currentItem?.story || "上传图片并补充故事后，Remuse 会在这里生成第二人生说明。";
  const emotionalResponse = analysis?.emotionalResponse || "故事保存后，Remuse 会给出更具体的情绪回应。";
  const reason = analysis?.recommendationReason || "请先完成真实上传和分析，再选择生成方向。";
  const value = analysis?.rarityAndValue;
  const primaryKind = normalizeGenerationKind(analysis?.primaryRecommendation);
  const features = analysis?.itemRecognition.visualFeatures?.filter(Boolean).slice(0, 3) || [];
  const itemImageUrl = resolveMediaUrl(currentItem?.imageUrl);

  return (
    <div className="result-view view-animate">
      <div className="result-top-bar">
        <button className="back-btn" onClick={() => onNavigate("capture")}>
          <svg viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="result-top-title">remuse 再生博物馆</div>
        <div className="capture-top-spacer" />
      </div>

      <h1 className="result-heading">识别完成</h1>

      <section className="result-recommend-card">
        <div className="result-recommend-copy">
          <span>推荐再生</span>
          <strong>{recommendationLabels[primaryKind]}</strong>
          <p>{reason}</p>
        </div>
        <button className="recommend-generate-btn" onClick={() => onStartGeneration(primaryKind)}>
          立即生成
        </button>
      </section>

      <section className="quick-generate-panel" aria-label="生成能力">
        <div className="quick-generate-center">
          <div className="quick-object">
            {itemImageUrl ? <img src={itemImageUrl} alt={itemName} /> : <span>{itemName.slice(0, 2)}</span>}
          </div>
          <div>
            <strong>{itemName}</strong>
            <small>{analysis?.itemRecognition.category || currentItem?.category || "旧物"}</small>
          </div>
        </div>

        <div className="quick-action-grid">
          {quickActions.map((action) => (
            <button
              className={`quick-action ${action.className} ${action.kind === primaryKind ? "is-recommended" : ""}`}
              key={action.kind}
              onClick={() => onStartGeneration(action.kind)}
            >
              <span className="quick-action-icon">
                <GenerationIcon kind={action.kind} />
              </span>
              <strong>{action.title}</strong>
            </button>
          ))}
        </div>
      </section>

      <div className="info-list">
        <div className="info-card">
          <div className="info-content">
            <span className="info-label">物品特征</span>
            <strong>{itemName}</strong>
            {features.length > 0 && <p className="feature-line">{features.join(" · ")}</p>}
          </div>
        </div>

        <div className="info-card">
          <div className="info-content">
            <span className="info-label">故事</span>
            {story}
          </div>
        </div>

        <div className="info-card">
          <div className="info-content">
            <span className="info-label">回应</span>
            {emotionalResponse}
          </div>
        </div>

        {value && (
          <div className="info-card">
            <div className="info-content">
              <span className="info-label">价值</span>
              {`${value.rarity} · ${value.referenceValue}`}
            </div>
          </div>
        )}
      </div>

      <div className="result-actions">
        <button className="action-btn btn-solid" onClick={() => onStartGeneration(primaryKind)}>
          <svg viewBox="0 0 24 24">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
          </svg>
          生成{recommendationLabels[primaryKind]}
        </button>
        <button className="action-btn btn-outline" onClick={() => onNavigate("gallery")}>
          去展馆
        </button>
      </div>
    </div>
  );
}

function normalizeGenerationKind(kind?: GenerationKind): GenerationKind {
  if (kind === "guide" || kind === "perler" || kind === "emoji") return kind;
  return "emoji";
}

function GenerationIcon({ kind }: { kind: GenerationKind }) {
  if (kind === "emoji") {
    return (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 10h.01M16 10h.01M8.5 15c1.8 1.6 5.2 1.6 7 0" />
      </svg>
    );
  }

  if (kind === "perler") {
    return (
      <svg viewBox="0 0 24 24">
        <circle cx="7" cy="7" r="2" />
        <circle cx="17" cy="7" r="2" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    );
  }

  if (kind === "guide") {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M5 4h14v16H5z" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
    </svg>
  );
}
