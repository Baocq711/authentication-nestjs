export const INIT_AUTH_API_PATH = [
  {
    name: 'Sign in',
    path: '/auth/signin',
    method: 'POST',
    module: 'Auth',
  },
  {
    name: 'Sign out',
    path: '/auth/signout',
    method: 'POST',
    module: 'Auth',
  },
  {
    name: 'Sign up',
    path: '/auth/signup',
    method: 'POST',
    module: 'Auth',
  },
  {
    name: 'Refresh',
    path: '/auth/refresh',
    method: 'GET',
    module: 'Auth',
  },
  {
    name: 'Profile',
    path: '/auth/profile',
    method: 'GET',
    module: 'Auth',
  },
];
