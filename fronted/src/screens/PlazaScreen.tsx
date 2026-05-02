import { squareItems } from "../data/mockData";
import type { ScreenType, SquareItem } from "../app/types";

interface PlazaScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export function PlazaScreen({ onNavigate }: PlazaScreenProps) {
  const leftColItems = squareItems.filter((_, index) => index % 2 === 0);
  const rightColItems = squareItems.filter((_, index) => index % 2 !== 0);

  const renderCard = (item: SquareItem) => (
    <button className="square-card" key={item.id} onClick={() => onNavigate("post-detail")}>
      <div className="square-card-img" style={{ background: item.bgColor, aspectRatio: item.aspectRatio }}>
        <span style={{ opacity: 0.6 }}>{item.category}图</span>
      </div>
      <div className="square-card-info">
        <span className="square-card-category">{item.category}</span>
        <h3 className="square-card-title">{item.title}</h3>
        <div className="square-card-likes">
          <svg viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {item.likes} 喜欢
        </div>
      </div>
    </button>
  );

  return (
    <div className="square-view view-animate">
      <header className="square-header">
        <h1>广场</h1>
        <p>看看别人如何让旧物重获新生</p>
      </header>

      <div className="square-tabs">
        <button className="square-tab active">推荐</button>
        <button className="square-tab">贴纸</button>
        <button className="square-tab">卡片</button>
        <button className="square-tab">拼豆</button>
        <button className="square-tab">交换</button>
      </div>

      <div className="square-grid">
        <div className="grid-col">{leftColItems.map(renderCard)}</div>
        <div className="grid-col">{rightColItems.map(renderCard)}</div>
      </div>

      <button className="fab-btn" onClick={() => onNavigate("publish")}>
        <svg viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}
