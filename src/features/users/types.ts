export type SystemUser = {
  id: number;
  number: string | undefined;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | undefined;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};
