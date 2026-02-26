# EDone 本地服務

負責接收網頁生成的 .ino 程式碼，並透過 Arduino CLI 編譯、上傳到單片機。預設板型為 **Arduino UNO R4 WiFi**。

## 依賴

- **Node.js** 18+
- **Arduino CLI**：請先安裝並確保 `arduino-cli` 在 PATH 中；UNO R4 WiFi 需安裝對應核心，例如：
  ```bash
  arduino-cli core update-index
  arduino-cli core install arduino:renesas_uno
  ```

## 安裝與啟動

```bash
cd local
npm install
npm start
```

或於專案根目錄先執行 `cd local && npm install`，之後可用根目錄的：

```bash
npm run local
```

服務預設位址：`http://127.0.0.1:8765`。網頁端會依此位址送程式碼並觸發上傳。

## 環境變數（可選）

- `LOCAL_PORT`：服務埠，預設 8765
- `ARDUINO_CLI_PATH`：arduino-cli 可執行檔路徑，預設 `arduino-cli`
- `ARDUINO_FQBN`：預設板型 FQBN，預設 `arduino:renesas_uno:unor4wifi`
- `CORS_ORIGIN`：允許的來源，預設 `*`

## 上傳失敗：bossac "extra arguments found"

若上傳時出現 `bossac: extra arguments found`，多半是 Renesas 核心或 bossac 工具版本與指令格式不相容，可依序嘗試：

1. **升級 Renesas 核心與 Arduino CLI**
   ```bash
   arduino-cli core update-index
   arduino-cli core upgrade arduino:renesas_uno
   ```
   並確認 Arduino CLI 為較新版本（例如 0.36+）。

2. **手動進入 bootloader 後再上傳**（UNO R4 WiFi）
   - 拔掉 USB 再插上，或
   - 在板子上**快速連按兩下 RESET**，看到「L」LED 閃爍後，在網頁重新點「刷新」埠口，再選正確的 COM 口後上傳。

上傳時已加上 `--verbose`，失敗日誌中會印出實際執行的 bossac 指令，可依此對照本機安裝的 bossac 用法。
