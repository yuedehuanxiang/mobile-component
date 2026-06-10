const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('releaseBuilder', {
  getStatus: () => ipcRenderer.invoke('release:get-status'),
  start: branches => ipcRenderer.invoke('release:start', { branches }),
  onLog: callback => {
    const listener = (_event, line) => callback(line)
    ipcRenderer.on('release:log', listener)

    return () => {
      ipcRenderer.removeListener('release:log', listener)
    }
  }
})
