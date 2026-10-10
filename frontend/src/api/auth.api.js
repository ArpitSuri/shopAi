import http from './http';

export const authApi = {
  signup: (data) => http.post('/auth/signup', data),
  verifyOtp: (email, otp) => http.post('/auth/verify-otp', { email, otp }),
  resendOtp: (email) => http.post('/auth/resend-otp', { email }),
  login: (data) => http.post('/auth/login', data),
  me: () => http.get('/auth/me'),
};
