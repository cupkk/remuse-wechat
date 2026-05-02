import React, { useState } from 'react';

const styles = `
  :root {
    /* Colors - Refined for a premium, organic dark mode */
    --bg-base: #0b0c0a;
    --bg-gradient-top: #12140f;
    --bg-gradient-bottom: #050604;
    
    --accent-main: #dcee88; /* Soft neon yellow-green */
    --accent-green: #97c978; 
    --accent-olive: #b3c462;
    --accent-glow: rgba(220, 238, 136, 0.12);
    --accent-glow-strong: rgba(220, 238, 136, 0.25);
    
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

  /* Reset & Global wrapper for isolation */
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
    background: linear-gradient(180deg, var(--bg-gradient-top) 0%, var(--bg-base) 35%, var(--bg-gradient-bottom) 100%);
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    box-shadow: 0 0 50px rgba(0,0,0,0.9);
  }

  /* --- Scrollable Content Area --- */
  .scroll-content {
    flex: 1;
    overflow-y: auto;
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

  /* =========================================
     1. Home View Styles
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
    background: radial-gradient(circle, var(--accent-glow) 0%, transparent 65%);
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
  
  .main-image:active {
    transform: scale(0.98);
  }

  /* Refined Pedestal - Diffuse shadow instead of harsh 3D cylinder */
  .pedestal {
    width: 220px;
    height: 24px;
    background: var(--accent-glow-strong);
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

  .item-details h2 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 14px;
    letter-spacing: 1px;
    color: #fff;
  }

  .item-details .quote {
    font-size: 15px;
    color: #d8dbcf;
    margin-bottom: 14px;
    letter-spacing: 0.5px;
    line-height: 1.5;
  }

  .item-details .context {
    font-size: 12px;
    color: var(--text-muted);
    letter-spacing: 0.5px;
  }

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

  .btn {
    flex: 1;
    height: 56px;
    border-radius: var(--radius-md);
    font-size: 16px;
    font-weight: 500;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
    outline: none;
    -webkit-tap-highlight-color: transparent;
  }

  .btn:active, .capture-card:active {
    transform: scale(0.96);
  }

  .btn-primary {
    background: linear-gradient(135deg, #e1f096 0%, #c4d47a 100%);
    color: var(--text-dark);
    border: none;
    box-shadow: 0 8px 24px var(--accent-glow);
    position: relative;
  }

  /* Folded corner made more subtle */
  .btn-primary::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 0 16px 16px;
    border-color: transparent transparent #fbfee8 #fbfee8;
    border-bottom-right-radius: var(--radius-md);
    box-shadow: -2px -2px 6px rgba(0,0,0,0.05);
  }

  .btn-secondary {
    background-color: var(--card-bg);
    color: #d1d6c4;
    border: 1px solid var(--btn-border);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
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
    -webkit-backdrop-filter: blur(20px);
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
    box-shadow: 0 4px 16px var(--accent-glow-strong);
  }

  .capture-icon svg {
    width: 26px;
    height: 26px;
    fill: none;
    stroke: var(--text-dark);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .capture-text {
    flex: 1;
    text-align: left;
  }

  .capture-text h3 {
    font-size: 17px;
    color: var(--text-primary);
    font-weight: 500;
    margin: 0 0 6px 0;
    letter-spacing: 0.5px;
  }

  .capture-text p {
    font-size: 13px;
    color: var(--text-muted);
    margin: 0;
  }

  .capture-arrow {
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0.3;
  }

  .capture-arrow svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: #fff;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* =========================================
     2. Gallery View Styles
     ========================================= */
  .gallery-view {
    padding: 28px 24px;
    display: flex;
    flex-direction: column;
  }

  .gallery-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
  }

  .gallery-title h1 {
    font-size: 28px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 8px 0;
    letter-spacing: 1px;
  }

  .gallery-title p {
    font-size: 14px;
    color: var(--text-muted);
    margin: 0;
    letter-spacing: 0.5px;
  }

  .plant-btn {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background-color: var(--card-bg);
    border: 1px solid var(--card-border);
    backdrop-filter: blur(12px);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: transform 0.2s ease, background-color 0.2s ease;
  }
  
  .plant-btn:active {
    transform: scale(0.9);
    background-color: rgba(255,255,255,0.08);
  }

  .plant-btn svg {
    width: 22px;
    height: 22px;
    stroke: var(--accent-olive);
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .gallery-stats {
    font-size: 15px;
    color: var(--text-muted);
    margin-bottom: 28px;
    font-weight: 500;
    background: var(--card-bg);
    padding: 14px 20px;
    border-radius: 16px;
    border: 1px solid var(--card-border);
    display: inline-flex;
    align-self: flex-start;
    backdrop-filter: blur(12px);
  }

  .gallery-stats .num {
    font-size: 20px;
    color: var(--accent-main);
    font-weight: 600;
    margin: 0 6px;
  }

  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .grid-card {
    background-color: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-lg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--card-border);
    cursor: pointer;
    transition: transform 0.2s ease;
    -webkit-tap-highlight-color: transparent;
    box-shadow: 0 12px 32px rgba(0,0,0,0.15);
  }

  .grid-card:active {
    transform: scale(0.96);
  }

  .grid-card-img {
    width: 100%;
    aspect-ratio: 4 / 3;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgba(255,255,255,0.2);
    font-size: 13px;
    overflow: hidden;
  }
  
  .grid-card-info {
    padding: 16px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .grid-card-title {
    font-size: 14px;
    color: #f5f6f1;
    font-weight: 500;
    letter-spacing: 0.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 55%;
  }

  .status-tag {
    font-size: 11px;
    padding: 6px 10px;
    border-radius: 12px;
    font-weight: 500;
    white-space: nowrap;
  }

  .tag-story { color: #b1c48c; background-color: rgba(177, 196, 140, 0.12); }
  .tag-sticker { color: #8bbdc7; background-color: rgba(139, 189, 199, 0.12); }
  .tag-exchange { color: #8cbdb2; background-color: rgba(140, 189, 178, 0.12); }

  /* =========================================
     3. Capture Detail View Styles
     ========================================= */
  .capture-detail-view {
    display: flex;
    flex-direction: column;
    padding: 24px 24px 0;
  }

  .capture-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    position: relative;
  }

  .capture-top-bar .titles {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .capture-top-bar h1 {
    font-size: 18px;
    color: #fff;
    font-weight: 500;
    margin: 0 0 4px 0;
    letter-spacing: 1px;
  }

  .capture-top-bar p {
    font-size: 12px;
    color: var(--text-muted);
    margin: 0;
  }

  .capture-controls {
    margin-left: auto;
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
    position: relative;
    overflow: hidden;
  }

  .photo-preview-placeholder {
    color: rgba(0,0,0,0.35);
    font-size: 15px;
    text-align: center;
    line-height: 1.6;
    font-weight: 500;
  }

  .recognition-info {
    margin-bottom: 40px;
    text-align: center;
  }

  .recognition-info h3 {
    font-size: 17px;
    font-weight: 400;
    color: var(--text-muted);
    margin: 0 0 12px 0;
  }

  .recognition-info h3 span {
    color: var(--accent-main);
    font-weight: 500;
    padding: 4px 10px;
    background: rgba(220, 238, 136, 0.1);
    border-radius: 10px;
    margin-left: 6px;
  }

  .recognition-info p {
    font-size: 15px;
    color: #8c937c;
    margin: 0;
  }

  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
    border: none;
    margin: 0 0 40px 0;
    width: 100%;
  }

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
  
  .mic-btn:active {
    transform: scale(0.85);
  }

  .mic-btn svg {
    width: 28px;
    height: 28px;
    fill: none;
    stroke: var(--accent-main);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .mic-ripple {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(220, 238, 136, 0.2);
    z-index: 1;
    animation: ripple 2.5s infinite cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .mic-ripple-2 { animation-delay: 1.2s; }

  .voice-input-area > p {
    color: var(--accent-main);
    font-size: 14px;
    margin: 0;
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  .suggestion-chips {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 40px;
  }

  .chip {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 20px;
    padding: 10px 18px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #c4cbb4;
    font-size: 13px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: all 0.2s ease;
    backdrop-filter: blur(8px);
  }
  
  .chip:active {
    background: rgba(255,255,255,0.08);
    color: #fff;
  }

  .chip svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .draft-card-container {
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    padding: 24px;
    margin-bottom: 20px;
    border: 1px solid var(--card-border);
    backdrop-filter: blur(16px);
  }

  .draft-header {
    color: var(--text-muted);
    font-size: 13px;
    margin-bottom: 16px;
    font-weight: 500;
  }

  .draft-content {
    color: #fff;
    font-size: 16px;
    line-height: 1.6;
    margin-bottom: 28px;
  }

  .draft-actions {
    display: flex;
    gap: 16px;
  }

  .draft-btn {
    flex: 1;
    height: 48px;
    border-radius: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 15px;
    cursor: pointer;
    border: none;
    gap: 8px;
    font-weight: 500;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.15s ease;
  }

  .draft-btn:active {
    transform: scale(0.96);
  }

  .draft-btn-edit {
    background: rgba(255,255,255,0.04);
    color: #c2c9b2;
    border: 1px solid rgba(255,255,255,0.08);
  }

  .draft-btn-edit svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .draft-btn-continue {
    background: #506135;
    color: var(--accent-main);
  }

  /* =========================================
     4. Result View Styles
     ========================================= */
  .result-view {
    display: flex;
    flex-direction: column;
    padding: 24px 24px 0;
  }

  .result-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    position: relative;
    min-height: 36px;
  }

  .back-btn {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    padding: 10px;
    border-radius: 50%;
    cursor: pointer;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    backdrop-filter: blur(12px);
    transition: background 0.2s ease;
  }
  
  .back-btn:active {
    background: rgba(255,255,255,0.08);
  }
  
  .back-btn svg {
    width: 20px;
    height: 20px;
    stroke: currentColor;
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .result-top-title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 16px;
    color: var(--accent-main);
    font-weight: 500;
    letter-spacing: 0.5px;
    z-index: 1;
  }

  .result-heading {
    text-align: center;
    font-size: 26px;
    font-weight: 600;
    color: var(--accent-main);
    margin: 16px 0 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .result-heading svg {
    width: 22px;
    height: 22px;
    fill: var(--accent-main);
  }

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

  /* Subtle noise texture on paper */
  .gen-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
  }

  .gen-card-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 2;
  }

  .gen-logo {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 48px;
  }

  .gen-logo svg {
    width: 18px;
    height: 18px;
    fill: #616a4c;
    margin-top: 2px;
  }

  .gen-logo-text {
    color: #616a4c;
    font-size: 12px;
    line-height: 1.4;
    margin-left: 4px;
  }
  
  .gen-logo-text strong {
    font-weight: 700;
    font-size: 14px;
    display: block;
  }

  .gen-title {
    color: #1a1c15;
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 16px 0;
    letter-spacing: 0.5px;
  }

  .gen-divider {
    width: 32px;
    height: 2px;
    background-color: #8c9576;
    margin-bottom: 16px;
    border-radius: 1px;
  }

  .gen-desc {
    color: #4a503e;
    font-size: 13px;
    line-height: 1.6;
    margin: 0;
    font-weight: 500;
  }

  .gen-leaf-decor {
    margin-top: auto;
    padding-top: 24px;
  }

  .gen-leaf-decor svg {
    width: 60px;
    height: auto;
    fill: #c9ceba;
  }

  .gen-card-right {
    width: 140px;
    margin-left: 20px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;
  }

  .simulated-bag {
    width: 100%;
    height: 100%;
    min-height: 200px;
    background-color: #dfd8c7;
    border-radius: 6px;
    box-shadow: 
      inset -6px 0 16px rgba(0,0,0,0.06),
      inset 6px 0 16px rgba(255,255,255,0.5),
      8px 12px 24px rgba(0,0,0,0.15);
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px;
    text-align: center;
    background-image: linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px);
    background-size: 10px 10px;
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
    z-index: 10;
  }

  .bag-logo {
    color: #314834;
    font-size: 34px;
    font-weight: 900;
    font-style: italic;
    margin-bottom: 8px;
    display: flex;
    align-items: baseline;
    justify-content: center;
  }
  
  .bag-logo span {
    font-size: 14px;
    font-style: normal;
    margin-left: 2px;
  }

  .bag-text {
    font-size: 10px;
    color: #314834;
    margin-bottom: 32px;
    font-weight: 600;
  }
  
  .bag-url {
    font-size: 8px;
    color: rgba(49, 72, 52, 0.6);
    margin-top: auto;
    font-weight: 500;
  }

  .info-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 40px;
  }

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
  }

  .info-card-clickable {
    cursor: pointer;
    align-items: center;
    transition: transform 0.2s ease, background 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }
  
  .info-card-clickable:active {
    transform: scale(0.97);
    background: rgba(40, 46, 34, 0.8);
  }

  .info-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 2px;
  }

  .info-card-clickable .info-icon {
    margin-top: 0;
  }

  .info-icon svg {
    width: 20px;
    height: 20px;
    stroke: var(--accent-main);
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .info-content {
    flex: 1;
    font-size: 15px;
    line-height: 1.6;
    color: #e8eae1;
  }

  .info-label {
    color: var(--text-muted);
    font-weight: 500;
  }

  .info-arrow {
    width: 20px;
    height: 20px;
    opacity: 0.4;
  }
  
  .info-arrow svg {
    width: 100%;
    height: 100%;
    stroke: #fff;
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .result-actions {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
  }

  .action-btn {
    flex: 1;
    height: 56px;
    border-radius: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
  
  .action-btn:active {
    transform: scale(0.96);
  }

  .action-btn svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .btn-outline {
    background: rgba(220, 238, 136, 0.05);
    border: 1px solid rgba(220, 238, 136, 0.25);
    color: var(--accent-main);
  }

  .btn-outline svg {
    stroke: currentColor;
  }

  .btn-solid {
    background: linear-gradient(135deg, #263a33, #16221e);
    border: 1px solid #324e43;
    color: #cce2d8;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  }

  .btn-solid svg {
    stroke: currentColor;
  }

  /* =========================================
     5. Square View Styles (Masonry)
     ========================================= */
  .square-view {
    display: flex;
    flex-direction: column;
    padding-top: 32px;
    position: relative;
    min-height: 100%;
  }

  .square-header {
    padding: 0 24px;
    margin-bottom: 32px;
  }

  .square-header h1 {
    font-size: 28px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 10px 0;
    letter-spacing: 1px;
  }

  .square-header p {
    font-size: 14px;
    color: var(--text-muted);
    margin: 0;
    letter-spacing: 0.5px;
  }

  .square-tabs {
    display: flex;
    gap: 32px;
    padding: 0 24px;
    margin-bottom: 24px;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }
  .square-tabs::-webkit-scrollbar {
    display: none;
  }

  .square-tab {
    background: none;
    border: none;
    font-size: 16px;
    color: var(--text-muted);
    padding: 0 0 10px 0;
    position: relative;
    cursor: pointer;
    white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
    transition: color 0.2s ease;
    font-weight: 500;
  }

  .square-tab.active {
    color: var(--accent-green);
    font-weight: 600;
  }

  .square-tab.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 24px;
    height: 3px;
    background-color: var(--accent-green);
    border-radius: 2px;
  }

  .square-grid {
    display: flex;
    gap: 16px;
    padding: 0 24px;
    align-items: flex-start;
  }

  .grid-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex: 1;
  }

  .square-card {
    background-color: rgba(255,255,255,0.02);
    border-radius: var(--radius-lg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--card-border);
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    -webkit-tap-highlight-color: transparent;
    box-shadow: 0 12px 32px rgba(0,0,0,0.15);
  }

  .square-card:active {
    transform: scale(0.96);
    background-color: rgba(255,255,255,0.04);
  }

  .square-card-img {
    width: 100%;
    background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(0,0,0,0.2));
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgba(255,255,255,0.3);
    font-size: 13px;
    position: relative;
  }

  .square-card-info {
    padding: 16px;
    display: flex;
    flex-direction: column;
  }

  .square-card-category {
    font-size: 12px;
    color: var(--accent-green);
    margin-bottom: 8px;
    font-weight: 600;
  }

  .square-card-title {
    font-size: 14px;
    color: #f5f6f1;
    font-weight: 500;
    line-height: 1.5;
    margin: 0 0 16px 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .square-card-likes {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #8c937c;
    margin-top: auto;
    font-weight: 500;
  }

  .square-card-likes svg {
    width: 14px;
    height: 14px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .fab-btn {
    position: fixed;
    bottom: calc(var(--nav-height) + 24px);
    right: 24px;
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #a2d282, #74a45a);
    border-radius: 50%;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 12px 32px rgba(131, 179, 105, 0.4);
    cursor: pointer;
    z-index: 50;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .fab-btn:active {
    transform: scale(0.85);
  }

  .fab-btn svg {
    width: 32px;
    height: 32px;
    stroke: #12160d;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* =========================================
     6. Post Detail View Styles
     ========================================= */
  .post-detail-view {
    display: flex;
    flex-direction: column;
    padding: 16px 24px;
  }

  .detail-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .detail-top-btn {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    color: #fff;
    padding: 10px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(12px);
    transition: background 0.2s ease;
  }
  
  .detail-top-btn:active {
    background: rgba(255,255,255,0.08);
  }

  .detail-top-btn svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .detail-hero-img {
    width: 100%;
    aspect-ratio: 16 / 12;
    background: linear-gradient(145deg, #e4e0d9, #cbc6be);
    border-radius: 24px;
    margin-bottom: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    box-shadow: inset 0 0 40px rgba(0,0,0,0.05), 0 20px 40px rgba(0,0,0,0.25);
    overflow: hidden;
  }

  .sticker-placeholder {
    width: 75%;
    height: 55%;
    background-color: #f7f3e8;
    border-radius: 16px;
    border: 2px dashed rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: rgba(0,0,0,0.4);
    font-size: 15px;
    font-weight: 500;
    transform: rotate(-3deg);
    box-shadow: 8px 16px 32px rgba(0,0,0,0.15);
  }

  .detail-text-content {
    margin-bottom: 40px;
    padding: 0 4px;
  }

  .detail-title {
    font-size: 26px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 16px 0;
    line-height: 1.4;
    letter-spacing: 0.5px;
  }

  .detail-meta {
    font-size: 14px;
    color: var(--text-muted);
    margin: 0 0 24px 0;
    display: flex;
    align-items: center;
  }

  .detail-meta .highlight {
    color: var(--accent-olive);
    font-weight: 500;
    margin-left: 6px;
  }

  .detail-desc {
    font-size: 16px;
    color: #bac0af;
    line-height: 1.6;
    margin: 0;
  }

  .detail-stats {
    display: flex;
    gap: 36px;
    margin-bottom: 48px;
    padding: 0 4px;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #c9cebf;
    font-size: 16px;
    font-weight: 500;
  }

  .stat-item svg {
    width: 24px;
    height: 24px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .detail-actions {
    display: flex;
    gap: 16px;
    width: 100%;
  }

  .detail-btn {
    flex: 1;
    height: 56px;
    border-radius: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.2s ease, opacity 0.2s ease;
  }

  .detail-btn:active {
    transform: scale(0.96);
  }

  .detail-btn svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .detail-btn-primary {
    background: linear-gradient(135deg, #c4d47a, #a5b651);
    color: #1a2214;
    box-shadow: 0 8px 24px rgba(184, 200, 107, 0.25);
  }

  .detail-btn-secondary {
    background: var(--card-bg);
    border: 1px solid #436153;
    color: #8bbca5;
    backdrop-filter: blur(12px);
  }

  /* =========================================
     7. Publish View Styles
     ========================================= */
  .publish-view {
    display: flex;
    flex-direction: column;
    padding: 24px 24px 0;
  }

  .publish-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    position: relative;
  }

  .publish-top-bar .titles {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .publish-top-bar h1 {
    font-size: 20px;
    color: var(--text-primary);
    font-weight: 600;
    margin: 0 0 6px 0;
    letter-spacing: 1px;
  }

  .publish-top-bar p {
    font-size: 13px;
    color: var(--text-muted);
    margin: 0;
  }

  .publish-preview-img {
    width: 100%;
    aspect-ratio: 16 / 10;
    background: linear-gradient(145deg, #e0dccc, #c8c2ae);
    border-radius: 20px;
    margin-bottom: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    box-shadow: inset 0 0 30px rgba(0,0,0,0.08), 0 16px 32px rgba(0,0,0,0.2);
    overflow: hidden;
  }

  .nayuki-sticker {
    background: #fbfdf4;
    padding: 24px;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 4px 12px 32px rgba(0,0,0,0.15);
    transform: rotate(2deg);
    border: 3px solid #fff;
  }

  .nayuki-logo {
    background-color: #7ba64b;
    color: #fff;
    padding: 6px 12px;
    font-weight: 800;
    font-size: 15px;
    line-height: 1.2;
    text-align: center;
    margin-bottom: 10px;
    border-radius: 4px;
  }

  .nayuki-text {
    color: #7ba64b;
    font-size: 15px;
    font-weight: 900;
    letter-spacing: 3px;
  }

  .form-group {
    margin-bottom: 32px;
  }

  .form-label {
    display: block;
    font-size: 15px;
    color: #e8eae1;
    margin-bottom: 14px;
    font-weight: 600;
  }

  .form-input-container {
    display: flex;
    align-items: center;
    background-color: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 18px 20px;
    backdrop-filter: blur(16px);
    transition: border-color 0.2s ease, background-color 0.2s ease;
  }
  
  .form-input-container:focus-within {
    border-color: rgba(184, 200, 107, 0.5);
    background-color: rgba(255,255,255,0.05);
  }

  .form-input {
    flex: 1;
    background: transparent;
    border: none;
    color: #fff;
    font-size: 16px;
    outline: none;
  }

  .form-input::placeholder {
    color: #6a725c;
  }

  .form-char-count {
    color: #6a725c;
    font-size: 13px;
    margin-left: 16px;
    font-weight: 500;
  }

  .form-tags {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .form-tag-btn {
    padding: 10px 24px;
    border-radius: 12px;
    background-color: var(--card-bg);
    color: #a4aa96;
    border: 1px solid var(--card-border);
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
    backdrop-filter: blur(12px);
  }

  .form-tag-btn.active {
    background-color: var(--accent-olive);
    color: #1a2214;
    border-color: var(--accent-olive);
    box-shadow: 0 4px 16px rgba(184, 200, 107, 0.25);
  }

  .toggle-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
  }

  .toggle-label {
    font-size: 16px;
    color: #f5f6f1;
    font-weight: 500;
  }

  .toggle-switch {
    width: 52px;
    height: 30px;
    border-radius: 15px;
    background-color: rgba(255,255,255,0.15);
    position: relative;
    cursor: pointer;
    transition: background-color 0.3s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .toggle-switch.active {
    background-color: var(--accent-olive);
  }

  .toggle-knob {
    width: 26px;
    height: 26px;
    background-color: #fff;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }

  .toggle-switch.active .toggle-knob {
    transform: translateX(22px);
  }

  .publish-actions {
    display: flex;
    gap: 16px;
    margin-top: 20px;
  }

  .btn-publish {
    flex: 1;
    height: 56px;
    border-radius: 16px;
    background: linear-gradient(135deg, #c4d47a, #a5b651);
    color: #1a2214;
    font-size: 17px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: transform 0.2s ease;
    box-shadow: 0 8px 24px rgba(184, 200, 107, 0.3);
  }

  .btn-save-draft {
    flex: 1;
    height: 56px;
    border-radius: 16px;
    background-color: var(--card-bg);
    color: var(--accent-olive);
    font-size: 17px;
    font-weight: 600;
    border: 1px solid #485c3f;
    cursor: pointer;
    transition: transform 0.2s ease;
    backdrop-filter: blur(12px);
  }

  .btn-publish:active, .btn-save-draft:active {
    transform: scale(0.96);
  }

  /* =========================================
     8. Profile View Styles
     ========================================= */
  .profile-view {
    display: flex;
    flex-direction: column;
    padding: 32px 24px 20px;
    position: relative;
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 36px;
    position: relative;
  }

  .avatar {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3a332a, #1a1612);
    border: 2px solid rgba(255,255,255,0.06);
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 44px;
    box-shadow: 0 12px 32px rgba(0,0,0,0.4);
  }

  .profile-info {
    flex: 1;
  }

  .profile-name {
    font-size: 26px;
    font-weight: 600;
    margin: 0 0 10px 0;
    color: #fff;
    letter-spacing: 0.5px;
  }

  .profile-stats {
    font-size: 13px;
    color: #8b927a;
    font-weight: 500;
  }

  .profile-stats span {
    color: var(--accent-main);
    font-size: 15px;
    font-weight: 600;
    margin-right: 2px;
  }

  .fortune-tag {
    position: absolute;
    top: 0;
    right: 0;
    background: rgba(220, 238, 136, 0.1);
    color: var(--accent-main);
    padding: 8px 14px;
    border-radius: 20px;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    backdrop-filter: blur(12px);
    border: 1px solid rgba(220, 238, 136, 0.15);
  }

  .fortune-tag svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }

  /* Calendar Card */
  .calendar-card {
    background: var(--card-bg);
    border-radius: 24px;
    padding: 28px 24px;
    margin-bottom: 44px;
    border: 1px solid var(--card-border);
    backdrop-filter: blur(20px);
    box-shadow: 0 20px 48px rgba(0,0,0,0.25);
  }

  .cal-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
  }

  .cal-month {
    font-size: 22px;
    font-weight: 600;
    color: #fff;
  }

  .cal-nav {
    display: flex;
    align-items: center;
    gap: 14px;
    background: rgba(0,0,0,0.2);
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    color: #a3a992;
    border: 1px solid rgba(255,255,255,0.04);
  }

  .cal-nav svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    fill: none;
    stroke-width: 2.5;
    cursor: pointer;
    transition: color 0.2s ease;
  }
  
  .cal-nav svg:active {
    color: #fff;
  }

  .cal-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    row-gap: 20px;
    text-align: center;
  }

  .cal-day-header {
    color: #636b56;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 12px;
  }

  .cal-cell {
    position: relative;
    height: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 15px;
    color: #e0e2d8;
    font-weight: 500;
  }

  .cal-cell.empty {
    pointer-events: none;
  }

  .cal-cell.highlight {
    background: rgba(184, 200, 107, 0.15); 
    border-radius: 12px;
    color: var(--accent-main);
    box-shadow: 0 0 20px rgba(184, 200, 107, 0.2);
  }

  .cal-marker {
    position: absolute;
    top: -18px;
    font-size: 16px;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
  }

  /* Profile Gallery Section */
  .section-title {
    text-align: center;
    color: var(--accent-main);
    font-size: 18px;
    margin-bottom: 24px;
    font-weight: 600;
    letter-spacing: 1px;
  }

  .profile-tabs {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }

  .profile-tab {
    padding: 10px 24px;
    border-radius: 20px;
    background: var(--card-bg);
    color: #8b927a;
    border: 1px solid var(--card-border);
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: all 0.2s ease;
    backdrop-filter: blur(12px);
  }

  .profile-tab.active {
    background: transparent;
    border-color: var(--accent-main);
    color: #e0e2d8;
  }

  .profile-gallery {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .profile-card {
    aspect-ratio: 4 / 3;
    border-radius: 16px;
    background-color: #2a2e26;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgba(255,255,255,0.3);
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 12px 32px rgba(0,0,0,0.2);
    border: 1px solid rgba(255,255,255,0.04);
  }

  .pin-tag {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    padding: 6px 10px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 500;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid rgba(255,255,255,0.1);
  }

  .pin-tag svg {
    width: 12px;
    height: 12px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
  }

  /* =========================================
     Bottom Navigation
     ========================================= */
  .bottom-nav {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: var(--nav-height);
    padding-bottom: var(--safe-area-bottom);
    background-color: rgba(6, 8, 5, 0.75);
    border-top: 1px solid rgba(255, 255, 255, 0.04);
    display: flex;
    justify-content: space-around;
    align-items: center;
    z-index: 100;
    backdrop-filter: blur(24px) saturate(150%);
    -webkit-backdrop-filter: blur(24px) saturate(150%);
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: #6a7258;
    width: 64px;
    height: 100%;
    transition: color 0.2s ease, transform 0.15s ease;
    cursor: pointer;
    border: none;
    background: none;
    -webkit-tap-highlight-color: transparent;
  }
  
  .nav-item:active {
    transform: scale(0.9);
  }

  .nav-item svg {
    width: 24px;
    height: 24px;
    margin-bottom: 6px;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: stroke-width 0.2s ease;
  }
  
  .nav-item span {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  .nav-item.active {
    color: var(--accent-main);
  }
`;

