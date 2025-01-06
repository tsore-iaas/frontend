export type AuthError = {
  message: string;
  field?: string;
  code?: string;
};

export type NotificationType = 'success' | 'error' | 'info';

export type Notification = {
  type: NotificationType;
  message: string;
  duration?: number;
};

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export interface AuthErrorResponse {
  error: string;
  message: string;
  details?: Record<string, string>;
}
