/**
 * 彙總本專案所有積木類型與參數，產出可餵給雲端 AI 的說明文字（複製後貼到 AI 對話即可）。
 */
import { toolboxConfig } from './toolbox'
import { arduinoBlockJson } from './blocks/arduino'

/** Blockly 內建積木（工具箱有、定義在核心）的簡要參數，供 AI 參考 */
const BUILTIN_BLOCK_SPEC = {
  controls_if: { fields: [], inputs: [{ name: 'IF0', shadow: 'logic_boolean' }, { name: 'DO0', block: true }], tooltip: '若條件成立則執行' },
  logic_compare: { fields: [{ name: 'OP', options: ['EQ', 'NEQ', 'LT', 'LTE', 'GT', 'GTE'] }], inputs: [{ name: 'A', shadow: 'math_number' }, { name: 'B', shadow: 'math_number' }], tooltip: '比較兩值' },
  logic_operation: { fields: [{ name: 'OP', options: ['AND', 'OR'] }], inputs: [{ name: 'A', shadow: 'logic_boolean' }, { name: 'B', shadow: 'logic_boolean' }], tooltip: '邏輯與/或' },
  logic_negate: { fields: [], inputs: [{ name: 'BOOL', shadow: 'logic_boolean' }], tooltip: '邏輯非' },
  logic_boolean: { fields: [{ name: 'BOOL', options: [['真', 'TRUE'], ['假', 'FALSE']] }], inputs: [], tooltip: '真/假' },
  logic_null: { fields: [], inputs: [], tooltip: '空值' },
  logic_ternary: { fields: [], inputs: [{ name: 'COND', shadow: 'logic_boolean' }, { name: 'THEN', shadow: 'text' }, { name: 'ELSE', shadow: 'text' }], tooltip: '條件 ? 則 : 否則' },
  controls_repeat_ext: { fields: [], inputs: [{ name: 'TIMES', shadow: 'math_number', defaultNum: 10 }], tooltip: '重複 N 次' },
  controls_whileUntil: { fields: [{ name: 'MODE', options: [['當', 'WHILE'], ['直到', 'UNTIL']] }], inputs: [{ name: 'BOOL', shadow: 'logic_boolean' }, { name: 'DO', block: true }], tooltip: '當/直到條件' },
  controls_for: { fields: [], inputs: [{ name: 'VAR', block: 'variables_get' }, { name: 'FROM', shadow: 'math_number' }, { name: 'TO', shadow: 'math_number' }, { name: 'BY', shadow: 'math_number' }, { name: 'DO', block: true }], tooltip: 'for 迴圈' },
  math_number: { fields: [{ name: 'NUM', type: 'number', example: 0 }], inputs: [], tooltip: '數字' },
  math_arithmetic: { fields: [{ name: 'OP', options: ['ADD', 'MINUS', 'MULTIPLY', 'DIVIDE', 'POWER'] }], inputs: [{ name: 'A', shadow: 'math_number' }, { name: 'B', shadow: 'math_number' }], tooltip: '四則運算' },
  math_single: { fields: [{ name: 'OP', options: ['ROOT', 'ABS', 'NEG', 'LN', 'LOG10', 'EXP', 'POW10'] }], inputs: [{ name: 'NUM', shadow: 'math_number' }], tooltip: '單一數值函數' },
  math_trig: { fields: [{ name: 'OP', options: ['SIN', 'COS', 'TAN', 'ASIN', 'ACOS', 'ATAN'] }], inputs: [{ name: 'NUM', shadow: 'math_number' }], tooltip: '三角函數' },
  math_constant: { fields: [{ name: 'CONSTANT', options: ['PI', 'E', 'GOLDEN_RATIO', 'SQRT2', 'SQRT1_2', 'INFINITY'] }], inputs: [], tooltip: '常數' },
  math_number_property: { fields: [{ name: 'PROP', options: ['EVEN', 'ODD', 'PRIME', 'WHOLE', 'POSITIVE', 'NEGATIVE', 'DIVISIBLE_BY'] }], inputs: [{ name: 'NUMBER_TO_CHECK', shadow: 'math_number' }], tooltip: '數字屬性' },
  math_round: { fields: [{ name: 'OP', options: ['ROUND', 'ROUNDUP', 'ROUNDDOWN'] }], inputs: [{ name: 'NUM', shadow: 'math_number' }], tooltip: '四捨五入' },
  math_modulo: { fields: [], inputs: [{ name: 'DIVIDEND', shadow: 'math_number' }, { name: 'DIVISOR', shadow: 'math_number' }], tooltip: '取餘' },
  math_constrain: { fields: [], inputs: [{ name: 'VALUE', shadow: 'math_number' }, { name: 'LOW', shadow: 'math_number' }, { name: 'HIGH', shadow: 'math_number' }], tooltip: '限制範圍' },
  math_random_int: { fields: [], inputs: [{ name: 'FROM', shadow: 'math_number' }, { name: 'TO', shadow: 'math_number' }], tooltip: '隨機整數' },
  text: { fields: [{ name: 'TEXT', type: 'string', example: 'Hello' }], inputs: [], tooltip: '字串' },
}

