const currentBranchEl = document.querySelector('#currentBranch')
const releaseBranchEl = document.querySelector('#releaseBranch')
const statusPillEl = document.querySelector('#statusPill')
const branchInputEl = document.querySelector('#branchInput')
const startButtonEl = document.querySelector('#startButton')
const refreshButtonEl = document.querySelector('#refreshButton')
const clearButtonEl = document.querySelector('#clearButton')
const logOutputEl = document.querySelector('#logOutput')
const resultTextEl = document.querySelector('#resultText')

function appendLog(line) {
  const time = new Date().toLocaleTimeString('zh-CN', { hour12: false })
  logOutputEl.textContent += `[${time}] ${line}\n`
  logOutputEl.scrollTop = logOutputEl.scrollHeight
}

function setBusy(isBusy) {
  startButtonEl.disabled = isBusy
  refreshButtonEl.disabled = isBusy
  branchInputEl.disabled = isBusy
  startButtonEl.textContent = isBusy ? '打包中...' : '开始打包'
  statusPillEl.textContent = isBusy ? '执行中' : '准备就绪'
  statusPillEl.dataset.state = isBusy ? 'running' : 'ready'
}

async function refreshStatus() {
  try {
    const status = await window.releaseBuilder.getStatus()
    currentBranchEl.textContent = status.currentBranch || '-'
    releaseBranchEl.textContent = status.releaseBranch || '-'
    resultTextEl.textContent = status.isGitRepository ? '等待开始' : '当前目录不是 Git 仓库'
    statusPillEl.textContent = status.isGitRepository ? '准备就绪' : '不可用'
    statusPillEl.dataset.state = status.isGitRepository ? 'ready' : 'error'
  } catch (error) {
    resultTextEl.textContent = '状态读取失败'
    statusPillEl.textContent = '错误'
    statusPillEl.dataset.state = 'error'
    appendLog(error.message || '状态读取失败。')
  }
}

window.releaseBuilder.onLog(line => {
  appendLog(line)
})

startButtonEl.addEventListener('click', async () => {
  logOutputEl.textContent = ''
  resultTextEl.textContent = '正在执行'
  setBusy(true)

  try {
    const result = await window.releaseBuilder.start(branchInputEl.value)

    if (result.ok) {
      resultTextEl.textContent = `完成：${result.releaseBranch}`
      statusPillEl.textContent = '成功'
      statusPillEl.dataset.state = 'success'
      appendLog(`完成路径：${result.prodPath}`)
    } else {
      resultTextEl.textContent = '执行失败'
      statusPillEl.textContent = '失败'
      statusPillEl.dataset.state = 'error'
      appendLog(result.error || '发布打包失败。')
    }
  } catch (error) {
    resultTextEl.textContent = '执行失败'
    statusPillEl.textContent = '失败'
    statusPillEl.dataset.state = 'error'
    appendLog(error.message || '发布打包失败。')
  } finally {
    setBusy(false)
    refreshStatus()
  }
})

refreshButtonEl.addEventListener('click', refreshStatus)

clearButtonEl.addEventListener('click', () => {
  logOutputEl.textContent = ''
})

refreshStatus()
