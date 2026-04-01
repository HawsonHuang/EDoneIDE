export function useLocalStore(): {
  ports: { port: string; board?: string; fqbn?: string | null }[]
  portsLoading: boolean
  portsError: string
  selectedUploadPort: string
  selectedSerialPort: string
  serialOpen: boolean
  serialBaudRate: number
  serialReceiveText: string
  portsExcludingCom1: { port: string; board?: string; fqbn?: string | null }[]
  loadPorts: () => Promise<void>
  setSelectedUploadPort: (port: string) => void
  setSelectedSerialPort: (port: string) => void
  openSerial: (port: string, baudRate?: number) => Promise<{ ok: boolean; error?: string }>
  closeSerial: () => Promise<void>
  writeSerial: (text: string) => Promise<{ ok: boolean; error?: string }>
  appendSerialReceive: (text: string) => void
  appendSerialError: (message: string) => void
  clearSerialReceive: () => void
  setSerialRestored: (port: string, baudRate?: number) => void
  fetchSerialState: () => Promise<{ ok: boolean; open?: boolean; port?: string; baudRate?: number }>
}
