const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3001";

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

  const item = await fetch(`${baseUrl}/api/items`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name: "奶茶袋", category: "包装", story: "考完试后的那杯奶茶。" })
  });
  if (!item.ok) throw new Error("create item failed");

  const generated = await fetch(`${baseUrl}/api/ai/generate-sticker`, {
    method: "POST",
    headers,
    body: JSON.stringify({ itemName: "奶茶袋", story: "考完试后的那杯奶茶。" })
  });
  if (!generated.ok) throw new Error("generate sticker failed");

  console.log("backend smoke passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
