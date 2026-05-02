import type { MainTab, ScreenType } from "../app/types";

interface BottomNavProps {
  activeTab: MainTab;
  onNavigate: (screen: ScreenType) => void;
}

export function BottomNav({ activeTab, onNavigate }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      <button className={`nav-item ${activeTab === "home" ? "active" : ""}`} onClick={() => onNavigate("home")}>
        <svg
          viewBox="0 0 24 24"
          fill={activeTab === "home" ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={activeTab === "home" ? 0 : 2}
        >
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
        <span>首页</span>
      </button>

      <button className={`nav-item ${activeTab === "gallery" ? "active" : ""}`} onClick={() => onNavigate("gallery")}>
        <svg
          viewBox="0 0 24 24"
          fill={activeTab === "gallery" ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={activeTab === "gallery" ? 0 : 2}
        >
          <path d="M3 21h18M5 21V9M19 21V9M9 21v-5a3 3 0 0 1 6 0v5M2 9l10-5 10 5Z" />
        </svg>
        <span>展馆</span>
      </button>

      <button className={`nav-item ${activeTab === "square" ? "active" : ""}`} onClick={() => onNavigate("square")}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="9" />
          <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
          <circle cx="8" cy="8" r="2.5" fill={activeTab === "square" ? "currentColor" : "none"} stroke="none" />
        </svg>
        <span>广场</span>
      </button>

      <button className={`nav-item ${activeTab === "profile" ? "active" : ""}`} onClick={() => onNavigate("profile")}>
        <svg
          viewBox="0 0 24 24"
          fill={activeTab === "profile" ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>我的</span>
      </button>
    </nav>
  );
}
