let ulOut = document.getElementById("out"); let genUniqueClientSessionKeyLength = 8;
let roomIdInput = document.getElementById("roomId"); let uniqueClientkey;
let connectNs1Btn = document.getElementById("connectNs1"); let wsConnectId = null;
let createRm1Btn = document.getElementById("crtRm1");
let joinRm1Btn = document.getElementById("joinRm1");
let msgRm1Btn = document.getElementById("msgRm1Btn");
let leaveRoomBtn = document.getElementById("leaveRoomBtn");
let roomCloseForAllBtn = document.getElementById("roomCloseForAllBtn");
let clSocketBtn = document.getElementById("clSocketBtn");
var ws = false; let msgCounter = 0; let room = "js"
function sendMessageToServer(msg) {
    let data = { msg, room }
    ws.send('message', data)
}
genUniqueClientSessionKey = () => {
    let result = ''; const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < genUniqueClientSessionKeyLength; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
function connect() {
    if ("WebSocket" in window) {
        uniqueClientkey = genUniqueClientSessionKey();
        ws = new WebSocket("ws://localhost:3000/ns1?clientId=" + uniqueClientkey);
        ws.onopen = () => {
            let newItem = document.createElement("li"); msgCounter++;
            newItem.appendChild(document.createTextNode("ws connected" + " => " + msgCounter))
            ulOut.appendChild(newItem)
            ws.send(JSON.stringify({ "type": "serverLog", 
                params: {"message": "connected to server => " + msgCounter } } ) );
        }        
        ws.onmessage = (evt) => {
            let obj = JSON.parse(evt.data); let inMsg = null; let params = obj.data;
            switch(obj.type) {
                case "connect":
                    wsConnectId = params.connectId;
                    inMsg = "connect id => " + params.connectId;
                    break;
                case "roomCreated":
                    inMsg = "roomCreated => " + params.roomId;
                    roomIdInput.value = params.roomId;
                    break;
                case "roomJoined":
                    inMsg = "roomJoined => " + params.roomId
                    break;
                case "roomMessage":
                    inMsg = "roomMessage => " + params.message
                    break;
                case "roomLeft":
                    inMsg = "roomLeft => " + params.roomId
                    break;
                case "roomCloseForAll":
                    inMsg = "roomClose => " + params.roomId
                    break;
                case "roomError":
                    inMsg = "roomError => " + params.error
                    break;
                default:
                    inMsg = "unknown type from server "
                    break;
            }
            let newItem = document.createElement("li");  msgCounter++;
            newItem.appendChild(document.createTextNode(inMsg + " => " + msgCounter))
            ulOut.appendChild(newItem)
        }
        ws.onclose = () => {  out.innerText = "socket closed"; }
    } else { out.innerText = "Websocket not supported by browser"; }
}
connectNs1Btn.addEventListener("click", evt => { connect() } );
createRm1Btn.addEventListener("click", evt => {
    if (ws) ws.send(JSON.stringify({"type":"create", "connectId": wsConnectId, "params": {}}))
})
joinRm1Btn.addEventListener("click", (event) => {
    if (ws && roomIdInput.value.length > 0) {
        const obj = { "type": "join", "params": { "roomId": roomIdInput.value.trim() },
            "connectId": wsConnectId }
        ws.send(JSON.stringify(obj))
    } else { alert("Low roomIdInput length => " + roomIdInput.length) }
})
msgRm1Btn.addEventListener("click", evt => { msgCounter++;
    ws.send(JSON.stringify({ "type":"msg", "connectId": wsConnectId,
        "params": { msg: "message from client routed using ws => " + msgCounter }}))
})
leaveRoomBtn.addEventListener("click", evt => {
    ws.send(JSON.stringify({ "type":"leaveRoom", "connectId": wsConnectId, 
        "params": { "roomId": roomIdInput.value.trim() }}))
})
roomCloseForAllBtn.addEventListener("click", evt => {
    ws.send(JSON.stringify({ "type":"closeRoom", "connectId": wsConnectId,
        "params": { "roomId": roomIdInput.value.trim() }}))
})
clSocketBtn.addEventListener("click", evt => {
    if (ws) {
        ws.send(JSON.stringify({ "type":"closeSocket", "connectId": wsConnectId,
        "params": { "roomId": roomIdInput.value.trim() }}))
        setTimeout(() => {
            if (ws) ws.close();
        }, 100)
    }
})
roomIdInput.value = "";