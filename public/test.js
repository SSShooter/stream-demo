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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var readableDiv = document.querySelector('#readable');
var transformDiv = document.querySelector('#transform');
var writableDiv = document.querySelector('#writable');
// Utils
function randomChars(length) {
    if (length === void 0) { length = 20; }
    return Array.from({ length: Math.floor(Math.random() * length) })
        .map(function () { return String.fromCharCode(Math.floor(Math.random() * 26) + 97); })
        .join('');
}
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
function wrap(text) {
    var p = document.createElement('p');
    p.textContent = text;
    return p;
}
function logInDiv(div, text) {
    div.append(wrap(text));
    div.scrollTop = div.scrollHeight;
}
var button = document.querySelector('#readable-steam-enqueue');
var index = 0;
var emitMessage = function (controller) {
    var log = index++ + ' msg: ' + randomChars() + controller.desiredSize;
    logInDiv(readableDiv, log);
    controller.enqueue(log); // 这里是进队列
    console.log('controller.desiredSize', controller.desiredSize);
};
// ReadableStream
var rQueuingStrategy = new CountQueuingStrategy({ highWaterMark: 15 });
var readableStream = new ReadableStream({
    start: function (controller) {
        button.onclick = function () {
            emitMessage(controller);
        };
    },
    pull: function (controller) {
        emitMessage(controller);
    },
}, rQueuingStrategy);
// WritableStream
var wQueuingStrategy = new CountQueuingStrategy({ highWaterMark: 10 });
var writableStream = new WritableStream({
    write: function (chunk) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sleep(5000)];
                    case 1:
                        _a.sent();
                        logInDiv(writableDiv, chunk);
                        return [2 /*return*/];
                }
            });
        });
    },
}, wQueuingStrategy);
// TransformStream（未使用）
var transformStream = new TransformStream({
    transform: function (chunk, controller) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                logInDiv(transformDiv, chunk);
                controller.enqueue(chunk);
                return [2 /*return*/];
            });
        });
    },
});
var bridge = function () {
    return __awaiter(this, void 0, void 0, function () {
        var reader, writer, _a, value, done;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    reader = readableStream.getReader();
                    writer = writableStream.getWriter();
                    _b.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 5];
                    return [4 /*yield*/, reader.read()]; // 从队列读出来
                case 2:
                    _a = _b.sent() // 从队列读出来
                    , value = _a.value, done = _a.done;
                    if (!value) return [3 /*break*/, 4];
                    console.log('writer.desiredSize', writer.desiredSize);
                    return [4 /*yield*/, writer.ready];
                case 3:
                    _b.sent();
                    writer.write(value); // 这里也只是写到队列里
                    logInDiv(transformDiv, value);
                    _b.label = 4;
                case 4:
                    if (done) {
                        return [3 /*break*/, 5];
                    }
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    });
};
// readableStream.pipeThrough(transformStream).pipeTo(writableStream)
// bridge()
