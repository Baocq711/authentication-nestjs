import { IsNotEmpty, IsUUID } from 'class-validator';
import {
  BeforeInsert,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v7 } from 'uuid';

export class BaseColumnEntity {
  @PrimaryColumn()
  @IsUUID(7)
  @IsNotEmpty()
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = v7();
  }
}
