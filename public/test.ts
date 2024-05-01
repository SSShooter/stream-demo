const readableDiv = document.querySelector('#readable')
const transformDiv = document.querySelector('#transform')
const writableDiv = document.querySelector('#writable')

// generate random characters with random length
function randomChars() {
  return Array.from({ length: Math.floor(Math.random() * 20) })
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
  '#readable-steam-enqueue'
)!
const rQueuingStrategy = new CountQueuingStrategy({ highWaterMark: 5 })
// const rQueuingStrategy = new ByteLengthQueuingStrategy({ highWaterMark: 1024 });

let index = 0
const readableStream = new ReadableStream(
  {
    start(controller) {
      button.onclick = () => {
        const log =
          index++ + ' start: ' + randomChars() + controller.desiredSize
        logInDiv(readableDiv!, log)
        controller.enqueue(log)
      }
    },
    pull(controller) {
      const log = index++ + ' pull: ' + randomChars() + controller.desiredSize
      logInDiv(readableDiv!, log)
      controller.enqueue(log)
    },
  },
  rQueuingStrategy
)

// const reader = readableStream.getReader();
// const readButton = document.querySelector('#read');
// readButton.onclick = async () => {
//     const { value, done } = await reader.read();
//     console.log('read', value, done);
// };

const wQueuingStrategy = new CountQueuingStrategy({ highWaterMark: 10 })
// const wQueuingStrategy = new ByteLengthQueuingStrategy({ highWaterMark: 1024 });

const writableStream = new WritableStream(
  {
    async write(chunk) {
      await sleep(5000)
      logInDiv(writableDiv!, chunk)
    },
  },
  wQueuingStrategy
  // {
  //   highWaterMark: 1024,
  //   size(chunk) {
  //     return chunk.length
  //   },
  // }
)

// const writer = writableStream.getWriter();
// writer.desiredSize

const transformStream = new TransformStream(
  {
    async transform(chunk, controller) {
      logInDiv(transformDiv!, chunk)
      controller.enqueue(chunk)
    },
  }
  // rQueuingStrategy,
  // wQueuingStrategy
)

readableStream.pipeThrough(transformStream).pipeTo(writableStream)

const f = async () => {
  const response = await fetch('/text')
  const clone = response.clone()
  const reader = response.body!.getReader()
  return [clone, reader]
}
