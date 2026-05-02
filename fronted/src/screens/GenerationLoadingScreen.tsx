import type { GenerationKind, ItemRecord, ScreenType } from "../app/types";

interface GenerationLoadingScreenProps {
  kind: GenerationKind;
  item: ItemRecord | null;
  errorText: string;
  isGenerating: boolean;
  onNavigate: (screen: ScreenType) => void;
}

const loadingLabels: Record<GenerationKind, string> = {
  sticker: "正在生成贴纸",
  emoji: "正在整理表情包",
  perler: "正在计算拼豆图纸",
  guide: "正在写改造指南"
};

export function GenerationLoadingScreen({ kind, item, errorText, isGenerating, onNavigate }: GenerationLoadingScreenProps) {
  const failed = Boolean(errorText) && !isGenerating;

  return (
    <div className="generation-loading-view view-animate">
      <div className="generation-loading-orbit" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <button className="back-btn generation-loading-back" onClick={() => onNavigate("result")}>
        <svg viewBox="0 0 24 24">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <section className="generation-loading-center">
        <div className="loading-object-chip">{item?.name || "夏天的奶茶袋"}</div>
        <div className="loading-progress-wrap" aria-hidden="true">
          <div className="loading-progress-bar" />
        </div>
        <h1>{failed ? "这次没有生成成功" : loadingLabels[kind]}</h1>
        <p>{errorText || "保留轮廓和故事。"}</p>
        <button className="welcome-main-btn" onClick={() => onNavigate("result")} disabled={isGenerating}>
          {isGenerating ? "生成中..." : failed ? "保留故事再试一次" : "等待生成结果"}
        </button>
      </section>
    </div>
  );
}
