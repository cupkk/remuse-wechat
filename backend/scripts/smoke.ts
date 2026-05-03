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
    body: JSON.stringify({
      name: "奶茶杯套",
      category: "包装",
      story: "考完试后的那杯奶茶。"
    })
  });
  if (!item.ok) throw new Error("create item failed");
  const itemPayload = await item.json() as { data: { id: string } };

  const items = await fetch(`${baseUrl}/api/items`, { headers });
  if (!items.ok) throw new Error("list items failed");

  const plaza = await fetch(`${baseUrl}/api/plaza`);
  if (!plaza.ok) throw new Error("list plaza failed");

  const publish = await fetch(`${baseUrl}/api/plaza`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      itemId: itemPayload.data.id,
      title: "奶茶杯套",
      allowSameStyle: true,
      allowExchange: false
    })
  });
  if (!publish.ok) throw new Error("publish plaza post failed");

  console.log("backend basic smoke passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
