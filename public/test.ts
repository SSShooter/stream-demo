const readableDiv = document.querySelector('#readable')
const transformDiv = document.querySelector('#transform')
const writableDiv = document.querySelector('#writable')

// Utils
function randomChars(length = 20) {
  return Array.from({ length: Math.floor(Math.random() * length) })
    .map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 97))
    .join('')
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
function wrap(text: string) {
  const p = document.createElement('p')
  p.textContent = text
  return p
}
function logInDiv(div: Element, text: string) {
  div.append(wrap(text))
  div.scrollTop = div.scrollHeight
}
const button = document.querySelector<HTMLButtonElement>(
  '#readable-steam-enqueue',
)!

let index = 0

const emitMessage = (controller) => {
  const log = index++ + ' msg: ' + randomChars() + controller.desiredSize
  logInDiv(readableDiv!, log)
  controller.enqueue(log) // 这里是进队列
  console.log('controller.desiredSize', controller.desiredSize)
}

// ReadableStream
const rQueuingStrategy = new CountQueuingStrategy({ highWaterMark: 15 })
const readableStream = new ReadableStream(
  {
    start(controller) {
      button.onclick = () => {
        emitMessage(controller)
      }
    },
    pull(controller) {
      emitMessage(controller)
    },
  },
  rQueuingStrategy,
)

// WritableStream
const wQueuingStrategy = new CountQueuingStrategy({ highWaterMark: 10 })
const writableStream = new WritableStream(
  {
    async write(chunk) {
      await sleep(5000)
      logInDiv(writableDiv!, chunk)
    },
  },
  wQueuingStrategy,
  // {
  //   highWaterMark: 1024,
  //   size(chunk) {
  //     return chunk.length
  //   },
  // },
)

// TransformStream
const transformStream = new TransformStream(
  {
    async transform(chunk, controller) {
      logInDiv(transformDiv!, chunk)
      controller.enqueue(chunk)
    },
  },
  // rQueuingStrategy,
  // wQueuingStrategy
)

const bridge = async function () {
  const reader = readableStream.getReader()
  const writer = writableStream.getWriter()
  while (true) {
    const { value, done } = await reader.read()
    if (value) {
      console.log('writer.desiredSize', writer.desiredSize)
      await writer.ready
      writer.write(value) // 这里也只是写到队列里
      logInDiv(transformDiv!, value)
    }
    if (done) {
      break
    }
  }
}

// readableStream.pipeThrough(transformStream).pipeTo(writableStream)
bridge()
