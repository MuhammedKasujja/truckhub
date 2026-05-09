export type Review = {
  id: number;
  rating: number;
  comment: string | null;
  passenger_id: number;
  driver_id: number;
  request_id: number;
  created_at: Date;
  updated_at: Date;
};
