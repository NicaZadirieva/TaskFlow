export interface IUser {
  key: React.Key;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  hourly_rate?: number;
}