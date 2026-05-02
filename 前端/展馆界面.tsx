import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';

const styles = `
  :root {
    /* Colors - Premium Organic Dark Mode */
    --bg-base: #050b14;
    --bg-gradient-top: #0a111c;
    --bg-gradient-bottom: #02060d;
    
    --accent-main: #39ff14; /* Matrix Green from the video */
    --accent-green: #97c978; 
    --accent-olive: #b3c462;
    --accent-glow: rgba(57, 255, 20, 0.15);
    --accent-glow-strong: rgba(57, 255, 20, 0.3);
    
    --text-title: #e4eed3;
    --text-primary: #f5f6f1;
    --text-secondary: #dcee88;
    --text-muted: #8c937c;
    --text-dark: #1b1e15;
    
    --card-bg: rgba(255, 255, 255, 0.035);
    --card-border: rgba(255, 255, 255, 0.05);
    --btn-border: rgba(255, 255, 255, 0.08);
    
    /* Typography */
    --font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif;
    --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
    --font-serif: Georgia, "Times New Roman", "Songti SC", serif;
    
    /* Spacing & Sizes */
    --nav-height: 88px;
    --max-width: 430px;
    --app-width: 100%;
    --radius-sm: 10px;
    --radius-md: 18px;
    --radius-lg: 24px;
    --radius-xl: 32px;
    
    --safe-area-bottom: env(safe-area-inset-bottom, 0px);
  }

  .remuse-wrapper {
    background-color: #000;
    color: var(--text-primary);
    font-family: var(--font-family);
    display: flex;
    justify-content: center;
    min-height: 100vh;
    min-height: 100dvh;
    margin: 0;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .remuse-wrapper * {
    box-sizing: border-box;
  }

  .app-container {
    width: var(--app-width);
    max-width: var(--max-width);
    height: 100vh;
    height: 100dvh;
    background: var(--bg-base);
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    box-shadow: 0 0 50px rgba(0,0,0,0.9);
  }

  .scroll-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding-bottom: calc(var(--nav-height) + 24px);
    scrollbar-width: none;
    display: flex;
    flex-direction: column;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }
  .scroll-content::-webkit-scrollbar {
    display: none;
  }

  /* --- Animations --- */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideUpOverlay {
    from { opacity: 0; transform: translateY(100vh); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes voicePlay {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(300%); }
  }

  @keyframes pulseGlow {
    0% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.1); opacity: 0.8; }
    100% { transform: scale(1); opacity: 0.6; }
  }

  @keyframes ripple {
    0% { transform: scale(1); opacity: 0.8; }
    100% { transform: scale(1.8); opacity: 0; }
  }

  .view-animate {
    animation: fadeUp 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }

  .overlay-animate {
    animation: slideUpOverlay 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  /* =========================================
     1. Common Buttons & Elements
     ========================================= */
  .btn {
    flex: 1;
    height: 56px;
    border-radius: 16px;
    font-size: 16px;
    font-weight: 500;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s ease;
    outline: none;
    border: none;
  }

  .btn:active {
    transform: scale(0.96);
  }

  .btn-primary {
    background: #dcee88; 
    color: var(--text-dark);
    box-shadow: 0 8px 24px rgba(220, 238, 136, 0.2);
  }

  .btn-secondary {
    background-color: var(--card-bg);
    color: #fff;
    border: 1px solid var(--card-border);
    backdrop-filter: blur(12px);
  }

  .back-btn {
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--card-border);
    padding: 10px;
    border-radius: 50%;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(12px);
    cursor: pointer;
    transition: background 0.2s ease;
  }
  .back-btn:active { background: rgba(255,255,255,0.08); }
  .back-btn svg { width: 20px; height: 20px; stroke: currentColor; fill: none; stroke-width: 2; }

  /* =========================================
     2. Home View Styles
     ========================================= */
  .home-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 28px 24px 10px;
    z-index: 10;
  }

  .home-header-left .logo {
    font-family: var(--font-serif);
    color: var(--text-title);
    font-size: 19px;
    font-weight: 500;
    letter-spacing: 0.8px;
    margin-bottom: 6px;
    opacity: 0.85;
  }

  .home-header-left .title {
    color: var(--text-title);
    font-size: 24px;
    font-weight: 500;
    letter-spacing: 1.2px;
    margin: 0;
  }

  .home-header-right {
    text-align: right;
    color: var(--text-title);
  }

  .home-header-right .date-main {
    font-family: var(--font-serif);
    font-size: 24px;
    letter-spacing: 2.5px;
    margin-bottom: 4px;
    font-weight: 500;
  }

  .home-header-right .date-sub {
    font-size: 12px;
    color: var(--text-muted);
    letter-spacing: 0.5px;
  }

  .ambient-glow {
    position: absolute;
    top: 25%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 380px;
    height: 380px;
    background: radial-gradient(circle, rgba(220, 238, 136, 0.15) 0%, transparent 65%);
    pointer-events: none;
    z-index: 0;
    filter: blur(28px);
    animation: pulseGlow 6s infinite ease-in-out;
  }

  .showcase {
    position: relative;
    margin-top: 56px;
    margin-bottom: 48px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 2;
  }

  .main-image {
    width: 200px;
    height: 260px;
    background: #d4c8b9;
    border-radius: 12px;
    position: relative;
    z-index: 2;
    box-shadow: inset 0 0 20px rgba(0,0,0,0.05), 0 24px 40px -12px rgba(0,0,0,0.6);
    background-image: 
      linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px);
    background-size: 24px 24px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: rgba(0,0,0,0.3);
    font-size: 14px;
    text-align: center;
    overflow: hidden;
    transition: transform 0.3s ease;
  }
  
  .main-image:active { transform: scale(0.98); }

  .pedestal {
    width: 220px;
    height: 24px;
    background: rgba(220, 238, 136, 0.2);
    border-radius: 50%;
    margin-top: -12px;
    position: relative;
    z-index: 1;
    filter: blur(16px);
  }

  .item-details {
    text-align: center;
    margin-bottom: 44px;
    z-index: 2;
    padding: 0 24px;
  }

  .item-details h2 { font-size: 24px; font-weight: 600; margin-bottom: 14px; letter-spacing: 1px; color: #fff; }
  .item-details .quote { font-size: 15px; color: #d8dbcf; margin-bottom: 14px; letter-spacing: 0.5px; line-height: 1.5; }
  .item-details .context { font-size: 12px; color: var(--text-muted); letter-spacing: 0.5px; }

  .home-actions-wrap {
    padding: 0 24px;
    width: 100%;
    margin-top: auto;
  }

  .actions-row {
    display: flex;
    gap: 16px;
    width: 100%;
    margin-bottom: 24px;
    z-index: 2;
  }

  .capture-card {
    width: 100%;
    background-color: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-xl);
    padding: 22px 24px;
    display: flex;
    align-items: center;
    z-index: 2;
    cursor: pointer;
    transition: all 0.25s ease;
    backdrop-filter: blur(20px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.2);
  }

  .capture-icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #e1f096 0%, #c4d47a 100%);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 20px;
    flex-shrink: 0;
    box-shadow: 0 4px 16px rgba(220, 238, 136, 0.4);
  }

  .capture-icon svg {
    width: 26px;
    height: 26px;
    fill: none;
    stroke: #1b1e15;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* =========================================
     3. 3D Gallery View (City Atlas)
     ========================================= */
  .gallery-view-3d {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: radial-gradient(circle at 50% 50%, #0f172a 0%, #01030a 100%);
  }

  .gallery-overlay-top {
    position: absolute;
    top: 0; left: 0; right: 0;
    padding: 40px 24px;
    z-index: 10;
    pointer-events: none;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  
  .gallery-overlay-top > * { pointer-events: auto; }

  .city-subtitle {
    color: var(--accent-main);
    font-size: 10px;
    font-family: var(--font-mono);
    letter-spacing: 0.3em;
    text-transform: uppercase;
    opacity: 0.8;
    margin-bottom: 8px;
    text-shadow: 0 0 8px var(--accent-glow-strong);
  }

  .city-title {
    font-size: 32px;
    font-weight: 800;
    color: #fff;
    margin: 0;
    letter-spacing: -0.5px;
    line-height: 1.1;
  }
  
  .city-title span {
    color: var(--accent-main);
    text-shadow: 0 0 12px var(--accent-glow-strong);
  }

  .city-top-actions { display: flex; gap: 12px; }

  .city-icon-btn {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    background-color: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    backdrop-filter: blur(16px);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #fff;
  }
  
  .city-icon-btn:active {
    transform: scale(0.9);
    background-color: rgba(255,255,255,0.1);
  }

  .city-icon-btn svg {
    width: 20px;
    height: 20px;
    stroke: currentColor;
    fill: none;
    stroke-width: 2;
  }

  /* =========================================
     4. Post Detail Overlay (Mobile Version)
     ========================================= */
  .video-detail-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: #000;
    z-index: 200;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }
  
  .video-detail-overlay::-webkit-scrollbar { display: none; }

  .vd-hero {
    width: 100%;
    height: 45vh;
    min-height: 300px;
    position: relative;
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .vd-top-controls {
    position: absolute;
    top: 32px;
    left: 20px;
    right: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 10;
  }

  .vd-icon-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.1);
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .vd-icon-btn svg {
    width: 20px;
    height: 20px;
    stroke: currentColor;
    fill: none;
    stroke-width: 2;
  }

  .vd-hero-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, #000 0%, transparent 60%);
    z-index: 5;
    pointer-events: none;
  }

  .vd-content {
    padding: 0 24px 80px;
    background: #000;
    flex: 1;
    position: relative;
    z-index: 10;
    margin-top: -40px; 
  }

  .vd-header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 24px;
  }

  .vd-title {
    font-size: 32px;
    font-weight: 800;
    color: #fff;
    margin: 0 0 6px 0;
    letter-spacing: -0.5px;
  }

  .vd-date {
    color: var(--accent-main);
    font-family: var(--font-mono);
    font-size: 14px;
    font-weight: 600;
  }

  .vd-mem-id {
    padding: 4px 10px;
    background: rgba(57, 255, 20, 0.1);
    border: 1px solid rgba(57, 255, 20, 0.3);
    color: var(--accent-main);
    font-size: 11px;
    font-weight: 600;
    font-family: var(--font-mono);
    border-radius: 6px;
  }

  .vd-desc {
    color: #9ca3af;
    font-size: 17px;
    line-height: 1.6;
    margin-bottom: 40px;
  }

  /* 移除大黑圆圈：仅纯文字、无图标、纯净暗色卡片 */
  .vd-mood-section {
    background: #111210;
    border-radius: 16px;
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 48px;
  }

  .vd-mood-section:active {
    transform: scale(0.98);
    background: #1a1b18;
  }

  .vd-mood-text {
    color: #fff;
    font-weight: 600;
    font-size: 16px;
  }

  .vd-mood-expanded {
    background: #111210;
    border-radius: 16px;
    padding: 20px 24px;
    margin-bottom: 48px;
    animation: fadeUp 0.3s ease forwards;
  }

  .vd-mood-header-expanded {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    cursor: pointer;
  }

  .vd-mood-quote {
    color: #d1d5db;
    font-size: 18px;
    font-style: italic;
    line-height: 1.6;
    border-left: 3px solid var(--accent-main);
    padding-left: 20px;
    margin-bottom: 24px;
    font-weight: 500;
  }

  .vd-voice-memo {
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(255,255,255,0.05);
    padding: 16px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.05);
  }

  .vd-voice-icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--accent-main);
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 0 15px rgba(57, 255, 20, 0.4);
    flex-shrink: 0;
  }
  
  .vd-voice-icon svg {
    width: 22px;
    height: 22px;
    stroke: #000;
    fill: none;
  }

  .vd-voice-track {
    flex: 1;
  }

  .vd-voice-bar {
    height: 4px;
    background: rgba(255,255,255,0.1);
    border-radius: 2px;
    overflow: hidden;
    position: relative;
  }

  .vd-voice-progress {
    position: absolute;
    top: 0; left: -100%; bottom: 0;
    width: 40%;
    background: var(--accent-main);
    border-radius: 2px;
    animation: voicePlay 2s infinite linear;
  }

  .vd-actions-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 24px;
  }

  .vd-action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 24px 10px;
    background: #111210;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .vd-action-btn:active {
    transform: scale(0.95);
    background: #1a1b18;
  }

  .vd-action-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #000;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
  }

  .vd-action-icon svg {
    width: 24px;
    height: 24px;
    stroke: currentColor;
    fill: none;
    stroke-width: 1.5;
  }

  .vd-action-label {
    color: #888;
    font-size: 13px;
    font-weight: 500;
  }

  /* =========================================
     5. Complete Other Views (Capture/Result/Publish/Square/Profile)
     ========================================= */
  .detail-view-container {
    display: flex;
    flex-direction: column;
    padding: 24px 24px 0;
  }

  .top-bar-shared {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    position: relative;
    min-height: 40px;
  }

  .top-bar-title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    width: 60%;
  }

  .top-bar-title h1 {
    font-size: 18px;
    color: #fff;
    font-weight: 600;
    margin: 0 0 4px 0;
    letter-spacing: 1px;
  }

  .top-bar-title p {
    font-size: 12px;
    color: var(--text-muted);
    margin: 0;
  }

  .capture-controls {
    display: flex;
    align-items: center;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 20px;
    padding: 8px 14px;
    backdrop-filter: blur(12px);
  }

  .capture-controls svg {
    width: 18px;
    height: 18px;
    stroke: #fff;
    fill: none;
    stroke-width: 2;
  }

  .control-div {
    width: 1px;
    height: 14px;
    background: rgba(255, 255, 255, 0.15);
    margin: 0 12px;
  }

  /* Photo Preview */
  .photo-preview-container {
    width: 100%;
    aspect-ratio: 16 / 11;
    background: linear-gradient(145deg, #d3cec4, #b8b3a8);
    border-radius: 24px;
    margin-bottom: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: inset 0 0 40px rgba(0,0,0,0.05), 0 20px 40px rgba(0,0,0,0.3);
    overflow: hidden;
  }

  .photo-preview-placeholder {
    color: rgba(0,0,0,0.35);
    font-size: 15px;
    text-align: center;
    font-weight: 500;
  }

  /* Mic Button Area */
  .voice-input-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 40px;
  }

  .mic-btn-wrapper {
    position: relative;
    width: 90px;
    height: 90px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
  }

  .mic-btn {
    width: 68px;
    height: 68px;
    background: linear-gradient(135deg, #6c7c4e, #475432);
    border-radius: 50%;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;
    cursor: pointer;
    box-shadow: 0 12px 24px rgba(0,0,0,0.5);
    transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  
  .mic-btn:active { transform: scale(0.85); }
  .mic-btn svg { width: 28px; height: 28px; fill: none; stroke: #dcee88; stroke-width: 2; }

  .mic-ripple {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(220, 238, 136, 0.2);
    z-index: 1;
    animation: ripple 2.5s infinite cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .mic-ripple-1 { width: 80px; height: 80px; background: rgba(220, 238, 136, 0.05); }
  .mic-ripple-2 { width: 100px; height: 100px; border-color: rgba(220, 238, 136, 0.08); animation-delay: 1.2s; }

  /* Draft Card */
  .draft-card-container {
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    padding: 24px;
    margin-bottom: 20px;
    border: 1px solid var(--card-border);
    backdrop-filter: blur(16px);
  }

  /* Result View Card */
  .gen-card {
    background: linear-gradient(145deg, #f9f7f2, #ebe6d9); 
    border-radius: 24px;
    padding: 32px 28px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 32px;
    box-shadow: 0 20px 48px rgba(0,0,0,0.4);
    position: relative;
    overflow: hidden;
  }
  .gen-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
  }
  .simulated-bag {
    width: 140px;
    height: 100%;
    min-height: 200px;
    background-color: #dfd8c7;
    border-radius: 6px;
    box-shadow: inset -6px 0 16px rgba(0,0,0,0.06), inset 6px 0 16px rgba(255,255,255,0.5), 8px 12px 24px rgba(0,0,0,0.15);
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }
  .simulated-bag::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 20px;
    background: rgba(0,0,0,0.04);
    border-bottom: 1px dashed rgba(0,0,0,0.12);
  }
  .bag-tape {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%) rotate(-4deg);
    width: 40px;
    height: 20px;
    background-color: #cec1a5;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }

  /* Info Lists */
  .info-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 20px;
    padding: 24px;
    display: flex;
    align-items: flex-start;
    gap: 16px;
    backdrop-filter: blur(16px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.2);
    margin-bottom: 16px;
  }
  .info-card .info-icon svg { width: 20px; height: 20px; stroke: #dcee88; fill: none; stroke-width: 2; flex-shrink:0; }

  /* Square View */
  .square-grid {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }
  .grid-col { display: flex; flex-direction: column; gap: 16px; flex: 1; }
  .square-card {
    background-color: rgba(255,255,255,0.02);
    border-radius: 24px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--card-border);
    cursor: pointer;
    box-shadow: 0 12px 32px rgba(0,0,0,0.15);
  }
  .square-card-img {
    width: 100%;
    background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(0,0,0,0.2));
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgba(255,255,255,0.3);
  }

  /* Bottom Navigation */
  .bottom-nav {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: var(--nav-height);
    padding-bottom: var(--safe-area-bottom);
    background-color: rgba(5, 11, 20, 0.85);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    justify-content: space-around;
    align-items: center;
    z-index: 100;
    backdrop-filter: blur(24px);
  }
  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #6a7258;
    width: 64px;
    height: 100%;
    cursor: pointer;
    background: none;
    border: none;
  }
  .nav-item.active { color: #dcee88; }
  .nav-item svg { width: 24px; height: 24px; margin-bottom: 6px; }
  .nav-item span { font-size: 11px; font-weight: 500; }
`;