function collectToolboxTypes(contents, categoryName = '') {
  const types = []
  if (!contents || !Array.isArray(contents)) return types
  for (const item of contents) {
    if (item.kind === 'category' && item.contents) {
      types.push(...collectToolboxTypes(item.contents, item.name || categoryName))
    } else if (item.kind === 'block' && item.type) {
      const def = { type: item.type, category: item.name || categoryName }
      if (item.fields) def.defaultFields = item.fields
      if (item.inputs) {
        def.defaultInputs = {}
        for (const [inputName, slot] of Object.entries(item.inputs)) {
          if (slot.shadow) def.defaultInputs[inputName] = { shadow: slot.shadow.type, shadowFields: slot.shadow.fields || {} }
          if (slot.block) def.defaultInputs[inputName] = { ...(def.defaultInputs[inputName] || {}), block: true }
        }
      }
      types.push(def)
    }
  }
  return types
}

function parseBlockDef(block) {
  const fields = []
  const inputs = []
  const args0 = block.args0 || []
  for (const arg of args0) {
    if (arg.type === 'field_input') {
      fields.push({ name: arg.name, type: 'string', example: arg.text != null ? arg.text : '' })
    } else if (arg.type === 'field_dropdown') {
      const options = (arg.options || []).map((o) => (Array.isArray(o) ? o[1] : o))
      fields.push({ name: arg.name, type: 'dropdown', options })
    } else if (arg.type === 'input_value') {
      const shadow = arg.check === 'Number' ? 'math_number' : (Array.isArray(arg.check) && arg.check.includes('String')) ? 'text' : null
      inputs.push({ name: arg.name, check: arg.check, shadow })
    }
  }
  return { fields, inputs, message0: block.message0, tooltip: block.tooltip }
}

function buildBlockSpecMap() {
  const map = {}
  for (const block of arduinoBlockJson) {
    const { fields, inputs, message0, tooltip } = parseBlockDef(block)
    map[block.type] = { category: '', fields, inputs, message0, tooltip }
  }
  const contents = toolboxConfig.contents || []
  const toolboxBlocks = collectToolboxTypes(contents)
  for (const t of toolboxBlocks) {
    if (!map[t.type]) {
      map[t.type] = BUILTIN_BLOCK_SPEC[t.type]
        ? { ...BUILTIN_BLOCK_SPEC[t.type], category: t.category }
        : { category: t.category, fields: [], inputs: [], tooltip: '(Blockly 內建)' }
    } else if (t.category) {
      map[t.type].category = t.category
    }
    if (t.defaultFields) map[t.type].defaultFields = t.defaultFields
    if (t.defaultInputs) map[t.type].defaultInputs = t.defaultInputs
  }
  return map
}

