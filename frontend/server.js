import { createServer } from 'http'
import { createReadStream, existsSync, statSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const PORT = process.env.PORT || 3000
const DIST = join(__dirname, 'dist')

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
}

createServer((req, res) => {
  let filePath = join(DIST, req.url === '/' ? 'index.html' : req.url)

  // Strip query string
  filePath = filePath.split('?')[0]

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    // SPA fallback
    filePath = join(DIST, 'index.html')
  }

  const ext = extname(filePath)
  const mime = MIME[ext] || 'application/octet-stream'

  res.writeHead(200, {
    'Content-Type': mime,
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000',
  })

  createReadStream(filePath).pipe(res)
}).listen(PORT, () => {
  console.log(`Frontend serving on port ${PORT}`)
})
