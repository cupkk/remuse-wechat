export function ProfileScreen() {
  return (
    <div className="profile-view view-animate">
      <div className="fortune-tag">
        <svg viewBox="0 0 24 24">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
        </svg>
        126
      </div>

      <div className="profile-header">
        <div className="avatar">旧</div>
        <div className="profile-info">
          <h1 className="profile-name">旧物收藏家</h1>
          <div className="profile-stats">
            <span>18</span> 件藏品&nbsp;·&nbsp; <span>9</span> 个成果&nbsp;·&nbsp; <span>6</span> 天好运
          </div>
        </div>
      </div>

      <div className="calendar-card">
        <div className="cal-top">
          <div className="cal-month">4月</div>
          <div className="cal-nav">
            <svg viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            2026年4月
            <svg viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>

        <div className="cal-grid">
          {["日", "一", "二", "三", "四", "五", "六"].map((dayName) => (
            <div className="cal-day-header" key={dayName}>
              {dayName}
            </div>
          ))}
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="cal-cell empty" key={`empty-${index}`} />
          ))}
          {Array.from({ length: 30 }).map((_, index) => {
            const day = index + 1;
            const is17 = day === 17;
            const is24 = day === 24;
            return (
              <div className={`cal-cell ${is24 ? "highlight" : ""}`} key={day}>
                {is17 && <div className="cal-marker">票</div>}
                {is24 && <div className="cal-marker">运</div>}
                {day}
              </div>
            );
          })}
        </div>
      </div>

      <h2 className="section-title">再生成果库</h2>

      <div className="profile-tabs">
        <button className="profile-tab active">拼豆</button>
        <button className="profile-tab">贴纸</button>
        <button className="profile-tab">表情包</button>
        <button className="profile-tab">卡片</button>
        <button className="profile-tab">手账</button>
      </div>

      <div className="profile-gallery">
        <div className="profile-card" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(0,0,0,0.1))" }}>
          <div className="pin-tag">
            <svg viewBox="0 0 24 24">
              <path
                d="M12 2L12 10M12 22L12 14M16 6H8C6.89543 6 6 6.89543 6 8V10C6 11.1046 6.89543 12 8 12H16C17.1046 12 18 11.1046 18 10V8C18 6.89543 17.1046 6 16 6ZM16 14H8C6.89543 14 6 14.8954 6 16V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V16C18 14.8954 17.1046 14 16 14Z"
                stroke="none"
                fill="currentColor"
              />
            </svg>
            置顶
          </div>
          <span>像素图占位</span>
        </div>
        <div className="profile-card" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(0,0,0,0.15))" }}>
          <span>头像卡占位</span>
        </div>
        <div className="profile-card" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(0,0,0,0.2))" }}>
          <span>奶茶图占位</span>
        </div>
        <div className="profile-card" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(0,0,0,0.25))" }}>
          <span>照片占位</span>
        </div>
      </div>
    </div>
  );
}
