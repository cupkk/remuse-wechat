import { useState } from "react";
import type { AppSessionUser, ItemRecord, ScreenType } from "../app/types";
import { resolveMediaUrl } from "../services/api";

interface HomeScreenProps {
  featuredItem: ItemRecord | null;
  isLoadingItems: boolean;
  sessionUser: AppSessionUser | null;
  onNavigate: (screen: ScreenType) => void;
}

export function HomeScreen({ featuredItem, isLoadingItems, sessionUser, onNavigate }: HomeScreenProps) {
  const [accepted, setAccepted] = useState(false);
  const hasItem = Boolean(featuredItem);
  const featuredImageUrl = resolveMediaUrl(featuredItem?.coverImageUrl || featuredItem?.imageUrl);

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
              {featuredImageUrl ? <img src={featuredImageUrl} alt={featuredItem?.name || "旧物"} /> : <span>{featuredItem?.category || "旧物"}</span>}
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
        <button className="home-upload-action" onClick={() => onNavigate("capture")}>
          <svg viewBox="0 0 24 24">
            <path d="M14.5 5h-5L7.7 8H5a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3h-2.7L14.5 5z" />
            <circle cx="12" cy="14" r="3.5" />
          </svg>
          拍照 / 上传
        </button>
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
