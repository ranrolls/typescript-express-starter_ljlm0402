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
  @Get('/sock/r1')
  @Render('sock/room1.html')
  room1() {
    return 'OK';
  }
}
