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
  return (userRole & permissionLevel) === permissionLevel
}

export const roleRows = [
  { id: 'pricelists', name: 'pricelists' },
  { id: 'customers', name: 'customers' },
  { id: 'advertising', name: 'advertising' },
  { id: 'cars', name: 'cars' },
  { id: 'manufacturers', name: 'manufacturers' },
  { id: 'categories', name: 'categories' },
  { id: 'techsupport', name: 'techsupport' },
  { id: 'reports', name: 'reports' },
  { id: 'settings', name: 'settings' },
]

export const initRolesState = {
  pricelists: false,
  customers: false,
  advertising: false,
  cars: false,
  manufacturers: false,
  categories: false,
  techsupport: false,
  reports: false,
  settings: false,
}

export const createRolesState = (role: number) => {
  return {
    pricelists: (role & PRICELISTS_ROLE) === PRICELISTS_ROLE,
    customers: (role & CUSTOMERS_ROLE) === CUSTOMERS_ROLE,
    advertising: (role & ADVERTISING_ROLE) === ADVERTISING_ROLE,
    cars: (role & CARS_ROLE) === CARS_ROLE,
    manufacturers: (role & MANUFACTURERS_ROLE) === MANUFACTURERS_ROLE,
    categories: (role & CATEGORIES_ROLE) === CATEGORIES_ROLE,
    techsupport: (role & TECHSUPPORT_ROLE) === TECHSUPPORT_ROLE,
    reports: (role & REPORTS_ROLE) === REPORTS_ROLE,
    settings: (role & SETTINGS_ROLE) === SETTINGS_ROLE,
  }
}

export const createRole = (roles: Record<string, boolean>) => {
  let role = 0
  if (roles.pricelists) role |= PRICELISTS_ROLE
  if (roles.customers) role |= CUSTOMERS_ROLE
  if (roles.advertising) role |= ADVERTISING_ROLE
  if (roles.cars) role |= CARS_ROLE
  if (roles.manufacturers) role |= MANUFACTURERS_ROLE
  if (roles.categories) role |= CATEGORIES_ROLE
  if (roles.techsupport) role |= TECHSUPPORT_ROLE
  if (roles.reports) role |= REPORTS_ROLE
  if (roles.settings) role |= SETTINGS_ROLE
  return role
}


