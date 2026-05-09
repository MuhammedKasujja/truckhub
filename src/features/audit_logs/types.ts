export type AuditLog = {
  id: string;
  user_id: string;
  resource_type: string;
  source: string;
  action: string;
  created_at: string;
};
