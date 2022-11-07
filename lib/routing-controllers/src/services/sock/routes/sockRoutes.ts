export default class SockRouteService {
//  #region starters/helpers
    private ws;
    private allWs = [];
    private maxClients = 5;
    private rooms = [];
    private lastRoom = "";
    constructor(ws) {
        this.addNewWs(ws);  ws = null;
    }
    addNewWs = (ws) => {
        this.allWs.push(ws); this.ws = ws;
        ws.on('message', data => {
            const obj = JSON.parse(data);
            const type = obj.type; const params = obj.params;
            let matchConnectId = obj.connectId || this.ws.uniqueClientkey;
            this.ws = this.allWs.find(ws => ws.uniqueClientkey === matchConnectId);
            if(!this.ws) {
                console.warn("No ws found for input connect id => " + obj.connectId + this.ws.uniqueClientkey)
                return false;
            }   // strip duplicate ws from allWs array
            switch (type) {
                case "serverLog": console.log(params.message); break;
                case "create": this.create(params); break;
                case "join": this.join(params.roomId); break;
                case "msg": this.inMsg(params.msg); break;
                case "leaveRoom": this.leave(params.roomId); break;
                case "closeRoom": this.closeRoom(params.roomId); break;
                case "closeSocket": this.closeSocket(); break;
                default: console.warn("Unknown type for ws => " + type); break;
            }
        });
        this.ws.send(JSON.stringify({ "type": "connect", data: { "connectId": ws.uniqueClientkey } }))
        ws = null;
    }
    closeSocket = () => {
        this.ws.close();
    }
    generalInformation = () => {
        let obj;
        if (this.ws["room"] === undefined)
            obj = {
                "type": "info",
                "params": {
                    "room": this.ws["room"],
                    "no-clients": this.rooms[this.ws["room"]].length,
                }
            }
        else
            obj = {
                "type": "info",
                "params": { "room": "no room" }
            }
        this.ws.send(JSON.stringify(obj));
    }
    genKey = (length) => {
        let result = ''; const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
    outMsg = obj => { this.ws.send(JSON.stringify(obj)); }
    create = async params => {  const room = this.genKey(3);
        this.rooms[room] = [this.ws]; this.ws["room"] = room;
        this.lastRoom = room;
        this.outMsg({ "type": "roomCreated", data: { "roomId": this.lastRoom } })
    }
    inMsg = async msg => {  console.log(msg);
        if(!this.rooms[this.ws.room]) {
            let outMsg = JSON.stringify({
                "type": "roomError", data: {
                    "error": "From => " + this.ws.uniqueClientkey + " : No room found" } })
            this.ws.send(outMsg);
        } else if(this.rooms[this.ws.room].length === 0) {
            let outMsg = JSON.stringify({
                "type": "roomError", data: {
                    "error": "From => " + this.ws.uniqueClientkey + " : No user in room" } })
            this.ws.send(outMsg);
        } else {
            let outMsg = JSON.stringify({
                "type": "roomMessage", data: {
                    "message": "From => " + this.ws.uniqueClientkey + " : " + msg }  })
            this.rooms[this.ws.room].forEach(wsItem => wsItem.send(outMsg));
        }
    }
    join = async room => {  console.log(room);
        if (!Object.keys(this.rooms).includes(room)) {
            this.outMsg({ "type": "roomError", data: { "roomId": this.lastRoom,
                "error": `Room ${room} does not exist!` } })
            return;                                  }
        if (this.rooms[room].length >= this.maxClients) {
            this.outMsg({ "type": "roomError", data: { "roomId": this.lastRoom,
                "error": `Room ${room} is full!` } }); return; }
        let alreadyAvailable = false;
        alreadyAvailable = this.rooms[room].some((availableWs) => {
            return availableWs.uniqueClientkey === this.ws.uniqueClientkey;   })
        if(!alreadyAvailable) {
            this.rooms[room].push(this.ws); this.ws["room"] = room; }
        this.lastRoom = room;
        this.outMsg({ "type": "roomJoined", data: { "roomId": this.lastRoom } })
    }
//  #endregion
    leave = async roomId => {   console.log(roomId);
        if(!this.ws["room"] && this.ws["room"].length < 1) {
            this.outMsg({ "type": "roomError", data: { "error": "User => " + this.ws.uniqueClientkey + " not connected to any room yet!" } }); return;
        }
        this.rooms[roomId] = this.rooms[roomId].filter(wsItem => wsItem.uniqueClientkey !== this.ws.uniqueClientkey);
        this.ws["room"] = undefined;
        if (this.rooms[roomId].length == 0) { this.closeRoom(roomId); return; }
        this.outMsg({ "type": "roomLeft", data: { "roomId": roomId } })
    }
    closeRoom = (roomId) => {
        this.rooms = this.rooms.filter(key => key !== roomId);
        this.outMsg({ "type": "roomCloseForAll", data: { "roomId": roomId } })
    }
}