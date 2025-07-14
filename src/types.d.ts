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
  dbId?: string | null
  engName: string | null
  manufacturerCode: string
  logoDownloadUri: string | null
  coutry?: string
  serieses?: TSerie[]
}

export type TSerie = {
  id: string
  name: string
  dbId?: string | null
  priority?: number
  models?: TModel[]
}

export type TModel = {
  id: string
  priority: number
  name: string
  dbId?: string | null // вспомогательное поле для сортировки
  code: string // код модели (внутренний)
  volume: number // объем двигателя
  modelCode: string // добавить в сущность

  manufacturerCode: string // код модели (МинТранспорта)

  // modelType: string
  // yearOfManufacture: number
  // finishingLevel: string
  // bodyType: string
  // numberOfDoors: number
  // numberOfSeats: number
  // horsepower: number
  // driveType: TDriveType
  // driveTechnology: TDriveTechnology
  // fuelType: TFuelType
  // serieId: string

  // automaticTransmittion: number

  // innerCode: number | null
  // fromYear: number | null
  // toYear: number | null
  // basePrice: number | null

  // carType: TCarType | null
}


export type TIcon = {
  id: string
  fileName: string
  downloadUri: string | null
  uploadUri: string | null
}

export type TCarType = {
  id: string
  name: string
  carTypeID?: string | null
  code?: number | null
  iconId?: string | null
  licenseType?: string | null
  priceListType: TPriceListType | null
  icon?: TIcon | null
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
  tosID?: string
  apiField?: string | null
  sortIndex?: number
  iconId?: string | null
  icon?: string | null
}

export type TAppExtrasItemField = {
  id: string;
  fieldName: string;
  fieldNameEn: string;
  checked: boolean;
  selected: boolean;
  value: number;
}

export type TExtra = {
  id: string
  name: string
  nameEn: string | null
  defaultChangePercentage: number
  tosID?: string
  apiField?: string | null
  sortIndex?: number
  iconId?: string | null
  icon?: string | null
}

export type TUpgradePackage = {
  id: string
  name: string
  nameEn: string | null
  defaultChangePercentage: number
  iconId?: string | null
}

export type TServicePackage = {
  id: string
  name: string
  nameEn: string | null
  defaultChangePercentage: number
  iconId?: string | null
}


export type TAverageMileage = {
  id: string
  yearOffset: number
  averageMileageMin: number
  averageMileageMax: number
}

export type TMileageDepreciation = {
  id: string
  averageMileageId: string
  percent: number
  mileageThreshold: number
  yearOffset: number
}

export type TMileageAppreciation = {
  id: string
  averageMileageId: string
  percent: number
  mileageThreshold: number
  yearOffset: number
}

export type TOwner = {
  id: string
  name: string
  nameEn: string | null
  defaultChangePercentage: number
  lessThanYearChangePercentage: number
  ownerCountAdjustmentFactor: number
  mileageAdjustmentType: number
  mileageAdjustmentFactor: number
}

export type TEngineType = {
  id: string
  name: string
  nameEn: string | null
  priceListBackground: string
  code: number
}

export type TCommentsForOpinion = {
  id: string
  name: string
}

export type TAppraiser = {
  id: string
  name: string
  identifier: string
}

export type TInternalStatus = {
  id: string
  name: string
  nameEn: string | null
}

export type TExternalStatus = {
  id: string
  name: string
  nameEn: string | null
}

export type TUsageType = {
  id: string
  name: string
  nameEn: string | null
}

export type TImporter = {
  id: string
  name: string
  nameEn: string | null
}

export type TProtective = {
  id: string
  name: string
  nameEn: string | null
}

export type TOpinion = {
  id: string
  number: number
  manufacturerCode: string | null
  modelCode: string
  model: string
  volume: number
  manufacturerName: string
  tozeretNm: string
  degemNm: string
  ordererName: string
  inspectionDate: string // ISO date string
  receptionDate: string  // ISO date string
  licenseNumber: string
  manufacturerYear: number
  price: number
  nextUpdateDate: string // ISO date string
  opinionSend: boolean
  opinionSendDate: string
  update1Send: boolean
  update1SendDate: string | null
  update2Send: boolean
  update2SendDate: string | null
  update3Send: boolean
  update3SendDate: string | null
}

export type TOpinionResponse = {
  data: TOpinion[]
  totalRowsNumber: number
  totalPagesNumber: number
  currentPageNumber: number
  rowsInPage: number
  status: number
  message: string | null
}

export type OpinionsFilters = {
  FromDate: string
  ToDate: string
  Number: string
  OrdererName: string
  LicenseNumber: string
  TozeretName: string
  DegemName: string
  ManufacturerCode: string
  ManufacturerName: string
  ManufacturerYear: string
  UpdateFromDate: string
  UpdateToDate: string
}