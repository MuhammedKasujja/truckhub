export type Customer = {
  id: number;
  number: string
  fullname: string;
  short_name: string | undefined;
  phone: string;
  balance: string | number;
  paid_to_date: string | number;
  email: string;
  created_at: Date;
  updated_at: Date;
};
