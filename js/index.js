// Static JS file.
const decryptMap = [
  120, 66, 178, 85, 204, 165, 7, 129, 22, 244, 152, 11, 96, 59, 183, 119, 70,
  214, 114, 6, 53, 236, 14, 97, 239, 162, 115, 188, 123, 27, 195, 145, 199, 243,
  43, 45, 98, 175, 65, 215, 157, 151, 171, 249, 2, 194, 3, 161, 30, 35, 164,
  147, 89, 202, 55, 201, 160, 154, 254, 193, 245, 122, 191, 255, 116, 93, 198,
  187, 83, 166, 216, 170, 241, 10, 247, 82, 179, 40, 118, 242, 58, 182, 5, 47,
  28, 172, 156, 155, 32, 1, 46, 197, 251, 184, 48, 67, 79, 212, 206, 127, 77,
  169, 131, 141, 189, 94, 16, 56, 138, 124, 253, 117, 142, 231, 220, 174, 159,
  173, 240, 190, 125, 229, 31, 252, 92, 107, 37, 228, 38, 133, 177, 74, 238,
  128, 18, 15, 143, 234, 224, 4, 71, 88, 223, 62, 235, 64, 19, 81, 41, 61, 111,
  36, 49, 246, 132, 54, 80, 146, 25, 149, 76, 17, 24, 150, 103, 126, 186, 12,
  248, 52, 196, 139, 108, 222, 109, 232, 137, 99, 217, 44, 86, 121, 211, 148,
  130, 57, 153, 68, 110, 237, 20, 60, 218, 8, 209, 102, 13, 225, 73, 101, 72,
  168, 29, 203, 112, 21, 180, 181, 205, 163, 250, 136, 233, 185, 208, 230, 226,
  42, 75, 219, 213, 104, 140, 207, 91, 90, 95, 192, 106, 210, 135, 9, 84, 39,
  221, 158, 227, 51, 0, 33, 34, 50, 63, 113, 200, 144, 167, 23, 26, 87, 176,
  134, 105, 100, 69, 78,
]
// First up, get DOM things we'll interact with.
const searchField = document.querySelector('#search-field')
const searchButton = document.querySelector('#search-button')
const fetchAllButton = document.querySelector('#fetch-all')
const resultsContainer = document.querySelector('#results')
const errorMessage = document.querySelector('#error')

class Decrypter extends TransformStream {
  constructor() {
    super({
      transform(chunk, controller) {
        const decrypted = chunk.map((byte) => decryptMap[byte])
        controller.enqueue(decrypted)
      },
    })
  }
}
class DomWriter extends WritableStream {
  constructor() {
    super({
      write(chunk) {
        resultsContainer.append(chunk)
        // 可以顺便对比一下每次都设置 innerHTML 会慢多少
        // resultsContainer.innerHTML += decoder.decode(decrypt, {
        //   stream: true,
        // })
      },
    })
  }
}

let ac = null
const getNovelStream = async () => {
  if (ac) {
    ac.abort('refetch')
  }
  resultsContainer.innerHTML = ''
  const start = performance.now()
  // prevent wrong callback
  ac = new AbortController()
  const signal = ac.signal
  // signal = null
  const response = await fetch(`/novel`, { signal })

  let firstResponse = performance.now()
  console.log(`Done! 🔥 Took ${firstResponse - start}ms`)

  await response.body
    .pipeThrough(new Decrypter())
    .pipeThrough(new TextDecoderStream())
    .pipeTo(new DomWriter())
  console.log(
    `Streaming done! 🔥 ${performance.now() - firstResponse}ms after request.`
  )
  ac = null
}

const getNovelStreamOld = () => {
  resultsContainer.innerHTML = ''
  const start = performance.now()

  fetch(`/novel`).then((response) => {
    let firstResponse = performance.now()
    console.log(`Done! 🔥 Took ${firstResponse - start}ms`)

    response.body.pipeTo(
      new WritableStream({
        write(piece) {
          const decrypt = piece.map((byte) => decryptMap[byte])
          const decoder = new TextDecoder()
          resultsContainer.append(decoder.decode(decrypt, { stream: true }))
        },
        close() {
          console.log(
            `Streaming done! 🔥 ${
              performance.now() - firstResponse
            }ms after request.`
          )
        },
      })
    )
  })
}

const getNovel = async () => {
  if (ac) {
    ac.abort('fetch all')
  }
  resultsContainer.innerHTML = ''

  let firstResponse = performance.now()
  const response = await fetch(`/novel`)
  const arrayBuffer = await response.arrayBuffer()
  const view = new Uint8Array(arrayBuffer)
  for (let i = 0; i < view.byteLength; i++) {
    view[i] = decryptMap[view[i]]
  }
  const decoder = new TextDecoder()
  resultsContainer.innerHTML = decoder.decode(view)
  console.log(
    `Streaming done! 🔥 ${performance.now() - firstResponse}ms after request.`
  )
}

// On click, or on Enter, find books!
searchButton.addEventListener('click', () => getNovelStream())
fetchAllButton.addEventListener('click', () => getNovel())

// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker
//     .register("../sw.js")
//     .then(() => console.log("serviceWorker registered. 😉"))
//     .catch(error => console.error(`serviceWorker Registration failed with ${error} ☹️`))
// }
