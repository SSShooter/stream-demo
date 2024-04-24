var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
// generate random characters with random length
function randomChars() {
    return Array.from({ length: Math.floor(Math.random() * 20) })
        .map(function () { return String.fromCharCode(Math.floor(Math.random() * 26) + 97); })
        .join("");
}
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
var button = document.querySelector("#readable-steam-enqueue");
var rQueuingStrategy = new CountQueuingStrategy({ highWaterMark: 5 });
var readableStream = new ReadableStream({
    start: function (controller) {
        button.onclick = function () {
            console.log("enqueue", controller.desiredSize);
            controller.enqueue(randomChars());
        };
    },
    pull: function (controller) {
        console.log("pull", controller.desiredSize);
        controller.enqueue("from pull: " + randomChars());
    }
}, rQueuingStrategy);
// const reader = readableStream.getReader();
// const readButton = document.querySelector('#read');
// readButton.onclick = async () => {
//     const { value, done } = await reader.read();
//     console.log('read', value, done);
// };
var wQueuingStrategy = new CountQueuingStrategy({ highWaterMark: 1 });
var writableStream = new WritableStream({
    write: function (chunk) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("write start");
                        return [4 /*yield*/, sleep(5000)];
                    case 1:
                        _a.sent();
                        console.log("write", chunk);
                        return [2 /*return*/];
                }
            });
        });
    }
}, wQueuingStrategy);
// const writer = writableStream.getWriter();
// writer.desiredSize
var transformStream = new TransformStream({
    transform: function (chunk, controller) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("transform", chunk);
                controller.enqueue(chunk);
                return [2 /*return*/];
            });
        });
    }
});
readableStream.pipeThrough(transformStream).pipeTo(writableStream);
var f = function () { return __awaiter(_this, void 0, void 0, function () {
    var response, clone, reader;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetch("/text")];
            case 1:
                response = _a.sent();
                clone = response.clone();
                reader = response.body.getReader();
                return [2 /*return*/, [clone, reader]];
        }
    });
}); };
