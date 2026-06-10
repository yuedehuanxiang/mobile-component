const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('releaseBuilder', {
  getStatus: projectPath => ipcRenderer.invoke('release:get-status', { projectPath }),
  selectProject: () => ipcRenderer.invoke('release:select-project'),
  start: payload => ipcRenderer.invoke('release:start', payload),
  onLog: callback => {
    const listener = (_event, line) => callback(line)
    ipcRenderer.on('release:log', listener)

    return () => {
      ipcRenderer.removeListener('release:log', listener)
    }
  }
})
