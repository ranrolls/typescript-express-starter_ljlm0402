import { Controller, Get } from 'routing-controllers';
import { spawn, spawnSync, fork } from 'child_process';
@Controller()
export class ChildProcessController {
  @Get('/cp/fork')
  async fork() {
    let controller = new AbortController()
    let { signal } = controller;
    let fp = fork('./sampleData/cp/fork.js', ["arg_1", "arg_2"], { signal });
    fp.on('error', (abortErr) => {
      console.error("caught abort error");
    })
    fp.on('message', (msg) => {
      console.log("message from child => " + msg);
    })
    fp.send("hi child");
    let result = await new Promise(async (resolve) => {
      setTimeout(() => {
        resolve(true)
        controller.abort();
      }, 4000)
    })
    return result;
  }
  @Get('/cp/sp/sync')
  async sync() {
    let result = await new Promise(async (resolve) => {
      let spawnP = spawnSync('node', ['--version']);
      // console.log("spawnPa => " + Object.keys(spawnPa));
      console.log("spawnSync output as => " + spawnP.stdout.toString());
      resolve(true);
    });
    if (result) {
      return result;
    } else { return "error"; }
  }
  @Get('/cp/sp/node')
  async spawnNode() {
    let result = await new Promise(async (resolve) => {
      let spawnP = spawn("node", ["--version"]);
      spawnP.stdout.on('data', (data) => {
        console.log("data from spawnP => " + data);
      })
      spawnP.stderr.on('data', (err) => {
        console.error(err);
      })
      spawnP.on('error', (err) => {
        console.log("spawnP has caught error");
        console.error(err)
      })
      spawnP.on('exit', () => {
        console.log("spawnP has exit")
      })
      spawnP.on('close', () => {
        console.log("spawnP has closed");
        resolve(true);
      })
    });
    if (result) {
      return result;
    } else { return "error"; }
  }
  @Get('/cp/sp')
  async spawn() {
    let result = await new Promise(async (resolve) => {
      let spawnP = await spawn('node', [' --version']);
      // let spawnP = spawnSync('node', [' ./sampleData/cp/spawn.js']);
      spawnP.on('data', (data) => {
        console.log("spawnP returns => " + data);
      })
      spawnP.on('exit', () => {
        console.log("spawnP has exit")
      })
      spawnP.on('close', () => {
        console.log("spawnP has closed");
        resolve(true);
      })
    });
    if (result) {
      return result;
    } else { return "error"; }
  }
  @Get('/cp')
  index() {
    return 'cp';
  }
}
