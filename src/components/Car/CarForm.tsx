import type { TCar, TCarType, TManufacturer, TSerie, TModel, TCategory, TExtra, TIntegralExtra, TUpgradePackage, TServicePackage } from "../../types"
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { object } from 'yup'
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMemo, useEffect } from "react"
import { Button, Grid, Typography } from "@mui/material"
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


interface Props {
  data: TCar | null
}

type TFormInput = {
  carType: TCarType | null
  category: TCategory | null
  manufacturer: TManufacturer | null
  series: TSerie | null
  model: TModel | null
  code: string | null
  details: string | null
  manufacturerYear: number | null
  extraPrice: number | null
  integralExtras: TIntegralExtra[]
  extras: TExtra[]
  upgradePackages: TUpgradePackage[]
  servicePackages: TServicePackage[]
}

export default function CarForm({ data }: Props) {
  const { t } = useTranslation()
  const { data: carTypes, isLoading: isCarTypesLoading } = useCarTypesQuery()
  const { data: manufacturers, isLoading: isManufacturersLoading } = useManufacturersWithSeriesAndModelsQuery()
  const { data: categories, isLoading: isCategoriesLoading } = useCategoriesQuery()
  const { data: integralExtrasData, isLoading: isIntegralExtrasLoading } = useIntegralExtrasQuery()
  const { data: extrasData, isLoading: isExtrasLoading } = useExtrasQuery()
  const { data: upgradePackagesData, isLoading: isUpgradePackagesLoading } = useUpgradePackagesQuery()
  const { data: servicePackagesData, isLoading: isServicePackagesLoading } = useServicePackagesQuery()



  const defaultValues = useMemo(() => ({
    carType: data?.carType || null,
    category: data?.category || null,
    model: data?.model || null,
    code: data?.model?.code || '',
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
  }), [integralExtrasData, extrasData, upgradePackagesData, servicePackagesData])


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

  // Следим за изменениями полей
  const selectedManufacturer = useWatch({ control, name: 'manufacturer' })
  const selectedSeries = useWatch({ control, name: 'series' })

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


  useEffect(() => {
    if (data?.model?.id && manufacturers) {
      for (const manufacturer of manufacturers) {
        for (const series of manufacturer.serieses || []) {
          const model = series.models?.find(m => m.id === data.model?.id)
          if (model) {
            setValue('manufacturer', manufacturer)
            setValue('series', series)
            break
          }
        }
      }
    }
  }, [data, manufacturers, setValue])


  const onSubmit = (data: any) => {
    console.log('Form data:', data)

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
              />
            </Grid>
            <Grid size={3}>
              <AppControlledAutocomplete<TCategory>
                name='carType'
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
                  setValue('code', '')
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
                  setValue('code', '')
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
                onUserChange={(data) => {
                  setValue('code', data?.code || '')
                }}
              />
            </Grid>
            <Grid size={3}>
              <AppControlledTextField
                name='code'
                control={control}
                label={t('modelCode', { ns: 'newCar' })}
                placeholder={t('modelCode', { ns: 'newCar' })}
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

        <Button type="submit" variant="contained" color="primary">
          {t('save', { ns: 'newCar' })}
        </Button>

      </form></FormProvider>
  </>)
}