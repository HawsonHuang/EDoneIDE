import type * as Blockly from 'blockly'

export interface BlockPack {
  blocks: any[]
  generatorModule: {
    register?: (
      arduinoGenerator: any,
      Blockly: typeof import('blockly'),
      Order: any
    ) => void
  }
}

export function installBlockPack(
  pack: BlockPack,
  workspace: Blockly.WorkspaceSvg
): void

