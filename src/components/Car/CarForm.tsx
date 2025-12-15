import type { TCar, TCarType, TManufacturer, TSerie, TModel, TCategory, TExtra, TIntegralExtra, TUpgradePackage, TServicePackage, TCountry, ModelCode } from "../../types"
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { object } from 'yup'
import { FormProvider, useForm, useWatch, useFieldArray } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMemo, useEffect } from "react"
import { Box, Button, Grid, Typography } from "@mui/material"
import { AppControlledAutocomplete } from "../AppControlledAutocomplete"
import { useCarTypesQuery } from "../../query/carTypes.query"
import { useManufacturersWithSeriesAndModelsQuery } from "../../query/manufacturers.query"
import AppControlledTextField from "../AppControlledTextField"
import { useCategoriesQuery } from "../../query/category.query"
import StyledPaper from "../StyledPaper"
import { useExtrasQuery } from "../../query/extras.query"

import { useIntegralExtrasQuery } from "../../query/integralExtras.query"
import { useUpgradePackagesQuery } from "../../query/upgradePackages.query"
import { useServicePackagesQuery } from "../../query/servicePackages.query"

import AppExtrasMultiselect from "../AppExtrasMultiselect"
import AppActionButton from "../AppActionButton"
import { useCountriesQuery } from "../../query/countries.query"
import { useNavigate } from "@tanstack/react-router"
import AppControlledCheckbox from "../AppControlledCheckbox"


interface Props {
  data: TCar | null
}

type TFormInput = {
  carType: TCarType | null
  category: TCategory | null
  country: TCountry | null
  manufacturer: TManufacturer | null
  series: TSerie | null
  model: TModel | null
  code: ModelCode | null
  details: string | null
  manufacturerYear: number | null
  extraPrice: number | null
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
}


export default function CarForm({ data }: Props) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const { data: carTypes, isLoading: isCarTypesLoading } = useCarTypesQuery()
  const { data: manufacturers, isLoading: isManufacturersLoading } = useManufacturersWithSeriesAndModelsQuery()
  const { data: categories, isLoading: isCategoriesLoading } = useCategoriesQuery()
  const { data: integralExtrasData, isLoading: _isIntegralExtrasLoading } = useIntegralExtrasQuery()
  const { data: extrasData, isLoading: _isExtrasLoading } = useExtrasQuery()
  const { data: upgradePackagesData, isLoading: _isUpgradePackagesLoading } = useUpgradePackagesQuery()
  const { data: servicePackagesData, isLoading: _isServicePackagesLoading } = useServicePackagesQuery()
  const { data: countries, isLoading: isCountriesLoading } = useCountriesQuery()


  const defaultValues = useMemo(() => ({
    carType: data?.carType || null,
    category: data?.category || null,
    country: data?.country || null,
    manufacturer: (data?.model as any)?.series?.manufacturer || null,
    series: (data?.model as any)?.series || null,
    model: data?.model || null,
    code: data?.codeId && data?.model?.codes ? data.model.codes.find(c => c.id === data.codeId) || null : null,
    details: data?.details || '',
    manufacturerYear: data?.manufacturerYear || null,
    extraPrice: data?.extraPrice || 0,
    integralExtras: integralExtrasData?.map((item: TIntegralExtra) => ({
      id: item.id,
      checked: false,
      fieldName: item.name,
      fieldNameEn: item.nameEn,
      selected: false,
      value: 0
    })) || [],
    extras: extrasData?.map((item: TExtra) => ({
      id: item.id,
      checked: false,
      fieldName: item.name,
      fieldNameEn: item.nameEn,
      selected: false,
      value: 0
    })) || [],
    upgradePackages: upgradePackagesData?.map((item: TUpgradePackage) => ({
      id: item.id,
      checked: false,
      fieldName: item.name,
      fieldNameEn: item.nameEn,
      selected: false,
      value: 0
    })) || [],
    servicePackages: servicePackagesData?.map((item: TServicePackage) => ({
      id: item.id,
      checked: false,
      fieldName: item.name,
      fieldNameEn: item.nameEn,
      selected: false,
      value: 0
    })) || [],
    additionalLines: data?.additionalLines || [],
  }), [integralExtrasData, extrasData, upgradePackagesData, servicePackagesData, data])


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
      methods.reset(defaultValues);
    }
  }, [integralExtrasData, extrasData, upgradePackagesData, servicePackagesData, methods, defaultValues]);

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
    if (!selectedModel?.codes) return []
    if (!selectedCarType) return selectedModel.codes
    return selectedModel.codes.filter(code => code.carTypeId === selectedCarType.id)
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

      // Загружаем code если есть
      if (data.codeId && data.model.codes) {
        const code = data.model.codes.find(c => c.id === data.codeId)
        if (code) {
          setValue('code', code)
        }
      }
      return
    }

    // Если данных нет, ищем в загруженных manufacturers
    if (data?.model?.id && manufacturers) {
      for (const manufacturer of manufacturers) {
        for (const series of manufacturer.serieses || []) {
          const model = series.models?.find(m => m.id === data.model?.id)
          if (model) {
            setValue('manufacturer', manufacturer)
            setValue('series', series)

            // Загружаем code если есть
            if (data.codeId && model.codes) {
              const code = model.codes.find(c => c.id === data.codeId)
              if (code) {
                setValue('code', code)
              }
            }
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

  // Массив уникальных годов из цен



  const onSubmit = (data: any) => {

    // console.log(data)

    // Фильтруем выбранные extras
    const selectedIntegralExtras = data.integralExtras?.filter((item: any) => item.selected) || [];
    const selectedExtras = data.extras?.filter((item: any) => item.selected) || [];
    const selectedUpgradePackages = data.upgradePackages?.filter((item: any) => item.selected) || [];
    const selectedServicePackages = data.servicePackages?.filter((item: any) => item.selected) || [];

    console.log('Selected integral extras:', selectedIntegralExtras)
    console.log('Selected extras:', selectedExtras)
    console.log('Selected upgrade packages:', selectedUpgradePackages)
    console.log('Selected service packages:', selectedServicePackages)
  }

  return (<>
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
        <Grid container columns={12} columnSpacing={3} sx={{ width: '100%' }}>
          <Grid size={10}>
            <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => {
              if (data?.id) {
                navigate({ to: '/catalog/$id', params: { id: data?.id } })
              } else {
                navigate({ to: '/catalog/new-car' })
              }
            }}>
              {t('toDetails', { ns: 'newCar' })}
            </Button>
          </Grid>
          <Grid size={2}>

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
            <Grid size={6}>

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
            <Grid size={3}>
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
            <Grid size={3}>
              <AppControlledAutocomplete<ModelCode>
                name='code'
                control={control}
                options={codeOptions}
                label={t('modelCode', { ns: 'newCar' })}
                placeholder={t('modelCode', { ns: 'newCar' })}
                disabled={!selectedModel}
                getOptionLabel={(option) => option.innerCode}
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
                name='specialYear'
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