import { Readable, Duplex, PassThrough, Transform } from 'stream';
const peaks = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n"];
class StreamFromArray extends Readable {
    constructor(array) {
        super({objectMode: true})
        this.array = array;
        this.index = 0;
    }

    _read() {
        if (this.index <= this.array.length) {
            const chunk = {
                data: this.array[this.index],
                index: this.index
            }
            this.push(chunk);
            this.index += 1;
        } else {
            this.push(null)
        }
    }
}
class Throttle extends Duplex {
    constructor(ms) {
        super();
        this.delay = ms;
    }
    _write(chunk, encoding, callback) {
        this.push(chunk);
        setTimeout(callback, this.delay);
    }
    _read() {}
    _final() {
        this.push(null)
    }
}
class TransformToUpperCase extends Transform {
    constructor(char) {
        super();
        this.replaceChar = char;
    }
    _transform(chunk, encoding, callback) {
        const transformChunk = chunk.toString().toUpperCase();
        this.push(transformChunk);
        callback();
    }
    _flush(callback) {
        this.push('more stuff is being passed ...')
        callback();
    }
}
export { StreamFromArray, PassThrough, Throttle, TransformToUpperCase }