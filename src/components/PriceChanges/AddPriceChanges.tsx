import { useMemo, useEffect } from 'react'
import { Box, Button, Grid, TextField, FormControl, InputLabel, FormHelperText } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { FormProvider, useForm, useFieldArray, Controller } from 'react-hook-form'
import { AppControlledAutocomplete } from '../AppControlledAutocomplete'
import AppActionButton from '../AppActionButton'
import { useManufacturersWithSeriesAndModelsQuery } from '../../query/manufacturers.query'
import { useCategoriesQuery } from '../../query/category.query'
import { useCarTypesQuery } from '../../query/carTypes.query'
import { useModelsByManufacturerQuery } from '../../query/models.query'
import {
  parameterSelectOptions,
  MANUFACTURER_PARAMETER,
  MODEL_PARAMETER,
  CATEGORY_PARAMETER,
  CARTYPE_PARAMETER,
  VOLUME_PARAMETER,
  PRICE_PARAMETER,
  YEAR_PARAMETER,
  FIX_CHANGE,
  ONE_TIME_CHANGE,
  includeId,
} from './constants'
import { usePriceChangeCreateMutation } from '../../query/priceChanges.query'
import type { TPriceChangeCreate } from '../../query/priceChanges.query'
import type { TPriceChange } from '../../types'

type ModelSelectProps = {
  index: number
  manufacturerId: string
  control: any
}

function ModelSelect({ index, manufacturerId, control }: ModelSelectProps) {
  const { t } = useTranslation()
  const { data: models, isLoading: isLoadingModels } = useModelsByManufacturerQuery(manufacturerId)

  const modelOptions = models?.map(m => ({ id: m.id, name: m.name })) || []

  return (
    <Grid size={2}>
      <AppControlledAutocomplete<{ id: string; name: string }>
        name={`changes.${index}.entityId`}
        control={control}
        options={modelOptions}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        label={t('model', { ns: 'prices' })}
        disabled={!manufacturerId}
        loading={isLoadingModels}
      />
    </Grid>
  )
}

type TChangeGroup = {
  id?: string // Для существующих изменений
  parameter: { id: number; name: string } | null
  entityId: { id: string; name: string } | null
  manufacturerId: { id: string; name: string } | null
  from: string
  to: string
  change: string
}

type TFormInput = {
  changes: TChangeGroup[]
}

type AddPriceChangesProps = {
  type: number // FIX_CHANGE или ONE_TIME_CHANGE
  countryId: string | null
  existingChanges?: TPriceChange[] // Существующие изменения текущего таба
  allExistingChanges?: TPriceChange[] // Все существующие изменения (оба таба)
}

