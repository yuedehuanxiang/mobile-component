import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

function getReleaseBranchName(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `release-${year}${month}${day}`
}

function parseBranches(rawBranches) {
  const seen = new Set()

  return String(rawBranches)
    .split(/[\n,]+/)
    .map(branch => branch.trim())
    .filter(Boolean)
    .filter(branch => {
      if (seen.has(branch)) {
        return false
      }

      seen.add(branch)
      return true
    })
}

function getCommandEnv() {
  const fallbackPaths = [
    '/opt/homebrew/bin',
    '/usr/local/bin',
    '/usr/bin',
    '/bin',
    '/usr/sbin',
    '/sbin'
  ]
  const currentPath = process.env.PATH || ''

  return {
    ...process.env,
    PATH: [...new Set([...fallbackPaths, ...currentPath.split(':').filter(Boolean)])].join(':')
  }
}

function runCommand(command, args, options = {}) {
  const {
    cwd,
    sendLog,
    logOutput = true,
    logCommand = true,
    env = getCommandEnv()
  } = options

  return new Promise((resolve, reject) => {
    if (logCommand && sendLog) {
      sendLog(`$ ${command} ${args.join(' ')}`)
    }

    const child = spawn(command, args, {
      cwd,
      env,
      shell: false
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', chunk => {
      const text = chunk.toString()
      stdout += text
      if (logOutput && sendLog) {
        sendLog(text.trimEnd())
      }
    })

    child.stderr.on('data', chunk => {
      const text = chunk.toString()
      stderr += text
      if (logOutput && sendLog) {
        sendLog(text.trimEnd())
      }
    })

    child.on('error', error => {
      reject(error)
    })

    child.on('close', code => {
      const output = `${stdout}${stderr}`.trim()

      if (code === 0) {
        resolve({ stdout, stderr, code })
        return
      }

      const error = new Error(output || `${command} exited with code ${code}`)
      error.code = code
      error.stdout = stdout
      error.stderr = stderr
      reject(error)
    })
  })
}

async function commandSucceeds(projectRoot, command, args) {
  try {
    await runCommand(command, args, {
      cwd: projectRoot,
      logCommand: false,
      logOutput: false
    })
    return true
  } catch {
    return false
  }
}

async function getCurrentBranch(projectRoot) {
  const result = await runCommand('git', ['branch', '--show-current'], {
    cwd: projectRoot,
    logCommand: false,
    logOutput: false
  })

  return result.stdout.trim()
}

async function assertBranchExists(projectRoot, branch) {
  const localExists = await commandSucceeds(projectRoot, 'git', [
    'show-ref',
    '--verify',
    '--quiet',
    `refs/heads/${branch}`
  ])

  if (localExists) {
    return branch
  }

  const remoteRef = `origin/${branch}`
  const remoteExists = await commandSucceeds(projectRoot, 'git', [
    'show-ref',
    '--verify',
    '--quiet',
    `refs/remotes/${remoteRef}`
  ])

  if (remoteExists) {
    return remoteRef
  }

  throw new Error(`分支不存在：${branch}`)
}

async function assertCleanWorktree(projectRoot) {
  const result = await runCommand('git', ['status', '--porcelain'], {
    cwd: projectRoot,
    logCommand: false,
    logOutput: false
  })

  if (result.stdout.trim()) {
    throw new Error('当前工作区有未提交变更，请先提交或暂存后再执行发布打包。')
  }
}

export async function getReleaseStatus(projectRoot) {
  const releaseBranch = getReleaseBranchName()
  const isGitRepository = await commandSucceeds(projectRoot, 'git', [
    'rev-parse',
    '--is-inside-work-tree'
  ])

  if (!isGitRepository) {
    return {
      isGitRepository,
      currentBranch: '',
      releaseBranch
    }
  }

  return {
    isGitRepository,
    currentBranch: await getCurrentBranch(projectRoot),
    releaseBranch
  }
}

export async function runReleaseBuild({ projectRoot, rawBranches, sendLog }) {
  const branches = parseBranches(rawBranches)
  const releaseBranch = getReleaseBranchName()
  const distPath = path.join(projectRoot, 'dist')
  const prodPath = path.join(projectRoot, 'prod')

  if (branches.length === 0) {
    throw new Error('请输入至少一个需要合并的分支。')
  }

  sendLog('检查 Git 仓库状态...')
  const isGitRepository = await commandSucceeds(projectRoot, 'git', [
    'rev-parse',
    '--is-inside-work-tree'
  ])

  if (!isGitRepository) {
    throw new Error('当前目录不是 Git 仓库。')
  }

  await assertCleanWorktree(projectRoot)

  const currentBranch = await getCurrentBranch(projectRoot)
  if (!currentBranch) {
    throw new Error('当前处于 detached HEAD 状态，请先切换到明确的基准分支。')
  }

  sendLog(`当前分支：${currentBranch}`)
  sendLog(`发布分支：${releaseBranch}`)

  const releaseExists = await commandSucceeds(projectRoot, 'git', [
    'show-ref',
    '--verify',
    '--quiet',
    `refs/heads/${releaseBranch}`
  ])

  if (releaseExists) {
    throw new Error(`本地已存在发布分支 ${releaseBranch}，请先确认或删除后再重试。`)
  }

  const mergeTargets = []
  for (const branch of branches) {
    mergeTargets.push(await assertBranchExists(projectRoot, branch))
  }

  sendLog(`创建发布分支：${releaseBranch}`)
  await runCommand('git', ['checkout', '-b', releaseBranch], {
    cwd: projectRoot,
    sendLog
  })

  for (const target of mergeTargets) {
    sendLog(`合并分支：${target}`)
    await runCommand('git', ['merge', '--no-edit', target], {
      cwd: projectRoot,
      sendLog
    })
  }

  sendLog('执行项目打包：npm run build')
  await runCommand('npm', ['run', 'build'], {
    cwd: projectRoot,
    sendLog
  })

  sendLog('复制 dist 到 prod...')
  await fs.rm(prodPath, { recursive: true, force: true })
  await fs.mkdir(prodPath, { recursive: true })
  await fs.cp(distPath, prodPath, { recursive: true })

  sendLog('发布打包完成。')

  return {
    ok: true,
    currentBranch,
    releaseBranch,
    mergedBranches: mergeTargets,
    prodPath
  }
}
