import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3001";
const defaultImagePath = path.resolve(process.cwd(), "..", ".playwright-mcp", "remuse-test-item.png");
const imagePath = path.resolve(process.env.SMOKE_IMAGE_PATH || defaultImagePath);

async function main() {
  const health = await fetch(`${baseUrl}/api/healthz`);
  if (!health.ok) throw new Error("healthz failed");

  const guest = await fetch(`${baseUrl}/api/auth/guest`, { method: "POST" });
  if (!guest.ok) throw new Error("guest auth failed");

  const session = await guest.json() as { data: { token: string } };
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.data.token}`
  };

  const imageBytes = await fs.readFile(imagePath);
  const formData = new FormData();
  formData.append("image", new Blob([imageBytes], { type: mimeTypeFromPath(imagePath) }), path.basename(imagePath));

  const upload = await fetch(`${baseUrl}/api/uploads/image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.data.token}`
    },
    body: formData
  });
  if (!upload.ok) throw new Error(`upload image failed: ${await upload.text()}`);
  const uploadPayload = await upload.json() as { data: { url: string } };
  if (!uploadPayload.data.url.startsWith("/api/uploads/")) throw new Error("upload did not return managed url");

  const analysis = await fetch(`${baseUrl}/api/ai/analyze-item`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      imageUrl: uploadPayload.data.url,
      story: "这是一件现场测试用旧物，用户想把它放进再生博物馆。"
    })
  });
  if (!analysis.ok) throw new Error(`analysis failed: ${await analysis.text()}`);
  const analysisPayload = await analysis.json() as { data: { itemRecognition?: { name?: string; category?: string } } };
  const itemName = analysisPayload.data.itemRecognition?.name || "现场测试旧物";
  const category = analysisPayload.data.itemRecognition?.category || "旧物";

  const item = await fetch(`${baseUrl}/api/items`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: itemName,
      category,
      story: "这是一件现场测试用旧物，用户想把它放进再生博物馆。",
      imageUrl: uploadPayload.data.url,
      analysis: analysisPayload.data
    })
  });
  if (!item.ok) throw new Error(`create item failed: ${await item.text()}`);
  const itemPayload = await item.json() as { data: { id: string } };

  const coverResult = await waitForItemCover(headers, itemPayload.data.id);
  if (!coverResult.coverImageUrl?.includes("/item-covers/")) {
    throw new Error(`cover image was not generated: ${coverResult.coverImageUrl || "empty"}`);
  }

  const coverFetch = await fetch(`${baseUrl}${coverResult.coverImageUrl}`, { headers: { Authorization: `Bearer ${session.data.token}` } });
  if (!coverFetch.ok) throw new Error("generated cover is not accessible");

  const generated = await fetch(`${baseUrl}/api/ai/generate-emoji-pack`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      itemId: itemPayload.data.id,
      itemName,
      category,
      imageUrl: uploadPayload.data.url,
      story: "这是一件现场测试用旧物，用户想把它放进再生博物馆。",
      analysis: analysisPayload.data
    })
  });
  if (!generated.ok) {
    const payload = await generated.text();
    throw new Error(`live AI generate failed: ${payload}`);
  }

  const assets = await fetch(`${baseUrl}/api/generated-assets`, { headers });
  if (!assets.ok) throw new Error("list generated assets failed");
  const assetsPayload = await assets.json() as { data: Array<{ itemId: string; payloadJson: string }> };
  const generatedForItem = assetsPayload.data.find((asset) => asset.itemId === itemPayload.data.id);
  if (!generatedForItem) throw new Error("generated asset was not saved");

  console.log("backend live AI smoke passed", {
    itemId: itemPayload.data.id,
    uploadUrl: uploadPayload.data.url,
    coverImageUrl: coverResult.coverImageUrl
  });
}

async function waitForItemCover(headers: Record<string, string>, itemId: string) {
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    const items = await fetch(`${baseUrl}/api/items`, { headers });
    if (!items.ok) throw new Error("list items failed while waiting for cover");
    const payload = await items.json() as { data: Array<{ id: string; coverImageUrl?: string | null }> };
    const item = payload.data.find((entry) => entry.id === itemId);
    if (item?.coverImageUrl) return item;
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  return { id: itemId, coverImageUrl: "" };
}

function mimeTypeFromPath(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  return "image/png";
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
