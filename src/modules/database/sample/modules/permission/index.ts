export const INIT_PERMISSION_API_PATH = [
  {
    name: 'Create Permission',
    path: '/permission',
    method: 'POST',
    module: 'Permission',
  },
  {
    name: 'Get Permissions',
    path: '/permission',
    method: 'GET',
    module: 'Permission',
  },
  {
    name: 'Get Permission',
    path: '/permission/:id',
    method: 'GET',
    module: 'Permission',
  },
  {
    name: 'Update Permission',
    path: '/permission/:id',
    method: 'PATCH',
    module: 'Permission',
  },
  {
    name: 'Delete Permission',
    path: '/permission/:id',
    method: 'DELETE',
    module: 'Permission',
  },
];
