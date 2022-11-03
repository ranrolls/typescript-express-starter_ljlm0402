import { Response } from 'express';
import {
  createReadStream, createWriteStream, existsSync,
  unlinkSync
} from 'fs';
import {
  Controller, Get, Res, ContentType
} from 'routing-controllers';
import {
  StreamFromArray, PassThrough, Throttle,
  TransformToUpperCase
} from '@/services/stream.service';
let counter = 0;
@Controller()
export class StreamController {
  @Get('/stream')
  index() {
    return 'OK';
  }
  @Get('/stream/read')
  async read(@Res() res: Response) {
    let result = await new Promise(async (resolve) => {
      const alphabets = ["a", "b", "c", "d", "e", "f", "g"];
      const alphaStream = new StreamFromArray(alphabets);
      alphaStream.on('data', chunk => console.log(chunk));
      alphaStream.on('end', () => resolve("ok"));
    });
    if (result) {
      return res.send(result);
    } else {
      return res.send("error");
    }
  }
  @Get('/stream/duplex')
  async duplex(@Res() res: Response) {
    try {
      const readStream = createReadStream('./sampleData/powder-day.mp4');
      const simpleTransformer = new PassThrough();
      const throttle = new Throttle(100);
      var total = 0;
      if (existsSync('./sampleData/copy-' + counter + '.mp4')) {
        await unlinkSync('./sampleData/copy-' + counter + '.mp4');
      } else if (existsSync('./sampleData/copy-' + 1 + '.mp4')) {
        await unlinkSync('./sampleData/copy-' + 1 + '.mp4');
      } else if (existsSync('./sampleData/copy-' + 2 + '.mp4')) {
        await unlinkSync('./sampleData/copy-' + 2 + '.mp4');
        counter = 0;
      }
      counter++;
      const writeStream = createWriteStream('./sampleData/copy-' + counter + '.mp4');
      let result = await new Promise(async (resolve) => {
        simpleTransformer.on('data', (chunk) => {
          total += chunk.length;
          console.log('bytes: ', total);
        });
        readStream
          .pipe(throttle)
          .pipe(simpleTransformer)
          .pipe(writeStream);
        writeStream.on('close', () => {
          resolve("success file transform complete")
        })
      });
      if (result) {
        return res.send(result);
      } else {
        return res.send("error");
      }
    } catch (err) {
      console.error(err);
      return err;
    }
  }
  @Get('/stream/transform')
  async transform(@Res() res: Response) {
    let readStream = createReadStream("sampleData/javascript.md");
    let writeStream = createWriteStream("sampleData/upperCase.md")
    let upperCaseTransform = new TransformToUpperCase("");
    let result = await new Promise(async (resolve) => {
      readStream.pipe(upperCaseTransform).pipe(writeStream);
      writeStream.on('close', () => {
        resolve("success close write stream");
      })
    })
    if (result) {
      return res.send(result)
    } else {
      return res.send("error")
    }
  }
  @Get('/stream/rw')
  async rw(@Res() res: Response) {
    if (existsSync('./sampleData/copy-' + counter + '.mp4')) {
      await unlinkSync('./sampleData/copy-' + counter + '.mp4');
    } else if (existsSync('./sampleData/copy-' + 1 + '.mp4')) {
      await unlinkSync('./sampleData/copy-' + 1 + '.mp4');
    } else if (existsSync('./sampleData/copy-' + 2 + '.mp4')) {
      await unlinkSync('./sampleData/copy-' + 2 + '.mp4');
      counter = 0;
    }
    counter++;
    let result = await new Promise(async (resolve) => {
      const readStream = await createReadStream('./sampleData/powder-day.mp4');
      const writeStream = await createWriteStream('./sampleData/copy-' + counter + '.mp4', {
        highWaterMark: 1628920128
      }); // in bytes
      readStream.on('data', (chunk) => {
        const result = writeStream.write(chunk);
        if (!result) {
          console.log('backpressure');
          readStream.pause();
        }
      });
      readStream.on('error', (error) => {
        console.log('an error occurred', error.message);
      });
      readStream.on('end', () => { writeStream.end(); });
      writeStream.on('drain', () => {
        console.log('drained');
        readStream.resume();
      })
      writeStream.on('close', () => {
        resolve("success close write stream")
      })
    })
    if (result) {
      return res.send(result)
    } else {
      return res.send("error")
    }
  }
  @Get('/stream/vid')
  @ContentType("video/mp4")
  async vid(@Res() res: Response) {
    let stream = await createReadStream('./sampleData/powder-day.mp4');
    stream.on("end", () => {
      console.log("stream ends here");
    })
    stream.on("error", console.error);
    if (stream) {
      return stream;
    } else {
      return "error";
    }
  }
  @Get('/stream/fsReadStream')
  fsReadStream() {
    if (existsSync("sampleData/javascript.md")) {
      let stream = createReadStream(
        "sampleData/javascript.md");
      let data;
      stream.once("data", (chunk) => {
        console.log("read stream started"); console.log("==========");
        console.log(chunk);
      });
      stream.on("data", (chunk) => {
        console.log(`chunk: ${chunk.length}`);
        data += chunk;
      });
      //  readStream.pause()
      //  readStream.resume()
      //  readStream.read()
      stream.on("end", () => {
        console.log(`finished ${data.length}`);
      });
    }
    return 'OK';
  }
  @Get('/stream/fsWriteStream')
  fsWriteStream() {
    // for implementation need continue write data
    let answerStream = createWriteStream("sampleData/javascript.md");
    answerStream.write(
      `Question Answers for \n========\n`
    );
    answerStream.close();
    return 'OK';
  }
}