// --- Mock Data ---
interface GalleryItem {
  id: string;
  name: string;
  status: string;
  statusType: 'story' | 'sticker' | 'exchange';
  bgColor: string;
}

const galleryItems: GalleryItem[] = [
  { id: '1', name: '火车票根', status: '已写故事', statusType: 'story', bgColor: 'linear-gradient(135deg, rgba(227,223,214,0.1), rgba(197,194,186,0.1))' },
  { id: '2', name: '奶茶袋', status: '已生成贴纸', statusType: 'sticker', bgColor: 'linear-gradient(135deg, rgba(214,184,139,0.1), rgba(189,162,122,0.1))' },
  { id: '3', name: '小狗玩偶', status: '已写故事', statusType: 'story', bgColor: 'linear-gradient(135deg, rgba(197,202,208,0.1), rgba(172,177,183,0.1))' },
  { id: '4', name: '香水瓶', status: '已写故事', statusType: 'story', bgColor: 'linear-gradient(135deg, rgba(226,223,216,0.1), rgba(197,195,188,0.1))' },
  { id: '5', name: '徽章', status: '可交换', statusType: 'exchange', bgColor: 'linear-gradient(135deg, rgba(209,206,193,0.1), rgba(181,179,166,0.1))' },
  { id: '6', name: '电影票根', status: '已写故事', statusType: 'story', bgColor: 'linear-gradient(135deg, rgba(232,230,223,0.1), rgba(204,203,197,0.1))' }
];

