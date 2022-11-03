import SockRouteService from "./routes/sockRoutes";
let sockRouteServiceInst = null;
export default class SockService {
    
    public static init = async (sockInterface) => {
        //  ns1         name_space
        sockInterface.ws('/ns1', (ws, req) => {
            let uniqueClientkey = !!req.query.clientId ? req.query.clientId : "";
            ws["uniqueClientkey"] = uniqueClientkey;
            if (!sockRouteServiceInst) {
                sockRouteServiceInst = new SockRouteService(ws);
            } else {
                sockRouteServiceInst.addNewWs(ws)
            }            
            ws =  null; req = null;
        })

        //  default     name_space
        /*
        sockInterface.ws('/', function (ws, req) {
            ws.on('message', (msg) => {
                console.log(msg);
                setImmediate(() => {
                    if (ws.OPEN === 1) {
                        ws.send("msg from default namespace")
                    }
                })
            })
        })
        */
    }
}