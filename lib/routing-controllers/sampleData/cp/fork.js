console.log("incomming args from parent at intialization => ")
console.log("process.argv[2] => " + process.argv[2])
console.log("process.argv[3] => " + process.argv[3])
process.on("message", (msg) => {
    console.log("process message caught at child from parent => ")
    console.log(msg);
})
process.send("message from child")

setTimeout(() => {
    console.log("Log from fork.js")
}, 2000)