import { useState } from "react";
import type { MainTab, ScreenType, Work } from "./types";
import { BottomNav } from "../components/BottomNav";
import { CaptureScreen } from "../screens/CaptureScreen";
import { GalleryScreen } from "../screens/GalleryScreen";
import { GenerationResultScreen } from "../screens/GenerationResultScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { PlazaScreen } from "../screens/PlazaScreen";
import { PostDetailScreen } from "../screens/PostDetailScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { PublishScreen } from "../screens/PublishScreen";
import { ResultScreen } from "../screens/ResultScreen";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { WorkDetailOverlay } from "../screens/WorkDetailOverlay";

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>("welcome");
  const [allowSameStyle, setAllowSameStyle] = useState(true);
  const [allowExchange, setAllowExchange] = useState(true);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [showMood, setShowMood] = useState(false);

  const mainTabs: MainTab[] = ["home", "gallery", "square", "profile"];
  const showBottomNav = mainTabs.includes(activeScreen as MainTab);

  const getNavActiveTab = (): MainTab => {
    if (mainTabs.includes(activeScreen as MainTab)) return activeScreen as MainTab;
    return "home";
  };

  const handleNavigate = (screen: ScreenType) => {
    setActiveScreen(screen);
    setSelectedWork(null);
  };

  const handleSelectWork = (work: Work) => {
    setSelectedWork(work);
    setShowMood(false);
  };

  return (
    <div className="remuse-wrapper">
      <div className="app-container">
        <main className="scroll-content">
          {activeScreen === "welcome" && <WelcomeScreen onNavigate={handleNavigate} />}
          {activeScreen === "home" && <HomeScreen onNavigate={handleNavigate} />}
          {activeScreen === "gallery" && <GalleryScreen onSelectWork={handleSelectWork} />}
          {activeScreen === "capture" && <CaptureScreen onNavigate={handleNavigate} />}
          {activeScreen === "result" && <ResultScreen onNavigate={handleNavigate} />}
          {activeScreen === "sticker-result" && <GenerationResultScreen kind="sticker" onNavigate={handleNavigate} />}
          {activeScreen === "emoji-pack" && <GenerationResultScreen kind="emoji" onNavigate={handleNavigate} />}
          {activeScreen === "perler-pattern" && <GenerationResultScreen kind="perler" onNavigate={handleNavigate} />}
          {activeScreen === "guide-result" && <GenerationResultScreen kind="guide" onNavigate={handleNavigate} />}
          {activeScreen === "square" && <PlazaScreen onNavigate={handleNavigate} />}
          {activeScreen === "post-detail" && <PostDetailScreen onNavigate={handleNavigate} />}
          {activeScreen === "publish" && (
            <PublishScreen
              allowExchange={allowExchange}
              allowSameStyle={allowSameStyle}
              onNavigate={handleNavigate}
              onToggleExchange={() => setAllowExchange((current) => !current)}
              onToggleSameStyle={() => setAllowSameStyle((current) => !current)}
            />
          )}
          {activeScreen === "profile" && <ProfileScreen />}
        </main>

        {selectedWork && (
          <WorkDetailOverlay
            selectedWork={selectedWork}
            showMood={showMood}
            onClose={() => setSelectedWork(null)}
            onNavigate={handleNavigate}
            onToggleMood={() => setShowMood((current) => !current)}
          />
        )}

        {showBottomNav && <BottomNav activeTab={getNavActiveTab()} onNavigate={handleNavigate} />}
      </div>
    </div>
  );
}
