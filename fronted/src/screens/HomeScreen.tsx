import { useState } from "react";
import type { AppSessionUser, ItemRecord, ScreenType } from "../app/types";

interface HomeScreenProps {
  featuredItem: ItemRecord | null;
  isLoadingItems: boolean;
  sessionUser: AppSessionUser | null;
  onNavigate: (screen: ScreenType) => void;
}

export function HomeScreen({ featuredItem, isLoadingItems, sessionUser, onNavigate }: HomeScreenProps) {
  const [accepted, setAccepted] = useState(false);
  const hasItem = Boolean(featuredItem);

  return (
    <div className={`home-view view-animate ${accepted ? "fortune-accepted" : ""}`}>
      <header className="home-header">
        <div className="home-header-left">
          <div className="logo">remuse</div>
          <h1 className="title">今日好物</h1>
          {sessionUser?.isGuest && <div className="guest-pill">游客身份</div>}
        </div>
      </header>

      <div className="ambient-glow" />
      <div className="fortune-sparkles" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <section className="showcase" onClick={() => onNavigate("gallery")}>
        {hasItem ? (
          <>
            <div className="main-image">
              {featuredItem?.imageUrl ? <img src={featuredItem.imageUrl} alt={featuredItem.name} /> : <span>{featuredItem?.category || "旧物"}</span>}
              <span style={{ fontSize: "11px", marginTop: "6px", opacity: 0.8 }}>{featuredItem?.name}</span>
            </div>
            <div className="pedestal" />
          </>
        ) : (
          <div className="home-empty-stage">
            <div className="empty-orbit" />
            <strong>{isLoadingItems ? "读取中" : "还没有藏品"}</strong>
            <span>{isLoadingItems ? "请稍等" : "上传第一件旧物。"}</span>
          </div>
        )}
      </section>

      <section className="item-details">
        <h2>{hasItem ? featuredItem?.name : "空展台"}</h2>
        <p className="quote">{hasItem ? summarizeStory(featuredItem?.story) : "从一张照片开始。"}</p>
        {hasItem && <p className="context">{featuredItem?.category || "旧物"}</p>}
      </section>

      <div className="home-actions-wrap">
        <div className="actions-row">
          <button className="btn btn-primary" onClick={() => (hasItem ? setAccepted(true) : onNavigate("capture"))}>
            {hasItem ? (accepted ? "已收下" : "收下好运") : "上传旧物"}
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate("gallery")}>
            展馆
          </button>
        </div>
      </div>
    </div>
  );
}

function summarizeStory(story?: string) {
  if (!story?.trim()) return "故事待补充。";
  return story.length > 28 ? `${story.slice(0, 28)}...` : story;
}