interface SquareItem {
  id: string;
  category: string;
  title: string;
  likes: number;
  bgColor: string;
  aspectRatio: string;
}

const squareItems: SquareItem[] = [
  { id: '1', category: '贴纸', title: '一张票根做成了春天贴纸', likes: 128, bgColor: 'linear-gradient(135deg, rgba(227,223,211,0.1), rgba(197,194,183,0.1))', aspectRatio: '1 / 1.15' },
  { id: '2', category: '卡片', title: '空瓶也有记忆', likes: 96, bgColor: 'linear-gradient(135deg, rgba(216,213,212,0.1), rgba(188,185,185,0.1))', aspectRatio: '1 / 1.02' },
  { id: '3', category: '玩偶', title: '陪伴了我十年的小狗', likes: 87, bgColor: 'linear-gradient(135deg, rgba(222,200,169,0.1), rgba(194,176,147,0.1))', aspectRatio: '1 / 1.1' },
  { id: '4', category: '拼豆', title: '用旧包装拼了个小挂件', likes: 74, bgColor: 'linear-gradient(135deg, rgba(215,216,198,0.1), rgba(188,188,173,0.1))', aspectRatio: '1 / 0.95' },
];

type ScreenType = 'home' | 'gallery' | 'square' | 'profile' | 'capture' | 'result' | 'post-detail' | 'publish';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>('home');
  const [allowSameStyle, setAllowSameStyle] = useState(true);
  const [allowExchange, setAllowExchange] = useState(true);

  const getNavActiveTab = () => {
    if (['capture', 'result', 'post-detail', 'publish'].includes(activeScreen)) return 'home';
    return activeScreen;
  };

  const handleNavClick = (tab: ScreenType) => {
    setActiveScreen(tab);
  };

  // --- 1. Home View ---
  const renderHomeView = () => (
    <div className="view-animate">
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
      <div className="ambient-glow"></div>
      <div className="showcase">
        <div className="main-image">
          <span>图片占位区域</span>
          <span style={{ fontSize: '11px', marginTop: '6px', opacity: 0.8 }}>(原图为奶茶袋)</span>
        </div>
        <div className="pedestal"></div>
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
            <svg viewBox="0 0 24 24">
              <rect x="3" y="6" width="18" height="14" rx="2" ry="2" />
              <circle cx="12" cy="13" r="4" />
              <line x1="7" y1="9" x2="9" y2="9" />
            </svg>
          </div>
          <div className="capture-text">
            <h3>拍下今天的物品</h3>
            <p>一张照片，一段故事。</p>
          </div>
          <div className="capture-arrow">
            <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
        </div>
      </div>
    </div>
  );

  // --- 2. Gallery View ---
  const renderGalleryView = () => (
    <div className="gallery-view view-animate">
      <header className="gallery-header">
        <div className="gallery-title">
          <h1>我的记忆馆</h1>
          <p>保存过的旧物都在这里</p>
        </div>
        <button className="plant-btn" onClick={() => console.log('Plant icon clicked')}>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21v-7" />
            <path d="M12 14c-3 0-5-1.5-5-4 2 0 5 2 5 4z" />
            <path d="M12 14c3 0 5-1.5 5-4-2 0-5 2-5 4z" />
          </svg>
        </button>
      </header>
      <div className="gallery-stats">
        <span className="num">18</span> 件藏品 <span style={{margin: '0 4px', opacity: 0.3}}>|</span> <span className="num">9</span> 个成果
      </div>
      <div className="gallery-grid">
        {galleryItems.map((item) => (
          <div className="grid-card" key={item.id} onClick={() => console.log(`Card clicked: ${item.name}`)}>
            <div className="grid-card-img" style={{ background: item.bgColor }}>
              <span style={{opacity: 0.6}}>{item.name}图</span>
            </div>
            <div className="grid-card-info">
              <span className="grid-card-title">{item.name}</span>
              <span className={`status-tag tag-${item.statusType}`}>{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // --- 3. Capture View ---
  const renderCaptureView = () => (
    <div className="capture-detail-view view-animate">
      <div className="capture-top-bar">
        <button className="back-btn" onClick={() => setActiveScreen('home')} style={{position: 'absolute', left: 0, zIndex: 10, background:'var(--card-bg)', border:'1px solid var(--card-border)', backdropFilter:'blur(12px)', borderRadius:'50%', padding:'10px'}}>
          <svg viewBox="0 0 24 24" style={{width:'20px', height:'20px', stroke:'#fff', fill:'none', strokeWidth:'2.5', strokeLinecap:'round', strokeLinejoin:'round'}}><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div className="titles">
          <h1>拍下旧物</h1>
          <p>说说它为什么值得留下</p>
        </div>
        <div className="capture-controls">
          <svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/></svg>
          <div className="control-div"></div>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/></svg>
        </div>
      </div>

      <div className="photo-preview-container">
        <div className="photo-preview-placeholder">
          <div>古茗奶茶袋照片</div>
          <div style={{fontSize: '12px', marginTop: '6px', opacity: 0.6, fontWeight: 400}}>(真实 DOM 模拟层)</div>
        </div>
      </div>

      <div className="recognition-info">
        <h3>识别为：<span>奶茶袋</span></h3>
        <p>要不要说说它的故事？</p>
      </div>

      <hr className="divider" />

      <div className="voice-input-area">
        <div className="mic-btn-wrapper">
          <div className="mic-ripple mic-ripple-2"></div>
          <div className="mic-ripple mic-ripple-1"></div>
          <button className="mic-btn" onClick={() => console.log('Hold to speak')}>
            <svg viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
          </button>
        </div>
        <p>按住说话</p>
      </div>

      <div className="suggestion-chips">
        <button className="chip"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>它属于谁？</button>
        <button className="chip"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>什么时候得到的？</button>
      </div>

      <div className="draft-card-container">
        <div className="draft-header">故事草稿</div>
        <div className="draft-content">去年夏天，和朋友刚考完试后买的那杯奶茶。</div>
        <div className="draft-actions">
          <button className="draft-btn draft-btn-edit"><svg viewBox="0 0 24 24"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>修改</button>
          <button className="draft-btn draft-btn-continue" onClick={() => setActiveScreen('result')}>继续</button>
        </div>
      </div>
    </div>
  );

  // --- 4. Result View ---
  const renderResultView = () => (
    <div className="result-view view-animate">
      <div className="result-top-bar">
        <button className="back-btn" onClick={() => setActiveScreen('capture')}>
          <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div className="result-top-title">remuse 再生博物馆</div>
        <div className="capture-controls">
          <svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>
          <div className="control-div"></div>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/></svg>
        </div>
      </div>

      <h1 className="result-heading">
        它适合这样继续存在 <svg viewBox="0 0 24 24"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" /></svg>
      </h1>

      <div className="gen-card">
        <div className="gen-card-left">
          <div className="gen-logo">
            <svg viewBox="0 0 24 24"><path d="M12 22V10M12 10C8 10 5 7 5 3M12 10C16 10 19 7 19 3" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round"/></svg>
            <div className="gen-logo-text"><strong>remuse</strong>再生博物馆</div>
          </div>
          <h2 className="gen-title">夏日小坐标</h2>
          <div className="gen-divider"></div>
          <p className="gen-desc">2024/06/18<br/>考完试后的那杯奶茶</p>
          <div className="gen-leaf-decor">
             <svg viewBox="0 0 100 40">
               <path d="M10,30 Q30,10 50,30 T90,20" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
               <ellipse cx="25" cy="15" rx="5" ry="2" transform="rotate(-30 25 15)" />
               <ellipse cx="40" cy="25" rx="6" ry="2" transform="rotate(20 40 25)" />
               <ellipse cx="65" cy="15" rx="5" ry="2" transform="rotate(-40 65 15)" />
               <ellipse cx="80" cy="25" rx="4" ry="1.5" transform="rotate(10 80 25)" />
             </svg>
          </div>
        </div>

        <div className="gen-card-right">
          <div className="simulated-bag">
            <div className="bag-tape"></div>
            <div className="bag-logo">1<span>點點</span></div>
            <div className="bag-text">奶茶在手 天生有戏</div>
            <div className="bag-url">www.alittle-tea.com</div>
          </div>
        </div>
      </div>

      <div className="info-list">
        <div className="info-card">
          <div className="info-icon"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10" /><line x1="9" y1="14" x2="11" y2="14" /></svg></div>
          <div className="info-content"><span className="info-label">故事摘要：</span>考完试后的那杯奶茶，留下的是一起松一口气的夏天。</div>
        </div>
        
        <div className="info-card">
          <div className="info-icon"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div>
          <div className="info-content"><span className="info-label">情绪回应：</span>它像那段轻松时刻的小坐标。</div>
        </div>

        <div className="info-card info-card-clickable" onClick={() => console.log('Generate sticker')}>
          <div className="info-icon"><svg viewBox="0 0 24 24"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg></div>
          <div className="info-content"><span className="info-label">推荐：</span>生成专属贴纸</div>
          <div className="info-arrow"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg></div>
        </div>
      </div>

      <div className="result-actions">
        <button className="action-btn btn-outline" onClick={() => setActiveScreen('gallery')}>
          <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>保存到展馆
        </button>
        <button className="action-btn btn-solid" onClick={() => setActiveScreen('publish')}>
          <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>发布到广场
        </button>
      </div>
    </div>
  );

  // --- 5. Square View ---
  const renderSquareView = () => {
    const leftColItems = squareItems.filter((_, index) => index % 2 === 0);
    const rightColItems = squareItems.filter((_, index) => index % 2 !== 0);

    const renderCard = (item: SquareItem) => (
      <div className="square-card" key={item.id} onClick={() => setActiveScreen('post-detail')}>
        <div className="square-card-img" style={{ background: item.bgColor, aspectRatio: item.aspectRatio }}>
          <span style={{opacity: 0.6}}>{item.category}图</span>
        </div>
        <div className="square-card-info">
          <span className="square-card-category">{item.category}</span>
          <h3 className="square-card-title">{item.title}</h3>
          <div className="square-card-likes">
            <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {item.likes} 喜欢
          </div>
        </div>
      </div>
    );

    return (
      <div className="square-view view-animate">
        <header className="square-header">
          <h1>广场</h1>
          <p>看看别人留下的旧物故事</p>
        </header>

        <div className="square-tabs">
          <button className="square-tab active">推荐</button>
          <button className="square-tab">贴纸</button>
          <button className="square-tab">卡片</button>
          <button className="square-tab">拼豆</button>
          <button className="square-tab">交换</button>
        </div>

        <div className="square-grid">
          <div className="grid-col">{leftColItems.map(renderCard)}</div>
          <div className="grid-col">{rightColItems.map(renderCard)}</div>
        </div>

        <button className="fab-btn" onClick={() => setActiveScreen('publish')}>
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
    );
  };

  // --- 6. Post Detail View ---
  const renderPostDetailView = () => (
    <div className="post-detail-view view-animate">
      <div className="detail-top-bar">
        <button className="detail-top-btn" onClick={() => setActiveScreen('square')}>
          <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <button className="detail-top-btn" onClick={() => console.log('More options')}>
          <svg viewBox="0 0 24 24" stroke="none" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
        </button>
      </div>

      <div className="detail-hero-img">
        <div className="sticker-placeholder">图片占位<br/><span style={{fontSize:'12px', opacity:0.7, fontWeight:400, marginTop:'4px'}}>(演唱会票根贴纸)</span></div>
      </div>

      <div className="detail-text-content">
        <h1 className="detail-title">一张票根做成了春天贴纸</h1>
        <p className="detail-meta">来自演唱会票根 · <span className="highlight">@旧物收藏家</span></p>
        <p className="detail-desc">这张票根是去年春天留下的，后来被做成了一张可以保存的贴纸。</p>
      </div>

      <div className="detail-stats">
        <div className="stat-item"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>128</div>
        <div className="stat-item"><svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>89</div>
        <div className="stat-item"><svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>26</div>
      </div>

      <div className="detail-actions">
        <button className="detail-btn detail-btn-primary" onClick={() => console.log('Create same style')}>
          <svg viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 4 13V4h9a7 7 0 0 1 7 7v9h-9Z"/><path d="M4 20L20 4"/></svg>一键同款
        </button>
        <button className="detail-btn detail-btn-secondary" onClick={() => console.log('Want to exchange')}>
          <svg viewBox="0 0 24 24"><path d="M17 2.1l4 4-4 4"/><path d="M3 12.2v-2a4 4 0 0 1 4-4h14"/><path d="M7 21.9l-4-4 4-4"/><path d="M21 11.8v2a4 4 0 0 1-4 4H3"/></svg>我想交换
        </button>
      </div>
    </div>
  );

  // --- 7. Publish View ---
  const renderPublishView = () => (
    <div className="publish-view view-animate">
      <div className="publish-top-bar">
        <button className="back-btn" style={{background:'var(--card-bg)', border:'1px solid var(--card-border)', padding:'10px', borderRadius:'50%', backdropFilter:'blur(12px)'}} onClick={() => setActiveScreen('result')}>
          <svg viewBox="0 0 24 24" style={{width:'20px', height:'20px', stroke:'#fff', fill:'none', strokeWidth:'2.5', strokeLinecap:'round', strokeLinejoin:'round'}}><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div className="titles">
          <h1>发布作品</h1>
          <p>把这件旧物的新生命放进广场</p>
        </div>
        <div className="capture-controls" style={{background:'var(--card-bg)', border:'1px solid var(--card-border)', padding:'8px 14px', borderRadius:'20px', backdropFilter:'blur(12px)'}}>
          <svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>
          <div className="control-div"></div>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/></svg>
        </div>
      </div>

      <div className="publish-preview-img">
        <div className="nayuki-sticker">
          <div className="nayuki-logo">奈雪<br/>的茶</div>
          <div className="nayuki-text">NAYUKI</div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">标题</label>
        <div className="form-input-container">
          <input type="text" className="form-input" placeholder="输入标题..." defaultValue="一只奶茶袋留下的夏天" />
          <span className="form-char-count">11/30</span>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">标签</label>
        <div className="form-tags">
          <button className="form-tag-btn active">贴纸</button>
          <button className="form-tag-btn">卡片</button>
          <button className="form-tag-btn">拼豆</button>
          <button className="form-tag-btn">交换</button>
        </div>
      </div>

      <div className="form-group">
        <div className="toggle-row">
          <span className="toggle-label">允许同款</span>
          <div className={`toggle-switch ${allowSameStyle ? 'active' : ''}`} onClick={() => setAllowSameStyle(!allowSameStyle)}>
            <div className="toggle-knob"></div>
          </div>
        </div>
        <div className="toggle-row">
          <span className="toggle-label">可交换</span>
          <div className={`toggle-switch ${allowExchange ? 'active' : ''}`} onClick={() => setAllowExchange(!allowExchange)}>
            <div className="toggle-knob"></div>
          </div>
        </div>
      </div>

      <div className="publish-actions">
        <button className="btn-publish" onClick={() => setActiveScreen('square')}>发布</button>
        <button className="btn-save-draft" onClick={() => console.log('Saved to drafts')}>存草稿</button>
      </div>

    </div>
  );

  // --- 8. Profile View ---
  const renderProfileView = () => (
    <div className="profile-view view-animate">
      
      <div className="fortune-tag">
        <svg viewBox="0 0 24 24"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" /></svg>
        126
      </div>

      <div className="profile-header">
        <div className="avatar">🐻</div>
        <div className="profile-info">
          <h1 className="profile-name">旧物收藏家</h1>
          <div className="profile-stats">
            <span>18</span> 件藏品 &nbsp;·&nbsp; <span>9</span> 个成果 &nbsp;·&nbsp; <span>6</span> 天好运
          </div>
        </div>
      </div>

      <div className="calendar-card">
        <div className="cal-top">
          <div className="cal-month">4月</div>
          <div className="cal-nav">
            <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
            2026年4月
            <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
        </div>
        
        <div className="cal-grid">
          {['日', '一', '二', '三', '四', '五', '六'].map(d => (
            <div className="cal-day-header" key={d}>{d}</div>
          ))}
          {Array.from({length: 3}).map((_, i) => (
            <div className="cal-cell empty" key={`empty-${i}`}></div>
          ))}
          {Array.from({length: 30}).map((_, i) => {
            const day = i + 1;
            const is17 = day === 17;
            const is24 = day === 24;
            return (
              <div className={`cal-cell ${is24 ? 'highlight' : ''}`} key={day}>
                {is17 && <div className="cal-marker">📦</div>}
                {is24 && <div className="cal-marker">🎁</div>}
                {day}
              </div>
            )
          })}
        </div>
      </div>

      <h2 className="section-title">再生成果库</h2>

      <div className="profile-tabs">
        <button className="profile-tab active">拼豆</button>
        <button className="profile-tab">贴纸</button>
        <button className="profile-tab">表情包</button>
        <button className="profile-tab">卡片</button>
        <button className="profile-tab">手帐</button>
      </div>

      <div className="profile-gallery">
        <div className="profile-card" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(0,0,0,0.1))'}}>
          <div className="pin-tag">
            <svg viewBox="0 0 24 24"><path d="M12 2L12 10M12 22L12 14M16 6H8C6.89543 6 6 6.89543 6 8V10C6 11.1046 6.89543 12 8 12H16C17.1046 12 18 11.1046 18 10V8C18 6.89543 17.1046 6 16 6ZM16 14H8C6.89543 14 6 14.8954 6 16V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V16C18 14.8954 17.1046 14 16 14Z" stroke="none" fill="currentColor"/></svg>
            置顶
          </div>
          <span>像素图占位</span>
        </div>
        <div className="profile-card" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(0,0,0,0.15))'}}>
          <span>头像卡占位</span>
        </div>
        <div className="profile-card" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(0,0,0,0.2))'}}>
          <span>奶茶图占位</span>
        </div>
        <div className="profile-card" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.02), rgba(0,0,0,0.25))'}}>
          <span>相片占位</span>
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
          {activeScreen === 'gallery' && renderGalleryView()}
          {activeScreen === 'capture' && renderCaptureView()}
          {activeScreen === 'result' && renderResultView()}
          {activeScreen === 'square' && renderSquareView()}
          {activeScreen === 'post-detail' && renderPostDetailView()}
          {activeScreen === 'publish' && renderPublishView()}
          {activeScreen === 'profile' && renderProfileView()}
        </main>

        <nav className="bottom-nav">
          <button className={`nav-item ${getNavActiveTab() === 'home' ? 'active' : ''}`} onClick={() => handleNavClick('home')}>
            <svg viewBox="0 0 24 24" fill={getNavActiveTab() === 'home' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={getNavActiveTab() === 'home' ? 0 : 2}><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg><span>首页</span>
          </button>
          <button className={`nav-item ${getNavActiveTab() === 'gallery' ? 'active' : ''}`} onClick={() => handleNavClick('gallery')}>
            <svg viewBox="0 0 24 24" fill={getNavActiveTab() === 'gallery' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={getNavActiveTab() === 'gallery' ? 0 : 2}><path d="M3 21h18M5 21V9M19 21V9M9 21v-5a3 3 0 0 1 6 0v5M2 9l10-5 10 5Z" /></svg><span>展馆</span>
          </button>
          <button className={`nav-item ${getNavActiveTab() === 'square' ? 'active' : ''}`} onClick={() => handleNavClick('square')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="9" /><line x1="5.6" y1="5.6" x2="18.4" y2="18.4" /><circle cx="8" cy="8" r="2.5" fill={getNavActiveTab() === 'square' ? 'currentColor' : 'none'} stroke="none" /></svg><span>广场</span>
          </button>
          <button className={`nav-item ${getNavActiveTab() === 'profile' ? 'active' : ''}`} onClick={() => handleNavClick('profile')}>
            <svg viewBox="0 0 24 24" fill={getNavActiveTab() === 'profile' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg><span>我的</span>
          </button>
        </nav>
      </div>
    </div>
  );
}