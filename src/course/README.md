# 課程檔案格式（供外部導入與不定期更新）

課程內容可從外部 JSON 導入或動態更新；引擎只解析符合下列格式的物件。

## 版本

- `version`: 數字，目前為 `1`。

## 課程根層

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| version | number | 是 | 格式版本，目前 1 |
| id | string | 是 | 課程唯一識別 |
| name | string | 是 | 課程顯示名稱 |
| steps | array | 是 | 步驟陣列，見下方 |

## 步驟 (step)

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| id | string | 是 | 步驟識別 |
| target | string | 條件 | **定位方式一**：CSS 選擇器（如 `[data-tour="xxx"]`、`#id`）。與 `targetBlocklyCategory` 二擇一。 |
| targetBlocklyCategory | string | 條件 | **定位方式二**：Blockly 左側工具箱分類名稱（如 `邏輯`、`循環`、`數字`、`變數`、`控件`、`串口`）。與 `target` 二擇一。 |
| title | string | 是 | 提示框標題 |
| content | string | 是 | 提示框內文 |
| placement | string | 否 | 提示框位置：top / bottom / left / right，預設 bottom |

**定位規則**：若填寫 `targetBlocklyCategory`，則依分類名稱在工具箱中框選該分類；否則用 `target` 做 `document.querySelector`。也可在 `target` 寫前綴 `blockly:分類名`（如 `blockly:變數`）等同使用 `targetBlocklyCategory`。

## 範例

```json
{
  "version": 1,
  "id": "ide-quick-start",
  "name": "IDE 快速入門",
  "steps": [
    {
      "id": "toolbox-var",
      "targetBlocklyCategory": "變數",
      "title": "變數",
      "content": "點這裡使用變數積木。",
      "placement": "right"
    },
    {
      "id": "workspace",
      "target": "[data-tour='workspace']",
      "title": "工作區",
      "content": "在此拖放積木編寫程式。",
      "placement": "right"
    }
  ]
}
```

## 兩套定位方式

1. **data-tour / 任意 CSS**：在頁面元件上加 `data-tour="xxx"`，步驟裡寫 `target: "[data-tour='xxx']"`；或直接用現有選擇器如 `#blocklyDiv`、`.class`。
2. **Blockly 分類**：步驟寫 `targetBlocklyCategory: "變數"`（名稱須與工具箱 `name` 一致），或 `target: "blockly:變數"`，引擎會在左側工具箱中依名稱框選該分類。

現有約定 `data-tour`：workspace、sidebar-code、topbar-upload、bottombar-serial。
