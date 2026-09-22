import { gzipSync } from 'node:zlib'
import { readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(process.cwd(), 'dist')
const html = await readFile(resolve(root, 'index.html'), 'utf8')
const scripts = [...html.matchAll(/<script[^>]+src="\/?assets\/([^"]+\.js)"/g)].map(match => match[1])
const styles = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="\/?assets\/([^"]+\.css)"/g)].map(match => match[1])

const limits = {
  script: { uncompressed: 300 * 1024, gzip: 100 * 1024 },
  style: { uncompressed: 50 * 1024, gzip: 15 * 1024 },
}

async function check(files, limit, label) {
  for (const file of files) {
    const path = resolve(root, 'assets', file)
    const body = await readFile(path)
    const uncompressed = body.length
    const gzip = gzipSync(body).length
    const over = uncompressed > limit.uncompressed || gzip > limit.gzip
    console.log(`${label} ${file}: ${Math.round(uncompressed / 1024)}KB uncompressed, ${Math.round(gzip / 1024)}KB gzip ${over ? 'OVER BUDGET' : 'ok'}`)
    if (over) process.exitCode = 1
  }
  if (!files.length) {
    console.error(`No initial ${label.toLowerCase()} assets found`)
    process.exitCode = 1
  }
}

await check(scripts, limits.script, 'script')
await check(styles, limits.style, 'style')
