const express = require('express')
const next = require('next')
const path = require('path')

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000

const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()

  // 静的ファイルの配信設定（Azure App Service向け）
  server.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
    etag: false
  }))

  // Next.js _next/static フォルダの配信
  server.use('/_next/static', express.static(path.join(__dirname, '.next/static'), {
    maxAge: '1y',
    etag: false
  }))

  // すべてのリクエストをNext.jsに渡す
  server.all('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
