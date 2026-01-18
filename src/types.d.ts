import { type } from "os"
import { ORDERED_TYPE_PRIVATE, ORDERED_TYPE_COMPANY } from "./constants"

interface IUser {
  id: string
  name: string
  email: string
}

export type TAvatarUpload = {
  imageUploadUri: string
  filename: string
  file: File
}

export type TPagination = {
  totalRowsNumber: number
  totalPagesNumber: number
  currentPageNumber: number
  rowsInPage: number
}


export type TUser = {
  id: string
  adSid: string | null
  userName: string
  firstName: string
  middleName: string | null
  lastName: string
  email: string
  tz: string
  mobileNumber: string | null
  phoneNumber: string | null
  address: string | null
  department: string | null
  position: string | null
  startWorkDate: string | null
  password: string
  imageFileName: string | null
  imageDownloadUri: string | null
  imageUploadUri: string | null
  role: number
  adUser: boolean
}


export type TCurrentUser = {
  id: string
  userName: string | null
  password: string
  firstName: string
  middleName: string | null
  lastName: string
  tz: string
  email: string
  mobileNumber: string | null
  phoneNumber: string | null
  address: string | null
  department: string | null
  position: string | null
  startWorkDate: string | null
  twoFA: boolean
  role: number
  defaultPage: string | null
  adUser: boolean
  adSid: string | null
  imageFileName: string | null
  imageDownloadUri: string | null
  imageUploadUri: string | null
  company: string | null
  companyTZ: string | null
  branch: string | null
  allowedMonths: number | null
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

export type TBodyType = {
  id: string
  name: string
  nameEn: string
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

export type ManufacturerCode = {
  id: string
  oldId: string | null
  manufacturerId: string
  code: string | null
}

export type TMark = {
  id: string
  oldId: string | null
  name: string
  iconId: string | null
}

export type ManufacturerCodeUpsertDto = {
  id?: string
  code: string
}

export type TManufacturerSeriesExtraItem = {
  extraId: string
  extraName: string
  includeInPriceList: boolean
  changePercentage: number
  fromYear: number
  toYear: number
}

export type TManufacturerSeriesExtras = {
  seriesId: string
  seriesName: string
  extras: TManufacturerSeriesExtraItem[]
}

export type TManufacturerSeriesExtraSetting = {
  manufacturerSeriesId: string
  extraId: string
  includeInPriceList: boolean
  changePercentage: number
}

export type ModelCode = {
  id: string
  innerCode: string
  innerCarTypeCode: string
  year: number
  carTypeId: string;
}

export type TManufacturer = {
  id: string
  name: string
  dbId?: string | null
  engName: string | null
  manufacturerCode?: string
  logoDownloadUri: string | null
  coutry?: string
  serieses?: TSerie[]
  codes: ManufacturerCode[]
  seriesExtras?: TManufacturerSeriesExtras[] | null
  seriesExtraSettings?: TManufacturerSeriesExtraSetting[] | null
}

export type TSerie = {
  id: string
  name: string
  dbId?: string | null
  priority?: number
  models?: TModel[]
  manufacturer?: TManufacturer
  seriesCode?: string
}

export type TModel = {
  id: string
  priority: number
  name: string
  dbId?: string | null // вспомогательное поле для сортировки
  volume: number // объем двигателя
  manufacturerCode: string // код модели (МинТранспорта)
  series: TSerie | null
  engineType: TEngineType | null
  code: string | null
  codes: {
    id: string
    year: number
    innerCode: string
    innerCarTypeCode: string
    carTypeName: string
  }[] | null // массив кодов модели



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

export type TModelForOpinion = {
  id: string
  name: string
  seriesName: string
  code: string
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
  priceListType: 1 | 2 | null
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

export type TExtraSeriesRules = {
  id: string
  extraId: string
  manufacturerSeriesId: string | null
  appliesToAllSeries: boolean
  fromYear: number | null
  toYear: number | null
  manufacturerId: string
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
  manufacturerId: string | null
  manufacturer: { id: string, name: string } | null
  extraSeriesRules: TExtraSeriesRules[] | null
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

export type TOpinionList = {
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
  data: TOpinionList[]
} & TPagination & {
  status?: number
  message?: string | null
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

export type TGearbox = {
  id: string
  name: string
  nameEn: string | null
  automaticInd: number
}


export type TOpinionOwner = {
  id: string;
  name: string;
  changePercentage: number;
  sortIndex: number;
}

export type TSelectedOwner = {
  ownerId: string;
  changePercentage: number;
}

export type TCarImage = {
  id: string
  carImageFileName: string
  carImageDownloadUri: string
  carImageOriginalFileName: string | null
}

export type TOpinion = {
  id: string
  isCorrection: boolean
  temporary: boolean
  customer: TCustomer | undefined
  number: number | null
  receptionDate: string | null
  inspectionDate: string | null
  ordererType: typeof ORDERED_TYPE_PRIVATE | typeof ORDERED_TYPE_COMPANY
  name: string | null
  lastName: string | null
  tz: string | null
  email: string | null
  phone: string | null
  fax: string | null
  licenseNumber: string | null
  parallelImport: boolean
  tinyImport: boolean
  personalImport: boolean
  importer: TImporter | undefined
  statementPrice: number | null
  claimNumber: string | null
  carType: TCarType | undefined
  manufacturer: TManufacturer | undefined
  manufacturerCode: string | null
  model: TModel | undefined
  modelCode: string | null
  manufacturerYear: number | null
  degemNm: string | null
  tozeretNm: string | null
  driveType: TDriveType | undefined
  gearbox: TGearbox | undefined
  volume: number | null
  horsepower: number | null
  numberOfSeats: number | null
  specialModelCode: string | null
  dateOfRegistration: string | null
  odometer: number | null
  usageType: TUsageType | undefined
  internalStatus: TInternalStatus | undefined
  externalStatus: TExternalStatus | undefined
  tyresStatus: number | null
  appraisers: TAppraiser[] | null
  numberOfOwners: number | null
  owners: TOpinionOwner[] | null
  commentsForOpinion: TCommentsForOpinion[] | null
  integralExtras: TIntegralExtra[] | null
  extras: TExtra[] | null
  protectives: TProtective[] | null
  carDescription: string | null
  comments: string | null
  integralExtras: TIntegralExtra[]
  extras: TExtra[]
  protectives: TProtective[]
  priceDeltaType: 'percent' | 'amount'
  priceDelta: number
  odometerDeltaType: 'percent' | 'amount'
  odometerDelta: number
  specialAdditionsDeltaType: 'percent' | 'amount'
  specialAdditionsDelta: number
  roadEntryDeltaType: 'percent' | 'amount'
  roadEntryDelta: number
  price: number
  extraPrice: number
  showPriceWithoutVAT: boolean
  deposition: string | null

  summary: string | null
  update1Price: number
  update1ExtraPrice: number
  update1Date: string | null
  update2Price: number | null
  update2ExtraPrice: number | null
  update2Date: string | null
  update3Price: number | null
  update3ExtraPrice: number | null
  update3Date: string | null

  update1Visible: boolean
  update2Visible: boolean
  update3Visible: boolean

  opinionSend: boolean
  opinionSendDate: string | null
  update1Send: boolean
  update1SendDate: string | null
  update2Send: boolean
  update2SendDate: string | null
  update3Send: boolean
  update3SendDate: string | null

  licenseImageName: string | null
  licenseImageDownloadUri: string | null
  carImages: TCarImage[] | []
}

export type TCustomer = {
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
  department: string | null
  company: string
  companyTZ: string
  position: string
  branch: string
  password: string
  dailyQueries: number
  numberOfUsers: number
  type: number
  createDate: string
  subscriptionValidity: string
  subscriptionExclusion: boolean
  comments: string
  imageFileName: string | null
  allowedMonths: number | null
  imageDownloadUri: string | null
  imageUploadUri: string | null
  customerTypes: TCustomerType[]
}

export type TCustomerList = {
  id: string
  firstName: string
  middleName: string
  lastName: string
  company: string
  mobileNumber: string
  email: string
  city: string
  street: string
  houseNumber: string
  zipCode: string
  type: number
  subscriptionValidity: string
  dailyQueries: number
  subscriptionExclusion: boolean
  customerTypes: TCustomerType[]
}

export type TCustomerListResponse = {
  data: TCustomerList[]
} & TPagination & {
  status: number
  message: string | null
}

export type TCustomerType = {
  id: string
  name: string
  nameEn: string | null
  code: string
}

export type TPriceList = {
  date: string
  month: number
  year: number
  comment: string
  upToYearOfManufacture: number
  yearOfFirstRegistration: number
  priceListType: number
  carTypes: TCarType[]
  engineTypes: TEngineType[]
  id: string
}

export type TPriceListResponse = {
  data: TPriceList[]
} & TPagination & {
  status: number
  message: string | null
}

export type TCategory = {
  id: string
  name: string
  nameEn: string | null
  categoryID: string
}

export type TCarModelCode = {
  id: string
  year: number
  innerCode: string
  innerCarTypeCode: string
  carTypeId: string
}

export type TCarModel = {
  id: string
  name: string
  volume: number
  engineType: TEngineType | null
  series: TSerie | null
  codes: TCarModelCode[] | null
}

export type TCar = {
  id: string
  country: TCountry | null
  carType: TCarType | null
  category: TCategory | null
  model: TCarModel | null
  codeId: string | null // id кода модели
  details: string | null
  manufacturerYear: number | null
  extraPrice: number | null
  gearbox: TGearbox | null
  bodyType: TBodyType | null | string
  horsepower: number | null
  integralExtras: TIntegralExtra[]
  extras: TExtra[]
  upgradePackages: TUpgradePackage[]
  servicePackages: TServicePackage[]
  additionalLines: {
    name: string;
    percentage: number;
    letterText: string;
    letterNum: string;
  }[]
  newCarPrice: number | null
  carPrices: TCarPrice[]
  driveType: TDriveType | null | string
}

export type TCarsList = {
  id: string
  modelName: string
  modelId: string
  seriesName: string
  manufacturerName: string
  modelCode: string
  fromYear: number
  toYear: number
  volume: number
  gearbox: TGearbox | null
  count: number
}

export type TCarResponse = {
  data: TCarsList[]
} & TPagination & {
  status: number
  message: string | null
}

export type TCarYears = {
  carId: string
  year: number
}

export type TCountry = {
  id: string
  name: string
  nameEn: string | null
}

export type TCarPrice = {
  id: string
  totalPrice: number
  year: number
  month: number
  calculateDate: number
}

export type CarIntegralExtra = {
  integralExtraId: string
  value: number
  priceListItem: boolean
}

export type CarExtra = {
  extraId: string
  value: number
  priceListItem: boolean
}

export type CarUpgradePackage = {
  upgradePackageId: string
  value: number
  priceListItem: boolean
}

export type CarServicePackage = {
  servicePackageId: string
  value: number
  priceListItem: boolean
}

export type CarAdditionalLine = {
  name: string
  percentage: number
  letterText: string
  letterNum: string
}

export type CarUpdateRequest = {
  countryId: string
  carTypeId: string
  categoryId?: string | null
  modelId: string
  manufacturerYear: number
  driveType?: string | null
  gearboxId?: string | null
  bodyTypeId?: string | null
  manufacturerCodeId?: string | null
  codeId?: string | null
  horsepower?: number | null
  fuelConsumption?: number | null
  acceleration?: number | null
  safetyRating?: number | null
  details?: string | null
  yearSpecial?: string | null
  deletedDate?: string | null
  visible: boolean
  newCarPrice?: number | null
  extraPrice?: number | null
  airPollution?: number | null
  finishingPercentage?: number | null
  parallelImports?: string | null
  factor?: number | null
  tos?: string | null
  carIntegralExtras?: CarIntegralExtra[] | null
  carExtras?: CarExtra[] | null
  carUpgradePackages?: CarUpgradePackage[] | null
  carServicePackages?: CarServicePackage[] | null
  carMarks?: { markId: string }[] | null
  carAdditionalLines?: CarAdditionalLine[] | null
  carPrices?: {
    id?: string
    totalPrice: number
    year: number
    month: number
    calculateDate: number
  }[] | null
}

export type TPriceChange = {
  id: string
  parameter: number
  entityId: string | null
  change: number // Процент изменения (110.0 = +10%, 90.0 = -10%)
  type: number // FIX_CHANGE или ONE_TIME_CHANGE
  from?: string | null
  to?: string | null
}

export type TSystemSettings = {
  id: string
  twoFA: boolean
  inactiveUsersDisconnectInterval: number
  inactiveAssessorsUsersDisconnectInterval: number
  inactiveOpinionsUsersDisconnectInterval: number
  adminAproveForNewUsers: boolean
  defaultDailyUserQueries: number
  unsuccessfulLoginAttempts: number
  preventUserMultiLogins: boolean
}

export type TAdUser = {
  id: string
  displayName: string
  givenName: string
  surname: string
  emailAddress: string
  samAccountName: string
  voiceTelephoneNumber: string
}

export type TRole = {
  id: string
  name: string
  nameEn: string | null
}

export type TUsersParamsResponse = {
  adUsers: TAdUser[]
}

export type TSupportArticleList = {
  id: string
  title: string
  application: number
  categoryName: string
  updatedAt: string | null
}

export type TSupportArticle = {
  id: string
  title: string
  content: string
  application: number
  supportArticleCategoryId: string
  updatedAt: string | null
  category: {
    id: string
    name: string
  }
}

export type TSupportArticlesResponse = {
  data: TSupportArticleList[]
} & TPagination

// Types for client support page
export type TClientSupportArticle = {
  id: string
  title: string
  content: string
}

export type TClientSupportCategory = {
  categoryId: string
  categoryName: string
  articles: TClientSupportArticle[]
}

export type TClientSupportCategoriesResponse = {
  categories: TClientSupportCategory[]
}

export type TClientSupportSearchResponse = TClientSupportArticle[]

// Types for service calls
export type TServiceCall = {
  id: string
  subject: string
  content: string
  userId: string
  date: string
  status: number
  user: {
    id: string
    firstName: string
    lastName: string
    userName: string
    email: string
    phoneNumber: string
  }
}

export type TServiceCallsResponse = {
  data: TServiceCall[]
} & TPagination

export type TServiceCallsStats = {
  total: number
  open: number
  inProgress: number
  closed: number
}

export type TAdvertisement = {
  pageType: number
  dock: number
  pageNumber: string | null
  link: string | null
  script: string | null
  imageFileName: string | null
  imageDownloadUri: string | null
  imageUploadUri: string | null
  id: string
}

export type TCodeList = {
  manufacturerName: string
  modelName: string
  year: number
  carType: string
  isAuto: string
  innerCarTypeCode: string
  innerCode: string
  innerSubCode: string
  chassis: string | null
  fromYear: number
  toYear: number
  description: string
  id: string
  bodyType: TBodyType | null
}

export type TCode = {
  id: string
  carType: TCarType
  innerCarTypeCode: string
  manufacturerId: string
  seriesId: string
  modelId: string
  innerCode: string
  innerSubCode: string
  isAuto: string
  bodyType: TBodyType | null
  year: number
  fromYear: number
  toYear: number
  taxGroup?: number | null
  modelDescription: string
  description: string
}

export type TCodesResponse = {
  data: TCodeList[]
} & TPagination

export type TChassis = {
  id: string
  name: string
}

export type TCodeFromApi = {
  id: string
  api_Id: number
  manufacturerCode: string
  modelCode: string
  yearOfManufacture: number
  modelName: string
  serieName: string
  manufacturerName: string
  modelType: string
  country: string
  finishingLevel: string
  horsepower: number
  automaticTransmission: boolean
  engineCapacity: number
  bodyTypeFromApi: string
  fromYear: number | null
  toYear: number | null
  innerCarTypeCode: string | null
  modelDescription: string | null
  description: string | null
  innerCode: string | null
  innerSubCode?: string | null // Не было в объекте, но есть в `TCode`
  isAuto?: string | null // Не было в объекте, но есть в `TCode`
  series?: string | null // Не было в объекте, но есть в `TCode`
  year?: string | null // Не было в объекте, но есть в `TCode`
  codeId: string
  carTypeId: string | null
  bodyTypeId: string | null
  modelId: string | null
  chassis: string | null
  manufacturerId?: string | null
  seriesId?: string | null
  systemManufacturerName?: string | null
  systemSerieName?: string | null
  systemModelName?: string | null
  taxGroup?: number | null
  taxGroupFromApi?: number | null
}

export type TCodesSyncResponse = {
  totalApiRecords: number
  newRecordsAdded: number
}

export type TExpiringCustomer = {
  id: string
  firstName: string
  lastName: string
  company: string
  mobileNumber: string
  email: string
  city: string
  street: string
  subscriptionValidity: string
  dailyQueries: number | null
  subscriptionExclusion: boolean
  customerTypes: TCustomerType[]
}


export enum EPriceListAdvertisementLayoutType {
  Unassigned = 0,
  Horizontal = 1, // 145 на 30 мм
  VerticalLeft = 2,
  VerticalRight = 3,
}

export type TPriceListLayout = {
  id: string
  name: string
  layoutType: EPriceListAdvertisementLayoutType
  orientation: 'Horizontal' | 'Vertical'
  originalFileName: string
  convertedPdfFileName: string
  previewFileName: string
  colorModel: 'CMYK' | 'sRGB' | 'RGB' | 'Gray' | 'Unknown' | null
  isActive: boolean
  createdDate: string
  deletedDate: string | null
  sync: number
}

export type TPricelistLayoutUploadResult = {
  fileName: string
  success: boolean
  error: string | null
  layout: TPriceListLayout | null
}

export type TPricelistLayoutUploadResponse = TPricelistLayoutUploadResult[]


export type TPricelistLayoutSchedule = {
  id: string
  layoutId: string
  layout?: {
    id: string
    name: string
    previewFileName: string
    layoutType: EPriceListAdvertisementLayoutType
  }
  fromDate: string // ISO Date String
  toDate: string | null   // ISO Date String
  fromPage: number
  toPage: number   // 999 = до конца
  priority: number // 1 = Высокий, 9 = Низкий
  repeatCount: number
  isActive: boolean
  createdDate: string
}

// Reports
export type TLeadingQuery = {
  id: string
  car: string
  number: number
  manufacturerYear: number
}

export type TReportDailyVisits = {
  date: string
  number: number
}


export type TReportsStatisticsChannel = {
  total: number
  percent: number
  newSessions: number
  newUsers: number
  abandonmentPercent: number
  pages: number
  averageTime: number // seconds
}

export type TReportsStatistics = {
  organic: TReportsStatisticsChannel
  direct: TReportsStatisticsChannel
  reference: TReportsStatisticsChannel
  dailyVisits: TReportDailyVisits[]
}

export type TReportsSearchQuery = {
  date: string
  number: number
}

export type TIdName = {
  id: string
  name: string
}

export type TCustomerWithUsers = {
  id: string
  name: string
  customerUsers: TIdName[]
}

export type TReportsNewModel = {
  id: string;
  manufacturerName: string;
  modelName: string;
  modelFinishing: string;
  volume: number;
  createdDate: string;
}

export type TReportsNewModels = {
  data: TReportsNewModel[];
} & TPagination

export type TReportsDeductedModel = {
  id: string;
  manufacturerName: string;
  modelName: string;
  modelFinishing: string;
  volume: number;
  deletedDate: string;
}

export type TReportsDeductedModels = {
  data: TReportsDeductedModel[];
} & TPagination