export const FIX_CHANGE = 1
export const ONE_TIME_CHANGE = 2

export const YEAR_PARAMETER = 1
export const MANUFACTURER_PARAMETER = 2
export const CATEGORY_PARAMETER = 3
export const CARTYPE_PARAMETER = 4
export const MODEL_PARAMETER = 5
export const VOLUME_PARAMETER = 6
export const PRICE_PARAMETER = 7

export const parameterSelectOptions = [
  {
    id: YEAR_PARAMETER,
    name: 'year',
  },
  {
    id: MANUFACTURER_PARAMETER,
    name: 'manufacturer',
  },
  {
    id: CATEGORY_PARAMETER,
    name: 'category',
  },
  {
    id: CARTYPE_PARAMETER,
    name: 'cartype',
  },
  {
    id: MODEL_PARAMETER,
    name: 'model',
  },
  {
    id: VOLUME_PARAMETER,
    name: 'volume',
  },
  {
    id: PRICE_PARAMETER,
    name: 'price',
  },
]

export const currentChangesToState = (changes: any[]) => {
  return changes.reduce((acc: Record<string, any>, change: any) => {
    acc[change.id] = { ...change }
    return acc
  }, {})
}

export const makeId = () => Date.now()

export const initChangeState = {
  parameter: '',
  entityId: '',
  change: '',
}

const paramTable: Record<number, number> = {
  [CATEGORY_PARAMETER]: CATEGORY_PARAMETER,
  [CARTYPE_PARAMETER]: CARTYPE_PARAMETER,
  [MANUFACTURER_PARAMETER]: MANUFACTURER_PARAMETER,
  [MODEL_PARAMETER]: MODEL_PARAMETER,
  // [VOLUME_PARAMETER]: VOLUME_PARAMETER,
  // [PRICE_PARAMETER]: PRICE_PARAMETER,
  // [YEAR_PARAMETER]: YEAR_PARAMETER
}

export const includeId = (val: any, param: number) => {
  return paramTable[param] ? val : null
}

