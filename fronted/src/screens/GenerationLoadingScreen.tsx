import type { GenerationKind, ItemRecord, ScreenType } from "../app/types";

interface GenerationLoadingScreenProps {
  kind: GenerationKind;
  item: ItemRecord | null;
  errorText: string;
  isGenerating: boolean;
  onNavigate: (screen: ScreenType) => void;
  onRetry: (kind: GenerationKind) => void;
}

const loadingLabels: Record<GenerationKind, string> = {
  sticker: "表情包生成中",
  emoji: "表情包生成中",
  perler: "拼豆生成中",
  guide: "改造生成中"
};

export function GenerationLoadingScreen({ kind, item, errorText, isGenerating, onNavigate, onRetry }: GenerationLoadingScreenProps) {
  const failed = Boolean(errorText) && !isGenerating;

  return (
    <div className={`generation-loading-view ${failed ? "is-failed" : "is-generating"} view-animate`}>
      <div className="generation-field" aria-hidden="true" />

      <button className="back-btn generation-loading-back" onClick={() => onNavigate("capture")}>
        <svg viewBox="0 0 24 24">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <section className="generation-loading-center" aria-live="polite">
        <div className="generation-sensory" aria-hidden="true">
          <div className="sensory-aura sensory-aura-one" />
          <div className="sensory-aura sensory-aura-two" />
          <div className="sensory-ring sensory-ring-one" />
          <div className="sensory-ring sensory-ring-two" />
          <div className="sensory-ring sensory-ring-three" />
          <div className="sensory-scan" />
          <div className="sensory-orb">
            {item?.imageUrl ? <img src={item.imageUrl} alt="" /> : <GenerationGlyph kind={kind} />}
          </div>
          <div className="sensory-particles">
            {Array.from({ length: 16 }).map((_, index) => (
              <i key={index} />
            ))}
          </div>
        </div>

        {failed ? (
          <div className="generation-loading-copy failed-copy">
            <h1>未生成</h1>
            <p>故事已保留</p>
            <button className="generation-retry-btn" onClick={() => onRetry(kind)}>
              再试一次
            </button>
          </div>
        ) : (
          <div className="generation-loading-copy">
            <div className="generation-state-kicker">{loadingLabels[kind]}</div>
            <div className="generation-mini-line" aria-hidden="true">
              <span />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function GenerationGlyph({ kind }: { kind: GenerationKind }) {
  if (kind === "emoji") {
    return (
      <svg viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="22" />
        <path d="M23 27h.1M41 27h.1M22 40c5.4 4.8 14.6 4.8 20 0" />
      </svg>
    );
  }

  if (kind === "perler") {
    return (
      <svg viewBox="0 0 64 64">
        <circle cx="21" cy="21" r="7" />
        <circle cx="43" cy="21" r="7" />
        <circle cx="21" cy="43" r="7" />
        <circle cx="43" cy="43" r="7" />
      </svg>
    );
  }

  if (kind === "guide") {
    return (
      <svg viewBox="0 0 64 64">
        <path d="M20 14h24v36H20z" />
        <path d="M26 24h12M26 32h12M26 40h8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64">
      <path d="M32 8l6.5 17.5L56 32l-17.5 6.5L32 56l-6.5-17.5L8 32l17.5-6.5L32 8z" />
    </svg>
  );
}
