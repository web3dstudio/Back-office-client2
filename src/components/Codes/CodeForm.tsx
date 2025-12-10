import { useTranslation } from "react-i18next"
import type { TCode } from "../../types"
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { object } from 'yup'
import { Box, Button, Grid, Typography } from "@mui/material"
import { useForm } from "react-hook-form"
import AppControlledTextField from "../AppControlledTextField"
import { AppControlledAutocomplete } from "../AppControlledAutocomplete"
import { useCarTypesQuery } from "../../query/carTypes.query"
import { useManufacturersWithSeriesAndModelsQuery } from "../../query/manufacturers.query"
import { useCodeCreateMutation, useCodeUpdateMutation } from "../../query/codes.query"
import { useChassisQuery } from "../../query/chassis.query"
import type { TCarType, TManufacturer, TSerie, TModel, TChassis } from "../../types"
import { useMemo, useEffect } from "react"
import { useWatch } from "react-hook-form"
import AppControlledSelect from "../AppControlledSelect"
import { useNavigate } from "@tanstack/react-router"

interface Props {
  code?: TCode | null
}

type TFormInput = {
  carType: TCarType | null
  innerCarTypeCode: string
  manufacturer: TManufacturer | null
  series: TSerie | null
  model: TModel | null
  innerCode: string
  subCode: string
  isAuto: string
  chassis: TChassis | null
  year: number | null
  fromYear: number | null
  toYear: number | null
  modelDescription: string
  description: string
}

