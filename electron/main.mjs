import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getReleaseStatus, runReleaseBuild } from '../scripts/release-build.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const defaultProjectRoot = path.resolve(__dirname, '..')

let mainWindow
let isRunning = false
let selectedProjectRoot = defaultProjectRoot

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 980,
    height: 720,
    minWidth: 840,
    minHeight: 620,
    title: 'Release Builder',
    backgroundColor: '#f6f7f9',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.loadFile(path.join(__dirname, 'index.html'))
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('release:get-status', async (_event, payload) => {
  const projectRoot = payload?.projectPath || selectedProjectRoot
  return getReleaseStatus(projectRoot)
})

ipcMain.handle('release:select-project', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择要打包的项目目录',
    defaultPath: selectedProjectRoot,
    properties: ['openDirectory']
  })

  if (result.canceled || result.filePaths.length === 0) {
    return {
      canceled: true,
      projectPath: selectedProjectRoot
    }
  }

  selectedProjectRoot = result.filePaths[0]

  return {
    canceled: false,
    projectPath: selectedProjectRoot,
    status: await getReleaseStatus(selectedProjectRoot)
  }
})

ipcMain.handle('release:start', async (_event, payload) => {
  if (isRunning) {
    return {
      ok: false,
      error: '已有打包任务正在执行，请等待当前任务完成。'
    }
  }

  const projectRoot = payload?.projectPath || selectedProjectRoot
  isRunning = true
  const sendLog = line => {
    if (!mainWindow?.isDestroyed()) {
      mainWindow.webContents.send('release:log', line)
    }
  }

  try {
    const result = await runReleaseBuild({
      projectRoot,
      rawBranches: payload?.branches ?? '',
      sendLog
    })

    return result
  } catch (error) {
    return {
      ok: false,
      error: error.message || '发布打包失败。'
    }
  } finally {
    isRunning = false
  }
})
