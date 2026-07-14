import type { TCar, TCarType, TManufacturer, TSerie, TModel, TCategory, TExtra, TIntegralExtra, TUpgradePackage, TServicePackage, TCountry, TGearbox, TCarModelCode, TCarModel, CarUpdateRequest, CarExtra, TDriveType, TAppExtrasItemField, TMark, TBodyType, TEngineType } from "../../types"
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { object } from 'yup'
import { FormProvider, useForm, useWatch, useFieldArray } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMemo, useEffect, useRef, useState } from "react"
import { Box, Button, Grid, Typography } from "@mui/material"
import { AppControlledAutocomplete } from "../AppControlledAutocomplete"
import { useCarTypesQuery } from "../../query/carTypes.query"
import { useCarCreateMutation, useCarUpdateMutation } from "../../query/car.query"
import { useManufacturersWithSeriesAndModelsQuery } from "../../query/manufacturers.query"
import AppControlledTextField from "../AppControlledTextField"
import { useCategoriesQuery } from "../../query/category.query"
import StyledPaper from "../StyledPaper"
import { useFilteredExtrasForCarQuery } from "../../query/extras.query"
import { useIntegralExtrasQuery } from "../../query/integralExtras.query"
import { useUpgradePackagesQuery } from "../../query/upgradePackages.query"
import { useServicePackagesQuery } from "../../query/servicePackages.query"
import AppExtrasMultiselect from "../AppExtrasMultiselect"
import AppExtrasMultiselectSimple from "../AppExtrasMultiselectSimple"
import AppActionButton from "../AppActionButton"
import { useCountriesQuery } from "../../query/countries.query"
import { useNavigate } from "@tanstack/react-router"
import AppControlledCheckbox from "../AppControlledCheckbox"
import { useGearboxesQuery } from "../../query/gearboxes.query"
import { useDriveTypesQuery } from "../../query/driveTypes.query"
import { useMarksQuery } from "../../query/marks.query"
import { useBodyTypesQuery } from "../../query/bodyTypes.query"
import { useEngineTypesQuery } from "../../query/engineTypes.query"


interface Props {
  data: TCar | null
}

type TFormInput = {
  carType: TCarType | null
  category: TCategory | null
  country: TCountry | null
  manufacturer: TManufacturer | null
  series: TSerie | null
  model: TModel | TCarModel | null
  code: TCarModelCode | null
  volume: number | null
  engineType: TEngineType | null
  gearbox: TGearbox | null
  bodyType: TBodyType | null
  driveType: TDriveType | null
  horsepower: number | null
  finishingPercentage: number | null
  factor: number | null
  acceleration: number | null
  fuelConsumption: number | null
  safetyRating: number | null
  airPollution: number | null
  yearSpecial: string | null
  parallelImports: string | null
  newCarPrice: number | null
  visible: boolean
  month: number | null
  year: number | null
  price: number | null
  details: string | null
  manufacturerYear: number | null
  extraPrice: number | null
  integralExtras: TIntegralExtra[]
  extras: TAppExtrasItemField[]
  upgradePackages: TUpgradePackage[]
  servicePackages: TServicePackage[]
  marks: TAppExtrasItemField[]
  additionalLines: {
    name: string;
    percentage: number;
    letterText: string;
    letterNum: string;
  }[]
}


