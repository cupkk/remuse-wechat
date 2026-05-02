import { useEffect, useMemo, useRef, useState } from "react";
import type { GenerationKind, ItemAnalysisResult, ItemRecord, ScreenType } from "../app/types";
import { analyzeUploadedItem, createItem, updateItem, uploadImage } from "../services/api";

interface CaptureScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onItemCreated: (item: ItemRecord, analysis: ItemAnalysisResult) => void;
  onItemUpdated: (item: ItemRecord) => void;
  onStartGeneration: (kind: GenerationKind, item?: ItemRecord | null) => void;
}

type CapturePhase = "idle" | "uploading" | "analyzing" | "archiving" | "archived" | "failed";
type StorySaveState = "idle" | "saving" | "saved" | "error";
type VoiceState = "idle" | "listening" | "unsupported";

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternativeLike | boolean;
}

interface SpeechRecognitionEventLike {
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const nextActions: Array<{ kind: GenerationKind; title: string; tone: string }> = [
  { kind: "emoji", title: "表情包", tone: "emoji" },
  { kind: "guide", title: "改造指南", tone: "guide" },
  { kind: "perler", title: "拼豆图纸", tone: "perler" }
];

const fallbackError = "这次没有识别成功，可以保留故事再试一次。";

export function CaptureScreen({ onNavigate, onItemCreated, onItemUpdated, onStartGeneration }: CaptureScreenProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [story, setStory] = useState("");
  const [phase, setPhase] = useState<CapturePhase>("idle");
  const [analysis, setAnalysis] = useState<ItemAnalysisResult | null>(null);
  const [archivedItem, setArchivedItem] = useState<ItemRecord | null>(null);
  const [errorText, setErrorText] = useState("");
  const [storySaveState, setStorySaveState] = useState<StorySaveState>("idle");
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [archiveSignal, setArchiveSignal] = useState(false);
  const storyRef = useRef(story);
  const storySaveRequestRef = useRef(0);
  const archiveRequestRef = useRef(0);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const storyTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    storyRef.current = story;
  }, [story]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!archivedItem) return;

    const normalizedStory = story.trim();
    if (normalizedStory === archivedItem.story) {
      setStorySaveState("saved");
      return;
    }

    setStorySaveState("saving");
    const saveTimer = window.setTimeout(async () => {
      const requestId = storySaveRequestRef.current + 1;
      storySaveRequestRef.current = requestId;
      try {
        const updated = await updateItem(archivedItem.id, { story: normalizedStory });
        if (storySaveRequestRef.current !== requestId) return;
        setArchivedItem(updated);
        onItemUpdated(updated);
        setStorySaveState("saved");
      } catch {
        if (storySaveRequestRef.current === requestId) setStorySaveState("error");
      }
    }, 900);

    return () => window.clearTimeout(saveTimer);
  }, [archivedItem, onItemUpdated, story]);

  const isProcessing = phase === "uploading" || phase === "analyzing" || phase === "archiving";
  const itemName = analysis?.itemRecognition.name || archivedItem?.name || "旧物";
  const itemCategory = analysis?.itemRecognition.category || archivedItem?.category || "记忆物品";
  const features = analysis?.itemRecognition.visualFeatures?.filter(Boolean).slice(0, 3) || [];
  const recommendedKind = normalizeGenerationKind(analysis?.primaryRecommendation);
  const canUseNextActions = Boolean(archivedItem) && storySaveState !== "saving";

  const statusTitle = useMemo(() => {
    if (phase === "uploading") return "保存图片";
    if (phase === "analyzing") return "识别中";
    if (phase === "archiving") return "入馆中";
    if (phase === "archived") return "已入馆";
    if (phase === "failed") return "未完成";
    return "拍照录入";
  }, [phase]);

  const statusLine = useMemo(() => {
    if (phase === "uploading") return "正在保存真实图片";
    if (phase === "analyzing") return "正在读取物品特征";
    if (phase === "archiving") return "正在放入你的展馆";
    if (phase === "archived") return storySaveState === "saving" ? "故事保存中" : "可以继续创作";
    if (phase === "failed") return errorText || fallbackError;
    return "拍照或从相册选择";
  }, [errorText, phase, storySaveState]);

  const storyStatus = useMemo(() => {
    if (!archivedItem) return isProcessing ? "可先讲述" : "";
    if (storySaveState === "saving") return "保存中";
    if (storySaveState === "error") return "未保存";
    return "已保存";
  }, [archivedItem, isProcessing, storySaveState]);

  const handleFileChange = (file?: File) => {
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysis(null);
    setArchivedItem(null);
    setErrorText("");
    setStorySaveState("idle");
    setArchiveSignal(false);
    void archiveFile(file);
  };

  const archiveFile = async (file: File) => {
    const requestId = archiveRequestRef.current + 1;
    archiveRequestRef.current = requestId;
    try {
      setPhase("uploading");
      const uploaded = await uploadImage(file);
      if (archiveRequestRef.current !== requestId) return;
      const storyForAnalysis = storyRef.current.trim();

      setPhase("analyzing");
      const nextAnalysis = await analyzeUploadedItem({
        story: storyForAnalysis,
        imageUrl: uploaded.url
      });
      if (archiveRequestRef.current !== requestId) return;

      const storyForArchive = storyRef.current.trim();
      setAnalysis(nextAnalysis);
      setPhase("archiving");
      const item = await createItem({
        name: nextAnalysis.itemRecognition.name || "旧物",
        category: nextAnalysis.itemRecognition.category || "记忆物品",
        story: storyForArchive,
        imageUrl: uploaded.url,
        analysis: {
          ...nextAnalysis,
          primaryRecommendation: normalizeGenerationKind(nextAnalysis.primaryRecommendation),
          alternativeRecommendations: normalizeRecommendations(nextAnalysis.alternativeRecommendations)
        }
      });
      if (archiveRequestRef.current !== requestId) return;

      setArchivedItem(item);
      if (storyRef.current.trim() === storyForArchive) setStory(item.story);
      setStorySaveState("saved");
      setPhase("archived");
      setArchiveSignal(true);
      onItemCreated(item, nextAnalysis);
      window.setTimeout(() => setArchiveSignal(false), 1700);
    } catch (error) {
      if (archiveRequestRef.current !== requestId) return;
      setErrorText(error instanceof Error ? error.message : fallbackError);
      setPhase("failed");
    }
  };

  const handleVoiceToggle = () => {
    if (voiceState === "listening") {
      recognitionRef.current?.stop();
      return;
    }

    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setVoiceState("unsupported");
      storyTextareaRef.current?.focus();
      return;
    }

    const recognition = new Recognition();
    const baseStory = storyRef.current.trim();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "zh-CN";
    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const alternative = result[0];
        if (typeof alternative !== "boolean" && alternative?.transcript) transcript += alternative.transcript;
      }
      const nextTranscript = transcript.trim();
      if (nextTranscript) setStory(baseStory ? `${baseStory}\n${nextTranscript}` : nextTranscript);
    };
    recognition.onerror = () => {
      setVoiceState("unsupported");
      storyTextareaRef.current?.focus();
    };
    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return;
      recognitionRef.current = null;
      setVoiceState("idle");
    };

    try {
      recognitionRef.current = recognition;
      recognition.start();
      setVoiceState("listening");
    } catch {
      recognitionRef.current = null;
      setVoiceState("unsupported");
      storyTextareaRef.current?.focus();
    }
  };

  return (
    <div className={`capture-detail-view capture-live-view phase-${phase} view-animate`}>
      <div className="capture-top-bar">
        <button className="back-btn" onClick={() => onNavigate("home")}>
          <svg viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="titles">
          <h1>{statusTitle}</h1>
          <p>{statusLine}</p>
        </div>
        <div className="capture-top-spacer" />
      </div>

      {!previewUrl ? (
        <section className="capture-upload-stage">
          <div className="capture-upload-halo" aria-hidden="true" />
          <div className="capture-upload-mark">
            <svg viewBox="0 0 48 48">
              <path d="M14 17h4l2.5-4h7L30 17h4a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H14a5 5 0 0 1-5-5V22a5 5 0 0 1 5-5z" />
              <circle cx="24" cy="27" r="7" />
            </svg>
          </div>
          <div className="capture-upload-actions">
            <label className="capture-source-btn">
              拍照
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(event) => {
                  handleFileChange(event.target.files?.[0]);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            <label className="capture-source-btn secondary">
              相册
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  handleFileChange(event.target.files?.[0]);
                  event.currentTarget.value = "";
                }}
              />
            </label>
          </div>
        </section>
      ) : (
        <section className="capture-live-stage">
          <div className="generation-field capture-field" aria-hidden="true" />
          <div className="generation-sensory capture-sensory" aria-hidden="true">
            <div className="sensory-aura sensory-aura-one" />
            <div className="sensory-aura sensory-aura-two" />
            <div className="sensory-ring sensory-ring-one" />
            <div className="sensory-ring sensory-ring-two" />
            <div className="sensory-ring sensory-ring-three" />
            {isProcessing && <div className="sensory-scan" />}
            <div className="sensory-orb capture-object-preview">
              <img src={previewUrl} alt="已选择的旧物" />
            </div>
            <div className="sensory-particles">
              {Array.from({ length: 16 }).map((_, index) => (
                <i key={index} />
              ))}
            </div>
          </div>

          <div className={`capture-archive-badge ${archiveSignal ? "is-visible" : ""}`}>
            <span>
              <svg viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
            已入馆
          </div>

          <label className="capture-retake-btn">
            换照片
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                handleFileChange(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
          </label>

          <div className="capture-recognition-strip">
            <strong>{phase === "failed" ? "保留故事" : itemName}</strong>
            <span>{features.length > 0 ? features.join(" · ") : itemCategory}</span>
          </div>
        </section>
      )}

      {selectedFile && (
        <section className="capture-story-panel">
          <div className="capture-story-head">
            <button className={`capture-mic-btn ${voiceState === "listening" ? "is-listening" : ""}`} onClick={handleVoiceToggle}>
              <svg viewBox="0 0 24 24">
                <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z" />
                <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" />
              </svg>
            </button>
            <div>
              <strong>{voiceState === "listening" ? "正在听" : "旧物故事"}</strong>
              <span>{voiceState === "unsupported" ? "可直接输入" : storyStatus}</span>
            </div>
          </div>
          <textarea
            ref={storyTextareaRef}
            className="capture-story-input"
            placeholder="讲讲它和你的故事。"
            value={story}
            onChange={(event) => setStory(event.target.value)}
            rows={5}
          />
        </section>
      )}

      {archivedItem && (
        <div className={`capture-next-actions ${canUseNextActions ? "is-ready" : ""}`} aria-label="下一步创作">
          {nextActions.map((action) => (
            <button
              className={`capture-next-btn tone-${action.tone} ${action.kind === recommendedKind ? "is-recommended" : ""}`}
              disabled={!canUseNextActions}
              key={action.kind}
              onClick={() => onStartGeneration(action.kind, archivedItem)}
            >
              <NextActionIcon kind={action.kind} />
              <span>{action.title}</span>
            </button>
          ))}
        </div>
      )}

      {phase === "failed" && selectedFile && (
        <div className="capture-error-actions">
          <button className="generation-retry-btn" onClick={() => archiveFile(selectedFile)}>
            再试一次
          </button>
        </div>
      )}
    </div>
  );
}

function getSpeechRecognition() {
  const speechWindow = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
}

function normalizeGenerationKind(kind?: GenerationKind): GenerationKind {
  if (kind === "guide" || kind === "perler" || kind === "emoji") return kind;
  return "emoji";
}

function normalizeRecommendations(kinds?: GenerationKind[]): GenerationKind[] {
  const normalized = (kinds || []).map(normalizeGenerationKind);
  return Array.from(new Set(normalized.length ? normalized : ["emoji", "guide", "perler"]));
}

function NextActionIcon({ kind }: { kind: GenerationKind }) {
  if (kind === "guide") {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M6 4h12v16H6z" />
        <path d="M9 9h6M9 13h6M9 17h4" />
      </svg>
    );
  }

  if (kind === "perler") {
    return (
      <svg viewBox="0 0 24 24">
        <circle cx="7" cy="7" r="2" />
        <circle cx="17" cy="7" r="2" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 10h.01M16 10h.01M8.5 15c1.9 1.7 5.1 1.7 7 0" />
    </svg>
  );
}
