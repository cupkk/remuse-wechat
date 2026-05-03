import { useState } from "react";
import type { AppSessionUser, ScreenType } from "../app/types";
import { enterAsGuest, login, register } from "../services/api";

interface WelcomeScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onSessionReady: (user: AppSessionUser) => void;
}

function getBeijingDateLabel() {
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const month = parts.find((part) => part.type === "month")?.value || "01";
  const day = parts.find((part) => part.type === "day")?.value || "01";
  return `${month} / ${day}`;
}

export function WelcomeScreen({ onNavigate, onSessionReady }: WelcomeScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusText, setStatusText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const beijingDateLabel = getBeijingDateLabel();

  const handleAccountSubmit = async () => {
    setIsSubmitting(true);
    setStatusText("");
    try {
      const session = mode === "login" ? await login(email, password) : await register(email, password);
      window.localStorage.setItem("remuse_token", session.token);
      onSessionReady(session.user);
      onNavigate("home");
    } catch (error) {
      setStatusText(error instanceof Error ? error.message : "暂时无法进入，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuest = async () => {
    setStatusText("");
    window.localStorage.setItem("remuse_token", "local-preview-token");
    onSessionReady({ id: "local-preview", nickname: "游客身份", isGuest: true });
    onNavigate("home");

    try {
      const session = await enterAsGuest();
      window.localStorage.setItem("remuse_token", session.token);
      onSessionReady(session.user);
    } catch {
      // Keep the instant local guest session. The next authenticated API call retries guest creation.
    }
  };

  return (
    <div className="welcome-view view-animate">
      <div className="welcome-orbit" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <header className="welcome-brand">
        <span>remuse</span>
        <h1>把旧物交给一座有记忆的博物馆</h1>
      </header>

      <section className="welcome-object">
        <div className="welcome-object-card">
          <div className="welcome-object-glint" aria-hidden="true" />
          <div className="welcome-object-mark">{beijingDateLabel}</div>
          <div className="welcome-object-title">今日幸运好物</div>
          <div className="welcome-object-line" />
          <p>一件旧物，一个新去处。</p>
        </div>
      </section>

      <section className="welcome-entry">
        <button className="welcome-guest-primary" onClick={handleGuest} disabled={isSubmitting}>
          <span>游客体验</span>
        </button>
        <button className="welcome-auth-link" onClick={() => setShowAuthSheet(true)} disabled={isSubmitting}>
          登录 / 注册账号
        </button>
      </section>

      {showAuthSheet && (
        <div className="welcome-sheet-layer" role="presentation" onClick={() => setShowAuthSheet(false)}>
          <section className="welcome-auth-sheet" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-grabber" />
            <div className="sheet-heading">
              <div>
                <h2>{mode === "login" ? "登录账号" : "创建账号"}</h2>
                <p>账号只用于同步你的藏品和生成成果。</p>
              </div>
              <button className="sheet-close" onClick={() => setShowAuthSheet(false)} aria-label="关闭登录面板">
                ×
              </button>
            </div>

            <div className="welcome-auth-tabs">
              <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
                登录
              </button>
              <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
                注册
              </button>
            </div>

            <label>
              <span>邮箱</span>
              <input placeholder="输入邮箱" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label>
              <span>密码</span>
              <input
                type="password"
                placeholder={mode === "login" ? "输入密码" : "设置至少 6 位密码"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {statusText && <p className="welcome-status">{statusText}</p>}

            <button className="welcome-main-btn" onClick={handleAccountSubmit} disabled={isSubmitting}>
              {isSubmitting ? "处理中..." : mode === "login" ? "进入 Remuse" : "创建账号"}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
