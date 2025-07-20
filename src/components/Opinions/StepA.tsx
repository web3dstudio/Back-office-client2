import { useTranslation } from "react-i18next"
import type { TCarType, TCustomer, TDriveType, TExternalStatus, TGearbox, TImporter, TInternalStatus, TManufacturer, TModelForOpinion, TOpinion, TSelectedOwner, TUsageType } from "../../types"
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { object } from 'yup'
import { Controller, FormProvider, useFieldArray, useForm } from "react-hook-form"
import { Box, Button, Checkbox, Divider, FormControl, FormControlLabel, Grid, InputAdornment, MenuItem, Select, Typography, useTheme } from "@mui/material"
import { useCustomersQuery } from "../../query/customers.query"
import { AppControlledAutocomplete } from "../AppControlledAutocomplete"
import { AppControlledDatePicker } from "../AppControlledDatePicker"
import AppControlledSelect from "../AppControlledSelect"
import AppControlledTextField from "../AppControlledTextField"
import AppDropzoneField from "../AppDropzoneField"
import { useImportersQuery } from "../../query/importer.query"
import { useCarTypesQuery } from "../../query/carTypes.query"
// import { useManufacturersQuery } from "../../query/manufacturers.query"
// import { useModelsByManufacturerQuery } from "../../query/models.query"
import { useEffect, useMemo } from "react"
import { useDriveTypesQuery } from "../../query/driveTypes.query"
import { useUsageTypesQuery } from "../../query/usageTypes.query"
import { useInternalStatusesQuery } from "../../query/internalStatus.query"
import { useExternalStatusesQuery } from "../../query/externalStatus.query"
import { useOwnersQuery } from "../../query/owners.query"
import React from "react"
import { useIntegralExtrasQuery } from "../../query/integralExtras.query"
import { useExtrasQuery } from "../../query/extras.query"
import AppExtrasMultiselectSimple from "../AppExtrasMultiselectSimple"
import { useProtectivesQuery } from "../../query/protectives.query"
import { useCommentsForOpinionQuery } from "../../query/commentsForOpinion.query"
import AppControlledCheckboxesTags from "../AppControlledCheckboxesTags"
import { useAppraisersQuery } from "../../query/appraisers.query"
import { ORDERED_TYPE_PRIVATE, ORDERED_TYPE_COMPANY } from "../../constants"
import { useGearboxesQuery } from "../../query/gearboxes.query"
import { useOpinionsAddMutation } from "../../query/opinios.query"


interface TProps {
  data: TOpinion | null
  onSave: (opinion: TOpinion) => void
  setIsTemporary: (isTemporary: boolean) => void
}

type TFormInput = Omit<TOpinion, 'id'> & {
  selectedOwners: TSelectedOwner[]
  opinionOwners: TSelectedOwner[]
}



const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1960 + 1 }, (_, i) => currentYear - i);

