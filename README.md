# EDone 易通科創編程

基於積木（Blockly）的視覺化編程 IDE，面向創客教育與單片機開發。拖拽積木即可生成 Arduino C/C++ 代碼，並可一鍵編譯、上傳到板子；內建 AI 助手與本地編譯上傳服務，方便課堂與協作使用。

## 項目作用

- **積木編程**：左側工具箱提供邏輯、循環、數字、變數、控件等積木，中間畫布拖拽組裝程式，無需先學 C 語法即可入門。
- **即時代碼**：每次增刪改積木會自動生成對應的 Arduino C/C++ 代碼，右側「代碼」頁即時預覽，方便對照學習。
- **一鍵上傳**：接上 Arduino UNO R4 WiFi（或相容板型）後，在「代碼」頁選擇埠口即可將當前程式編譯並上傳到單片機；編譯與上傳階段會在介面上分別顯示，便於除錯。
- **AI 助手**：右側「AI」頁可與本地 Ollama 對話（如 gemma 等模型），用於問答、輔助理解程式或擴充教學內容。
- **本地服務**：編譯與上傳由專案內 `local/` 服務透過 Arduino CLI 在本機執行，不需依賴雲端；適合內網環境與課堂部署。

## 技術棧

- **前端**：Vue 3、Vite、Pinia、Blockly 12、Tailwind CSS
- **本地服務**：Node.js、Express；依賴 Arduino CLI、serialport（埠口列舉備援）
- **預設板型**：Arduino UNO R4 WiFi（arduino:renesas_uno:unor4wifi）

## 快速開始

```bash
# 前端
npm install
npm run dev
# 瀏覽器打開 http://localhost:5173

# 若要上傳到板子，另開終端：
cd local && npm install && npm start
# 或根目錄：npm run local
```

詳細步驟、環境變數與故障排除見 **[DEPLOY.md](DEPLOY.md)**；本地服務的 Arduino 依賴與上傳問題見 **[local/README.md](local/README.md)**。

## 目錄結構（概要）

- `src/` — 前端：元件、Blockly 工作區、積木與代碼生成、AI 聊天、本地 API 封裝
- `local/` — 本地服務：接收 .ino、編譯、上傳、列埠口；依賴 Arduino CLI
- `local/workspace/` — 本地服務寫入的 sketch 目錄（由 .gitignore 排除內容，僅保留 .gitkeep）

## 授權與貢獻

專案為私有倉庫時可自訂授權；歡迎隊友在倉庫內完善細節與文檔。

# Vue 3 + TypeScript + Vite + Tailwind + Pinia