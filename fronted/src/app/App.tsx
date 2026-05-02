import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type {
  AppSessionUser,
  GeneratedAssetRecord,
  GenerationKind,
  ItemAnalysisResult,
  ItemRecord,
  MainTab,
  PlazaPost,
  ScreenType,
  Work
} from "./types";
import { BottomNav } from "../components/BottomNav";
import { CaptureScreen } from "../screens/CaptureScreen";
import { GalleryScreen } from "../screens/GalleryScreen";
import { GenerationLoadingScreen } from "../screens/GenerationLoadingScreen";
import { GenerationResultScreen } from "../screens/GenerationResultScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { PlazaScreen } from "../screens/PlazaScreen";
import { PostDetailScreen } from "../screens/PostDetailScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { PublishScreen } from "../screens/PublishScreen";
import { ResultScreen } from "../screens/ResultScreen";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { WorkDetailOverlay } from "../screens/WorkDetailOverlay";
import { generateAssetForItem, listGeneratedAssets, listItems, listOfficialPlazaPosts } from "../services/api";

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>("welcome");
  const [sessionUser, setSessionUser] = useState<AppSessionUser | null>(null);
  const [items, setItems] = useState<ItemRecord[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [plazaPosts, setPlazaPosts] = useState<PlazaPost[]>([]);
  const [isLoadingPlaza, setIsLoadingPlaza] = useState(false);
  const [currentGenerationKind, setCurrentGenerationKind] = useState<GenerationKind>("emoji");
  const [currentItem, setCurrentItem] = useState<ItemRecord | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<ItemAnalysisResult | null>(null);
  const [generatedAsset, setGeneratedAsset] = useState<GeneratedAssetRecord | null>(null);
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAssetRecord[]>([]);
  const [generationError, setGenerationError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [allowSameStyle, setAllowSameStyle] = useState(true);
  const [allowExchange, setAllowExchange] = useState(true);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [showMood, setShowMood] = useState(false);
  const scrollRef = useRef<HTMLElement | null>(null);

  const mainTabs: MainTab[] = ["home", "gallery", "square", "profile"];
  const showBottomNav = mainTabs.includes(activeScreen as MainTab);
  const featuredItem = useMemo(() => currentItem ?? items[0] ?? null, [currentItem, items]);

  useEffect(() => {
    const token = window.localStorage.getItem("remuse_token");
    if (token && token !== "local-preview-token") {
      setIsLoadingItems(true);
      listItems()
        .then(async (nextItems) => {
          const nextAssets = await listGeneratedAssets().catch(() => []);
          setItems(nextItems);
          setGeneratedAssets(nextAssets);
          setCurrentItem((current) => current ?? nextItems[0] ?? null);
        })
        .catch(() => setItems([]))
        .finally(() => setIsLoadingItems(false));
    }
  }, [sessionUser]);

  useEffect(() => {
    if (activeScreen !== "square" || plazaPosts.length > 0) return;
    setIsLoadingPlaza(true);
    listOfficialPlazaPosts()
      .then(setPlazaPosts)
      .catch(() => setPlazaPosts([]))
      .finally(() => setIsLoadingPlaza(false));
  }, [activeScreen, plazaPosts.length]);

  useLayoutEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;
    scrollElement.scrollTop = 0;
    window.requestAnimationFrame(() => {
      scrollElement.scrollTop = 0;
    });
  }, [activeScreen]);

  const getNavActiveTab = (): MainTab => {
    if (mainTabs.includes(activeScreen as MainTab)) return activeScreen as MainTab;
    return "home";
  };

  const handleNavigate = (screen: ScreenType) => {
    setActiveScreen(screen);
    setSelectedWork(null);
  };

  const handleLogout = () => {
    window.localStorage.removeItem("remuse_token");
    setSessionUser(null);
    setItems([]);
    setGeneratedAssets([]);
    setCurrentItem(null);
    setCurrentAnalysis(null);
    setGeneratedAsset(null);
    setGenerationError("");
    setSelectedWork(null);
    setShowMood(false);
    setActiveScreen("welcome");
  };

  const handleSelectWork = (work: Work) => {
    const matchedItem = items.find((item) => item.id === work.id) ?? null;
    if (matchedItem) {
      setCurrentItem(matchedItem);
      setCurrentAnalysis(parseItemAnalysis(matchedItem.analysisJson));
    }
    setSelectedWork(work);
    setShowMood(false);
  };

  const handleStartGeneration = async (kind: GenerationKind, itemOverride?: ItemRecord | null) => {
    const targetItem = itemOverride ?? currentItem ?? items[0] ?? null;
    if (!targetItem) {
      setGenerationError("请先上传一件旧物，再选择生成方式。");
      setSelectedWork(null);
      setActiveScreen("capture");
      return;
    }

    setCurrentItem(targetItem);
    setCurrentAnalysis(parseItemAnalysis(targetItem.analysisJson));
    setCurrentGenerationKind(kind);
    setGeneratedAsset(null);
    setGenerationError("");
    setIsGenerating(true);
    setSelectedWork(null);
    setActiveScreen("generation-loading");
    let didGenerate = false;

    try {
      const asset = await generateAssetForItem(kind, targetItem);
      didGenerate = true;
      setGeneratedAsset(asset);
      setGeneratedAssets((current) => [asset, ...current.filter((existing) => existing.id !== asset.id)]);
      setItems((current) => [targetItem, ...current.filter((item) => item.id !== targetItem.id)]);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "这次没有生成成功，可以保留故事再试一次。");
    } finally {
      setIsGenerating(false);
      if (didGenerate) {
        window.setTimeout(() => {
          setActiveScreen(getGenerationResultScreen(kind));
        }, 650);
      }
    }
  };

  const handleItemCreated = (item: ItemRecord, analysis: ItemAnalysisResult) => {
    setCurrentItem(item);
    setCurrentAnalysis(analysis);
    setItems((current) => [item, ...current.filter((existing) => existing.id !== item.id)]);
  };

  const handleItemUpdated = (item: ItemRecord) => {
    setCurrentItem(item);
    setCurrentAnalysis(parseItemAnalysis(item.analysisJson));
    setItems((current) => [item, ...current.filter((existing) => existing.id !== item.id)]);
  };

  return (
    <div className="remuse-wrapper">
      <div className="app-container">
        <main className="scroll-content" ref={scrollRef}>
          {activeScreen === "welcome" && <WelcomeScreen onNavigate={handleNavigate} onSessionReady={setSessionUser} />}
          {activeScreen === "home" && (
            <HomeScreen
              featuredItem={featuredItem}
              isLoadingItems={isLoadingItems}
              sessionUser={sessionUser}
              onNavigate={handleNavigate}
            />
          )}
          {activeScreen === "gallery" && (
            <GalleryScreen
              items={items}
              generatedAssets={generatedAssets}
              onNavigate={handleNavigate}
              onSelectWork={handleSelectWork}
            />
          )}
          {activeScreen === "capture" && (
            <CaptureScreen
              onNavigate={handleNavigate}
              onItemCreated={handleItemCreated}
              onItemUpdated={handleItemUpdated}
              onStartGeneration={handleStartGeneration}
            />
          )}
          {activeScreen === "result" && (
            <ResultScreen
              currentItem={featuredItem}
              analysis={currentAnalysis ?? parseItemAnalysis(featuredItem?.analysisJson)}
              onNavigate={handleNavigate}
              onStartGeneration={handleStartGeneration}
            />
          )}
          {activeScreen === "generation-loading" && (
            <GenerationLoadingScreen
              kind={currentGenerationKind}
              item={featuredItem}
              errorText={generationError}
              isGenerating={isGenerating}
              onNavigate={handleNavigate}
              onRetry={handleStartGeneration}
            />
          )}
          {activeScreen === "sticker-result" && (
            <GenerationResultScreen kind="sticker" item={featuredItem} generatedAsset={generatedAsset} onNavigate={handleNavigate} />
          )}
          {activeScreen === "emoji-pack" && (
            <GenerationResultScreen kind="emoji" item={featuredItem} generatedAsset={generatedAsset} onNavigate={handleNavigate} />
          )}
          {activeScreen === "perler-pattern" && (
            <GenerationResultScreen kind="perler" item={featuredItem} generatedAsset={generatedAsset} onNavigate={handleNavigate} />
          )}
          {activeScreen === "guide-result" && (
            <GenerationResultScreen kind="guide" item={featuredItem} generatedAsset={generatedAsset} onNavigate={handleNavigate} />
          )}
          {activeScreen === "square" && <PlazaScreen posts={plazaPosts} isLoading={isLoadingPlaza} onNavigate={handleNavigate} />}
          {activeScreen === "post-detail" && <PostDetailScreen onNavigate={handleNavigate} />}
          {activeScreen === "publish" && (
            <PublishScreen
              allowExchange={allowExchange}
              allowSameStyle={allowSameStyle}
              currentItem={featuredItem}
              generatedAsset={generatedAsset}
              onNavigate={handleNavigate}
              onToggleExchange={() => setAllowExchange((current) => !current)}
              onToggleSameStyle={() => setAllowSameStyle((current) => !current)}
            />
          )}
          {activeScreen === "profile" && (
            <ProfileScreen
              sessionUser={sessionUser}
              items={items}
              generatedAssets={generatedAssets}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
            />
          )}
        </main>

        {selectedWork && (
          <WorkDetailOverlay
            selectedWork={selectedWork}
            showMood={showMood}
            onClose={() => setSelectedWork(null)}
            onStartGeneration={(kind) => handleStartGeneration(kind, items.find((item) => item.id === selectedWork.id) ?? currentItem)}
            onToggleMood={() => setShowMood((current) => !current)}
          />
        )}

        {showBottomNav && <BottomNav activeTab={getNavActiveTab()} onNavigate={handleNavigate} />}
      </div>
    </div>
  );
}

function getGenerationResultScreen(kind: GenerationKind): ScreenType {
  if (kind === "emoji") return "emoji-pack";
  if (kind === "perler") return "perler-pattern";
  if (kind === "guide") return "guide-result";
  return "emoji-pack";
}

function parseItemAnalysis(analysisJson?: string | null): ItemAnalysisResult | null {
  if (!analysisJson) return null;
  try {
    return JSON.parse(analysisJson) as ItemAnalysisResult;
  } catch {
    return null;
  }
}
