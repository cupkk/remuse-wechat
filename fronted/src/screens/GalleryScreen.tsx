import { useMemo } from "react";
import type { GeneratedAssetRecord, ItemRecord, ScreenType, Work } from "../app/types";
import { Icons } from "../components/Icons";
import { VanillaSphereGallery } from "../components/VanillaSphereGallery";

interface GalleryScreenProps {
  items: ItemRecord[];
  generatedAssets: GeneratedAssetRecord[];
  onNavigate: (screen: ScreenType) => void;
  onSelectWork: (work: Work) => void;
}

export function GalleryScreen({ items, generatedAssets, onNavigate, onSelectWork }: GalleryScreenProps) {
  const works = useMemo(() => {
    return items.map((item, index) => {
      const itemAssets = generatedAssets.filter((asset) => asset.itemId === item.id);
      return {
        id: item.id,
        title: item.name,
        date: formatDate(item.createdAt),
        description: item.story || "这件旧物还没有补充故事。",
        moodText: itemAssets.length > 0 ? `${itemAssets.length} 个生成成果` : "还没有生成成果",
        colorHex: coverColors[index % coverColors.length],
        imageUrl: item.imageUrl,
        isPlaceholder: !item.imageUrl
      };
    });
  }, [generatedAssets, items]);

  return (
    <div className="gallery-view-3d view-animate">
      <div className="gallery-overlay-top">
        <div className="gallery-title-block">
          <div className="city-subtitle">REMUSE ARCHIVE</div>
          <h1 className="city-title">
            CITY <span>/</span>
            <br />
            <span>ARCHIVE</span>
          </h1>
        </div>
        <div className="city-top-actions">
          <button className="city-icon-btn" onClick={() => onNavigate("capture")} aria-label="上传旧物">
            <Icons.Compass />
          </button>
          <button className="city-icon-btn" aria-label="搜索藏品">
            <Icons.Search />
          </button>
        </div>
      </div>

      <div className="gallery-sphere-stage">
        <VanillaSphereGallery works={works} onWorkClick={(work) => {
          if (!work.isPlaceholder) onSelectWork(work);
        }} />
      </div>

      <div className="gallery-archive-count">
        {items.length > 0 ? `${items.length} 件藏品` : "0 件藏品"}
      </div>
    </div>
  );
}

const coverColors = ["2e8b57", "4682b4", "20b2aa", "3cb371", "008080", "5f9ea0"];

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toLocaleDateString("zh-CN");
}