export default function StepA({ data, onSave, setIsTemporary }: TProps) {

  const { t, i18n } = useTranslation()
  const theme = useTheme()

  const { data: customers, isLoading: isCustomersLoading } = useCustomersQuery()
  const { data: importers, isLoading: isImportersLoading } = useImportersQuery()
  const { data: carTypes, isLoading: isCarTypesLoading } = useCarTypesQuery()
  // const { data: manufacturers, isLoading: isManufacturersLoading } = useManufacturersQuery()
  const { data: driveTypes, isLoading: isDriveTypesLoading } = useDriveTypesQuery()
  const { data: gearboxes, isLoading: isGearboxesLoading } = useGearboxesQuery()

  const typeOptions = [
    {
      label: t('percent', { ns: 'opinion' }),
      value: 'percent',
    },
    {
      label: t('amount', { ns: 'opinion' }),
      value: 'amount',
    },
  ]

  const { data: usageTypes, isLoading: isUsageTypesLoading } = useUsageTypesQuery()
  const { data: internalStatuses, isLoading: isInternalStatusesLoading } = useInternalStatusesQuery()
  const { data: externalStatuses, isLoading: isExternalStatusesLoading } = useExternalStatusesQuery()
  const { data: owners, isLoading: isOwnersLoading } = useOwnersQuery()
  const { data: integralExtras, isLoading: isIntegralExtrasLoading } = useIntegralExtrasQuery()
  const { data: extras, isLoading: isExtrasLoading } = useExtrasQuery()
  const { data: protectives, isLoading: isProtectivesLoading } = useProtectivesQuery()
  const { data: commentsForOpinion, isLoading: isCommentsForOpinionLoading } = useCommentsForOpinionQuery()
  const { data: appraisers, isLoading: isAppraisersLoading } = useAppraisersQuery()

  const { mutate: createOpinion } = useOpinionsAddMutation()

  function getDefaultExtras<T extends { id: string; name: string; nameEn?: string | null }>(allExtras: T[], selectedExtras: T[]) {
    const selectedIds = (selectedExtras || []).map(item => item.id)
    return (allExtras || []).map(item => ({
      id: item.id,
      fieldName: item.name,
      fieldNameEn: item.nameEn,
      selected: selectedIds.includes(item.id)
    }))
  }

  const defaultValues = useMemo(() => ({
    temporary: data?.temporary || false,
    isCorrection: data?.isCorrection || false,
    customer: data?.customer || undefined,
    receptionDate: data?.receptionDate || '',
    inspectionDate: data?.inspectionDate || '',
    number: data?.number || 0,
    ordererType: data?.ordererType || ORDERED_TYPE_PRIVATE,
    name: data?.name || '',
    lastName: data?.lastName || '',
    tz: data?.tz || '',
    email: data?.email || '',
    phone: data?.phone || '',
    fax: data?.fax || '',
    licenseNumber: data?.licenseNumber || '',
    parallelImport: data?.parallelImport || false,
    personalImport: data?.personalImport || false,
    tinyImport: data?.tinyImport || false,
    // licensePhoto: data?.licensePhoto || '',
    importer: data?.importer || undefined,
    statementPrice: data?.statementPrice || undefined,
    claimNumber: data?.claimNumber || '',
    degemNm: data?.degemNm || '',
    tozeretNm: data?.tozeretNm || '',
    carType: data?.carType || undefined,

    manufacturer: data?.manufacturer || undefined,
    manufacturerCode: data?.manufacturerCode || '',
    model: data?.model || undefined,
    modelCode: data?.modelCode || '',
    manufacturerYear: data?.manufacturerYear || new Date().getFullYear(),
    driveType: data?.driveType || undefined,
    gearbox: data?.gearbox || undefined,
    volume: data?.volume || 0,
    horsepower: data?.horsepower || 0,
    numberOfSeats: data?.numberOfSeats || 0,
    specialModelCode: data?.specialModelCode || '',

    dateOfRegistration: data?.dateOfRegistration || '',
    odometer: data?.odometer || 0,
    usageType: data?.usageType || undefined,
    internalStatus: data?.internalStatus || undefined,
    externalStatus: data?.externalStatus || undefined,
    tyresStatus: data?.tyresStatus || 0,

    numberOfOwners: data?.numberOfOwners || 0,
    owners: data?.owners || [],
    selectedOwners: (data?.owners || []).map(owner => ({
      ownerId: owner.id,
      changePercentage: owner.changePercentage
    })),
    opinionOwners: [] as TSelectedOwner[],

    carDescription: data?.carDescription || '',

    integralExtras: getDefaultExtras(integralExtras || [], data?.integralExtras || []),
    extras: getDefaultExtras(extras || [], data?.extras || []),
    protectives: getDefaultExtras(protectives || [], data?.protectives || []),

    commentsForOpinion: data?.commentsForOpinion || [],
    comments: data?.comments || '',

    priceDeltaType: data?.priceDeltaType || 'percent',
    priceDelta: data?.priceDelta || 0,
    odometerDeltaType: data?.odometerDeltaType || 'percent',
    odometerDelta: data?.odometerDelta || 0,
    specialAdditionsDeltaType: data?.specialAdditionsDeltaType || 'percent',
    specialAdditionsDelta: data?.specialAdditionsDelta || 0,
    roadEntryDeltaType: data?.roadEntryDeltaType || 'percent',
    roadEntryDelta: data?.roadEntryDelta || 0,
    price: data?.price || 0,
    extraPrice: data?.extraPrice || 0,
    showPriceWithoutVAT: data?.showPriceWithoutVAT || false,

    appraisers: data?.appraisers || [],

  }), [integralExtras, extras, protectives]);



  const schema = object()
    .shape({
      customer: yup.object().required(t('form-field.required')),
      receptionDate: yup.string().required(t('form-field.required')).nullable().min(1, t('form-field.required')),
      inspectionDate: yup.string().required(t('form-field.required')).nullable().min(1, t('form-field.required')),
      email: yup.string().email(t('form-field.email')),
      licenseNumber: yup.string().required(t('form-field.required')).min(1, t('form-field.required')),
      manufacturerYear: yup.number().required(t('form-field.required')).min(1960, t('form-field.required')),
      volume: yup.number().required(t('form-field.required')).min(0, t('form-field.required')),
      horsepower: yup.number().required(t('form-field.required')).min(0, t('form-field.required')),
      dateOfRegistration: yup.string().required(t('form-field.required')).nullable().min(1, t('form-field.required')),
    })
    .required()

  const methods = useForm<TFormInput>({
    // @ts-ignore
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: defaultValues
  })

  const { handleSubmit, control, formState, reset, watch, setValue } = methods
  const errors = formState.errors

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'selectedOwners'
  })

  const numberOfOwners = watch('numberOfOwners')
  const selectedOwners = watch('selectedOwners')

  useEffect(() => {
    if (numberOfOwners === null) return
    // Увеличиваем массив
    if (fields.length < numberOfOwners) {
      for (let i = fields.length; i < numberOfOwners; i++) {
        append({ ownerId: '', changePercentage: 0 })
      }
    }
    // Уменьшаем массив
    if (fields.length > numberOfOwners) {
      for (let i = fields.length; i > numberOfOwners; i--) {
        remove(i - 1)
      }
    }
  }, [numberOfOwners])

  useEffect(() => {
    const result: TSelectedOwner[] = selectedOwners
      .filter(item => !!item.ownerId)
      .map(item => ({
        ownerId: item.ownerId,
        changePercentage: item.changePercentage
      }))
    // @ts-ignore
    setValue('opinionOwners', result)
  }, [selectedOwners, setValue])

  const ordererType = watch('ordererType')

  const onSubmit = (data: any) => {
    console.log(data)

    // Фильтруем только выбранные элементы
    const selectedIntegralExtras = data.integralExtras?.filter((item: any) => item.selected) || [];
    const selectedExtras = data.extras?.filter((item: any) => item.selected) || [];
    const selectedProtectives = data.protectives?.filter((item: any) => item.selected) || [];

    const finalData = {
      ...data,
      integralExtras: selectedIntegralExtras,
      extras: selectedExtras,
      protectives: selectedProtectives,
      owners: data.opinionOwners || [],
      numberOfOwners: data.opinionOwners?.length || 0,
    };

    createOpinion(finalData)
    // onConfirm(data)
    // reset()
  }





  return (<>
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container columns={12} columnSpacing={2} rowSpacing={0} sx={{ width: '100%' }}>
          <Grid size={12} sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontWeight: 'bold' }} variant="body1" >
                {data?.number ?? t('new', { ns: 'opinion' })}
              </Typography>
            </Box>

            <Box>
              <FormControlLabel
                labelPlacement="bottom"
                control={
                  <Controller
                    name="temporary"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        {...field}
                        checked={!!field.value}
                        onChange={e => {
                          field.onChange(e.target.checked)
                          setIsTemporary(e.target.checked)
                        }}
                      />
                    )}
                  />
                }
                label={t('temporary', { ns: 'opinion' })}
              />

              <FormControlLabel
                labelPlacement="bottom"
                control={
                  <Controller
                    name="isCorrection"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        {...field}
                        checked={!!field.value}
                      />
                    )}
                  />
                }
                label={t('isCorrection', { ns: 'opinion' })}
              />
            </Box>

          </Grid>

          <Grid size={4}>
            <AppControlledAutocomplete<TCustomer>
              name='customer'
              required
              loading={isCustomersLoading}
              options={customers as TCustomer[] || []}
              getOptionLabel={(option) => option.firstName + ' ' + option.lastName}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              control={control}
              errors={errors}
              label={t('customer', { ns: 'opinion' })}
              placeholder={t('customer', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={8}></Grid>

          <Grid size={4}>
            <AppControlledDatePicker
              name="receptionDate"
              control={control}
              errors={errors}
              required
              label={t('recDate', { ns: 'opinion' })}
              placeholder={t('recDate', { ns: 'opinion' })} />
          </Grid>

          <Grid size={4}>
            <AppControlledDatePicker
              name="inspectionDate"
              control={control}
              errors={errors}
              required
              label={t('insDate', { ns: 'opinion' })}
              placeholder={t('insDate', { ns: 'opinion' })} />
          </Grid>

          <Grid size={4}></Grid>

          <Grid size={3}>
            <AppControlledSelect
              name="ordererType"
              control={control}
              errors={errors}
              label={t('ordererType', { ns: 'opinion' })}
              options={[
                { label: t('private', { ns: 'opinion' }), value: ORDERED_TYPE_PRIVATE },
                { label: t('company', { ns: 'opinion' }), value: ORDERED_TYPE_COMPANY },
              ]}
            />
          </Grid>

          <Grid size={3}>
            <AppControlledTextField
              name="name"
              control={control}
              errors={errors}
              label={t('name', { ns: 'opinion' })}
            />
          </Grid>

          {ordererType === ORDERED_TYPE_PRIVATE && (
            <Grid size={3}>
              <AppControlledTextField
                name="lastName"
                control={control}
                errors={errors}
                label={t('lastName', { ns: 'opinion' })}
              />
            </Grid>
          )}

          <Grid size={3}>
            <AppControlledTextField
              name="tz"
              control={control}
              errors={errors}
              label={ordererType === ORDERED_TYPE_COMPANY ? t('h.p', { ns: 'opinion' }) : t('tz', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={4}>
            <AppControlledTextField
              name="email"
              control={control}
              errors={errors}
              label={t('email', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={4}>
            <AppControlledTextField
              name="phone"
              control={control}
              errors={errors}
              label={t('phone', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={4}>
            <AppControlledTextField
              name="fax"
              control={control}
              errors={errors}
              label={t('fax', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={3}>
            <AppControlledTextField
              name="licenseNumber"
              required
              control={control}
              errors={errors}
              label={t('licNum', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={'auto'}>
            <FormControlLabel
              labelPlacement="bottom"
              control={
                <Controller
                  name="parallelImport"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      {...field}
                      checked={!!field.value}
                    />
                  )}
                />
              }
              label={t('parImp', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={'auto'}>
            <FormControlLabel
              labelPlacement="bottom"
              control={
                <Controller
                  name="personalImport"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      {...field}
                      checked={!!field.value}
                    />
                  )}
                />
              }
              label={t('personalImp', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={'auto'}>
            <FormControlLabel
              labelPlacement="bottom"
              control={
                <Controller
                  name="tinyImport"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      {...field}
                      checked={!!field.value}
                    />
                  )}
                />
              }
              label={t('tinyImp', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={'grow'} sx={{ pt: 3 }}>
            <AppDropzoneField
              name='licPhoto'
              maxFileSize={1024 * 1024 * 10} // 10MB
              label={t('licPhoto', { ns: 'opinion' })}
              maxFiles={1}
              onChange={(files) => {
                // setFiles(files)
              }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ mt: 2 }} />

        <Grid container columns={12} columnSpacing={2} rowSpacing={0} sx={{ width: '100%', mt: 3 }}>
          <Grid size={6}>
            <AppControlledAutocomplete<TImporter>
              name='importer'
              loading={isImportersLoading}
              options={importers as TImporter[] || []}
              getOptionLabel={(option) => i18n.language === 'he' ? option.name : option.nameEn ?? option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              control={control}
              errors={errors}
              label={t('impName', { ns: 'opinion' })}
            // placeholder={t('impName', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={3}>
            <AppControlledTextField
              name="statementPrice"
              control={control}
              errors={errors}
              label={t('statePrice', { ns: 'opinion' })}
              type="number"
            />
          </Grid>

          <Grid size={3}>
            <AppControlledTextField
              name="claimNumber"
              control={control}
              errors={errors}
              label={t('claimNumber', { ns: 'opinion' })}
            />
          </Grid>


        </Grid>

        <Divider sx={{ mt: 0 }} />

        <Grid container columns={12} columnSpacing={2} rowSpacing={0} sx={{ width: '100%', mt: 3 }}>
          <Grid size={2}>
            <AppControlledAutocomplete<TCarType>
              name='carType'
              loading={isCarTypesLoading}
              options={carTypes as TCarType[] || []}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              control={control}
              errors={errors}
              label={t('carType', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={2}>
            <AppControlledTextField
              name="manufacturer"
              control={control}
              errors={errors}
              label={t('manufacturer', { ns: 'opinion' })}
            />
          </Grid>
          <Grid size={2}>
            <AppControlledTextField
              name="manufacturerCode"
              control={control}
              errors={errors}
              label={t('manufacturerCode', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={2}>
            <AppControlledTextField
              name="model"
              control={control}
              errors={errors}
              label={t('model', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={2}>
            <AppControlledTextField
              name="modelCode"
              control={control}
              errors={errors}
              label={t('modelCode', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={2}>
            <AppControlledAutocomplete<any>
              name='manufacturerYear'
              required
              options={years}
              getOptionLabel={(option) => option.toString()}
              isOptionEqualToValue={(option, value) => option === value}
              control={control}
              errors={errors}
              label={t('manYear', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={6}>
            <AppControlledTextField
              name="tozeretNm"
              control={control}
              errors={errors}
              label={t('tozeretNm', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={6}>
            <AppControlledTextField
              name="degemNm"
              control={control}
              errors={errors}
              label={t('degemNm', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={2}>
            <AppControlledAutocomplete<TDriveType>
              name='driveType'
              loading={isDriveTypesLoading}
              options={driveTypes as TDriveType[] || []}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              control={control}
              errors={errors}
              label={t('driveType', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={2}>
            <AppControlledAutocomplete<TGearbox>
              name='gearbox'
              loading={isGearboxesLoading}
              options={gearboxes as unknown as TGearbox[] || []}
              getOptionLabel={(option) => i18n.language === 'he' ? option.name : option.nameEn ?? option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              control={control}
              errors={errors}
              label={t('gearbox', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={2}>
            <AppControlledTextField
              name="volume"
              required
              control={control}
              errors={errors}
              label={t('vol', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={2}>
            <AppControlledTextField
              name="horsepower"
              required
              control={control}
              errors={errors}
              label={t('hp', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={2}>
            <AppControlledTextField
              name="numberOfSeats"
              control={control}
              errors={errors}
              label={t('numberOfSeats', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={2}>
            <AppControlledTextField
              name="specialModelCode"
              control={control}
              errors={errors}
              label={t('specialModelCode', { ns: 'opinion' })}
            />
          </Grid>

        </Grid>

        <Divider sx={{ mt: 0 }} />

        <Grid container columns={12} columnSpacing={2} rowSpacing={0} sx={{ width: '100%', mt: 3 }}>
          <Grid size={2}>
            <AppControlledDatePicker
              name="dateOfRegistration"
              control={control}
              errors={errors}
              required
              label={t('dateOfRegistration', { ns: 'opinion' })}
              placeholder={t('dateOfRegistration', { ns: 'opinion' })} />
          </Grid>

          <Grid size={2}>
            <AppControlledTextField
              name="odometer"
              control={control}
              errors={errors}
              label={t('odometer', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={2}>
            <AppControlledAutocomplete<TUsageType>
              name='usageType'
              loading={isUsageTypesLoading}
              options={usageTypes as TUsageType[] || []}
              getOptionLabel={(option) => i18n.language === 'he' ? option.name : option.nameEn ?? option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              control={control}
              errors={errors}
              label={t('usageType', { ns: 'opinion' })}
            // placeholder={t('usageType', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={2}>
            <AppControlledAutocomplete<TInternalStatus>
              name='internalStatus'
              loading={isInternalStatusesLoading}
              options={internalStatuses as TInternalStatus[] || []}
              getOptionLabel={(option) => i18n.language === 'he' ? option.name : option.nameEn ?? option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              control={control}
              errors={errors}
              label={t('internalStatus', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={2}>
            <AppControlledAutocomplete<TExternalStatus>
              name='externalStatus'
              loading={isExternalStatusesLoading}
              options={externalStatuses as TExternalStatus[] || []}
              getOptionLabel={(option) => i18n.language === 'he' ? option.name : option.nameEn ?? option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              control={control}
              errors={errors}
              label={t('externalStatus', { ns: 'opinion' })}
            />
          </Grid>

          <Grid size={2}>
            <AppControlledTextField
              name="tyresStatus"
              control={control}
              errors={errors}
              label={t('tyresStatus', { ns: 'opinion' })}
            />
          </Grid>

        </Grid>

        <Divider sx={{ mt: 0 }} />

        <Grid container columns={12} columnSpacing={2} rowSpacing={0} sx={{ width: '100%', mt: 3 }}>
          <Grid size={2}>
            <AppControlledSelect
              name="numberOfOwners"
              loading={isOwnersLoading}
              control={control}
              errors={errors}
              label={t('numberOfOwners', { ns: 'opinion' })}
              options={[
                { label: '—', value: 0 },
                ...Array.from({ length: 10 }, (_, i) => ({
                  label: String(i + 1),
                  value: i + 1,
                })),
              ]}
            />
          </Grid>
          <Grid size={10}>
            <Grid container columnSpacing={2} columns={10} >
              {fields.map((field, idx) => (
                <React.Fragment key={field.id}>
                  <Grid size={7} >
                    <Controller
                      name={`selectedOwners.${idx}.ownerId`}
                      control={control}
                      render={({ field }) => (
                        <FormControl
                          variant='outlined'
                          size='small'
                          fullWidth
                          sx={{ mt: -1 }}
                        >
                          <Typography variant="body2" sx={{ mb: 0.5, color: theme.palette.text.secondary, marginInlineStart: 2 }}>
                            {t('owner', { ns: 'opinion' })}
                          </Typography>
                          <Select
                            {...field}
                            fullWidth
                            value={field.value || ''}
                            onChange={e => {
                              const selectedOwner = owners?.find(o => o.id === e.target.value)
                              field.onChange(selectedOwner?.id || '')
                              setValue(`selectedOwners.${idx}.changePercentage`, selectedOwner?.defaultChangePercentage ?? 0)
                            }}
                          >
                            {owners?.map(o => (
                              <MenuItem value={o.id} key={o.id}>{o.name}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid size={3}>
                    <AppControlledTextField
                      name={`selectedOwners.${idx}.changePercentage`}
                      type="number"
                      control={control}
                      errors={errors}
                      label={t('percent', { ns: 'opinion' })}
                    />
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ mt: 0 }} />

        <Grid container columns={12} columnSpacing={2} rowSpacing={0} sx={{ width: '100%', mt: 3 }}>
          <Grid size={'grow'} sx={{ pt: 3 }}>
            <AppDropzoneField
              name='carPhoto'
              maxFileSize={1024 * 1024 * 10} // 10MB
              label={t('carPhoto', { ns: 'opinion' })}
              maxFiles={8}
              onChange={(files) => {
                // setFiles(files)
              }}
            />
          </Grid>

          <Grid size={12} sx={{ mt: 3 }}>
            <AppControlledTextField
              name="carDescription"
              control={control}
              errors={errors}
              label={t('carDesc', { ns: 'opinion' })}
              multiline
              minRows={4}
            />
          </Grid>
          <Grid size={12} sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>{t('integralExtras', { ns: 'opinion' })}</Typography>
            <AppExtrasMultiselectSimple name="integralExtras" loading={isIntegralExtrasLoading} />
          </Grid>

          <Grid size={12} sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>{t('extras', { ns: 'opinion' })}</Typography>
            <AppExtrasMultiselectSimple name="extras" loading={isExtrasLoading} />
          </Grid>

          <Grid size={12} sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>{t('protectives', { ns: 'opinion' })}</Typography>
            <AppExtrasMultiselectSimple name="protectives" loading={isProtectivesLoading} />
          </Grid>

          <Grid size={12} sx={{ mt: 4 }}>
            {/* // commentsForOpinion */}
            <AppControlledCheckboxesTags
              name="commentsForOpinion"
              loading={isCommentsForOpinionLoading}
              control={control}
              errors={errors}
              label={t('commentsForOpinion', { ns: 'opinion' })}
              // placeholder={t('commentsForOpinion', { ns: 'opinion' })}
              options={commentsForOpinion as any[] || []}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Grid>

          <Grid size={12}>
            <AppControlledTextField
              name="comments"
              control={control}
              errors={errors}
              label={t('comments', { ns: 'opinion' })}
              multiline
              minRows={4}
            />
          </Grid>

          <Grid size={12} container columnSpacing={3} columns={12}>
            <Grid size={6} container columns={12} columnSpacing={1}>
              <Grid size={6} >
                <AppControlledSelect
                  name="priceDeltaType"
                  control={control}
                  label={t('priceDeltaType', { ns: 'opinion' })}
                  options={typeOptions}
                />
              </Grid>
              <Grid size={6}>
                <AppControlledTextField
                  name="priceDelta"
                  type="number"
                  control={control}
                  label={t('priceDelta', { ns: 'opinion' })}
                  placeholder={t('priceDelta', { ns: 'opinion' })}
                  slotProps={{
                    input: {
                      endAdornment: <InputAdornment position="end">
                        {watch('priceDeltaType') === 'percent' ? '%' : '₪'}
                      </InputAdornment>,
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Grid size={6} container columns={12} columnSpacing={1}>
              <Grid size={6} >
                <AppControlledSelect
                  name="odometerDeltaType"
                  control={control}
                  label={t('odometerDeltaType', { ns: 'opinion' })}
                  options={typeOptions}
                />
              </Grid>
              <Grid size={6}>
                <AppControlledTextField
                  name="odometerDelta"
                  type="number"
                  control={control}
                  label={t('odometerDelta', { ns: 'opinion' })}
                  placeholder={t('odometerDelta', { ns: 'opinion' })}
                  slotProps={{
                    input: {
                      endAdornment: <InputAdornment position="end">
                        {watch('odometerDeltaType') === 'percent' ? '%' : '₪'}
                      </InputAdornment>,
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Grid size={6} container columns={12} columnSpacing={1}>
              <Grid size={6} >
                <AppControlledSelect
                  name="specialAdditionsDeltaType"
                  control={control}
                  label={t('specialAdditionsDeltaType', { ns: 'opinion' })}
                  options={typeOptions}
                />
              </Grid>
              <Grid size={6}>
                <AppControlledTextField
                  name="specialAdditionsDelta"
                  type="number"
                  control={control}
                  label={t('specialAdditionsDelta', { ns: 'opinion' })}
                  placeholder={t('specialAdditionsDelta', { ns: 'opinion' })}
                  slotProps={{
                    input: {
                      endAdornment: <InputAdornment position="end">
                        {watch('specialAdditionsDeltaType') === 'percent' ? '%' : '₪'}
                      </InputAdornment>,
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Grid size={6} container columns={12} columnSpacing={1}>
              <Grid size={6} >
                <AppControlledSelect
                  name="roadEntryDeltaType"
                  control={control}
                  label={t('roadEntryDeltaType', { ns: 'opinion' })}
                  options={typeOptions}
                />
              </Grid>
              <Grid size={6}>
                <AppControlledTextField
                  name="roadEntryDelta"
                  type="number"
                  control={control}
                  label={t('roadEntryDelta', { ns: 'opinion' })}
                  placeholder={t('roadEntryDelta', { ns: 'opinion' })}
                  slotProps={{
                    input: {
                      endAdornment: <InputAdornment position="end">
                        {watch('roadEntryDeltaType') === 'percent' ? '%' : '₪'}
                      </InputAdornment>,
                    },
                  }}
                />
              </Grid>
            </Grid>

          </Grid>

          <Grid size={5}>
            <AppControlledTextField
              name="price"
              type="number"
              control={control}
              label={t('price', { ns: 'opinion' })}
              placeholder={t('price', { ns: 'opinion' })}
              slotProps={{
                input: {
                  endAdornment: <InputAdornment position="end">₪</InputAdornment>
                },
              }}
            />
          </Grid>

          <Grid size={5}>
            <AppControlledTextField
              name="extraPrice"
              type="number"
              control={control}
              label={t('xPrice', { ns: 'opinion' })}
              placeholder={t('xPrice', { ns: 'opinion' })}
              slotProps={{
                input: {
                  endAdornment: <InputAdornment position="end">₪</InputAdornment>
                },
              }}
            />
          </Grid>

          <Grid size={2}>
            <FormControlLabel
              labelPlacement="bottom"
              control={
                <Controller
                  name="showPriceWithoutVAT"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      {...field}
                      checked={!!field.value}
                    />
                  )}
                />
              }
              label={t('showPriceWithoutVAT', { ns: 'opinion' })}
            />
          </Grid>

        </Grid>

        <Divider sx={{ mt: 0 }} />

        <Grid container columns={12} columnSpacing={2} rowSpacing={0} sx={{ width: '100%', mt: 3 }}>
          <Grid size={12}>
            <AppControlledCheckboxesTags
              name="appraisers"
              loading={isAppraisersLoading}
              control={control}
              errors={errors}
              label={t('appraiser', { ns: 'opinion' })}
              // placeholder={t('appraiser', { ns: 'opinion' })}
              options={appraisers as any[] || []}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Grid>
        </Grid>

        <Grid container columns={12} columnSpacing={2} rowSpacing={0} sx={{ width: '100%' }}>
          <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" color="primary" onClick={() => {

            }}>
              {t('save', { ns: 'opinion' })}
            </Button>
          </Grid>
        </Grid>

      </form>
    </FormProvider>
  </>)
}