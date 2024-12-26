export const INIT_ROLE_API_PATH = [
  {
    name: 'Create Role',
    path: '/role',
    method: 'POST',
    module: 'Role',
  },
  {
    name: 'Get Roles',
    path: '/role',
    method: 'GET',
    module: 'Role',
  },
  {
    name: 'Get Role',
    path: '/role/:id',
    method: 'GET',
    module: 'Role',
  },
  {
    name: 'Update Role',
    path: '/role/:id',
    method: 'PATCH',
    module: 'Role',
  },
  {
    name: 'Delete Role',
    path: '/role/:id',
    method: 'DELETE',
    module: 'Role',
  },
];
