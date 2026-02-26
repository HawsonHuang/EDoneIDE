export function useBlocklyStore(): {
  workspace: { value: unknown }
  generatedCode: { value: string }
  setWorkspace: (ws: unknown) => void
  disposeWorkspace: () => void
  generateCode: () => void
}
