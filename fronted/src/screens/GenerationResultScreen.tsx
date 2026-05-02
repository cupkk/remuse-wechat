import { generatedAssets } from "../data/mockData";
import type { GenerationKind, ScreenType } from "../app/types";

interface GenerationResultScreenProps {
  kind: GenerationKind;
  onNavigate: (screen: ScreenType) => void;
}

const kindLabels: Record<GenerationKind, string> = {
  sticker: "专属贴纸",
  emoji: "表情包",
  perler: "拼豆图纸",
  guide: "改造指南"
};

export function GenerationResultScreen({ kind, onNavigate }: GenerationResultScreenProps) {
  const asset = generatedAssets[kind];

  return (
    <div className={`generation-view generation-${kind} view-animate`}>
      <div className="generation-top">
        <button className="back-btn" onClick={() => onNavigate("result")}>
          <svg viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span>{kindLabels[kind]}</span>
        <button className="generation-more-btn">
          <svg viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </button>
      </div>

      <section className="generation-hero">
        <div className="generation-art">
          {kind === "sticker" && <StickerPreview />}
          {kind === "emoji" && <EmojiPreview />}
          {kind === "perler" && <PerlerPreview />}
          {kind === "guide" && <GuidePreview />}
        </div>
      </section>

      <section className="generation-copy">
        <p className="generation-kicker">{asset.subtitle}</p>
        <h1>{asset.title}</h1>
        <p>{asset.description}</p>
      </section>

      <section className="generation-meta">
        <div>
          <span>来源</span>
          <strong>夏天的奶茶袋</strong>
        </div>
        <div>
          <span>状态</span>
          <strong>已生成</strong>
        </div>
      </section>

      <div className="generation-actions">
        <button className="action-btn btn-outline" onClick={() => onNavigate("gallery")}>
          保存到展馆
        </button>
        <button className="action-btn btn-solid" onClick={() => onNavigate("publish")}>
          发布到广场
        </button>
      </div>
    </div>
  );
}

function StickerPreview() {
  return (
    <div className="sticker-preview">
      <div className="sticker-paper">
        <span>SUMMER</span>
        <strong>松一口气</strong>
      </div>
      <div className="sticker-dot dot-a" />
      <div className="sticker-dot dot-b" />
    </div>
  );
}

function EmojiPreview() {
  return (
    <div className="emoji-preview">
      {["松", "好", "再", "收"].map((text) => (
        <div className="emoji-cell" key={text}>
          {text}
        </div>
      ))}
    </div>
  );
}

function PerlerPreview() {
  return (
    <div className="perler-preview">
      {Array.from({ length: 100 }).map((_, index) => (
        <span className={`bead bead-${index % 5}`} key={index} />
      ))}
    </div>
  );
}

function GuidePreview() {
  return (
    <div className="guide-preview">
      <div className="guide-step">
        <span>01</span>
        <strong>裁下正面图案</strong>
      </div>
      <div className="guide-step">
        <span>02</span>
        <strong>写入故事摘要</strong>
      </div>
      <div className="guide-step">
        <span>03</span>
        <strong>装入透明封套</strong>
      </div>
    </div>
  );
}
