import { IsString, IsNumber, IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateRecordDto {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}