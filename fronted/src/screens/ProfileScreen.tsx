import type { AppSessionUser, GeneratedAssetRecord, ItemRecord, ScreenType } from "../app/types";

interface ProfileScreenProps {
  sessionUser: AppSessionUser | null;
  items: ItemRecord[];
  generatedAssets: GeneratedAssetRecord[];
  onNavigate: (screen: ScreenType) => void;
}

const kindLabel: Record<string, string> = {
  sticker: "贴纸",
  emoji: "表情包",
  perler: "拼豆",
  guide: "改造"
};

export function ProfileScreen({ sessionUser, items, generatedAssets, onNavigate }: ProfileScreenProps) {
  const displayName = sessionUser?.nickname || (sessionUser?.isGuest ? "游客身份" : "旧物收藏家");
  const recentAssets = generatedAssets.slice(0, 4);
  const calendar = buildChinaCalendar(items, generatedAssets);

  return (
    <div className="profile-view view-animate">
      <div className="profile-header">
        <div className="avatar">{displayName.slice(0, 1)}</div>
        <div className="profile-info">
          <h1 className="profile-name">{displayName}</h1>
          <div className="profile-stats">
            <span>{items.length}</span> 件藏品&nbsp;·&nbsp; <span>{generatedAssets.length}</span> 个成果
          </div>
        </div>
      </div>

      <section className="profile-summary">
        <button onClick={() => onNavigate("gallery")}>展馆</button>
        <button onClick={() => onNavigate("capture")}>上传</button>
      </section>

      <section className="calendar-card journal-calendar">
        <div className="cal-top">
          <div>
            <div className="cal-month">{calendar.monthLabel}</div>
            <p className="calendar-subtitle">手账日历</p>
          </div>
          <div className="cal-nav">{calendar.yearLabel}</div>
        </div>

        <div className="cal-grid journal-grid">
          {["日", "一", "二", "三", "四", "五", "六"].map((dayName) => (
            <div className="cal-day-header" key={dayName}>
              {dayName}
            </div>
          ))}
          {calendar.cells.map((cell) => (
            <div className={`cal-cell journal-cell ${cell.isCurrentMonth ? "" : "empty"} ${cell.isToday ? "today" : ""} ${cell.count > 0 ? "highlight" : ""}`} key={cell.key}>
              <span>{cell.day}</span>
              <small>{cell.lunarLabel}</small>
              {cell.count > 0 && <i>{cell.count}</i>}
            </div>
          ))}
        </div>
      </section>

      <h2 className="section-title">最近成果</h2>

      {recentAssets.length > 0 ? (
        <div className="profile-gallery">
          {recentAssets.map((asset) => {
            const payload = parsePayload(asset.payloadJson);
            const imageUrl = typeof payload.imageUrl === "string" ? payload.imageUrl : "";
            return (
              <div className="profile-card" key={asset.id}>
                {imageUrl ? <img src={imageUrl} alt={asset.title} /> : <span>{kindLabel[asset.kind] || "成果"}</span>}
                <small>{asset.title || kindLabel[asset.kind]}</small>
              </div>
            );
          })}
        </div>
      ) : (
        <button className="profile-empty" onClick={() => onNavigate("capture")}>
          还没有生成成果
        </button>
      )}
    </div>
  );
}

function buildChinaCalendar(items: ItemRecord[], generatedAssets: GeneratedAssetRecord[]) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = firstDay.getDay();
  const entryCounts = new Map<string, number>();

  [...items.map((item) => item.createdAt), ...generatedAssets.map((asset) => asset.createdAt)].forEach((value) => {
    const key = dateKey(value);
    if (!key) return;
    entryCounts.set(key, (entryCounts.get(key) || 0) + 1);
  });

  const cells: Array<{
    key: string;
    day: number;
    lunarLabel: string;
    isCurrentMonth: boolean;
    isToday: boolean;
    count: number;
  }> = [];

  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let index = leading - 1; index >= 0; index -= 1) {
    const day = prevMonthDays - index;
    const date = new Date(year, month - 1, day);
    cells.push(buildCalendarCell(date, false, today, entryCounts));
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    cells.push(buildCalendarCell(date, true, today, entryCounts));
  }

  while (cells.length % 7 !== 0 || cells.length < 42) {
    const date = new Date(year, month, daysInMonth + (cells.length - leading - daysInMonth) + 1);
    cells.push(buildCalendarCell(date, false, today, entryCounts));
  }

  return {
    monthLabel: `${month + 1}月`,
    yearLabel: `${year}年`,
    cells
  };
}

function buildCalendarCell(date: Date, isCurrentMonth: boolean, today: Date, entryCounts: Map<string, number>) {
  const key = formatDateKey(date);
  return {
    key,
    day: date.getDate(),
    lunarLabel: getChineseCalendarLabel(date),
    isCurrentMonth,
    isToday: formatDateKey(date) === formatDateKey(today),
    count: entryCounts.get(key) || 0
  };
}

function dateKey(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return formatDateKey(date);
}

function formatDateKey(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function getChineseCalendarLabel(date: Date) {
  const lunarFormatter = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
    day: "numeric"
  });
  const label = lunarFormatter.format(date).replace(/[0-9]/g, "").trim();
  if (label) return label.slice(0, 3);
  const fallback = ["初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十"];
  return fallback[(date.getDate() - 1) % fallback.length];
}

function parsePayload(payloadJson?: string) {
  if (!payloadJson) return {} as Record<string, unknown>;
  try {
    return JSON.parse(payloadJson) as Record<string, unknown>;
  } catch {
    return {};
  }
}
