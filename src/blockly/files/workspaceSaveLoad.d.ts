import type { Workspace } from 'blockly/core/workspace'

export const WORKSPACE_FILE_EXT: string

export function saveWorkspace(workspace: Workspace): { [key: string]: any } | null

export interface LoadWorkspaceOptions {
  clearFirst?: boolean
  recordUndo?: boolean
}

export function loadWorkspace(
  state: { [key: string]: any },
  workspace: Workspace,
  options?: LoadWorkspaceOptions
): void
