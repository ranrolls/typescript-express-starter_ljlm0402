import { Controller, Get } from 'routing-controllers';
var fs = require('fs');
import { promisify } from 'util';

let readFile = promisify(fs.readFile);
let writeFile = promisify(fs.writeFile);
let unlinkFile = promisify(fs.unlink);
let beep = (num) => console.log("beep => " + num);
var delay = (seconds) => new Promise((resolves) => {
    setTimeout(() => {
        console.log("delay resolves => " + seconds);
        resolves
    }, seconds * 1000);
})

@Controller()
export class BasicsController {
    @Get('/basics')
    index() {
        return 'OK';
    }
    @Get('/basics/all')
    all() {
        Promise.all([
            delay(2),
            writeFile('sampleData/file.txt', 'Sample File...'),
            delay(3)
        ])
        .then(readFile('sampleData/data.json', 'utf-8', (err, data) => {
            var data = JSON.parse(data);
            console.log(data.name);
        }) )
        .then(() => "promise all")
        .then(console.log)
        .then(() => "OK");
        return 'OK -> The output sequence on console is not correct';
    }
    @Get('/basics/race')
    race() {
        Promise.race([
            delay(5), delay(2), delay(3), delay(5)
        ]).then(() => "promise race")
            .then(console.log);
        return 'OK -> promise.race';
    }
    @Get('/basics/seq')
    seq() {
        const doStuffSequentially = () => Promise.resolve()
            .then(() => console.log('starting'))
            .then(() => delay(1))
            .then(() => 'waiting')
            .then(console.log)
            .then(() => delay(2))
            .then(() => writeFile('sampleData/file.txt', 'Sample File...'))
            .then(beep.call(null, 1))
            .then(() => 'sampleData/file.txt created')
            .then(console.log)
            .then(() => delay(3))
            .then(() => unlinkFile('sampleData/file.txt'))
            .then(beep.call(null, 2))
            .then(() => 'sampleData/file.txt removed')
            .then(console.log)
            .catch(console.error);
        doStuffSequentially()
            .then(() => console.log('again again!!!'))
            .then(() => doStuffSequentially())
            .then(() => console.log('enough already...'));
        return 'OK -> The output sequence on console is not correct';
    }
}