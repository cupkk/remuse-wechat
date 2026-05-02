import { useState } from "react";
import type { ScreenType } from "../app/types";
import { enterAsGuest, login, register } from "../services/api";

interface WelcomeScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export function WelcomeScreen({ onNavigate }: WelcomeScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusText, setStatusText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccountSubmit = async () => {
    setIsSubmitting(true);
    setStatusText("");
    try {
      const session = mode === "login" ? await login(email, password) : await register(email, password);
      window.localStorage.setItem("remuse_token", session.token);
      onNavigate("home");
    } catch (error) {
      setStatusText(error instanceof Error ? error.message : "暂时无法进入，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuest = async () => {
    setIsSubmitting(true);
    setStatusText("");
    try {
      const session = await enterAsGuest();
      window.localStorage.setItem("remuse_token", session.token);
    } catch {
      window.localStorage.setItem("remuse_token", "local-preview-token");
    } finally {
      setIsSubmitting(false);
      onNavigate("home");
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
        <h1>把旧物交给一座会记得的博物馆</h1>
        <p>先以游客身份体验，之后再保存账号。</p>
      </header>

      <section className="welcome-object">
        <div className="welcome-object-card">
          <div className="welcome-object-mark">05 / 24</div>
          <div className="welcome-object-title">今日幸运好物</div>
          <div className="welcome-object-line" />
          <p>一件旧物，一段故事，一个新的去处。</p>
        </div>
      </section>

      <section className="welcome-auth">
        <div className="welcome-auth-tabs">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
            登录
          </button>
          <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
            注册
          </button>
        </div>

        <label>
          <span>手机号 / 邮箱</span>
          <input placeholder="输入账号" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          <span>密码</span>
          <input
            type="password"
            placeholder={mode === "login" ? "输入密码" : "设置密码"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {statusText && <p className="welcome-status">{statusText}</p>}

        <button className="welcome-main-btn" onClick={handleAccountSubmit} disabled={isSubmitting}>
          {isSubmitting ? "处理中..." : mode === "login" ? "进入 Remuse" : "创建账号"}
        </button>
        <button className="welcome-guest-btn" onClick={handleGuest} disabled={isSubmitting}>
          {isSubmitting ? "正在进入..." : "游客身份进入"}
        </button>
      </section>
    </div>
  );
}
