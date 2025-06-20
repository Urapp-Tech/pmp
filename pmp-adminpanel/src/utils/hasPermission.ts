import { useSelector } from 'react-redux';

type Permission = {
  name: string;
  action: string;
  show_on_menu: boolean;
};

export function hasPermission(
  rolePermissions: any[],
  requiredPermission: string
): boolean {
  return rolePermissions?.some(
    (perm) => perm.name === requiredPermission && perm.show_on_menu
  );
}

export function usePermission() {
  const authState = useSelector((state: any) => state.authState);
  const userPermissions: any[] = authState?.user?.role?.permissions || [];

  const can = (permissionName: string): boolean => {
    return userPermissions.some((p) => p.name === permissionName);
  };

  const canAny = (permissions: string[]): boolean => {
    return permissions.some((name) =>
      userPermissions.some((p) => p.name === name)
    );
  };

  return { can, canAny };
}