function CodeForm({ code = null }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: carTypes, isLoading: isCarTypesLoading } = useCarTypesQuery()
  const { data: manufacturers, isLoading: isManufacturersLoading } = useManufacturersWithSeriesAndModelsQuery()
  const { data: chassisList, isLoading: isChassisLoading } = useChassisQuery()
  const { mutate: createCode, isPending: isCreating } = useCodeCreateMutation()
  const { mutate: updateCode, isPending: isUpdating } = useCodeUpdateMutation()

  // Generate years from current year + 1 down to 1990
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1988 }, (_, i) => currentYear + 1 - i)

  const schema = object()
    .shape({
      carType: yup.object().required(t('form-field.required')),
      innerCarTypeCode: yup.string().required(t('form-field.required')),
      manufacturer: yup.object().required(t('form-field.required')),
      series: yup.object().required(t('form-field.required')),
      model: yup.object().required(t('form-field.required')),
      innerCode: yup.string().required(t('form-field.required')),
      chassis: yup.object().required(t('form-field.required')),
      year: yup.number().required(t('form-field.required')),
      fromYear: yup.number().required(t('form-field.required')),
      toYear: yup.number().required(t('form-field.required')),
    })
    .required()

  const methods = useForm<TFormInput>({
    // @ts-ignore
    resolver: yupResolver(schema) as any,
    mode: 'onChange',
    defaultValues: {
      carType: null,
      innerCarTypeCode: '',
      manufacturer: null,
      series: null,
      model: null,
      innerCode: '',
      subCode: '',
      isAuto: '0',
      chassis: null,
      year: null,
      fromYear: null,
      toYear: null,
      modelDescription: '',
      description: '',
    },
  })

  const { control, handleSubmit, formState, setValue, reset } = methods

  const selectedManufacturer = useWatch({ control, name: 'manufacturer' })
  const selectedSeries = useWatch({ control, name: 'series' })
  const year = useWatch({ control, name: 'year' })
  const fromYear = useWatch({ control, name: 'fromYear' })

  useEffect(() => {
    if (code?.id) {
      reset({
        carType: code.carType || null,
        innerCarTypeCode: code.innerCarTypeCode || '',
        manufacturer: null,
        series: null,
        model: null,
        innerCode: code.innerCode || '',
        subCode: code.innerSubCode || '',
        isAuto: code.isAuto || '0',
        chassis: null,
        year: code.year || null,
        fromYear: code.fromYear || code.year || null,
        toYear: code.toYear || code.year || null,
        modelDescription: code.modelDescription || '',
        description: code.description || '',
      })
    } else if (code === null) {
      reset({
        carType: null,
        innerCarTypeCode: '',
        manufacturer: null,
        series: null,
        model: null,
        innerCode: '',
        subCode: '',
        isAuto: '0',
        year: null,
        fromYear: null,
        toYear: null,
        modelDescription: '',
        description: '',
      })
    }
  }, [code?.id, reset])

  // Set manufacturer from manufacturers array
  useEffect(() => {
    if (code?.manufacturerId && manufacturers && manufacturers.length > 0 && !isManufacturersLoading) {
      const foundManufacturer = manufacturers.find(m => m.id === code.manufacturerId)
      if (foundManufacturer) {
        setValue('manufacturer', foundManufacturer, { shouldDirty: false })
      }
    }
  }, [code?.manufacturerId, manufacturers, isManufacturersLoading, setValue])

  // Set series after manufacturer is set
  useEffect(() => {
    if (code?.seriesId && selectedManufacturer) {
      const foundSeries = selectedManufacturer.serieses?.find(s => s.id === code.seriesId)
      if (foundSeries) {
        setValue('series', foundSeries, { shouldDirty: false })
      }
    }
  }, [code?.seriesId, selectedManufacturer, setValue])

  // Set model after series is set
  useEffect(() => {
    if (code?.modelId && selectedSeries) {
      const foundModel = selectedSeries.models?.find(m => m.id === code.modelId)
      if (foundModel) {
        setValue('model', foundModel, { shouldDirty: false })
      }
    }
  }, [code?.modelId, selectedSeries, setValue])

  // Set chassis from chassis list by id
  useEffect(() => {
    if (code?.chassis && chassisList && chassisList.length > 0 && !isChassisLoading) {
      const foundChassis = chassisList.find(c => c.id === code.chassis)
      if (foundChassis) {
        setValue('chassis', foundChassis, { shouldDirty: false })
      }
    }
  }, [code?.chassis, chassisList, isChassisLoading, setValue])

  // При создании: если year изменен и fromYear пустой, установить fromYear из year
  useEffect(() => {
    if (!code && year && !fromYear) {
      setValue('fromYear', year)
    }
  }, [year, fromYear, code, setValue])

  const errors = formState.errors

  // Filter series by selected manufacturer
  const seriesOptions = useMemo(() => {
    if (!selectedManufacturer) return []
    return selectedManufacturer.serieses || []
  }, [selectedManufacturer])

  // Filter models by selected series
  const modelOptions = useMemo(() => {
    if (!selectedSeries) return []
    return selectedSeries.models || []
  }, [selectedSeries])

  const onSubmit = (data: TFormInput) => {
    if (!data.carType || !data.manufacturer || !data.series || !data.model || !data.chassis) {
      return
    }

    const formData = {
      modelId: data.model.id,
      description: data.description,
      innerCode: data.innerCode,
      innerSubCode: data.subCode,
      innerCarTypeCode: data.innerCarTypeCode,
      chassis: data.chassis.id,
      year: data.year || 0,
      fromYear: data.fromYear || 0,
      toYear: data.toYear || 0,
      isAuto: data.isAuto,
      carTypeId: data.carType.id,
      modelDescription: data.modelDescription,
    }

    if (code?.id) {
      updateCode(
        { id: code.id, data: formData },
        {
          onSuccess: () => {
            navigate({ to: '/codes' })
          },
        }
      )
    } else {
      createCode(formData, {
        onSuccess: () => {
          navigate({ to: '/codes' })
        },
      })
    }
  }

  const isAutoOptions = [
    { value: '0', label: '0' },
    { value: '1', label: '1' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
      <Grid container columnSpacing={2} rowSpacing={2} columns={12} sx={{ width: '100%' }}>
        <Grid size={6}>
          <AppControlledAutocomplete<TCarType>
            name='carType'
            control={control}
            options={carTypes || []}
            label={t('carType', { ns: 'newCode' })}
            required
            loading={isCarTypesLoading}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            errors={errors}
          />
        </Grid>

        <Grid size={6}>
          <AppControlledTextField
            name='innerCarTypeCode'
            control={control}
            errors={errors}
            label={t('innerCarTypeCode', { ns: 'newCode' })}
            required
          />
        </Grid>

        <Grid size={4}>
          <AppControlledAutocomplete<TManufacturer>
            name='manufacturer'
            control={control}
            options={manufacturers || []}
            label={t('manufacturerName', { ns: 'newCode' })}
            required
            loading={isManufacturersLoading}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            errors={errors}
            onUserChange={() => {
              setValue('series', null)
              setValue('model', null)
            }}
          />
        </Grid>

        <Grid size={4}>
          <AppControlledAutocomplete<TSerie>
            name='series'
            control={control}
            options={seriesOptions}
            label="Series"
            required
            loading={isManufacturersLoading}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            errors={errors}
            onUserChange={() => {
              setValue('model', null)
            }}
          />
        </Grid>

        <Grid size={4}>
          <AppControlledAutocomplete<TModel>
            name='model'
            control={control}
            options={modelOptions}
            label={t('modelName', { ns: 'newCode' })}
            required
            loading={isManufacturersLoading}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            errors={errors}
          />
        </Grid>

        <Grid size={3}>
          <AppControlledTextField
            name='innerCode'
            control={control}
            errors={errors}
            label={t('innerCode', { ns: 'newCode' })}
            required
          />
        </Grid>

        <Grid size={3}>
          <AppControlledTextField
            name='subCode'
            control={control}
            errors={errors}
            label={t('innerSubCode', { ns: 'newCode' })}
          />
        </Grid>

        <Grid size={3}>
          <AppControlledSelect
            name='isAuto'
            control={control}
            options={isAutoOptions}
            label={t('isAuto', { ns: 'newCode' })}
            errors={errors}
          />
        </Grid>

        <Grid size={3}>
          <AppControlledAutocomplete<TChassis>
            name='chassis'
            control={control}
            options={chassisList || []}
            label={t('chassis', { ns: 'newCode' })}
            required
            loading={isChassisLoading}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            errors={errors}
          />
        </Grid>

        <Grid size={4}>
          <AppControlledAutocomplete<number>
            name='year'
            control={control}
            options={years}
            label={t('year', { ns: 'newCode' })}
            required
            getOptionLabel={(option) => option.toString()}
            isOptionEqualToValue={(option, value) => option === value}
            errors={errors}
          />
        </Grid>

        <Grid size={4}>
          <AppControlledAutocomplete<number>
            name='fromYear'
            control={control}
            options={years}
            label={t('fromYear', { ns: 'newCode' })}
            required
            getOptionLabel={(option) => option.toString()}
            isOptionEqualToValue={(option, value) => option === value}
            errors={errors}
          />
        </Grid>

        <Grid size={4}>
          <AppControlledAutocomplete<number>
            name='toYear'
            control={control}
            options={years}
            label={t('toYear', { ns: 'newCode' })}
            required
            getOptionLabel={(option) => option.toString()}
            isOptionEqualToValue={(option, value) => option === value}
            errors={errors}
          />
        </Grid>

        <Grid size={12}>
          <AppControlledTextField
            name='modelDescription'
            control={control}
            errors={errors}
            label="Model Description"
            multiline
            minRows={4}
          />
        </Grid>

        <Grid size={12}>
          <AppControlledTextField
            name='description'
            control={control}
            errors={errors}
            label="Comments"
            multiline
            minRows={4}
          />
        </Grid>

        <Grid size={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button
              color='primary'
              size='small'
              onClick={() => navigate({ to: '/codes' })}
              variant='outlined'
            >
              <Typography sx={{ textWrap: 'nowrap', fontSize: '14px', fontWeight: 'bold' }}>
                {t('modals.cancel', { ns: 'common' })}
              </Typography>
            </Button>
            <Button
              color='primary'
              type='submit'
              variant='contained'
              disabled={!formState.isValid || isUpdating || isCreating}
              loading={isUpdating || isCreating}
            >
              <Typography sx={{ textWrap: 'nowrap', fontSize: '14px', fontWeight: 'bold' }}>
                {t('modals.save', { ns: 'common' })}
              </Typography>
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  )
}

export default CodeForm

