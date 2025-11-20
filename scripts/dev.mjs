import { spawn } from 'child_process'
import { createWriteStream } from 'fs'
import path from 'path'

const logPath = path.join(process.cwd(), 'dev.log')
const logStream = createWriteStream(logPath, { flags: 'a' })

const DEV_PORT = process.env.PORT || '3020'

const devProcess = spawn('next', ['dev', '-p', DEV_PORT], {
  shell: true,
  env: process.env,
  stdio: ['ignore', 'pipe', 'pipe']
})

const writeOutput = (data, stream) => {
  process[stream].write(data)
  logStream.write(data)
}

devProcess.stdout.on('data', (data) => writeOutput(data, 'stdout'))
devProcess.stderr.on('data', (data) => writeOutput(data, 'stderr'))

const cleanup = (code) => {
  logStream.end()
  if (code !== null) {
    console.log(`\nnext dev exited with code ${code}`)
  }
}

devProcess.on('close', cleanup)
devProcess.on('error', (err) => {
  console.error('Failed to start dev server:', err)
  cleanup(null)
})