// --- Mock Data ---
interface Work {
  id: string;
  title: string;
  date: string;
  description: string;
  moodText: string;
  colorHex: string;
}

const CITY_WORKS: Work[] = [
  { id: 'w7', title: 'Night Study', date: '2024.06.15', description: 'Midnight coffee.', moodText: 'Peaceful night.', colorHex: '20b2aa' },
  { id: 'w10', title: 'Autumn Leaves', date: '2024.09.25', description: 'Golden season.', moodText: 'Crisp air.', colorHex: '3cb371' },
  { id: 'w12', title: 'Summer Breeze', date: '2024.07.10', description: 'A walk by the beach.', moodText: 'Refreshing.', colorHex: '008080' },
  { id: 'w1', title: '一张票根', date: '2024.04.22', description: '留住春天的碎片。', moodText: '好想再去一次', colorHex: '2e8b57' },
  { id: 'w2', title: '空瓶也有记忆', date: '2024.04.10', description: '虽然没有了味道，但依然好看。', moodText: '时间过得真快', colorHex: '4682b4' },
  { id: 'w15', title: 'Winter Snow', date: '2024.12.20', description: 'First snow of the year.', moodText: 'Cold but beautiful.', colorHex: '5f9ea0' },
];

const SQUARE_ITEMS = [
  { id: 'sq1', category: '贴纸', title: '一张票根做成了春天贴纸', likes: 128, color: 'linear-gradient(135deg, rgba(227,223,211,0.1), rgba(197,194,183,0.1))', ratio: '1/1.15' },
  { id: 'sq2', category: '卡片', title: '空瓶也有记忆', likes: 96, color: 'linear-gradient(135deg, rgba(216,213,212,0.1), rgba(188,185,185,0.1))', ratio: '1/1.02' },
  { id: 'sq3', category: '玩偶', title: '陪伴了我十年的小狗', likes: 87, color: 'linear-gradient(135deg, rgba(222,200,169,0.1), rgba(194,176,147,0.1))', ratio: '1/1.1' },
  { id: 'sq4', category: '拼豆', title: '用旧包装拼了个小挂件', likes: 74, color: 'linear-gradient(135deg, rgba(215,216,198,0.1), rgba(188,188,173,0.1))', ratio: '1/0.95' },
];

