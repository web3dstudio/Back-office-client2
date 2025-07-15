import { useTranslation } from "react-i18next"
import type { TCarType, TCustomer, TDriveType, TExternalStatus, TImporter, TInternalStatus, TManufacturer, TModel, TModelForOpinion, TOpinion, TOwner, TUsageType } from "../../types"
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { object } from 'yup'
import { Controller, useForm } from "react-hook-form"
import { Box, Checkbox, Divider, FormControlLabel, Grid, Select, Typography } from "@mui/material"
import { useCustomersQuery } from "../../query/customers.query"
import { AppControlledAutocomplete } from "../AppControlledAutocomplete"
import { AppControlledDatePicker } from "../AppControlledDatePicker"
import AppControlledSelect from "../AppControlledSelect"
import AppControlledTextField from "../AppControlledTextField"
import AppDropzoneField from "../AppDropzoneField"
import { useImportersQuery } from "../../query/importer.query"
import { useCarTypesQuery } from "../../query/carTypes.query"
import { useManufacturersQuery } from "../../query/manufacturers.query"
import { useModelsByManufacturerQuery } from "../../query/models.query"
import { useEffect, useState } from "react"
import { useDriveTypesQuery } from "../../query/driveTypes.query"
import { useUsageTypesQuery } from "../../query/usageTypes.query"
import { useInternalStatusesQuery } from "../../query/internalStatus.query"
import { useExternalStatusesQuery } from "../../query/externalStatus.query"
import { useOwnersQuery } from "../../query/owners.query"


interface TProps {
  data: TOpinion | null
  onSave: (opinion: TOpinion) => void
  setIsTemporary: (isTemporary: boolean) => void
}

type TFormInput = Omit<TOpinion, 'id'>

const ORDERED_TYPE_PRIVATE = 1
const ORDERED_TYPE_COMPANY = 2

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1960 + 1 }, (_, i) => currentYear - i);