function AddPriceChanges({ type, countryId, existingChanges = [], allExistingChanges = [] }: AddPriceChangesProps) {
  const { t } = useTranslation()
  const { data: manufacturers, isLoading: isLoadingManufacturers } = useManufacturersWithSeriesAndModelsQuery()
  const { data: categories, isLoading: isLoadingCategories } = useCategoriesQuery()
  const { data: carTypes, isLoading: isLoadingCarTypes } = useCarTypesQuery()
  const createMutation = usePriceChangeCreateMutation()

  const parameterOptions = useMemo(() =>
    parameterSelectOptions.map(opt => ({
      id: opt.id,
      name: t(opt.name, { ns: 'prices' })
    })), [t]
  )

  // Находим параметр "год" по умолчанию
  const defaultParameter = useMemo(() => {
    return parameterOptions.find(opt => opt.id === YEAR_PARAMETER) || null
  }, [parameterOptions])

  // Преобразуем существующие изменения в формат формы
  // Пересчитывается только когда изменились existingChanges или parameterOptions
  // categories, carTypes, manufacturers используются внутри, но не вызывают пересчет
  const existingChangesIds = useMemo(() => existingChanges.map(c => c.id).join(','), [existingChanges])

  const existingChangesFormatted = useMemo(() => {
    return existingChanges.map(change => {
      const needsEntityId = change.parameter === CATEGORY_PARAMETER ||
        change.parameter === CARTYPE_PARAMETER ||
        change.parameter === MANUFACTURER_PARAMETER ||
        change.parameter === MODEL_PARAMETER

      // Находим объект параметра
      const parameterOption = parameterOptions.find(opt => opt.id === change.parameter) || null

      // Находим объект entityId в зависимости от типа параметра
      let entityIdOption: { id: string; name: string } | null = null
      let manufacturerIdOption: { id: string; name: string } | null = null

      if (change.entityId) {
        if (change.parameter === CATEGORY_PARAMETER && categories) {
          entityIdOption = categories.find(c => c.id === change.entityId) || null
        } else if (change.parameter === CARTYPE_PARAMETER && carTypes) {
          entityIdOption = carTypes.find(ct => ct.id === change.entityId) || null
        } else if (change.parameter === MANUFACTURER_PARAMETER && manufacturers) {
          entityIdOption = manufacturers.find(m => m.id === change.entityId) || null
        } else if (change.parameter === MODEL_PARAMETER) {
          // Для MODEL_PARAMETER нужно найти модель и её manufacturer
          if (manufacturers) {
            // Ищем модель по entityId во всех manufacturers
            for (const manufacturer of manufacturers) {
              if (manufacturer.serieses) {
                for (const serie of manufacturer.serieses) {
                  if (serie.models) {
                    const model = serie.models.find(m => m.id === change.entityId)
                    if (model) {
                      entityIdOption = { id: model.id, name: model.name }
                      manufacturerIdOption = { id: manufacturer.id, name: manufacturer.name }
                      break
                    }
                  }
                }
              }
            }
          }
        }
      }

      return {
        id: change.id,
        parameter: parameterOption,
        entityId: entityIdOption,
        manufacturerId: manufacturerIdOption,
        from: needsEntityId ? '' : (change.from || ''),
        to: needsEntityId ? '' : (change.to || ''),
        change: String(change.change),
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingChangesIds, parameterOptions, manufacturers, categories, carTypes])

  const methods = useForm<TFormInput>({
    mode: 'onChange',
    defaultValues: {
      changes: [
        ...existingChangesFormatted,
        { parameter: defaultParameter, entityId: null, manufacturerId: null, from: '', to: '', change: '' }
      ]
    },
  })

  const { control, handleSubmit, setValue, watch, reset } = methods
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'changes'
  })

  // Обновляем форму когда existingChangesFormatted изменился
  useEffect(() => {
    if (categories && carTypes && manufacturers) {
      reset({
        changes: [
          ...existingChangesFormatted,
          { parameter: defaultParameter, entityId: null, manufacturerId: null, from: '', to: '', change: '' }
        ]
      }, { keepDefaultValues: false })
    }
  }, [existingChangesFormatted, categories, carTypes, manufacturers, reset, defaultParameter])

  const watchedChanges = watch('changes')

  const handleAddChange = () => {
    append({ parameter: defaultParameter, entityId: null, manufacturerId: null, from: '', to: '', change: '' })
  }

  const handleRemoveChange = (index: number) => {
    remove(index)
  }

  const getManufacturerOptions = () => {
    if (!manufacturers) return []
    return manufacturers.map(m => ({ id: m.id, name: m.name }))
  }

  const getCategoryOptions = () => {
    if (!categories) return []
    return categories.map(c => ({ id: c.id, name: c.name }))
  }

  const getCarTypeOptions = () => {
    if (!carTypes) return []
    return carTypes.map(ct => ({ id: ct.id, name: ct.name }))
  }

  const onSubmit = (data: TFormInput) => {
    if (!countryId) {
      return
    }

    // Получаем изменения из текущего таба
    const currentTabChanges = data.changes.filter((change: TChangeGroup) => {
      const parameterValue = change.parameter?.id || change.parameter

      if (!parameterValue || !change.change) {
        return false
      }

      // Для параметров из paramTable (Category, CarType, Manufacturer, Model) нужен entityId
      const needsEntityId = parameterValue === CATEGORY_PARAMETER ||
        parameterValue === CARTYPE_PARAMETER ||
        parameterValue === MANUFACTURER_PARAMETER ||
        parameterValue === MODEL_PARAMETER

      if (needsEntityId) {
        const entityIdValue = typeof change.entityId === 'object' && change.entityId !== null
          ? (change.entityId as { id: string; name: string })?.id
          : change.entityId
        return !!entityIdValue
      }

      // Для остальных параметров (Volume, Price, Year) нужны from и to
      return !!(change.from && change.to)
    })

    // Получаем изменения из другого таба (которые не были изменены в текущем табе)
    const otherTabType = type === FIX_CHANGE ? ONE_TIME_CHANGE : FIX_CHANGE
    const otherTabChanges = allExistingChanges
      .filter(change => change.type === otherTabType)
      .map(change => ({
        id: change.id,
        countryId: countryId || null,
        type: change.type,
        parameter: change.parameter,
        entityId: change.entityId,
        change: change.change,
        from: change.from || null,
        to: change.to || null,
      } as TPriceChangeCreate & { id: string; countryId: string | null; from: string | null; to: string | null }))

    // Преобразуем изменения текущего таба
    const currentTabPriceChanges = currentTabChanges.map(change => {
      const parameterValue = change.parameter?.id || change.parameter || 0

      const entityIdValue = change.entityId?.id || change.entityId

      // Для параметров из paramTable (Category, CarType, Manufacturer, Model) from/to = null
      // Для остальных (Volume, Price, Year) используем значения из формы
      const needsEntityId = parameterValue === CATEGORY_PARAMETER ||
        parameterValue === CARTYPE_PARAMETER ||
        parameterValue === MANUFACTURER_PARAMETER ||
        parameterValue === MODEL_PARAMETER

      const baseChange = {
        countryId: countryId || null,
        type: type,
        parameter: parameterValue as number,
        entityId: includeId(entityIdValue as string | null, parameterValue as number),
        change: parseFloat(change.change) || 0,
        from: needsEntityId ? null : (change.from || null),
        to: needsEntityId ? null : (change.to || null),
      }

      // Если есть id, это существующее изменение
      if (change.id) {
        return {
          ...baseChange,
          id: change.id,
        } as TPriceChangeCreate & { id: string; countryId: string | null; from: string | null; to: string | null }
      }

      // Иначе это новое изменение
      return baseChange as TPriceChangeCreate & { countryId: string | null; from: string | null; to: string | null }
    })

    // Объединяем изменения текущего таба и другого таба
    const allPriceChanges = [...currentTabPriceChanges, ...otherTabChanges]

    if (allPriceChanges.length > 0) {
      createMutation.mutate(allPriceChanges)
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ mb: 3 }}>
          {fields.map((field, index) => {
            const currentChange = watchedChanges?.[index]
            const parameterValue = currentChange?.parameter
            const parameter = typeof parameterValue === 'object' && parameterValue !== null
              ? (parameterValue as { id: number; name: string })?.id
              : parameterValue

            // Определяем, нужно ли показывать entityId поля (для Category, CarType, Manufacturer, Model)
            const showEntityId = parameter && (
              Number(parameter) === CATEGORY_PARAMETER ||
              Number(parameter) === CARTYPE_PARAMETER ||
              Number(parameter) === MANUFACTURER_PARAMETER ||
              Number(parameter) === MODEL_PARAMETER
            )

            // Определяем, нужно ли показывать from/to поля (для Volume, Price, Year)
            const showFromTo = parameter && (
              Number(parameter) === VOLUME_PARAMETER ||
              Number(parameter) === PRICE_PARAMETER ||
              Number(parameter) === YEAR_PARAMETER
            )

            return (
              <Box key={field.id} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center" sx={{ flexWrap: 'nowrap' }}>
                  <Grid size={2}>
                    <AppControlledAutocomplete<{ id: number; name: string }>
                      name={`changes.${index}.parameter`}
                      control={control}
                      options={parameterOptions}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      label={t('parameter', { ns: 'prices' })}
                      onUserChange={() => {
                        setValue(`changes.${index}.entityId`, null)
                        setValue(`changes.${index}.manufacturerId`, null)
                        setValue(`changes.${index}.from`, '')
                        setValue(`changes.${index}.to`, '')
                      }}
                    />
                  </Grid>

                  {showEntityId && parameter && Number(parameter) === CATEGORY_PARAMETER && (
                    <Grid size={2}>
                      <AppControlledAutocomplete<{ id: string; name: string }>
                        name={`changes.${index}.entityId`}
                        control={control}
                        options={getCategoryOptions()}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        label={t('category', { ns: 'prices' })}
                        loading={isLoadingCategories}
                      />
                    </Grid>
                  )}

                  {showEntityId && parameter && Number(parameter) === CARTYPE_PARAMETER && (
                    <Grid size={2}>
                      <AppControlledAutocomplete<{ id: string; name: string }>
                        name={`changes.${index}.entityId`}
                        control={control}
                        options={getCarTypeOptions()}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        label={t('cartype', { ns: 'prices' })}
                        loading={isLoadingCarTypes}
                      />
                    </Grid>
                  )}

                  {showEntityId && parameter && Number(parameter) === MANUFACTURER_PARAMETER && (
                    <Grid size={2}>
                      <AppControlledAutocomplete<{ id: string; name: string }>
                        name={`changes.${index}.entityId`}
                        control={control}
                        options={getManufacturerOptions()}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        label={t('manufacturer', { ns: 'prices' })}
                        loading={isLoadingManufacturers}
                      />
                    </Grid>
                  )}

                  {showEntityId && parameter && Number(parameter) === MODEL_PARAMETER && (
                    <>
                      <Grid size={2}>
                        <AppControlledAutocomplete<{ id: string; name: string }>
                          name={`changes.${index}.manufacturerId`}
                          control={control}
                          options={getManufacturerOptions()}
                          getOptionLabel={(option) => option.name}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          label={t('manufacturer', { ns: 'prices' })}
                          loading={isLoadingManufacturers}
                          onUserChange={() => {
                            setValue(`changes.${index}.entityId`, null)
                          }}
                        />
                      </Grid>
                      <ModelSelect
                        index={index}
                        manufacturerId={typeof currentChange?.manufacturerId === 'object' && currentChange?.manufacturerId !== null
                          ? (currentChange.manufacturerId as { id: string; name: string })?.id
                          : currentChange?.manufacturerId || ''}
                        control={control}
                      />
                    </>
                  )}

                  {showFromTo && (
                    <>
                      <Grid size={2}>
                        <Controller
                          name={`changes.${index}.from`}
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth variant='outlined' size='small'>
                              <InputLabel shrink htmlFor={`changes.${index}.from`} sx={{ fontSize: '20px' }}>
                                {t('from', { ns: 'prices' })}
                              </InputLabel>
                              <TextField
                                {...field}
                                onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                                id={`changes.${index}.from`}
                                variant='outlined'
                                size='small'
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    'label + &': {
                                      marginTop: 2,
                                    },
                                  },
                                }}
                              />
                              <FormHelperText margin='dense'> </FormHelperText>
                            </FormControl>
                          )}
                        />
                      </Grid>
                      <Grid size={2}>
                        <Controller
                          name={`changes.${index}.to`}
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth variant='outlined' size='small'>
                              <InputLabel shrink htmlFor={`changes.${index}.to`} sx={{ fontSize: '20px' }}>
                                {t('to', { ns: 'prices' })}
                              </InputLabel>
                              <TextField
                                {...field}
                                onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                                id={`changes.${index}.to`}
                                variant='outlined'
                                size='small'
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    'label + &': {
                                      marginTop: 2,
                                    },
                                  },
                                }}
                              />
                              <FormHelperText margin='dense'> </FormHelperText>
                            </FormControl>
                          )}
                        />
                      </Grid>
                    </>
                  )}
                  <Grid size={2}>
                    <Controller
                      name={`changes.${index}.change`}
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth variant='outlined' size='small'>
                          <InputLabel shrink htmlFor={`changes.${index}.change`} sx={{ fontSize: '20px' }}>
                            {t('change', { ns: 'prices' })}
                          </InputLabel>
                          <TextField
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                            id={`changes.${index}.change`}
                            variant='outlined'
                            size='small'
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                'label + &': {
                                  marginTop: 2,
                                },
                              },
                            }}
                          />
                          <FormHelperText margin='dense'> </FormHelperText>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid size="auto">
                    <AppActionButton
                      type="remove"
                      onClick={() => handleRemoveChange(index)}
                      disabled={fields.length === 1}
                      sx={{ backgroundColor: 'error.main', '&:hover': { backgroundColor: 'error.main' } }}
                    />
                  </Grid>
                  {index === fields.length - 1 && (
                    <Grid size="auto">
                      <AppActionButton
                        type="add"
                        onClick={handleAddChange}
                      />
                    </Grid>
                  )}
                </Grid>
              </Box>
            )
          })}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleSubmit(onSubmit)}
              disabled={createMutation.isPending || !countryId}
            >
              {t('save', { ns: 'prices' })}
            </Button>
          </Box>
        </Box>
      </form>
    </FormProvider>
  )
}

export default AddPriceChanges
