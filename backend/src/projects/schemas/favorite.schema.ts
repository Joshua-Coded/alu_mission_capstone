import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type FavoriteDocument = Favorite & Document;

@Schema({ timestamps: true })
export class Favorite {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  project: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);

// Create compound index to ensure a user can only favorite a project once
FavoriteSchema.index({ user: 1, project: 1 }, { unique: true });