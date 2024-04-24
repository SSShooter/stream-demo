// generate random characters with random length
function randomChars() {
  return Array.from({ length: Math.floor(Math.random() * 20) })
    .map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 97))
    .join("");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const button = document.querySelector<HTMLButtonElement>(
  "#readable-steam-enqueue"
)!;
const rQueuingStrategy = new CountQueuingStrategy({ highWaterMark: 5 });
const readableStream = new ReadableStream(
  {
    start(controller) {
      button.onclick = () => {
        console.log("enqueue", controller.desiredSize);
        controller.enqueue(randomChars());
      };
    },
    pull(controller) {
      console.log("pull", controller.desiredSize);
      controller.enqueue("from pull: " + randomChars());
    },
  },
  rQueuingStrategy
);

// const reader = readableStream.getReader();
// const readButton = document.querySelector('#read');
// readButton.onclick = async () => {
//     const { value, done } = await reader.read();
//     console.log('read', value, done);
// };

const wQueuingStrategy = new CountQueuingStrategy({ highWaterMark: 1 });

const writableStream = new WritableStream(
  {
    async write(chunk) {
      console.log("write start");
      await sleep(5000);
      console.log("write", chunk);
    },
  },
  wQueuingStrategy
);

// const writer = writableStream.getWriter();
// writer.desiredSize

const transformStream = new TransformStream({
  async transform(chunk, controller) {
    console.log("transform", chunk);
    controller.enqueue(chunk);
  },
});

readableStream.pipeThrough(transformStream).pipeTo(writableStream);

const f = async () => {
  const response = await fetch("/text");
  const clone = response.clone();
  const reader = response.body!.getReader();
  return [clone, reader];
};
