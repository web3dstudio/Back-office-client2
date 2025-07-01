import { type } from "os"

interface IUser {
  id: string
  name: string
  email: string
}


export type TCurrentUser = {
  id: string
  parentId: string
  firstName: string
  middleName: string
  lastName: string
  tz: string
  email: string
  mobileNumber: string
  phoneNumber: string
  city: string
  street: string
  houseNumber: string
  zipCode: string
  department: string
  company: string
  companyTZ: string
  position: string
  branch: string
  password: string
  dailyQueries: number
  numberOfUsers: number
  type: number
  createDate: Date
  subscriptionValidity: Date
  subscriptionExclusion: boolean
  comments: string
  imageFileName: string | undefined
  imageDownloadUri: string | undefined
  imageUploadUri: string | undefined
  allowedMonths: number
}

export type TLogoutResponse = {
  status: number
  message: string | null
}

export type TNewModel = {
  id: number,
  sugDegem: string
  tozeretCd: number,
  tozeretNm: string
  tozeretEretzNm: string
  tozar: string
  degemCd: number,
  degemNm: string
  shnatYitzur: number,
  kinuyMishari: string
}

export type TDriveType = {
  id: string
  name: string
  code: number
}

export type TDriveTechnology = {
  id: string
  name: string
  code: number
}

export type TFuelType = {
  id: string
  name: string
  code: number
}

export type TManufacturer = {
  id: string
  name: string
  manufacturerCode: string
  coutry?: string
}

export type TSerie = {
  id: string
  name: string
}

export type TModel = {
  id: string
  name: string
  modelType: string
  manufacturerCode: string
  modelCode: string
  yearOfManufacture: number
  finishingLevel: string
  engineCapacity: number
  bodyType: string
  numberOfDoors: number
  numberOfSeats: number
  horsepower: number
  driveType: TDriveType
  driveTechnology: TDriveTechnology
  fuelType: TFuelType
  serieId: string
  serieName: string
  manufacturerId: string
  manufacturerName: string
  manufacturerCountry: string
  automaticTransmittion: number

  innerCode: number | null
  fromYear: number | null
  toYear: number | null
  basePrice: number | null

  carType: TCarType | null
}

export type TCarType = {
  id: string
  name: string
  carTypeID?: string | null
  code?: number | null
  iconId?: string | null
  licenseType?: string | null
  priceListType: TPriceListType | null
  icon?: string | null
}

export type TPartialModelUpdateParams = {
  innerCode: number | null
  fromYear: number | null
  toYear: number | null
  basePrice: number | null
  carType: TCarType | null
}

export type TPriceListType = {
  id: number
  name: string
}

export type TIntegralExtra = {
  id: string
  name: string
  nameEn: string | null
  defaultChangePercentage: number
  tosID: string
  apiField: string | null
  sortIndex: number
  iconId: string | null
  icon: string | null
}

export type TAppExtrasItemField = {
  id: string;
  fieldName: string;
  fieldNameEn: string;
  checked: boolean;
  selected: boolean;
  value: number;
}