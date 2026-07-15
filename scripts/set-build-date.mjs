import fs from 'node:fs'
import path from 'node:path'

function formatLocalDateYYYYMMDDWithDashes(date) {
  const yyyy = String(date.getFullYear())
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const buildDate = formatLocalDateYYYYMMDDWithDashes(new Date())
const projectRoot = process.cwd()
const envFilePath = path.join(projectRoot, '.env.production.local')

let prev = ''
if (fs.existsSync(envFilePath)) {
  prev = fs.readFileSync(envFilePath, 'utf8')
}

const filtered = prev
  .split(/\r?\n/)
  .filter((line) => line.trim() !== '' && !line.startsWith('VITE_BUILD_DATE='))

filtered.push(`VITE_BUILD_DATE=${buildDate}`)

fs.writeFileSync(envFilePath, filtered.join('\n') + '\n', 'utf8')
console.log(`Wrote VITE_BUILD_DATE=${buildDate} to .env.production.local`)
