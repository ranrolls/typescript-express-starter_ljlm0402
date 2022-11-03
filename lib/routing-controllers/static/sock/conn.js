let out = document.getElementById("out");
let cl = document.getElementById("cl");
let ba = document.getElementById("ba");
var ws = false; let msgCounter = 0;
function sendMessageToServer(msg) {
    ws.send(msg)
}
function connect() {
    if ("WebSocket" in window) {
        ws = new WebSocket("ws://localhost:3000/ns1")
        ws.onopen = () => {
            sendMessageToServer("Hi server!")
            out.innerText = "message sent to server";
        }
        ws.onmessage = (evt) => {
            out.innerText = evt.data + " => " + msgCounter;
        }
        ws.onclose = () => {
            out.innerText = "socket closed";
        }
    } else {
        out.innerText = "Websocket not supported by browser";
    }
}
connect();
cl.addEventListener("click", (evt) => {
    if(ws) ws.close();
})
ba.addEventListener("click", (event) => {
    if (ws) {
        msgCounter++;
        sendMessageToServer("hi => " + msgCounter);
    }
})