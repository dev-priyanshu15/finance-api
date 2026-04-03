import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateRecordDto {
  @IsNumber()
  amount: number;

  @IsString()
  type: string; // "income" | "expense"

  @IsString()
  category: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  notes?: string;
}