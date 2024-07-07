import { Injectable, Logger } from '@nestjs/common';
import { DaoService } from '../dao/dao.service';

@Injectable()
export class PublicService {
  private readonly logger = new Logger(PublicService.name);
  constructor(private daoService: DaoService) {}

  async downloadPicture(fileId: number): Promise<string> {
    const file = await this.daoService.fileRepository.findOne({
      where: { fileId: fileId },
    });
    this.logger.log('file found: ', file);
    const filePath = file.filePath;
    this.logger.log('filePath: ', filePath);

    return filePath;
  }
}
