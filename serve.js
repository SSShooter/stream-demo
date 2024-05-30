import express from 'express'
import React from 'react'
import { renderToStaticNodeStream } from 'react-dom/server'

import { startPage, endPage } from './js/template'

import App from './components/App'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { Transform } from 'stream'
import map from './map'

const app = express()

// Static things.
app.use('/manifest.json', express.static('manifest.json'))
app.use('/sw.js', express.static('sw.js'))
app.use('/js', express.static('js'))
app.use('/css', express.static('css'))
app.use('/icons', express.static('icons'))
app.use('/public', express.static('public'))

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

app.get('/fake-stream', async (req, res) => {
  res.set('Content-Type', 'message')
  // create a stream with node
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue('11111')
      await sleep(1000)
      controller.enqueue('2222')
      await sleep(1000)
      controller.enqueue('3333')
      await sleep(1000)
      controller.enqueue('44444')
      controller.close()
    },
  })
  // pipe to res
  stream.pipeTo(
    new WritableStream({
      async write(chunk) {
        res.write(chunk)
      },
      close() {
        res.write('<p>Stream ended</p>')
        res.end('</body></html>')
      },
    })
  )
})
const algorithm = 'aes-192-cbc'
const password = 'Password used to generate key'
app.get('/novel-1', async (req, res) => {
  const file = fs.createReadStream('novel.txt')
  res.set('Content-Type', 'message')
  crypto.scrypt(password, 'salt', 24, (err, key) => {
    if (err) throw err
    // Then, we'll generate a random initialization vector
    crypto.randomFill(new Uint8Array(16), (err, iv) => {
      if (err) throw err
      console.log(algorithm, key.toString(), iv.toString())
      const cipher = crypto.createCipheriv(
        algorithm,
        key.toString(),
        iv.toString()
      )

      // pipe file to encrypt
      file.pipe(cipher).pipe(res)
    })
  })
})

app.get('/novel', async (_, res) => {
  const file = fs.createReadStream('les-miserable.txt', { highWaterMark: 1024 * 25 })
  res.set('Content-Type', 'message')
  const encryptStream = new Transform({
    transform(chunk, encoding, callback) {
      setTimeout(() => {
        const encrypted = []
        // 加密字节流，传到浏览器是乱码
        chunk.forEach((byte) => {
          encrypted.push(map[byte])
        })
        const encryptedBuffer = Buffer.from(encrypted)
        this.push(encryptedBuffer)
        callback()
      }, 10)
    },
  })
  file.pipe(encryptStream).pipe(res)
})

app.get('/log', async (_, res) => {
  const file = fs.createReadStream('public/mockLogs', { highWaterMark: 1024 * 25 })
  res.set('Content-Type', 'log')
  const delayer = new Transform({
    transform(chunk, encoding, callback) {
      setTimeout(() => {
        this.push(chunk)
        callback()
      }, 20)
    },
  })
  file.pipe(delayer).pipe(res)
})

// index.html
app.use('/', (req, res) => {
  // We're serving HTML.
  res.set('Content-Type', 'text/html')

  // Write just the first bit.
  res.write(startPage)

  // Create a stream from the HTML of this component
  const stream = renderToStaticNodeStream(<App />)

  /*
    Pipe it into the response.
    { end: false } doesn't close the stream when its finished
    so we can </body></html> ourselves.
  */
  stream.pipe(res, { end: false })

  stream.on('end', () => {
    // We do that here.
    res.write(endPage)
    res.end()
  })
})

// Start!
app.listen(3000, () =>
  console.log('You can open the app at http://localhost:3000/ 😄')
)