type ScreenType = 'home' | 'gallery' | 'capture' | 'result' | 'publish' | 'square' | 'profile';

// --- Vanilla Three.js 3D Sphere Component ---
function VanillaSphereGallery({ works, onWorkClick }: { works: Work[], onWorkClick: (item: Work) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 9.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const count = 24;
    const phi = Math.PI * (3 - Math.sqrt(5)); 
    const meshes: THREE.Mesh[] = [];
    const colors = ['#39ff14', '#1b5e20', '#1e3a8a', '#0d9488', '#312e81', '#059669', '#2563eb', '#10b981'];

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (Math.max(count - 1, 1))) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      const geometry = new THREE.PlaneGeometry(1.2, 1.4);
      const workItem = works[i % works.length];
      const material = new THREE.MeshBasicMaterial({ 
        color: new THREE.Color(workItem.colorHex ? `#${workItem.colorHex}` : colors[i % colors.length]), 
        transparent: true, 
        opacity: 0.85, 
        side: THREE.DoubleSide 
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x * 4.2, y * 4.2, z * 4.2);
      mesh.lookAt(0, 0, 0);
      mesh.userData = { 
        item: workItem, 
        floatOffset: Math.random() * Math.PI * 2,
        basePosition: mesh.position.clone()
      };

      group.add(mesh);
      meshes.push(mesh);
    }

    let isDragging = false;
    let startMousePosition = { x: 0, y: 0 };
    let previousMousePosition = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const updateMousePosition = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleClick = (clientX: number, clientY: number) => {
      updateMousePosition(clientX, clientY);
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(group.children);
      if (intersects.length > 0) {
        onWorkClick(intersects[0].object.userData.item);
      }
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      startMousePosition = { x: clientX, y: clientY };
      previousMousePosition = { x: clientX, y: clientY };
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      
      const deltaX = clientX - previousMousePosition.x;
      const deltaY = clientY - previousMousePosition.y;
      group.rotation.y += deltaX * 0.005;
      group.rotation.x += deltaY * 0.005;
      previousMousePosition = { x: clientX, y: clientY };
    };

    const onPointerUp = () => { isDragging = false; };
    const onClickEvent = (e: MouseEvent) => {
      const dist = Math.hypot(e.clientX - startMousePosition.x, e.clientY - startMousePosition.y);
      if (dist < 5) handleClick(e.clientX, e.clientY);
    };
    
    const onTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const dist = Math.hypot(touch.clientX - startMousePosition.x, touch.clientY - startMousePosition.y);
        if (dist < 5) handleClick(touch.clientX, touch.clientY);
      }
      isDragging = false;
    };

    container.addEventListener('mousedown', onPointerDown as any);
    container.addEventListener('mousemove', onPointerMove as any);
    container.addEventListener('mouseup', onPointerUp);
    container.addEventListener('mouseleave', onPointerUp);
    container.addEventListener('click', onClickEvent);
    container.addEventListener('touchstart', onPointerDown as any, { passive: true });
    container.addEventListener('touchmove', onPointerMove as any, { passive: true });
    container.addEventListener('touchend', onTouchEnd as any);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      if (!isDragging) {
        group.rotation.y += 0.002;
        group.rotation.x += 0.0005;
      }

      meshes.forEach(mesh => {
        const { basePosition, floatOffset } = mesh.userData;
        mesh.position.y = basePosition.y + Math.sin(time * 2 + floatOffset) * 0.1;
        mesh.position.x = basePosition.x + Math.cos(time * 1.5 + floatOffset) * 0.1;
        mesh.lookAt(0, 0, 0);
      });
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [works, onWorkClick]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

