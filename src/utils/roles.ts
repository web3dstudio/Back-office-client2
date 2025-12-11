export const PRICELISTS_ROLE = 1
export const CUSTOMERS_ROLE = 2
export const ADVERTISING_ROLE = 4
export const CARS_ROLE = 8
export const MANUFACTURERS_ROLE = 16
export const CATEGORIES_ROLE = 32
export const TECHSUPPORT_ROLE = 64
export const REPORTS_ROLE = 128
export const SETTINGS_ROLE = 256

export const checkUserPermission = (permissionLevel: number | undefined, userRole: number): boolean => {
  if (!permissionLevel || permissionLevel === 0) return true
  // Проверяем, что все биты permissionLevel присутствуют в userRole
  // Используем побитовое И (&) вместо ИЛИ (|)
  return (userRole & permissionLevel) === permissionLevel
}
