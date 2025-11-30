export const PRICELISTS_ROLE = 1
export const CUSTOMERS_ROLE = 2
export const ADVERTISING_ROLE = 4
export const CARS_ROLE = 8
export const MANUFACTURERS_ROLE = 16
export const CATEGORIES_ROLE = 32
export const TECHSUPPORT_ROLE = 64
export const REPORTS_ROLE = 128
export const SETTINGS_ROLE = 256

export const checkUserPermission = (permissionLevel = 0, userRole: number) => {
  if (!permissionLevel || permissionLevel === 0) return true
  return (permissionLevel | userRole) === userRole
}

export const initRolesState = {
  [PRICELISTS_ROLE]: false,
  [CUSTOMERS_ROLE]: false,
  [ADVERTISING_ROLE]: false,
  [CARS_ROLE]: false,
  [MANUFACTURERS_ROLE]: false,
  [CATEGORIES_ROLE]: false,
  [TECHSUPPORT_ROLE]: false,
  [REPORTS_ROLE]: false,
  [SETTINGS_ROLE]: false,
}

export const initRolesStateChecked = {
  [PRICELISTS_ROLE]: true,
  [CUSTOMERS_ROLE]: true,
  [ADVERTISING_ROLE]: true,
  [CARS_ROLE]: true,
  [MANUFACTURERS_ROLE]: true,
  [CATEGORIES_ROLE]: true,
  [TECHSUPPORT_ROLE]: true,
  [REPORTS_ROLE]: true,
  [SETTINGS_ROLE]: true,
}

export const roleRows = [
  {
    id: PRICELISTS_ROLE,
    name: 'pricelist',
  },
  {
    id: CUSTOMERS_ROLE,
    name: 'customers',
  },
  {
    id: ADVERTISING_ROLE,
    name: 'adds',
  },
  {
    id: CARS_ROLE,
    name: 'cars',
  },
  {
    id: MANUFACTURERS_ROLE,
    name: 'manufacturers',
  },
  {
    id: CATEGORIES_ROLE,
    name: 'categories',
  },
  {
    id: TECHSUPPORT_ROLE,
    name: 'techSupport',
  },
  {
    id: REPORTS_ROLE,
    name: 'reports',
  },
  {
    id: SETTINGS_ROLE,
    name: 'settings',
  },
]

export const createRole = (roles: Record<number, boolean>) => {
  const rolesArr = Object.entries(roles).reduce((acc: number[], [role, isTrue]) => {
    if (isTrue) acc.push(parseInt(role))
    return acc
  }, [])
  const role = rolesArr.reduce((acc, val) => {
    acc = acc | val
    return acc
  }, 0)
  return role
}

export const createRolesState = (userRole = 0) => {
  const rolesState = Object.keys(initRolesState).reduce((acc: Record<string, boolean>, role) => {
    acc[role] = checkUserPermission(parseInt(role), userRole)
    return acc
  }, {})
  return rolesState
}

