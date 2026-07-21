import { EntityId } from "@/schemas";

export type Review = {
  id: EntityId;
  rating: number;
  comment: string | null;
  passenger_id: EntityId;
  driver_id: EntityId;
  request_id: EntityId;
  created_at: Date;
  updated_at: Date;
};
