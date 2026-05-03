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
import { createPlazaPost, generateAssetForItem, listGeneratedAssets, listItems, listPlazaPosts } from "../services/api";

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>("welcome");
  const [sessionUser, setSessionUser] = useState<AppSessionUser | null>(null);
  const [items, setItems] = useState<ItemRecord[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [plazaPosts, setPlazaPosts] = useState<PlazaPost[]>([]);
  const [isLoadingPlaza, setIsLoadingPlaza] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PlazaPost | null>(null);
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
  const pendingCoverKey = useMemo(
    () => items.filter((item) => item.imageUrl && !item.coverImageUrl).map((item) => item.id).join("|"),
    [items]
  );

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
    listPlazaPosts()
      .then(setPlazaPosts)
      .catch(() => setPlazaPosts([]))
      .finally(() => setIsLoadingPlaza(false));
  }, [activeScreen, plazaPosts.length]);

  useEffect(() => {
    if (!sessionUser || !pendingCoverKey) return;

    let cancelled = false;
    let attempts = 0;
    let timerId = 0;

    const refreshItems = async () => {
      attempts += 1;
      try {
        const nextItems = await listItems();
        if (!cancelled) {
          setItems(nextItems);
          setCurrentItem((current) => {
            if (!current) return nextItems[0] ?? null;
            return nextItems.find((item) => item.id === current.id) ?? current;
          });
        }
      } catch {
        // Cover generation is a background enhancement; keep the archived item usable.
      }

      if (!cancelled && attempts < 6) {
        timerId = window.setTimeout(refreshItems, 3500);
      }
    };

    timerId = window.setTimeout(refreshItems, 3000);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [pendingCoverKey, sessionUser]);

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
    if (screen !== "post-detail") setSelectedPost(null);
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
    setSelectedPost(null);
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

  const handleSelectPost = (post: PlazaPost) => {
    setSelectedPost(post);
    setSelectedWork(null);
    setActiveScreen("post-detail");
  };

  const refreshPlazaPosts = async () => {
    const nextPosts = await listPlazaPosts();
    setPlazaPosts(nextPosts);
    return nextPosts;
  };

  const handlePublish = async (input: {
    itemId: string;
    generatedAssetId?: string | null;
    title?: string;
    allowSameStyle: boolean;
    allowExchange: boolean;
  }) => {
    const post = await createPlazaPost(input);
    setPlazaPosts((current) => [post, ...current.filter((item) => item.id !== post.id)]);
    setSelectedPost(post);
    setSelectedWork(null);
    setActiveScreen("post-detail");
    return post;
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
          {activeScreen === "square" && (
            <PlazaScreen
              posts={plazaPosts}
              isLoading={isLoadingPlaza}
              onNavigate={handleNavigate}
              onRefresh={refreshPlazaPosts}
              onSelectPost={handleSelectPost}
            />
          )}
          {activeScreen === "post-detail" && <PostDetailScreen post={selectedPost} onNavigate={handleNavigate} />}
          {activeScreen === "publish" && (
            <PublishScreen
              allowExchange={allowExchange}
              allowSameStyle={allowSameStyle}
              items={items}
              currentItem={currentItem}
              generatedAsset={generatedAsset}
              onSelectItem={(item) => {
                setCurrentItem(item);
                setCurrentAnalysis(parseItemAnalysis(item.analysisJson));
              }}
              onNavigate={handleNavigate}
              onPublish={handlePublish}
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
        {activeScreen === "square" && (
          <button className="fab-btn app-fab-btn" onClick={() => handleNavigate("publish")} aria-label="发布作品">
            <svg viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        )}
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
