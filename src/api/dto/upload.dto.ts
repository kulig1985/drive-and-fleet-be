// dto/upload.dto.ts
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UploadedFileDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  content: string;
}

export class UploadDto {
  @IsNumber()
  kmAmount: number;

  @IsString()
  fuelLevel: string;

  @IsNumber()
  orderId: number;

  @IsNumber()
  rideId: number;

  @IsArray()
  @IsString({ each: true })
  equipmentsList: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UploadedFileDto)
  uploadedFiles: UploadedFileDto[];

  @IsString()
  signature: string;
}
