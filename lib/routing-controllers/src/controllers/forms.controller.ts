import { Response, Request } from 'express';
import { Controller, Get, Post, Render, Res, Req, Body, BodyParam } from 'routing-controllers';
import multiparty from 'multiparty';
import { createWriteStream } from 'fs';
@Controller()
export class FormsController {
    @Post('/forms/textUp')
    async textUp(@Res() res: Response, @BodyParam("fn") first_name: string, @BodyParam("ln") last_name: string) {
        return "First name => " + first_name + " Last name => " + last_name;
    }
    @Get('/forms/text')
    @Render('forms/text.html')
    text() {
        return '/text';
    }
    @Post('/forms/up')
    async up(@Res() res: Response, @Req() req: Request) {
        let result = await new Promise(async (resolve, reject) => {
            let form = new multiparty.Form();
            form.on('part', (part) => {
                part.pipe(createWriteStream(`./sampleData/up/in/${part.filename}`))
                    .on('close', () => {
                        resolve(part.filename);
                    })
                    .on('error', () => {
                        reject(false)
                    })
            });
            form.parse(req);
        });
        if (result) {
            return `<h1>File uploaded: ${result}</h1>`
        } else {
            return "error"
        }
    }
    @Get('/forms')
    @Render('forms/up.html')
    index() {
        return '/forms';
    }
}
