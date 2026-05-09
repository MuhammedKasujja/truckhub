export type Customer = {
  id: number;
  number: string
  fullname: string;
  first_name: string;
  last_name: string;
  user_name: string | undefined;
  phone: string;
  balance: string | number;
  paid_to_date: string | number;
  email: string;
  created_at: Date;
  updated_at: Date;
};
