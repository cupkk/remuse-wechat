import { useMemo, useState } from "react";
import type { ItemAnalysisResult, ItemRecord, ScreenType } from "../app/types";
import { analyzeUploadedItem, createItem, uploadImage } from "../services/api";

interface CaptureScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onItemCreated: (item: ItemRecord, analysis: ItemAnalysisResult) => void;
}

const defaultStory = "";

export function CaptureScreen({ onNavigate, onItemCreated }: CaptureScreenProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [story, setStory] = useState(defaultStory);
  const [statusText, setStatusText] = useState("上传图片，写几句故事。");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canAnalyze = selectedFile && story.trim().length > 0 && !isSubmitting;
  const primaryStatus = useMemo(() => {
    if (isSubmitting) return statusText;
    if (selectedFile) return "图片已选择。";
    return statusText;
  }, [isSubmitting, selectedFile, statusText]);

  const handleFileChange = (file?: File) => {
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStatusText("图片已选择。");
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setStatusText("请先选择一张旧物图片。");
      return;
    }

    setIsSubmitting(true);
    try {
      setStatusText("保存图片...");
      const uploaded = await uploadImage(selectedFile);
      setStatusText("分析图片和故事...");
      const analysis = await analyzeUploadedItem({
        itemName: itemName.trim() || undefined,
        category: category.trim() || undefined,
        story: story.trim(),
        imageUrl: uploaded.url
      });
      setStatusText("保存到展馆...");
      const item = await createItem({
        name: analysis.itemRecognition.name || itemName.trim() || "旧物",
        category: analysis.itemRecognition.category || category.trim() || "记忆物品",
        story: story.trim(),
        imageUrl: uploaded.url,
        analysis
      });
      onItemCreated(item, analysis);
      onNavigate("result");
    } catch (error) {
      setStatusText(error instanceof Error ? error.message : "这次没有分析成功，可以保留故事再试一次。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="capture-detail-view view-animate">
      <div className="capture-top-bar">
        <button className="back-btn" onClick={() => onNavigate("home")}>
          <svg viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="titles">
          <h1>拍下旧物</h1>
          <p>照片和故事就够了</p>
        </div>
        <div className="capture-top-spacer" />
      </div>

      <div className="photo-preview-container">
        <label className={`photo-preview-placeholder capture-upload-drop ${previewUrl ? "has-image" : ""}`}>
          {previewUrl ? (
            <img src={previewUrl} alt="已选择的旧物" />
          ) : (
            <>
              <div>选择照片</div>
            </>
          )}
          <input type="file" accept="image/*" capture="environment" onChange={(event) => handleFileChange(event.target.files?.[0])} />
        </label>
      </div>

      <div className="recognition-info">
        <h3>
          AI 分析 <span>{itemName || "待开始"}</span>
        </h3>
        <p>{primaryStatus}</p>
      </div>

      <div className="draft-card-container">
        <div className="draft-header">旧物故事</div>
        <div className="capture-fields">
          <input placeholder="名称，可留空" value={itemName} onChange={(event) => setItemName(event.target.value)} />
          <input placeholder="分类，可留空" value={category} onChange={(event) => setCategory(event.target.value)} />
          <textarea placeholder="写下它从哪里来，为什么留下。" value={story} onChange={(event) => setStory(event.target.value)} rows={4} />
        </div>
        <div className="draft-actions">
          <button className="draft-btn draft-btn-edit" onClick={() => setStory("")} disabled={isSubmitting}>
            <svg viewBox="0 0 24 24">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
            清空
          </button>
          <button className="draft-btn draft-btn-continue" onClick={handleAnalyze} disabled={!canAnalyze}>
            {isSubmitting ? "分析中..." : "分析"}
          </button>
        </div>
      </div>
    </div>
  );
}
