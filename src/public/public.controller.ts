import { Controller, Get, HttpStatus, Query, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { existsSync } from 'fs';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private publicService: PublicService) {}

  @Get('downloadPicture')
  async downloadPicture(
    @Query('fileId') fileId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    // const userAgent = req.headers['user-agent'];
    // console.log(`User-Agent: ${userAgent}`);
    const filePath = await this.publicService.downloadPicture(fileId);

    if (existsSync(filePath)) {
      const fileName = filePath.split('/').pop();

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`,
      );
      res.setHeader('Content-Type', 'application/octet-stream');

      res.sendFile(filePath, (err) => {
        if (err) {
          res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .send('Failed to download file');
        }
      });
    } else {
      res.status(HttpStatus.NOT_FOUND).send('File not found');
    }
  }
}
