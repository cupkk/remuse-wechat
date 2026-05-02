import type { GeneratedAssetRecord, GenerationKind, ItemRecord, ScreenType } from "../app/types";

interface GenerationResultScreenProps {
  kind: GenerationKind;
  item: ItemRecord | null;
  generatedAsset: GeneratedAssetRecord | null;
  onNavigate: (screen: ScreenType) => void;
}

const kindLabels: Record<GenerationKind, string> = {
  sticker: "表情包",
  emoji: "表情包",
  perler: "拼豆图纸",
  guide: "改造指南"
};

export function GenerationResultScreen({ kind, item, generatedAsset, onNavigate }: GenerationResultScreenProps) {
  const generatedPayload = parsePayload(generatedAsset?.payloadJson);
  const imageUrl = typeof generatedPayload.imageUrl === "string" ? generatedPayload.imageUrl : null;
  const generatedTitle = generatedAsset?.title || kindLabels[kind];
  const generatedSubtitle = getPayloadString(generatedPayload, "kindLabel") || kindLabels[kind];

  if (!generatedAsset || !imageUrl) {
    return (
      <div className={`generation-view generation-${kind} view-animate`}>
        <div className="generation-top">
          <button className="back-btn" onClick={() => onNavigate("capture")}>
            <svg viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span>{kindLabels[kind]}</span>
          <div />
        </div>

        <section className="generation-failed">
          <h1>这次没有生成成功</h1>
          <p>可以保留故事，再试一次。</p>
          <button className="welcome-main-btn" onClick={() => onNavigate("capture")}>
            返回
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className={`generation-view generation-${kind} view-animate`}>
      <div className="generation-top">
        <button className="back-btn" onClick={() => onNavigate("capture")}>
          <svg viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span>{kindLabels[kind]}</span>
        <div />
      </div>

      <section className="generation-hero">
        <div className="generation-art">
          <img className="generated-real-image" src={imageUrl} alt={generatedTitle} />
        </div>
      </section>

      <section className="generation-copy">
        <p className="generation-kicker">{generatedSubtitle}</p>
        <h1>{generatedTitle}</h1>
        <p>{item?.name || "已保存到展馆"}</p>
      </section>

      <div className="generation-actions">
        <button className="action-btn btn-outline" onClick={() => onNavigate("gallery")}>
          展馆
        </button>
        <button className="action-btn btn-solid" onClick={() => onNavigate("publish")}>
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

function getPayloadString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}
