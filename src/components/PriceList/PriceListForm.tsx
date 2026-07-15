import { Box, Button, DialogActions, Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { object } from 'yup'
import { AppControlledAutocomplete } from "../AppControlledAutocomplete";
import { usePriceListTypesQuery } from "../../query/priceListTypes.querty";
import { useCarTypesQuery } from "../../query/carTypes.query";
import { useEngineTypesQuery } from "../../query/engineTypes.query";
import AppControlledCheckboxesTags from "../AppControlledCheckboxesTags";
import { useNavigate } from "@tanstack/react-router";
import type { TCarType, TEngineType, TPriceList, TPriceListType } from "../../types";
import { useEffect, useMemo, useRef, useState } from "react";
import AppDialog from "../AppDialog/AppDialog";
import AppControlledTextField from "../AppControlledTextField";
import usePriceListCreateMutation from "../../query/priceList.query";



type TFormInput = {
  carTypes: TCarType[]
  engineTypes: TEngineType[]
  comment: string
  month: number
  year: number
  priceListType: TPriceListType
  upToYearOfManufacture: number | undefined
  yearOfFirstRegistration: number | undefined
}

const currentYear = new Date().getFullYear()
const futureYears = Array.from({ length: 15 }, (_unused, index) => currentYear - index)
const pastYears = Array.from({ length: currentYear - 2005 + 1 }, (_unused, index) => currentYear - index)
const months = Array.from({ length: 12 }, (_unused, index) => index + 1)



export default function PriceListForm() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const [titleDialogOpen, setTitleDialogOpen] = useState(false)
  const [commentDialogOpen, setCommentDialogOpen] = useState(false)
  const prevPriceListYearRef = useRef<number | null>(null)


  const { data: priceListTypes, isLoading: isPriceListTypesLoading } = usePriceListTypesQuery()
  const { data: carTypes, isLoading: isCarTypesLoading } = useCarTypesQuery()
  const { data: engineTypes, isLoading: isEngineTypesLoading } = useEngineTypesQuery()

  const { mutate: createPriceList, isPending: isCreatePriceListLoading } = usePriceListCreateMutation()

  const schema = object()
    .shape({
      year: yup.number().required(t('form-field.required')),
      month: yup.number().required(t('form-field.required')),
      carTypes: yup.array().min(1, t('form-field.required')),
      yearOfFirstRegistration: yup
        .number()
        .nullable()
        .min(2005, t('form-field.required'))
        .transform((_value, originalValue) => {
          if (originalValue === '' || originalValue === null || originalValue === undefined) return null
          const parsedValue = Number(originalValue)
          return Number.isNaN(parsedValue) ? null : parsedValue
        }),
      upToYearOfManufacture: yup
        .number()
        .nullable()
        .min(2005, t('form-field.required'))
        .transform((_value, originalValue) => {
          if (originalValue === '' || originalValue === null || originalValue === undefined) return null
          const parsedValue = Number(originalValue)
          return Number.isNaN(parsedValue) ? null : parsedValue
        })
        .when('yearOfFirstRegistration', (yearOfFirstRegValue, schema) => {
          const yofr = Array.isArray(yearOfFirstRegValue) ? yearOfFirstRegValue[0] : yearOfFirstRegValue
          if (typeof yofr !== 'number') return schema
          return schema.min(
            yofr,
            `${t('upToYearOfManufacture', { ns: 'priceList' })} >= ${t('yearOfFirstRegistration', { ns: 'priceList' })}`
          )
        })
        .when('year', (yearValue, schema) => {
          const plYear = Array.isArray(yearValue) ? yearValue[0] : yearValue
          if (typeof plYear !== 'number') return schema
          return schema.max(
            plYear,
            t('upToYearCannotExceedPriceListYear', { ns: 'priceList' })
          )
        }),
    })
    .required()

  const methods = useForm<TFormInput>({
    // @ts-ignore
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      priceListType: undefined,
      carTypes: [],
      engineTypes: [],
      comment: 'סכום זה יש להכפיל במספר חודשי העלייה לכביש מעבר לינואר 17 בהתאמה ולהוסיף למחיר המכונית',
      upToYearOfManufacture: currentYear,
      yearOfFirstRegistration: 2005,
    },
  })
  const { handleSubmit, control, formState, setValue, watch } = methods
  const errors = formState.errors

  const priceListType = watch('priceListType')
  const year = watch('year')
  const yearOfFirstRegistration = watch('yearOfFirstRegistration')
  const upToYearOfManufacture = watch('upToYearOfManufacture')

  const yearOfFirstRegistrationNumber =
    typeof yearOfFirstRegistration === 'number'
      ? yearOfFirstRegistration
      : yearOfFirstRegistration
        ? Number(yearOfFirstRegistration)
        : null

  const priceListYear = typeof year === 'number' ? year : year ? Number(year) : null

  const upToYearOfManufactureOptions = useMemo(() => {
    if (!yearOfFirstRegistrationNumber || Number.isNaN(yearOfFirstRegistrationNumber)) return pastYears
    let options = pastYears.filter(candidateYear => candidateYear >= yearOfFirstRegistrationNumber)
    if (priceListYear != null && !Number.isNaN(priceListYear)) {
      options = options.filter(candidateYear => candidateYear <= priceListYear)
    }
    return options
  }, [yearOfFirstRegistrationNumber, priceListYear])

  const carTypesFiltered = useMemo(() => {
    return carTypes?.filter(carType => carType.priceListType === priceListType?.id) || []
  }, [carTypes, priceListType])

  useEffect(() => {
    setValue('carTypes', [], { shouldValidate: false, shouldDirty: false })
  }, [priceListType, setValue])

  useEffect(() => {
    if (!yearOfFirstRegistrationNumber || Number.isNaN(yearOfFirstRegistrationNumber)) return
    const upTo =
      typeof upToYearOfManufacture === 'number'
        ? upToYearOfManufacture
        : null
    if (upTo !== null && !Number.isNaN(upTo) && upTo < yearOfFirstRegistrationNumber) {
      setValue('upToYearOfManufacture', undefined, { shouldValidate: true, shouldDirty: true })
    }
  }, [yearOfFirstRegistrationNumber, upToYearOfManufacture, setValue])

  useEffect(() => {
    if (priceListYear == null || Number.isNaN(priceListYear)) return
    const upTo =
      typeof upToYearOfManufacture === 'number'
        ? upToYearOfManufacture
        : null

    const prevPriceListYear = prevPriceListYearRef.current

    if (prevPriceListYear != null && priceListYear > prevPriceListYear) {
      if (upTo !== null && upTo === prevPriceListYear) {
        setValue('upToYearOfManufacture', priceListYear, { shouldValidate: true, shouldDirty: true })
      }
    } else if (upTo !== null && !Number.isNaN(upTo) && upTo > priceListYear) {
      setValue('upToYearOfManufacture', priceListYear, { shouldValidate: true, shouldDirty: true })
    }

    prevPriceListYearRef.current = priceListYear
  }, [priceListYear, upToYearOfManufacture, setValue])



  // carTypes: [{carTypeId: "fc31b8da-86b4-4adc-088a-08dcbd2fd25f"}]
  // comment : "סכום זה יש להכפיל במספר חודשי העלייה לכביש מעבר לינואר 17 בהתאמה ולהוסיף למחיר המכונית"
  // month: 7
  // priceListType: 1
  // upToYearOfManufacture: ""
  // year: 2025
  // yearOfFirstRegistration: ""

  const onSubmit = (data: any) => {
    const priceList = {
      carTypeIds: data.carTypes.map((carType: TCarType) => carType.id),
      engineTypeIds: (data.engineTypes || []).map((engineType: TEngineType) => engineType.id),
      comment: data.comment,
      month: data.month,
      year: data.year,
      upToYearOfManufacture: data.upToYearOfManufacture?.toString(),
      yearOfFirstRegistration: data.yearOfFirstRegistration?.toString(),
      priceListType: data.priceListType.id,
    }
    createPriceList(priceList as unknown as Omit<TPriceList, 'id' | 'date' | 'carTypes'> & { carTypeIds: string[]; engineTypeIds: string[] })
  }

  return (<>

    <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
      <Grid container columnSpacing={2} rowSpacing={0} columns={12} sx={{ width: '100%' }}>

        <Grid size={2}>
          <AppControlledAutocomplete
            name='year'
            required
            options={futureYears}
            getOptionLabel={(option) => option.toString()}
            isOptionEqualToValue={(option, value) => option === value}
            control={control}
            errors={errors}
            label={t('year', { ns: 'priceList' })}
          />
        </Grid>

        <Grid size={2}>
          <AppControlledAutocomplete
            name='month'
            required
            options={months}
            getOptionLabel={(option) => option.toString()}
            isOptionEqualToValue={(option, value) => option === value}
            control={control}
            errors={errors}
            label={t('month', { ns: 'priceList' })}
          />
        </Grid>

        <Grid size={2}>
          <AppControlledAutocomplete
            name='priceListType'
            required
            loading={isPriceListTypesLoading}
            options={priceListTypes || []}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            control={control}
            errors={errors}
            label={t('priceListType', { ns: 'priceList' })}
          />
        </Grid>
        <Grid size={2}>
          <AppControlledCheckboxesTags
            name='carTypes'
            disabled={!priceListType}
            required
            loading={isCarTypesLoading}
            options={carTypesFiltered || []}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            control={control}
            errors={errors}
            label={t('carTypes', { ns: 'priceList' })}
          />
        </Grid>

        <Grid size={4}>
          <AppControlledCheckboxesTags
            name='engineTypes'
            loading={isEngineTypesLoading}
            options={engineTypes || []}
            getOptionLabel={(option) => (i18n.language?.startsWith('he') ? option.name : (option.nameEn || option.name))}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            control={control}
            errors={errors}
            label={t('engineTypes', { ns: 'priceList' })}
          />
        </Grid>

        <Grid size={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start', flexWrap: 'wrap', mt: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              sx={{ textTransform: 'capitalize' }}
              onClick={() => setTitleDialogOpen(true)}>
              {t('carYears', { ns: 'priceList' })} ({yearOfFirstRegistration ?? '—'} – {upToYearOfManufacture ?? '—'})
            </Button>
            <Button
              variant="outlined"
              color="primary"
              sx={{ textTransform: 'capitalize' }}
              onClick={() => setCommentDialogOpen(true)}>
              {t('comment', { ns: 'priceList' })}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              sx={{ textTransform: 'capitalize' }}
              onClick={() => navigate({ to: '/price-list/advertisements' })}>
              {t('advertize', { ns: 'priceList' })}
            </Button>
          </Box>
        </Grid>

        <Grid size={12}>
          <Grid
            container
            columnSpacing={2}
            rowSpacing={0}
            columns={12}
            sx={{ width: '100%', justifyContent: i18n.language?.startsWith('he') ? 'flex-start' : 'flex-end' }}
          >
            <Grid size={'auto'}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ textTransform: 'capitalize', mt: 2 }}
                onClick={() => { }}
                disabled={!formState.isValid}
              >
                {t('preview', { ns: 'priceList' })}
              </Button>
            </Grid>

            <Grid size={'auto'}>
              <Button
                disabled={!formState.isValid}
                loading={isCreatePriceListLoading}
                type="submit"
                variant="contained"
                color="primary"
                sx={{ textTransform: 'capitalize', mt: 2 }}
              >
                {t('crateNew', { ns: 'priceList' })}
              </Button>
            </Grid>
          </Grid>
        </Grid>


      </Grid>

      <AppDialog
        open={titleDialogOpen}
        onClose={() => setTitleDialogOpen(false)}
        title={t('carYears', { ns: 'priceList' })}
        maxWidth='sm'
      >
        <Grid container spacing={2} columns={12} sx={{ width: '100%', mt: 2 }}>
          <Grid size={6}>
            <AppControlledAutocomplete
              name='yearOfFirstRegistration'
              options={pastYears}
              getOptionLabel={(option) => option.toString()}
              isOptionEqualToValue={(option, value) => option === value}
              control={control}
              errors={errors}
              label={t('yearOfFirstRegistration', { ns: 'priceList' })}
            />
          </Grid>
          <Grid size={6}>
            <AppControlledAutocomplete
              name='upToYearOfManufacture'
              options={upToYearOfManufactureOptions}
              getOptionLabel={(option) => option.toString()}
              isOptionEqualToValue={(option, value) => option === value}
              control={control}
              errors={errors}
              label={t('upToYearOfManufacture', { ns: 'priceList' })}
            />
          </Grid>
        </Grid>
        <DialogActions>
          <Button variant="contained" color="primary" sx={{ textTransform: 'capitalize' }} onClick={() => setTitleDialogOpen(false)}>
            {t('save', { ns: 'common' })}
          </Button>
        </DialogActions>
      </AppDialog>


      <AppDialog
        open={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        title={t('comment', { ns: 'priceList' })}
        maxWidth='sm'
      >
        <Grid container spacing={2} columns={12} sx={{ width: '100%', mt: 2 }}>
          <Grid size={12}>
            <AppControlledTextField
              name='comment'
              multiline
              minRows={4}
              control={control}
              errors={errors}
              label={t('comment', { ns: 'priceList' })}
            />
          </Grid>
        </Grid>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            sx={{ textTransform: 'capitalize' }}
            onClick={() => setCommentDialogOpen(false)}>
            {t('save', { ns: 'common' })}
          </Button>
        </DialogActions>
      </AppDialog>
    </form >
  </>)
}