// --- Icons ---
const Icons = {
  Compass: () => <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
  Search: () => <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  X: () => <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Share: () => <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  Heart: ({ fill = 'none' }) => <svg viewBox="0 0 24 24" fill={fill}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Message: () => <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  Pen: () => <svg viewBox="0 0 24 24"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>,
  Bulb: () => <svg viewBox="0 0 24 24"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.14.74.74 1.21 1.5 1.39 2.36"/></svg>
};

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>('gallery');
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [showMood, setShowMood] = useState(false);

  const getNavActiveTab = () => {
    if (['capture', 'result', 'publish'].includes(activeScreen)) return 'home';
    return activeScreen;
  };

  const handleNavClick = (tab: ScreenType) => {
    setActiveScreen(tab);
    setSelectedWork(null);
  };

  // --- 1. Home View ---
  const renderHomeView = () => (
    <div className="view-animate" style={{flex:1, display:'flex', flexDirection:'column'}}>
      <header className="home-header">
        <div className="home-header-left">
          <div className="logo">remuse</div>
          <h1 className="title">今日幸运好物</h1>
        </div>
        <div className="home-header-right">
          <div className="date-main">05 / 24</div>
          <div className="date-sub">周六 · 五月廿七</div>
        </div>
      </header>
      
      <div className="ambient-glow" />
      
      <div className="showcase">
        <div className="main-image">
          <span>图片占位区域</span>
          <span style={{ fontSize: '11px', marginTop: '6px', opacity: 0.8 }}>(原图为奶茶袋)</span>
        </div>
        <div className="pedestal" />
      </div>
      
      <div className="item-details">
        <h2>夏天的奶茶袋</h2>
        <p className="quote">它提醒你，松一口气也是一种前进。</p>
        <p className="context">来自一段去年夏天的故事</p>
      </div>
      
      <div className="home-actions-wrap">
        <div className="actions-row">
          <button className="btn btn-primary" onClick={() => console.log('收下好运')}>收下好运</button>
          <button className="btn btn-secondary" onClick={() => console.log('查看详情')}>查看详情</button>
        </div>
        <div className="capture-card" onClick={() => setActiveScreen('capture')}>
          <div className="capture-icon">
            <svg viewBox="0 0 24 24" style={{width:'26px', height:'26px', fill:'none', stroke:'#1b1e15', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round'}}>
              <rect x="3" y="6" width="18" height="14" rx="2" ry="2" /><circle cx="12" cy="13" r="4" /><line x1="7" y1="9" x2="9" y2="9" />
            </svg>
          </div>
          <div style={{flex:1}}>
            <h3 style={{fontSize:'17px', color:'#dcee88', fontWeight:500, margin:'0 0 6px 0'}}>拍下今天的物品</h3>
            <p style={{fontSize:'13px', color:'#8b927a', margin:0}}>一张照片，一段故事。</p>
          </div>
          <div style={{opacity:0.3}}><svg viewBox="0 0 24 24" style={{width:'20px', height:'20px', fill:'none', stroke:'#fff', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round'}}><polyline points="9 18 15 12 9 6" /></svg></div>
        </div>
      </div>
    </div>
  );

  // --- 2. Luminous City Gallery View (3D Sphere) ---
  const renderLuminousCity = () => (
    <div className="gallery-view-3d view-animate">
      <div className="gallery-overlay-top">
        <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
          <div className="city-subtitle">Memories Construction Corp</div>
          <h1 className="city-title">
            CITY ATLAS <span style={{color:'var(--accent-main)', textShadow:'0 0 12px rgba(57, 255, 20, 0.4)'}}>/</span> <br/>
            <span style={{color:'var(--accent-main)', textShadow:'0 0 12px rgba(57, 255, 20, 0.4)'}}>ARCHIVE</span>
          </h1>
        </div>
        <div className="city-top-actions">
          <button className="city-icon-btn"><Icons.Compass /></button>
          <button className="city-icon-btn"><Icons.Search /></button>
        </div>
      </div>
      <div style={{position:'absolute', inset:0, zIndex:0}}>
        <VanillaSphereGallery works={CITY_WORKS} onWorkClick={(w) => {
           setSelectedWork(w);
           setShowMood(false);
        }} />
      </div>
    </div>
  );

  // --- 3. Post Detail Overlay (Deep Dark Mobile Modal) ---
  const renderWorkDetailOverlay = () => {
    if (!selectedWork) return null;
    return (
      <div className="video-detail-overlay overlay-animate">
        <div className="vd-hero" style={{ backgroundColor: `#${selectedWork.colorHex}` }}>
          <div className="vd-top-controls">
            <button className="vd-icon-btn" onClick={() => setSelectedWork(null)}><Icons.X /></button>
            <div style={{display:'flex', gap:'8px'}}>
              <button className="vd-icon-btn"><Icons.Share /></button>
              <button className="vd-icon-btn"><Icons.Heart fill="#ff4b4b" /></button>
            </div>
          </div>
          <div className="vd-hero-gradient" />
        </div>

        <div className="vd-content">
          <div className="vd-header-row">
            <div>
              <h1 className="vd-title">{selectedWork.title}</h1>
              <div className="vd-date">{selectedWork.date}</div>
            </div>
            <div className="vd-mem-id">MEM-ID#{selectedWork.id.toUpperCase()}</div>
          </div>
          
          <p className="vd-desc">{selectedWork.description}</p>

          {/* 纯净黑色的 Mood Section，没有任何突兀圆圈或图标 */}
          {!showMood ? (
            <div className="vd-mood-section" onClick={() => setShowMood(true)}>
              <span className="vd-mood-text">看看当时的心情</span>
            </div>
          ) : (
            <div className="vd-mood-expanded" onClick={() => setShowMood(false)}>
              <div className="vd-mood-header-expanded">
                <span className="vd-mood-text">看看当时的心情</span>
              </div>
              <div className="vd-mood-quote">"{selectedWork.moodText}"</div>
              <div className="vd-voice-memo">
                <div className="vd-voice-icon"><Icons.Message /></div>
                <div className="vd-voice-track">
                  <div className="vd-voice-bar"><div className="vd-voice-progress" /></div>
                  <div style={{fontSize:'10px', color:'rgba(255,255,255,0.4)', fontFamily:'var(--font-mono)', marginTop:'8px'}}>VOICE_MEMO_01.MP3</div>
                </div>
              </div>
            </div>
          )}

          <div style={{marginTop:'48px', textAlign:'center'}}>
            <h3 style={{fontSize:'18px', color:'#fff', fontWeight:500, marginBottom:'6px'}}>让物品重获新生</h3>
            <p style={{fontSize:'13px', color:'rgba(255,255,255,0.4)'}}>选择一个方向开始你的创作之旅</p>
          </div>

          <div className="vd-actions-grid">
            <div className="vd-action-btn">
              <div className="vd-action-icon"><Icons.Message /></div>
              <span className="vd-action-label">表情包</span>
            </div>
            <div className="vd-action-btn">
              <div className="vd-action-icon"><Icons.Pen /></div>
              <span className="vd-action-label">拼豆图纸</span>
            </div>
            <div className="vd-action-btn">
              <div className="vd-action-icon"><Icons.Bulb /></div>
              <span className="vd-action-label">改造指南</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- 4. Capture View ---
  const renderCaptureView = () => (
    <div className="detail-view-container view-animate" style={{flex:1}}>
      <div className="top-bar-shared">
        <button className="back-btn" onClick={() => setActiveScreen('home')}>
          <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div className="top-bar-title">
          <h1>拍下旧物</h1>
          <p>说说它为什么值得留下</p>
        </div>
        <div style={{width:'40px'}} />
      </div>
      
      <div className="photo-preview-container">
        <div className="photo-preview-placeholder">
          古茗奶茶袋照片区<br/><span style={{fontSize:'12px', fontWeight:400, opacity:0.6}}>(真实DOM)</span>
        </div>
      </div>

      <div style={{textAlign:'center', marginBottom:'32px'}}>
        <h3 style={{fontSize:'17px', color:'var(--text-muted)', marginBottom:'12px', fontWeight:400}}>识别为：<span style={{color:'var(--accent-main)', background:'rgba(57, 255, 20, 0.1)', padding:'4px 10px', borderRadius:'10px', fontWeight:500}}>奶茶袋</span></h3>
        <p style={{fontSize:'15px', color:'#8c937c'}}>要不要说说它的故事？</p>
      </div>

      <div className="voice-input-area">
        <div className="mic-btn-wrapper">
          <div className="mic-ripple mic-ripple-2"></div>
          <div className="mic-ripple mic-ripple-1"></div>
          <button className="mic-btn">
            <svg viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
          </button>
        </div>
        <p style={{color:'var(--accent-main)', fontSize:'14px'}}>按住说话</p>
      </div>

      <div style={{display:'flex', justifyContent:'center', marginTop:'auto', marginBottom:'40px'}}>
        <button className="btn btn-primary" onClick={() => setActiveScreen('result')} style={{width:'80%'}}>生成新生档案</button>
      </div>
    </div>
  );

  // --- 5. Result View ---
  const renderResultView = () => (
    <div className="detail-view-container view-animate" style={{flex:1}}>
      <div className="top-bar-shared">
        <button className="back-btn" onClick={() => setActiveScreen('capture')}>
          <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div className="top-bar-title">
          <h1>它适合这样继续存在</h1>
        </div>
        <div style={{width:'40px'}} />
      </div>

      <div className="gen-card" style={{padding:'32px', marginBottom:'24px', flexShrink:0}}>
        <div style={{flex:1}}>
          <h2 style={{color:'#1a1c15', fontSize:'22px', fontWeight:800, marginBottom:'12px'}}>夏日小坐标</h2>
          <div style={{width:'24px', height:'2px', background:'#8c9576', marginBottom:'12px'}} />
          <p style={{color:'#4a503e', fontSize:'12px', lineHeight:1.6}}>2024/06/18<br/>考完试后的那杯奶茶</p>
        </div>
        <div className="simulated-bag">
          <div className="bag-tape" />
          <div style={{color:'#314834', fontSize:'24px', fontWeight:900, fontStyle:'italic'}}>1點點</div>
        </div>
      </div>

      <div className="info-card">
        <div className="info-icon"><Icons.Message /></div>
        <div style={{color:'#e8eae1', fontSize:'14px', lineHeight:1.6}}><span style={{color:'var(--text-muted)'}}>故事摘要：</span>考完试后的那杯奶茶，留下的是一起松一口气的夏天。</div>
      </div>

      <div style={{display:'flex', gap:'16px', margin:'24px 0'}}>
        <button className="btn btn-secondary" onClick={() => setActiveScreen('gallery')} style={{flex:1}}>保存到展馆</button>
        <button className="btn btn-primary" onClick={() => setActiveScreen('publish')} style={{flex:1}}>发布到广场</button>
      </div>
    </div>
  );

  // --- 6. Publish View ---
  const renderPublishView = () => (
    <div className="detail-view-container view-animate" style={{flex:1}}>
      <div className="top-bar-shared">
        <button className="back-btn" onClick={() => setActiveScreen('result')}>
          <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div className="top-bar-title"><h1>发布作品</h1></div>
        <div style={{width:'40px'}} />
      </div>

      <div style={{background:'rgba(255,255,255,0.03)', borderRadius:'20px', padding:'20px'}}>
         <h3 style={{color:'#fff', fontSize:'15px', marginBottom:'12px'}}>标题</h3>
         <input type="text" style={{width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', padding:'16px', borderRadius:'12px', fontSize:'15px'}} defaultValue="一只奶茶袋留下的夏天"/>
      </div>

      <div style={{display:'flex', gap:'16px', margin:'24px 0'}}>
        <button className="btn btn-primary" onClick={() => setActiveScreen('square')} style={{flex:1}}>发布</button>
      </div>
    </div>
  );

  // --- 7. Square View (Waterfall Grid) ---
  const renderSquareView = () => {
    const leftColItems = SQUARE_ITEMS.filter((_, idx) => idx % 2 === 0);
    const rightColItems = SQUARE_ITEMS.filter((_, idx) => idx % 2 !== 0);

    const renderCard = (item: any) => (
      <div className="square-card" key={item.id} onClick={() => setActiveScreen('gallery')}>
        <div className="square-card-img" style={{ background: item.color, aspectRatio: item.ratio }}>
           <span style={{opacity:0.5}}>{item.category}图</span>
        </div>
        <div style={{padding:'16px'}}>
          <div style={{color:'var(--accent-main)', fontSize:'12px', fontWeight:600, marginBottom:'8px'}}>{item.category}</div>
          <div style={{color:'#fff', fontSize:'14px', marginBottom:'12px'}}>{item.title}</div>
          <div style={{color:'#8c937c', fontSize:'12px'}}>❤ {item.likes}</div>
        </div>
      </div>
    );

    return (
      <div className="detail-view-container view-animate" style={{flex:1}}>
        <div style={{marginBottom:'24px'}}>
          <h1 style={{fontSize:'28px', color:'#fff', fontWeight:600}}>广场</h1>
          <p style={{color:'var(--text-muted)', fontSize:'14px', marginTop:'4px'}}>看看别人留下的旧物故事</p>
        </div>
        <div className="square-grid">
          <div className="grid-col">{leftColItems.map(renderCard)}</div>
          <div className="grid-col">{rightColItems.map(renderCard)}</div>
        </div>
      </div>
    );
  };

  // --- 8. Profile View ---
  const renderProfileView = () => (
    <div className="detail-view-container view-animate" style={{flex:1}}>
      <div style={{display:'flex', alignItems:'center', gap:'20px', marginBottom:'32px'}}>
        <div style={{width:'80px', height:'80px', borderRadius:'50%', background:'#1a1612', display:'flex', justifyContent:'center', alignItems:'center', fontSize:'36px', border:'2px solid rgba(255,255,255,0.1)'}}>🐻</div>
        <div>
          <h1 style={{fontSize:'24px', color:'#fff', fontWeight:600, margin:'0 0 8px 0'}}>旧物收藏家</h1>
          <div style={{color:'var(--text-muted)', fontSize:'13px'}}><span style={{color:'var(--accent-main)', fontWeight:600}}>18</span> 件藏品 · <span style={{color:'var(--accent-main)', fontWeight:600}}>9</span> 个成果</div>
        </div>
      </div>
      <div style={{background:'var(--card-bg)', borderRadius:'24px', padding:'24px', border:'1px solid var(--card-border)'}}>
        <h2 style={{color:'#fff', fontSize:'20px', marginBottom:'20px'}}>4月</h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'16px', textAlign:'center', color:'#8c937c', fontSize:'14px'}}>
           <div>日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div>
           <div/><div/><div/><div/><div style={{color:'#fff'}}>1</div><div style={{color:'#fff'}}>2</div><div style={{color:'#fff'}}>3</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="remuse-wrapper">
      <style>{styles}</style>
      
      <div className="app-container">
        <main className="scroll-content">
          {activeScreen === 'home' && renderHomeView()}
          {activeScreen === 'gallery' && renderLuminousCity()}
          {activeScreen === 'capture' && renderCaptureView()}
          {activeScreen === 'result' && renderResultView()}
          {activeScreen === 'publish' && renderPublishView()}
          {activeScreen === 'square' && renderSquareView()}
          {activeScreen === 'profile' && renderProfileView()}
        </main>
        
        {/* Fullscreen Mobile Overlay triggered from Gallery */}
        {selectedWork && renderWorkDetailOverlay()}

        <nav className="bottom-nav">
          <button className={`nav-item ${activeScreen === 'home' ? 'active' : ''}`} onClick={() => setActiveScreen('home')}>
            <svg viewBox="0 0 24 24" fill={activeScreen === 'home' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={activeScreen === 'home' ? 0 : 2}><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
            <span>首页</span>
          </button>
          <button className={`nav-item ${activeScreen === 'gallery' ? 'active' : ''}`} onClick={() => setActiveScreen('gallery')}>
            <svg viewBox="0 0 24 24" fill={activeScreen === 'gallery' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={activeScreen === 'gallery' ? 0 : 2}><path d="M3 21h18M5 21V9M19 21V9M9 21v-5a3 3 0 0 1 6 0v5M2 9l10-5 10 5Z" /></svg>
            <span>展馆</span>
          </button>
          <button className={`nav-item ${activeScreen === 'square' ? 'active' : ''}`} onClick={() => setActiveScreen('square')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="9" /><line x1="5.6" y1="5.6" x2="18.4" y2="18.4" /><circle cx="8" cy="8" r="2.5" fill={activeScreen === 'square' ? 'currentColor' : 'none'} stroke="none" /></svg>
            <span>广场</span>
          </button>
          <button className={`nav-item ${activeScreen === 'profile' ? 'active' : ''}`} onClick={() => setActiveScreen('profile')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            <span>我的</span>
          </button>
        </nav>
      </div>
    </div>
  );
}