export default function CarForm({ data }: Props) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { mutate: updateCar } = useCarUpdateMutation()
  const { mutate: createCar } = useCarCreateMutation()

  const { data: carTypes, isLoading: isCarTypesLoading } = useCarTypesQuery()
  const { data: manufacturers, isLoading: isManufacturersLoading } = useManufacturersWithSeriesAndModelsQuery()
  const { data: categories, isLoading: isCategoriesLoading } = useCategoriesQuery()
  const { data: integralExtrasData, isLoading: _isIntegralExtrasLoading } = useIntegralExtrasQuery()
  const { data: upgradePackagesData, isLoading: _isUpgradePackagesLoading } = useUpgradePackagesQuery()
  const { data: servicePackagesData, isLoading: _isServicePackagesLoading } = useServicePackagesQuery()
  const { data: marksData, isLoading: isMarksLoading } = useMarksQuery()
  const { data: countries, isLoading: isCountriesLoading } = useCountriesQuery()
  const { data: gearboxes, isLoading: isGearboxesLoading } = useGearboxesQuery()
  const { data: driveTypes, isLoading: isDriveTypesLoading } = useDriveTypesQuery()
  const { data: bodyTypes, isLoading: isBodyTypesLoading } = useBodyTypesQuery()
  const { data: engineTypes, isLoading: isEngineTypesLoading } = useEngineTypesQuery()

  const resolvedEngineType = useMemo(() => {
    const raw = (data as any)?.model?.engineType
    if (!raw) return null
    if (typeof raw === 'object' && typeof raw.id === 'string') {
      return (engineTypes || []).find(et => et.id === raw.id) || (raw as TEngineType)
    }
    return null
  }, [data, engineTypes])

  const resolvedBodyType = useMemo(() => {
    const raw = (data as any)?.bodyType
    if (!raw) return null
    // backend may return bodyType as id (string) or as object
    if (typeof raw === 'string') return (bodyTypes || []).find(bt => bt.id === raw) || null
    if (typeof raw === 'object' && typeof raw.id === 'string') {
      return (bodyTypes || []).find(bt => bt.id === raw.id) || (raw as TBodyType)
    }
    return null
  }, [data, bodyTypes])

  const resolvedDriveType = useMemo(() => {
    const raw = (data as any)?.driveType
    if (!raw) return null
    // backend may return driveType as id (string) or as object
    if (typeof raw === 'string') return (driveTypes || []).find(d => d.id === raw) || null
    if (typeof raw === 'object' && typeof raw.id === 'string') return raw as TDriveType
    return null
  }, [data, driveTypes])

  const carIncludeExtraIds = useMemo(
    () => (data?.extras as any[])?.map((extra) => extra.extraId).filter(Boolean) ?? [],
    [data]
  )

  const defaultValues = useMemo(() => ({
    carType: data?.carType || null,
    category: data?.category || null,
    country: data?.country || (countries && countries.length > 0 ? countries[0] : null),
    manufacturer: (data?.model as any)?.series?.manufacturer || null,
    series: (data?.model as any)?.series || null,
    model: data?.model || null,
    code: data?.codeId && data?.model?.codes ? data.model.codes.find(c => c.id === data.codeId) || null : null,
    volume: (data?.model as any)?.volume ?? null,
    engineType: resolvedEngineType,
    gearbox: data?.gearbox || null,
    bodyType: resolvedBodyType,
    driveType: resolvedDriveType,
    horsepower: data?.horsepower || null,
    finishingPercentage: (data as any)?.finishingPercentage ?? null,
    factor: (data as any)?.factor ?? null,
    acceleration: (data as any)?.acceleration ?? null,
    fuelConsumption: (data as any)?.fuelConsumption ?? null,
    safetyRating: (data as any)?.safetyRating ?? null,
    airPollution: (data as any)?.airPollution ?? null,
    yearSpecial: (data as any)?.yearSpecial ?? (data as any)?.specialYear ?? null,
    parallelImports: (data as any)?.parallelImports ?? null,
    newCarPrice: (data as any)?.newCarPrice ?? null,
    visible: (data as any)?.visible ?? true,
    month: null,
    year: null,
    price: null,
    details: data?.details || '',
    manufacturerYear: data?.manufacturerYear || null,
    extraPrice: data?.extraPrice || 0,
    integralExtras: integralExtrasData?.map((item: TIntegralExtra) => {
      const existingExtra = (data?.integralExtras as any)?.find((extra: any) => extra.integralExtraId === item.id)
      return {
        id: item.id,
        checked: !!existingExtra?.priceListItem,
        fieldName: item.name,
        fieldNameEn: item.nameEn ?? '',
        selected: !!existingExtra,
        value: existingExtra ? existingExtra.value || 0 : 0
      }
    }) || [],
    extras: [],
    upgradePackages: upgradePackagesData?.map((item: TUpgradePackage) => {
      const existingPackage = (data?.upgradePackages as any)?.find((pkg: any) => pkg.upgradePackageId === item.id)
      return {
        id: item.id,
        checked: !!existingPackage?.priceListItem,
        fieldName: item.name,
        fieldNameEn: item.nameEn ?? '',
        selected: !!existingPackage,
        value: existingPackage ? existingPackage.value || 0 : 0
      }
    }) || [],
    servicePackages: servicePackagesData?.map((item: TServicePackage) => {
      const existingPackage = (data?.servicePackages as any)?.find((pkg: any) => pkg.servicePackageId === item.id)
      return {
        id: item.id,
        checked: !!existingPackage?.priceListItem,
        fieldName: item.name,
        fieldNameEn: item.nameEn ?? '',
        selected: !!existingPackage,
        value: existingPackage ? existingPackage.value || 0 : 0
      }
    }) || [],
    marks: (marksData || []).map((mark: TMark) => {
      const raw = (data as any)?.marks ?? (data as any)?.carMarks ?? []
      const existingIds = Array.isArray(raw)
        ? raw
          .map((m: any) => (typeof m === 'string' ? m : (m?.markId ?? m?.id)))
          .filter(Boolean)
        : []
      const isSelected = existingIds.includes(mark.id)
      return {
        id: mark.id,
        fieldName: mark.name,
        fieldNameEn: mark.name,
        checked: isSelected,
        selected: isSelected,
        value: 0
      }
    }),
    additionalLines: (data as any)?.carAdditionalLines?.map((line: any) => ({
      name: line.name || '',
      percentage: line.percentage || 0,
      letterText: line.letterText || '',
      letterNum: line.letterNum?.toString() || ''
    })) || [],
  }), [integralExtrasData, upgradePackagesData, servicePackagesData, marksData, data, countries, resolvedBodyType, resolvedDriveType, resolvedEngineType])


  const schema = object()
    .shape({
      carType: yup.object().required(t('form-field.required')),

    })
    .required()

  const methods = useForm<TFormInput>({
    // @ts-ignore
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: defaultValues
  })

  useEffect(() => {
    if (integralExtrasData) {
      methods.reset({
        ...defaultValues,
        extras: methods.getValues('extras'),
      });
    }
  }, [integralExtrasData, upgradePackagesData, servicePackagesData, marksData, methods, defaultValues]);

  const { handleSubmit, control, setValue } = methods

  // Массив additional lines
  const { fields: additionalLines, append, remove } = useFieldArray({
    control,
    name: 'additionalLines'
  })

  // Следим за изменениями полей
  const selectedManufacturer = useWatch({ control, name: 'manufacturer' })
  const selectedSeries = useWatch({ control, name: 'series' })
  const selectedModel = useWatch({ control, name: 'model' })
  const selectedCarType = useWatch({ control, name: 'carType' })
  const selectedManufacturerYear = useWatch({ control, name: 'manufacturerYear' })

  const extrasFilterParams = useMemo(() => {
    const manufacturerId = selectedManufacturer?.id
    if (!manufacturerId) return null

    const seriesId = selectedSeries?.id
    const year = selectedManufacturerYear
    const carManufacturerId = (data?.model as any)?.series?.manufacturer?.id as string | undefined
    const includeExtraIds =
      data && carManufacturerId === manufacturerId ? carIncludeExtraIds : undefined

    return {
      manufacturerId,
      ...(seriesId ? { seriesId } : {}),
      ...(year && year > 0 ? { year } : {}),
      includeExtraIds,
    }
  }, [
    selectedManufacturer?.id,
    selectedSeries?.id,
    selectedManufacturerYear,
    data,
    carIncludeExtraIds,
  ])

  const {
    data: filteredExtrasData,
    isFetching: isFetchingFilteredExtras,
  } = useFilteredExtrasForCarQuery(extrasFilterParams)

  const extrasFormItems = useMemo((): TAppExtrasItemField[] | undefined => {
    if (!extrasFilterParams) return []

    if (isFetchingFilteredExtras && filteredExtrasData === undefined) {
      return undefined
    }

    if (!filteredExtrasData?.length) return []

    const currentExtras = methods.getValues('extras')
    const isSameCarContext = !!data &&
      (data?.model as any)?.series?.manufacturer?.id === selectedManufacturer?.id &&
      (data?.model as any)?.series?.id === selectedSeries?.id &&
      data?.manufacturerYear === selectedManufacturerYear

    const seriesId = selectedSeries?.id
    const year = selectedManufacturerYear

    const matchRule = (rule: NonNullable<TExtra['extraSeriesRules']>[number], ignoreYear: boolean) => {
      const seriesOk = !!rule.appliesToAllSeries || rule.manufacturerSeriesId === seriesId
      if (!seriesOk) return false
      if (ignoreYear || !year || year <= 0) return true
      const from = rule.fromYear ?? 0
      const to = rule.toYear ?? 0
      if (from > 0 && year < from) return false
      if (to > 0 && year > to) return false
      return true
    }

    return filteredExtrasData.flatMap((item: TExtra) => {
      const allRules = item.extraSeriesRules ?? []
      let rules = allRules.filter((r) => matchRule(r, false))

      // Attached to car but outside year window — still show series-matching rules
      if (rules.length === 0 && carIncludeExtraIds.includes(item.id)) {
        rules = allRules.filter((r) => matchRule(r, true))
      }

      // Extra without rules: one row (placeholder 0)
      const ruleRows = rules.length > 0
        ? rules
        : allRules.length === 0
          ? [{ id: item.id, fromYear: null, toYear: null, changePercentage: null } as NonNullable<TExtra['extraSeriesRules']>[number]]
          : []

      return ruleRows.map((rule) => {
        const existingFromCar = isSameCarContext
          ? (data?.extras as any)?.find((extra: any) => extra.extraId === item.id)
          : null
        const existingFromForm = currentExtras?.find(
          (extra) => extra.id === item.id && (extra.ruleId == null || extra.ruleId === rule.id)
        ) ?? currentExtras?.find((extra) => extra.id === item.id)

        const selected = existingFromForm?.selected ?? (isSameCarContext && !!existingFromCar)
        const checked = existingFromForm?.checked ?? (isSameCarContext && !!existingFromCar?.priceListItem)
        const value =
          existingFromForm?.value !== undefined
            ? existingFromForm.value
            : (existingFromCar ? (existingFromCar.value ?? null) : null)

        return {
          id: item.id,
          ruleId: rule.id,
          checked: !!checked,
          fieldName: item.name,
          fieldNameEn: item.nameEn ?? '',
          selected: !!selected,
          value: selected ? value : null,
          ruleChangePercentage: rule.changePercentage ?? 0,
          fromYear: rule.fromYear ?? undefined,
          toYear: rule.toYear ?? undefined,
        } satisfies TAppExtrasItemField
      })
    })
  }, [
    extrasFilterParams,
    filteredExtrasData,
    isFetchingFilteredExtras,
    data,
    selectedManufacturer?.id,
    selectedSeries?.id,
    selectedManufacturerYear,
    carIncludeExtraIds,
    methods,
  ])

  useEffect(() => {
    setValue('volume', (selectedModel as any)?.volume ?? (data as any)?.model?.volume ?? null)
    const rawEngineType = (selectedModel as any)?.engineType ?? (data as any)?.model?.engineType ?? null
    const resolved =
      rawEngineType && typeof rawEngineType === 'object' && typeof rawEngineType.id === 'string'
        ? (engineTypes || []).find(et => et.id === rawEngineType.id) || rawEngineType
        : null
    setValue('engineType', resolved)
  }, [selectedModel, data, setValue, engineTypes])

  // Массив годов от текущего до 1960
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1960 + 1 }, (_, i) => currentYear - i);

  // Фильтруем series по выбранному manufacturer
  const seriesOptions = useMemo(() => {
    if (!selectedManufacturer || !manufacturers) return []
    const manufacturer = manufacturers.find(m => m.id === selectedManufacturer.id)
    return manufacturer?.serieses || []
  }, [selectedManufacturer, manufacturers])

  // Фильтруем models по выбранному series
  const modelOptions = useMemo(() => {
    if (!selectedSeries || !seriesOptions.length) return []
    const series = seriesOptions.find(s => s.id === selectedSeries.id)
    return series?.models || []
  }, [selectedSeries, seriesOptions])

  // Получаем коды из выбранной модели, отфильтрованные по carType (если выбран)
  const codeOptions = useMemo(() => {
    if (!selectedModel?.codes) {
      return []
    }
    const codes = selectedModel.codes as TCarModelCode[]
    if (!selectedCarType) {
      return codes
    }
    const filtered = codes.filter((code: TCarModelCode) => {
      return code.carTypeId === selectedCarType.id
    })
    return filtered
  }, [selectedModel, selectedCarType])

  // Сбрасываем код, если он не попадает в отфильтрованный список
  const selectedCode = useWatch({ control, name: 'code' })
  useEffect(() => {
    if (selectedCode && codeOptions.length > 0) {
      const codeExists = codeOptions.some(code => code.id === selectedCode.id)
      if (!codeExists) {
        setValue('code', null)
      }
    }
  }, [codeOptions, selectedCode, setValue])

  useEffect(() => {
    // Сначала пробуем использовать данные напрямую из data.model.series.manufacturer
    if (data?.model && (data.model as any).series?.manufacturer) {
      const manufacturer = (data.model as any).series.manufacturer
      const series = (data.model as any).series
      setValue('manufacturer', manufacturer)
      setValue('series', series)
      setValue('model', data.model)

      // Загружаем code если есть
      if (data.codeId && data.model.codes) {
        const code = data.model.codes.find(c => c.id === data.codeId)
        if (code) {
          setValue('code', code)
        }
      }
      return
    }

    // Если данных нет, ищем в загруженных manufacturers (только для установки manufacturer и series)
    if (data?.model?.id && manufacturers) {
      for (const manufacturer of manufacturers) {
        for (const series of manufacturer.serieses || []) {
          const model = series.models?.find(m => m.id === data.model?.id)
          if (model) {
            setValue('manufacturer', manufacturer)
            setValue('series', series)
            // Не устанавливаем code из manufacturers, т.к. там другой тип кодов
            break
          }
        }
      }
    }
  }, [data, manufacturers, setValue])


  // Массив месяцев от 1 до 12
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => i + 1)
  }, [])

  // Price by year: local map key `${year}-${month}-${countryId}`
  const [carPricesMap, setCarPricesMap] = useState<Record<string, { id?: string; totalPrice: number; year: number; month: number; calculateDate: number }>>({})
  const carPricesMapRef = useRef(carPricesMap)
  useEffect(() => {
    carPricesMapRef.current = carPricesMap
  }, [carPricesMap])

  const selectedMonth = useWatch({ control, name: 'month' })
  const selectedYear = useWatch({ control, name: 'year' })
  const selectedCountry = useWatch({ control, name: 'country' })
  const priceField = useWatch({ control, name: 'price' })
  const currentCountryId = selectedCountry?.id ?? (data as any)?.country?.id ?? ''
  const currentPriceKey = selectedYear && selectedMonth ? `${selectedYear}-${selectedMonth}-${currentCountryId}` : null
  const lastPriceKeyRef = useRef<string | null>(null)

  // Init map from API carPrices on load
  useEffect(() => {
    if (!data?.id) return
    const cid = (data as any)?.country?.id ?? ''
    const prices = (data as any)?.carPrices || []
    const next: Record<string, { id?: string; totalPrice: number; year: number; month: number; calculateDate: number }> = {}
    for (const p of prices) {
      if (!p || typeof p.year !== 'number' || typeof p.month !== 'number') continue
      const key = `${p.year}-${p.month}-${cid}`
      next[key] = {
        id: p.id,
        totalPrice: Number(p.totalPrice) || 0,
        year: p.year,
        month: p.month,
        calculateDate: typeof p.calculateDate === 'number' ? p.calculateDate : Date.now(),
      }
    }
    setCarPricesMap(next)
  }, [data?.id, (data as any)?.country?.id])

  // When user selects year/month, reflect stored price in input (or clear if none)
  useEffect(() => {
    if (!selectedYear || !selectedMonth) {
      setValue('price', null)
      return
    }
    const key = `${selectedYear}-${selectedMonth}-${currentCountryId}`
    const existing = carPricesMap[key]
    setValue('price', existing ? existing.totalPrice : null, { shouldDirty: true })
  }, [selectedYear, selectedMonth, currentCountryId, carPricesMap, setValue])

  // When user changes price input, update map
  useEffect(() => {
    if (!currentPriceKey) {
      lastPriceKeyRef.current = null
      return
    }
    // IMPORTANT: when user changes year/month, do not create/update price entry using the previous price value.
    // Wait for an actual change in the price field for the currently selected key.
    if (lastPriceKeyRef.current !== currentPriceKey) {
      lastPriceKeyRef.current = currentPriceKey
      return
    }

    const raw = priceField as any
    const num = raw === '' || raw === null || raw === undefined ? 0 : Number(raw)
    if (!Number.isFinite(num)) return
    const key = currentPriceKey
    setCarPricesMap(prev => {
      const next = { ...prev }
      if (num === 0) {
        delete next[key]
        return next
      }
      const existing = prev[key]
      next[key] = {
        id: existing?.id,
        totalPrice: num,
        year: selectedYear as number,
        month: selectedMonth as number,
        calculateDate: existing?.calculateDate ?? Date.now(),
      }
      return next
    })
  }, [priceField, currentPriceKey, selectedYear, selectedMonth])



  const onSubmit = (formData: TFormInput) => {
    if (!data?.id) {
      console.log('No car ID, cannot update')
      return
    }

    // Фильтруем выбранные extras и преобразуем в формат для API
    const carIntegralExtras = formData.integralExtras?.filter((item: any) => item.selected).map((item: any) => ({
      integralExtraId: item.id,
      value: item.value || 0,
      priceListItem: !!item.checked,
    })) || null;

    const carExtrasMap = new Map<string, CarExtra>()
    for (const item of formData.extras || []) {
      if (!item?.selected || !item.id) continue
      // null/empty in UI = use placeholder (rule / Extra.Default), API needs a concrete number
      const resolvedValue =
        item.value == null
          ? (item.ruleChangePercentage ?? item.defaultChangePercentage ?? 0)
          : Number(item.value)
      carExtrasMap.set(item.id, {
        extraId: item.id,
        value: Number.isFinite(resolvedValue) ? resolvedValue : 0,
        priceListItem: !!item.checked,
      })
    }
    const carExtras = carExtrasMap.size > 0 ? Array.from(carExtrasMap.values()) : null

    const carUpgradePackages = formData.upgradePackages?.filter((item: any) => item.selected).map((item: any) => ({
      upgradePackageId: item.id,
      value: item.value || 0,
      priceListItem: !!item.checked,
    })) || null;

    const carServicePackages = formData.servicePackages?.filter((item: any) => item.selected).map((item: any) => ({
      servicePackageId: item.id,
      value: item.value || 0,
      priceListItem: !!item.checked,
    })) || null;

    const carMarks = formData.marks?.filter((item: any) => item.selected).map((item: any) => ({
      markId: item.id,
    })) || null;

    const carAdditionalLines = formData.additionalLines?.map((line: any) => ({
      name: line.name,
      percentage: line.percentage,
      letterText: line.letterText,
      letterNum: line.letterNum
    })) || null;

    const horsepowerNumber =
      formData.horsepower === null || formData.horsepower === undefined || (formData as any).horsepower === ''
        ? null
        : Number((formData as any).horsepower)

    const finishingPercentageNumber =
      formData.finishingPercentage === null || formData.finishingPercentage === undefined || (formData as any).finishingPercentage === ''
        ? null
        : Number((formData as any).finishingPercentage)

    const factorNumber =
      formData.factor === null || formData.factor === undefined || (formData as any).factor === ''
        ? null
        : Number((formData as any).factor)

    const accelerationNumber =
      formData.acceleration === null || formData.acceleration === undefined || (formData as any).acceleration === ''
        ? null
        : Number((formData as any).acceleration)

    const fuelConsumptionNumber =
      formData.fuelConsumption === null || formData.fuelConsumption === undefined || (formData as any).fuelConsumption === ''
        ? null
        : Number((formData as any).fuelConsumption)

    const safetyRatingNumber =
      formData.safetyRating === null || formData.safetyRating === undefined || (formData as any).safetyRating === ''
        ? null
        : Number((formData as any).safetyRating)

    const airPollutionNumber =
      formData.airPollution === null || formData.airPollution === undefined || (formData as any).airPollution === ''
        ? null
        : Number((formData as any).airPollution)

    const newCarPriceNumber =
      (formData as any).newCarPrice === '' || formData.newCarPrice === null || formData.newCarPrice === undefined
        ? null
        : Number((formData as any).newCarPrice)

    const carPricesToSend = Object.entries(carPricesMap)
      .filter(([key]) => key.endsWith(`-${currentCountryId}`))
      .map(([, p]) => p)
      .filter(p => p.totalPrice !== 0)

    const updateData: CarUpdateRequest = {
      countryId: formData.country?.id || '',
      carTypeId: formData.carType?.id || '',
      categoryId: formData.category?.id || null,
      modelId: (formData.model as TCarModel)?.id || '',
      manufacturerYear: formData.manufacturerYear || 0,
      driveType: formData.driveType?.id || null,
      gearboxId: formData.gearbox?.id || null,
      bodyTypeId: formData.bodyType?.id || null,
      manufacturerCodeId: null,
      codeId: formData.code?.id || null,
      horsepower: horsepowerNumber !== null && Number.isFinite(horsepowerNumber) ? horsepowerNumber : null,
      fuelConsumption: fuelConsumptionNumber !== null && Number.isFinite(fuelConsumptionNumber) ? fuelConsumptionNumber : null,
      acceleration: accelerationNumber !== null && Number.isFinite(accelerationNumber) ? accelerationNumber : null,
      safetyRating: safetyRatingNumber !== null && Number.isFinite(safetyRatingNumber) ? safetyRatingNumber : null,
      details: formData.details || null,
      yearSpecial: formData.yearSpecial || null,
      deletedDate: null,
      visible: !!formData.visible,
      newCarPrice: newCarPriceNumber !== null && Number.isFinite(newCarPriceNumber) ? newCarPriceNumber : null,
      extraPrice: formData.extraPrice || null,
      airPollution: airPollutionNumber !== null && Number.isFinite(airPollutionNumber) ? airPollutionNumber : null,
      finishingPercentage: finishingPercentageNumber !== null && Number.isFinite(finishingPercentageNumber) ? finishingPercentageNumber : null,
      parallelImports: formData.parallelImports || null,
      factor: factorNumber !== null && Number.isFinite(factorNumber) ? factorNumber : null,
      tos: null,
      carIntegralExtras,
      carExtras,
      carUpgradePackages,
      carServicePackages,
      carMarks,
      carAdditionalLines,
      carPrices: carPricesToSend.length ? carPricesToSend : null
    }

    if (data?.id) {
      updateCar({ id: data.id, data: updateData })
    } else {
      createCar(updateData)
    }
  }

  return (<>
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit as any)} style={{ width: '100%' }}>
        <Grid container columns={12} columnSpacing={3} sx={{ width: '100%' }}>
          <Grid size={9}>
            {data?.id ? (
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={() => {
                  navigate({ to: '/catalog/$id', params: { id: data.id } })
                }}
              >
                {t('toDetails', { ns: 'newCar' })}
              </Button>
            ) : null}
          </Grid>
          <Grid size={3}>

            <AppControlledAutocomplete<TCountry>
              name='country'
              control={control}
              options={countries || []}
              label={t('country', { ns: 'newCar' })}
              placeholder={t('country', { ns: 'newCar' })}
              required
              loading={isCountriesLoading}
              getOptionLabel={(option) => i18n.language === 'he' ? option.name || '' : option.nameEn || option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Grid>
        </Grid>




        <StyledPaper sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          padding: 3,
          width: '100%',
          display: 'flex',
          gap: 2,
          marginBottom: 3,
        }}>
          <Grid container columns={12} columnSpacing={3} sx={{ width: '100%' }}>
            <Grid size={3}>
              <AppControlledAutocomplete<TCarType>
                name='carType'
                control={control}
                options={carTypes || []}
                label={t('carType', { ns: 'newCar' })}
                placeholder={t('carType', { ns: 'newCar' })}
                required
                loading={isCarTypesLoading}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onUserChange={() => {
                  setValue('code', null)
                }}
              />
            </Grid>
            <Grid size={6}>
              <AppControlledAutocomplete<TCarModelCode>
                name='code'
                control={control}
                options={codeOptions}
                label={t('modelCode', { ns: 'newCar' })}
                placeholder={t('modelCode', { ns: 'newCar' })}
                disabled={!selectedModel}
                getOptionLabel={(option) => `${option.innerCode} (${option.year}, ${option.innerCarTypeCode})`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onUserChange={(code) => {
                  if (code) {
                    const matchingCarType = carTypes?.find(ct => ct.id === code.carTypeId)
                    if (matchingCarType && (!selectedCarType || code.carTypeId !== selectedCarType.id)) {
                      setValue('carType', matchingCarType)
                    }
                  }
                }}
              />
            </Grid>
            <Grid size={3}>
              <AppControlledAutocomplete<TCategory>
                name='category'
                control={control}
                options={categories || []}
                label={t('category', { ns: 'newCar' })}
                placeholder={t('category', { ns: 'newCar' })}
                loading={isCategoriesLoading}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Grid>
            <Grid size={3}>
              <AppControlledAutocomplete<TManufacturer>
                name='manufacturer'
                control={control}
                options={manufacturers || []}
                label={t('manufacturer', { ns: 'newCar' })}
                placeholder={t('manufacturer', { ns: 'newCar' })}
                required
                loading={isManufacturersLoading}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onUserChange={() => {
                  setValue('series', null)
                  setValue('model', null)
                  setValue('code', null)
                }}
              />
            </Grid>
            <Grid size={3}>
              <AppControlledAutocomplete<TSerie>
                name='series'
                control={control}
                options={seriesOptions}
                label={t('series', { ns: 'newCar' })}
                placeholder={t('series', { ns: 'newCar' })}
                required
                loading={isManufacturersLoading}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onUserChange={() => {
                  setValue('model', null)
                  setValue('code', null)
                }}
              />
            </Grid>
            <Grid size={6}>
              <AppControlledAutocomplete<TModel>
                name='model'
                control={control}
                options={modelOptions}
                label={t('modelName', { ns: 'newCar' })}
                placeholder={t('modelName', { ns: 'newCar' })}
                required
                loading={isManufacturersLoading}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onUserChange={() => {
                  setValue('code', null)
                }}
              />
            </Grid>
            <Grid size={6}>
              <AppControlledTextField
                name='volume'
                control={control}
                label={t('volume', { ns: 'newCar' })}
                placeholder={t('volume', { ns: 'newCar' })}
                type='number'
                disabled
              />
            </Grid>
            <Grid size={6}>
              <AppControlledAutocomplete<TEngineType>
                name='engineType'
                control={control}
                options={engineTypes || []}
                label={t('engineType', { ns: 'newCar' })}
                placeholder={t('engineType', { ns: 'newCar' })}
                loading={isEngineTypesLoading}
                disabled
                getOptionLabel={(option) => i18n.language === 'he' ? option.name : (option.nameEn || option.name)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Grid>
          </Grid>
        </StyledPaper>
        <StyledPaper sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          padding: 3,
          width: '100%',
          display: 'flex',
          gap: 2,
          marginBottom: 3,
        }}>
          <Grid container columns={12} columnSpacing={3} sx={{ width: '100%' }}>
            <Grid size={3}>
              <AppControlledAutocomplete<TGearbox>
                name='gearbox'
                control={control}
                options={gearboxes || []}
                label={t('gearbox', { ns: 'newCar' })}
                placeholder={t('gearbox', { ns: 'newCar' })}
                loading={isGearboxesLoading}
                getOptionLabel={(option) => i18n.language === 'he' ? option.name : (option.nameEn || option.name)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Grid>
            <Grid size={3}>
              <AppControlledAutocomplete<TDriveType>
                name='driveType'
                control={control}
                options={driveTypes || []}
                label={t('driveType', { ns: 'newCar' })}
                placeholder={t('driveType', { ns: 'newCar' })}
                loading={isDriveTypesLoading}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Grid>
            <Grid size={3}>
              <AppControlledAutocomplete<TBodyType>
                name='bodyType'
                control={control}
                options={bodyTypes || []}
                label={t('bodyType', { ns: 'newCar' })}
                placeholder={t('bodyType', { ns: 'newCar' })}
                loading={isBodyTypesLoading}
                getOptionLabel={(option) => i18n.language === 'he' ? option.name : (option.nameEn || option.name)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Grid>
            <Grid size={3}>
              <AppControlledTextField
                name='horsepower'
                control={control}
                label={t('horsepower', { ns: 'newCar' })}
                placeholder={t('horsepower', { ns: 'newCar' })}
                type='number'
              />
            </Grid>
            <Grid size={3}>
              <AppControlledTextField
                name='finishingPercentage'
                control={control}
                label={t('finishingPercentage', { ns: 'newCar' })}
                placeholder={t('finishingPercentage', { ns: 'newCar' })}
                type='number'
              />
            </Grid>
            <Grid size={3}>
              <AppControlledTextField
                name='factor'
                control={control}
                label={t('factor', { ns: 'newCar' })}
                placeholder={t('factor', { ns: 'newCar' })}
                type='number'
              />
            </Grid>
            <Grid size={3}>
              <AppControlledTextField
                name='acceleration'
                control={control}
                label={t('acceleration', { ns: 'newCar' })}
                placeholder={t('acceleration', { ns: 'newCar' })}
                type='number'
              />
            </Grid>
            <Grid size={3}>
              <AppControlledTextField
                name='fuelConsumption'
                control={control}
                label={t('fuelConsumption', { ns: 'newCar' })}
                placeholder={t('fuelConsumption', { ns: 'newCar' })}
                type='number'
              />
            </Grid>
            <Grid size={3}>
              <AppControlledTextField
                name='safetyRating'
                control={control}
                label={t('safetyRating', { ns: 'newCar' })}
                placeholder={t('safetyRating', { ns: 'newCar' })}
                type='number'
              />
            </Grid>
            <Grid size={3}>
              <AppControlledTextField
                name='airPollution'
                control={control}
                label={t('airPollution', { ns: 'newCar' })}
                placeholder={t('airPollution', { ns: 'newCar' })}
                type='number'
              />
            </Grid>
          </Grid>
        </StyledPaper>
        <StyledPaper sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          padding: 3,
          width: '100%',
          display: 'flex',
          gap: 2,
          marginBottom: 3,
        }}>
          <Grid container columns={12} columnSpacing={3} sx={{ width: '100%' }}>
            <Grid size={3}>
              <AppControlledAutocomplete
                name='manufacturerYear'
                control={control}
                label={t('year', { ns: 'newCar' })}
                placeholder={t('year', { ns: 'newCar' })}
                options={years}
                required
                getOptionLabel={(option) => option.toString()}
                isOptionEqualToValue={(option, value) => option === value}
              />
            </Grid>
            <Grid size={3}>
              <AppControlledTextField
                name='extraPrice'
                control={control}
                label={t('extraPrice', { ns: 'newCar' })}
                placeholder={t('extraPrice', { ns: 'newCar' })}
              />
            </Grid>
            <Grid size={12}>
              <AppControlledTextField
                name='details'
                control={control}
                label={t('details', { ns: 'newCar' })}
                placeholder={t('details', { ns: 'newCar' })}
                multiline
                minRows={4}
              />
            </Grid>
          </Grid>
        </StyledPaper>

        <StyledPaper sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          padding: 3,
          width: '100%',
          display: 'flex',
          gap: 2,
          marginBottom: 3,
        }}>
          <Grid container columns={12} rowSpacing={2} columnSpacing={3} sx={{ width: '100%' }}>
            <Grid size={12}>
              <Typography variant="h6">
                Integral extras
              </Typography>
            </Grid>
            <Grid size={12}>

              <AppExtrasMultiselect
                name='integralExtras'
              />
            </Grid>
          </Grid>
        </StyledPaper>


        <StyledPaper sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          padding: 3,
          width: '100%',
          display: 'flex',
          gap: 2,
          marginBottom: 3,
        }}>
          <Grid container columns={12} rowSpacing={2} columnSpacing={3} sx={{ width: '100%' }}>
            <Grid size={12}>
              <Typography variant="h6">
                Extras
              </Typography>
            </Grid>

            <Grid size={12}>
              <AppExtrasMultiselect
                name='extras'
                items={extrasFormItems}
              />
            </Grid>

          </Grid>
        </StyledPaper>

        <StyledPaper sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          padding: 3,
          width: '100%',
          display: 'flex',
          gap: 2,
          marginBottom: 3,
        }}>
          <Grid container columns={12} rowSpacing={2} columnSpacing={3} sx={{ width: '100%' }}>
            <Grid size={12}>
              <Typography variant="h6">
                Upgrade packages
              </Typography>
            </Grid>

            <Grid size={12}>
              <AppExtrasMultiselect
                name='upgradePackages'
              />
            </Grid>

          </Grid>
        </StyledPaper>


        <StyledPaper sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          padding: 3,
          width: '100%',
          display: 'flex',
          gap: 2,
          marginBottom: 3,
        }}>
          <Grid container columns={12} rowSpacing={2} columnSpacing={3} sx={{ width: '100%' }}>
            <Grid size={12}>
              <Typography variant="h6">
                Service packages
              </Typography>
            </Grid>

            <Grid size={12}>
              <AppExtrasMultiselect
                name='servicePackages'
              />
            </Grid>
          </Grid>
        </StyledPaper>

        <StyledPaper sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          padding: 3,
          width: '100%',
          display: 'flex',
          gap: 2,
          marginBottom: 3,
        }}>
          <Grid container columns={12} rowSpacing={2} columnSpacing={3} sx={{ width: '100%' }}>
            <Grid size={12}>
              <Typography variant="h6">
                {t('marks', { ns: 'newCar' })}
              </Typography>
            </Grid>

            <Grid size={12}>
              <AppExtrasMultiselectSimple name="marks" loading={isMarksLoading} />
            </Grid>
          </Grid>
        </StyledPaper>

        <StyledPaper sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          padding: 3,
          width: '100%',
          display: 'flex',
          gap: 2,
          marginBottom: 3,
        }}>

          <Grid container columns={13} rowSpacing={0} columnSpacing={3} sx={{ width: '100%' }}>
            <Grid size={13} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              mb={additionalLines.length > 0 ? 2 : 0}>

              <Typography variant="h6">{t('additional', { ns: 'newCar' })}</Typography>

              <AppActionButton type="add" onClick={() => append({ name: '', percentage: 0, letterText: '', letterNum: '' })} />
            </Grid>

            {additionalLines.map((field, index) => (

              <Grid size={13} key={field.id} sx={{ display: 'flex', columnGap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                <AppControlledTextField
                  name={`additionalLines.${index}.name`}
                  control={control}
                  label={t('additionalLineName', { ns: 'newCar' })}
                  placeholder={t('additionalLineName', { ns: 'newCar' })}
                />

                <AppControlledTextField
                  name={`additionalLines.${index}.percentage`}
                  control={control}
                  label={t('additionalLinePercentage', { ns: 'newCar' })}
                  placeholder={t('additionalLinePercentage', { ns: 'newCar' })}
                />

                <AppControlledTextField
                  name={`additionalLines.${index}.letterText`}
                  control={control}
                  label={t('additionalLineLetterText', { ns: 'newCar' })}
                  placeholder={t('additionalLineLetterText', { ns: 'newCar' })}
                />

                <AppControlledTextField
                  name={`additionalLines.${index}.letterNum`}
                  control={control}
                  label={t('additionalLineLetterNum', { ns: 'newCar' })}
                  placeholder={t('additionalLineLetterNum', { ns: 'newCar' })}
                />

                <AppActionButton type="delete" onClick={() => remove(index)} sx={{ mb: 1 }} />
              </Grid>


            ))}
          </Grid>
        </StyledPaper>

        <StyledPaper sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          padding: 3,
          width: '100%',
          display: 'flex',
          gap: 2,
          marginBottom: 3,
        }}>
          <Grid container columns={12} rowSpacing={2} columnSpacing={3} sx={{ width: '100%' }}>

            <Grid size={6}>
              <AppControlledTextField
                name='yearSpecial'
                control={control}
                label={t('specialByYear', { ns: 'newCar' })}
                placeholder={t('specialByYear', { ns: 'newCar' })}
              />
            </Grid>

            <Grid size={6}>
              <AppControlledTextField
                name='parallelImports'
                control={control}
                label={t('parallelImports', { ns: 'newCar' })}
                placeholder={t('parallelImports', { ns: 'newCar' })}
              />
            </Grid>
          </Grid>
        </StyledPaper>

        <StyledPaper sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          padding: 3,
          width: '100%',
          display: 'flex',
          gap: 2,
          marginBottom: 3,
        }}>
          <Grid container columns={12} rowSpacing={2} columnSpacing={3} sx={{ width: '100%' }}>

            <Grid size={3}>
              <AppControlledTextField
                name='newCarPrice'
                control={control}
                label={t('newCarPrice', { ns: 'newCar' })}
                placeholder={t('newCarPrice', { ns: 'newCar' })}
                type='number'
              />
            </Grid>

            <Grid size={2}>
              <AppControlledAutocomplete
                name='month'
                control={control}
                label={t('month', { ns: 'newCar' })}
                placeholder={t('month', { ns: 'newCar' })}
                options={months}
                getOptionLabel={(option) => option.toString()}
                isOptionEqualToValue={(option, value) => option === value}
              />
            </Grid>

            <Grid size={2}>
              <AppControlledAutocomplete
                name='year'
                control={control}
                label={t('year', { ns: 'newCar' })}
                placeholder={t('year', { ns: 'newCar' })}
                options={years}
                getOptionLabel={(option) => option.toString()}
                isOptionEqualToValue={(option, value) => option === value}
              />
            </Grid>


            <Grid size={3}>
              <AppControlledTextField
                name='price'
                control={control}
                label={t('price', { ns: 'newCar' })}
                placeholder={t('price', { ns: 'newCar' })}
                type='number'
              />
            </Grid>

            <Grid size={2}>
              <AppControlledCheckbox
                name='visible'
                control={control}
                label={t('showInPriceList', { ns: 'newCar' })}
                sx={{ mt: 2 }}
              />
            </Grid>
          </Grid>
        </StyledPaper>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>

          <Button type="submit" variant="contained" color="primary" >
            {t('save', { ns: 'newCar' })}
          </Button>
        </Box>

      </form></FormProvider>
  </>)
}