/**
 * 取得供 AI 使用的積木與工作區格式說明（JSON 物件）。
 */
export function getBlocksSpecForAi() {
  const blockSpecMap = buildBlockSpecMap()
  const blocks = {}
  for (const [type, spec] of Object.entries(blockSpecMap)) {
    blocks[type] = {
      category: spec.category,
      tooltip: spec.tooltip,
      message0: spec.message0,
      fields: spec.fields || [],
      inputs: spec.inputs || [],
      defaultFields: spec.defaultFields,
      defaultInputs: spec.defaultInputs,
    }
  }
  return {
    version: 1,
    purpose: '供 AI 生成本 IDE 可載入的 workspace JSON 或理解如何操作積木',
    blockTypes: Object.keys(blocks).sort(),
    blocks,
    workspaceFormat: {
      description: 'Blockly 工作區存檔：頂層 { "blocks": { "languageVersion": 0, "blocks": [ ... ] } }',
      blockShape: '每顆積木: type, id(唯一), x, y(頂層), fields, inputs.插槽.shadow 或 .block, next.block',
      shadowExample: '字串用 shadow type "text" fields.TEXT；數字用 shadow type "math_number" fields.NUM',
    },
  }
}

/**
 * 將 spec 轉成 Markdown 字串，方便複製到雲端 AI 對話。
 */
export function specToMarkdown(spec) {
  if (!spec) spec = getBlocksSpecForAi()
  const lines = [
    '# EDone IDE 積木與工作區格式說明（供 AI 使用）',
    '',
    '## 用途',
    spec.purpose,
    '',
    '## 積木類型一覽',
    spec.blockTypes.join(', '),
    '',
    '## 各積木參數',
    '',
  ]
  for (const type of spec.blockTypes) {
    const b = spec.blocks[type]
    lines.push(`### ${type}`)
    lines.push(`- 分類: ${b.category}`)
    if (b.tooltip) lines.push(`- 說明: ${b.tooltip}`)
    if (b.message0) lines.push(`- 外觀: ${b.message0}`)
    if (b.fields && b.fields.length) {
      lines.push('- 欄位 (fields):')
      for (const f of b.fields) {
        if (f.options) lines.push(`  - ${f.name}: dropdown, 可選值 ${JSON.stringify(f.options)}`)
        else lines.push(`  - ${f.name}: ${f.type}, 範例: ${f.example != null ? f.example : '-'}`)
      }
    }
    if (b.inputs && b.inputs.length) {
      lines.push('- 輸入 (inputs):')
      for (const i of b.inputs) {
        const sh = i.shadow || ''
        lines.push(`  - ${i.name}: 可接 shadow ${sh || '(block)'}${i.check ? ` (check: ${JSON.stringify(i.check)})` : ''}`)
      }
    }
    if (b.defaultFields) lines.push(`- 預設 fields: ${JSON.stringify(b.defaultFields)}`)
    if (b.defaultInputs) lines.push(`- 預設 inputs: ${JSON.stringify(b.defaultInputs)}`)
    lines.push('')
  }
  lines.push('## 工作區 JSON 格式')
  lines.push('')
  lines.push('- 頂層: `{ "blocks": { "languageVersion": 0, "blocks": [ ... ] } }`')
  lines.push('- 每顆積木: type, id, x, y, fields, inputs, next')
  lines.push('- inputs.插槽名.shadow: type, id, fields；字串用 text+TEXT，數字用 math_number+NUM')
  lines.push('- next.block: 同一堆疊下一顆語句塊')
  lines.push('')
  return lines.join('\n')
}

/**
 * 取得可複製的完整說明文字（Markdown），用於「複製到剪貼簿」後貼到雲端 AI。
 */
export function getSpecTextForCopy() {
  return specToMarkdown(getBlocksSpecForAi())
}
