import { Controller, Get, Render } from 'routing-controllers';

@Controller()
export class IndexController {
  @Get('/')
  index() {
    return 'OK';
  }
  @Get('/sock')
  @Render('sock/ping.html')
  sock() {
    return 'OK';
  }
  @Get('/sock/io')
  @Render('sock/io.html')
  socketIO() {
    return 'using socket.io';
  }
  @Get('/sock/r1')
  @Render('sock/room1.html')
  room1() {
    return 'using ws';
  }
}