const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('digidAPI', {
  chat: (prompt, agent) => ipcRenderer.invoke('ai-chat', { prompt, agent }),
  setToken: (token) => ipcRenderer.send('set-hf-token', token)
})