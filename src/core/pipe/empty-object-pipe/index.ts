import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isNotEmptyObject } from 'class-validator';

export interface EmptyObjectPipeOptions {
  message?: string;
}

@Injectable()
export class EmptyObjectPipe implements PipeTransform {
  constructor(private readonly options: EmptyObjectPipeOptions = {}) {}

  transform(value: any) {
    if (!isNotEmptyObject(value)) {
      throw new BadRequestException(this.options.message || 'Object should not be empty');
    }
    return value;
  }
}
