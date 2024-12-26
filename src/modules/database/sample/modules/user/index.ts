export const INIT_USER_API_PATH = [
  {
    name: 'Create User',
    path: '/user',
    method: 'POST',
    module: 'User',
  },
  {
    name: 'Get Users',
    path: '/user',
    method: 'GET',
    module: 'User',
  },
  {
    name: 'Get Users',
    path: '/user/:id',
    method: 'GET',
    module: 'User',
  },
  {
    name: 'Update Users',
    path: '/user/:id',
    method: 'PATCH',
    module: 'User',
  },
  {
    name: 'Delete Users',
    path: '/user/:id',
    method: 'DELETE',
    module: 'User',
  },
];