export default function StepA({ data, onSave, setIsTemporary }: TProps) {

  const { t, i18n } = useTranslation()
  const { data: customers } = useCustomersQuery()
  const { data: importers } = useImportersQuery()
  const { data: carTypes } = useCarTypesQuery()
  const { data: manufacturers, isLoading: isManufacturersLoading } = useManufacturersQuery()
  const { data: driveTypes } = useDriveTypesQuery()
  // const { data: gearboxes } = useGearboxesQuery()
  const gearboxes = [
    { id: 1, name: 'Manual' },
    { id: 2, name: 'Automatic' },
    { id: 3, name: 'Semi-automatic' },
  ]

  const { data: usageTypes } = useUsageTypesQuery()
  const { data: internalStatuses } = useInternalStatusesQuery()
  const { data: externalStatuses } = useExternalStatusesQuery()

  const { data: owners } = useOwnersQuery()
  const [selectedOwners, setSelectedOwners] = useState<any[]>([])

  const schema = object()
    .shape({
      name: yup.string().required(t('form-field.required')),
    })
    .required()

  const methods = useForm<TFormInput>({
    // @ts-ignore
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      temporary: data?.temporary || false,
      isCorrection: data?.isCorrection || false,
      number: data?.number || 0,
      // manufacturerCode: data?.manufacturerCode || '',
      // modelCode: data?.modelCode || '',
      // model: data?.model || '',
      // volume: data?.volume || 0,
      // manufacturerName: data?.manufacturerName || '',
      // tozeretNm: data?.tozeretNm || '',
    },
  })

  const { handleSubmit, control, formState, reset, watch, setValue } = methods
  const errors = formState.errors

  const manufacturer = watch('manufacturer')
  const { data: models } = useModelsByManufacturerQuery(manufacturer?.id || undefined)

  useEffect(() => {
    if (manufacturer) {
      setValue('model', null)
    }
  }, [manufacturer])

  const model = watch('model')
  useEffect(() => {
    if (model) {
      setValue('modelCode', model.code)
    } else {
      setValue('modelCode', '')
    }
  }, [model])


  const numberOfOwners = watch('numberOfOwners')

  useEffect(() => {
    console.log('numberOfOwners', numberOfOwners)
    if (numberOfOwners) {
      setSelectedOwners([])
    }
  }, [numberOfOwners])


  const onSubmit = (data: any) => {
    // onConfirm(data)
    // reset()
  }




  return (<>
    <form onSubmit={handleSubmit(onSubmit)}>
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

        <Grid size={3}>
          <AppControlledTextField
            name="lastName"
            control={control}
            errors={errors}
            label={t('lastName', { ns: 'opinion' })}
          />
        </Grid>

        <Grid size={3}>
          <AppControlledTextField
            name="tz"
            control={control}
            errors={errors}
            label={t('tz', { ns: 'opinion' })}
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

      <Divider sx={{ mt: 0 }} />

      <Grid container columns={12} columnSpacing={2} rowSpacing={0} sx={{ width: '100%', mt: 3 }}>
        <Grid size={6}>
          <AppControlledAutocomplete<TImporter>
            name='importerId'
            options={importers as TImporter[] || []}
            getOptionLabel={(option) => i18n.language === 'he' ? option.name : option.nameEn ?? option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            control={control}
            errors={errors}
            label={t('impName', { ns: 'opinion' })}
            placeholder={t('impName', { ns: 'opinion' })}
          />
        </Grid>

        <Grid size={3}>
          <AppControlledTextField
            name="statementPrice"
            control={control}
            errors={errors}
            label={t('statePrice', { ns: 'opinion' })}
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
            options={carTypes as TCarType[] || []}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            control={control}
            errors={errors}
            label={t('carType', { ns: 'opinion' })}
            placeholder={t('carType', { ns: 'opinion' })}
          />
        </Grid>
        <Grid size={2}>
          <AppControlledAutocomplete<TManufacturer>
            name='manufacturer'
            options={manufacturers as TManufacturer[] || []}
            getOptionLabel={(option) => i18n.language === 'he' ? option.name : option.engName ?? option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            control={control}
            errors={errors}
            label={t('manufacturer', { ns: 'opinion' })}
            placeholder={t('manufacturer', { ns: 'opinion' })}
          />
        </Grid>

        <Grid size={4}>
          <AppControlledAutocomplete<TModelForOpinion>
            name='model'
            options={models as TModelForOpinion[] || []}
            loading={isManufacturersLoading}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            groupBy={(option) => option.seriesName}
            control={control}
            errors={errors}
            label={t('model', { ns: 'opinion' })}
            placeholder={t('model', { ns: 'opinion' })}
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
            placeholder={t('manYear', { ns: 'opinion' })}
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
            options={driveTypes as TDriveType[] || []}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            control={control}
            errors={errors}
            label={t('driveType', { ns: 'opinion' })}
            placeholder={t('driveType', { ns: 'opinion' })}
          />
        </Grid>

        <Grid size={2}>
          <AppControlledAutocomplete<any>
            name='gearbox'
            options={gearboxes as any[] || []}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            control={control}
            errors={errors}
            label={t('gearbox', { ns: 'opinion' })}
            placeholder={t('gearbox', { ns: 'opinion' })}
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
            options={usageTypes as TUsageType[] || []}
            getOptionLabel={(option) => i18n.language === 'he' ? option.name : option.nameEn ?? option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            control={control}
            errors={errors}
            label={t('usageType', { ns: 'opinion' })}
            placeholder={t('usageType', { ns: 'opinion' })}
          />
        </Grid>

        <Grid size={2}>
          <AppControlledAutocomplete<TInternalStatus>
            name='internalStatus'
            options={internalStatuses as TInternalStatus[] || []}
            getOptionLabel={(option) => i18n.language === 'he' ? option.name : option.nameEn ?? option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            control={control}
            errors={errors}
            label={t('internalStatus', { ns: 'opinion' })}
            placeholder={t('internalStatus', { ns: 'opinion' })}
          />
        </Grid>

        <Grid size={2}>
          <AppControlledAutocomplete<TExternalStatus>
            name='externalStatus'
            options={externalStatuses as TExternalStatus[] || []}
            getOptionLabel={(option) => i18n.language === 'he' ? option.name : option.nameEn ?? option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            control={control}
            errors={errors}
            label={t('externalStatus', { ns: 'opinion' })}
            placeholder={t('externalStatus', { ns: 'opinion' })}
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
            control={control}
            errors={errors}
            label={t('numberOfOwners', { ns: 'opinion' })}
            options={Array.from({ length: 10 }, (_, i) => ({
              label: (i + 1).toString(),
              value: i + 1,
            }))}
          />
        </Grid>
        <Grid size={10}>
          {selectedOwners.map(owner => (
            <Box key={owner.id}>
              <Typography>{owner.name}</Typography>
            </Box>
          ))}
        </Grid>
      </Grid>

    </form>
  </>)
}