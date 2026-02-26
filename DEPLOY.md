# EDone IDE 部署說明

本文說明如何在本機或協作環境中運行 **EDone 易通科創編程** 專案。

## 環境需求

| 項目 | 說明 |
|------|------|
| **Node.js** | 18+（前端與 local 服務均需） |
| **Arduino CLI** | 僅在需要「上傳到單片機」時使用，需在 PATH 中 |

## 取得程式碼

```bash
git clone <倉庫 URL>
cd EDoneIDE
```

## 一、前端（網頁 IDE）

```bash
npm install
npm run dev
```

- 預設：<http://localhost:5173>
- 建置：`npm run build`（產出在 `dist/`）
- 預覽建置結果：`npm run preview`

## 二、本地服務（編譯與上傳）

使用「代碼」頁的**生成代碼、編譯、上傳到 Arduino** 時，需在本機運行 local 服務：

```bash
cd local
npm install
npm start
```

- 預設：<http://127.0.0.1:8765>
- 或於專案根目錄執行：`npm run local`（需先於 `local/` 執行過 `npm install`）

**Arduino 相關（僅在上傳時需要）：**

```bash
arduino-cli core update-index
arduino-cli core install arduino:renesas_uno
```

更多說明與故障排除見 [local/README.md](local/README.md)。

## 三、日常使用流程

1. **只使用網頁積木與 AI**：根目錄執行 `npm run dev`，瀏覽器打開 <http://localhost:5173>。
2. **要上傳到板子**：另開終端，在專案根目錄執行 `npm run local`，保持 local 服務運行；網頁選埠口後點「上傳到 Arduino (UNO R4 WiFi)」。

## 四、可選配置

- **本地服務埠**：環境變數 `LOCAL_PORT`（預設 8765）。
- **前端連線的 local 位址**：建置時設定 `VITE_LOCAL_AGENT_URL`，例如：
  ```bash
  VITE_LOCAL_AGENT_URL=http://127.0.0.1:8765 npm run build
  ```
  開發時可在專案根目錄建立 `.env`，加入：
  ```env
  VITE_LOCAL_AGENT_URL=http://127.0.0.1:8765
  ```
  重啟 `npm run dev` 後生效。

## 五、提交與協作

- 已由 `.gitignore` 排除：`node_modules`、`dist`、`local/workspace/*`（生成的 sketch）、`.env` 等。
- 新 clone 後需在**根目錄**與 **`local/`** 各執行一次 `npm install`。
- 需上傳板子者請自行安裝 Arduino CLI 並安裝 `arduino:renesas_uno` 核心。
