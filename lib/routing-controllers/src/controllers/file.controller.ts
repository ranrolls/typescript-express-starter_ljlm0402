import { Controller, Get } from 'routing-controllers';
const path = require("path");
var fs = require('fs')
var data = {
  name: 'Bob'
}
@Controller()
export class FileController {
  @Get('/file')
  index() {
    return `The file name is ${path.basename(__filename)}`;
  }
  @Get('/file/read')
  read() {
    fs.readFile('sampleData/data.json', 'utf-8', (err, data) => {
      var data = JSON.parse(data);
      console.log(data.name);
    })
    return 'OK';
  }
  @Get('/file/readDir')
  readDir() {
    fs.readdir('C:/dev/code/prac', (err, data) => {
      console.log(data)
    })
    return 'OK';
  }
  @Get('/file/write')
  write() {
    fs.writeFile('sampleData/data.json', JSON.stringify(data), (err) => {
      console.log('write finished', err)
    })
    return 'OK';
  }
  @Get('/file/appendFile')
  appendFile() {
    let md = `
        This is a New File
        ==================

        ES6 Template Strings are cool. They honor whitespace.

        * Template Strings
        * Node File System
        * Readline CLIs
    `;
    let appendFile = () => {
      fs.appendFileSync(
        "sampleData/javascript.md",
        "\n\n### Node.js Everyone!"
      );
      console.log("Markdown Created");
    }
    if (!fs.existsSync("sampleData/javascript.md")) {
      fs.writeFile("sampleData/javascript.md", md.trim(), function (err) {
        if (err) {
          throw err;
        }
        appendFile()
      });
    } else appendFile()

    return 'OK';
  }
  @Get('/file/mkDir')
  mkDir() {
    if (fs.existsSync("sampleData/mkDir")) {
      console.log("already there!");
    } else {
      fs.mkdir("sampleData/mkDir", function (err) {
        if (err) {
          console.log(`ERROR: ${err}`);
        } else {
          console.log("directory created");
        }
      });
    }
    return 'OK';
  }
  @Get('/file/rename')
  rename() {
    if (fs.existsSync("sampleData/newName.md")) return 'Already renamed'
    // fs.renameSync("sampleData/javascript.md", "sampleData/newName.md");
    fs.rename("sampleData/javascript.md", "sampleData/newName.md", function (err) {
      if (err) {
        throw err;
      }
      console.log("Notes markdown file moved");
    });
    return 'OK';
  }
  @Get('/file/removeFile')
  removeFile() {
    if (fs.existsSync("sampleData/newName.md")) {
      // fs.unlinkSync("sampleData/newName.md");
      fs.unlink("sampleData/newName.md", function (err) {
        if (err) {
          throw err;
        }
        console.log("Notes markdown file moved");
      });
    }
    return 'OK';
  }
  @Get('/file/deleteDir')
  deleteDir() {
    // fs.readdirSync("./accounts").forEach((file) => {
    //   fs.renameSync(`./accounts/${file}`, `./library/${file}`);
    // });
    return 'OK';
  }
  @Get('/file/deleteDirectory')
  deleteDirectory() {
    // fs.rmdir("./assets", function (err) {
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     console.log("./assets directory removed");
    //   }
    // });
    // fs.rmdirSync("./accounts");
    return 'OK';
  }
}
