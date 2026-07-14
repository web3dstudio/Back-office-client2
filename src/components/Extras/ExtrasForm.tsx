import { useTranslation } from "react-i18next"
import type { TExtra, TExtraSeriesRules, TIcon, TManufacturer, TSerie } from "../../types"
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { object } from 'yup'
import { Box, Button, Checkbox, FormControlLabel, Grid, InputAdornment, Typography } from "@mui/material"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { AppControlledAutocomplete } from "../AppControlledAutocomplete"
import AppControlledTextField from "../AppControlledTextField"
import { useEffect, useMemo, useState } from "react"
import AppDialog from "../AppDialog/AppDialog"
import AppIconsSearch from "../AppIconsSearch"
import AppActionButton from "../AppActionButton"
import { useIconsQuery } from "../../query/icons.query"
import type { TExtraUpsert } from "../../query/extras.query"
import { useManufacturersWithSeriesAndModelsQuery } from "../../query/manufacturers.query"

interface Props {
  data: TExtra | null
  isPending: boolean
  onCancel: () => void
  onConfirm: (data: TExtraUpsert) => void
}

type TFormInput = {
  name: string
  nameEn: string
  defaultChangePercentage: number
  manufacturer: TManufacturer | null
  extraSeriesRules: {
    id?: string
    manufacturerSeriesId: string | null
    serie: TSerie | null
    fromYear: number | null
    toYear: number | null
    appliesToAllSeries: boolean
    changePercentage: number | null
  }[]
}

function ExtrasForm({ data, isPending, onCancel, onConfirm }: Props) {
  const { t, i18n } = useTranslation()
  const [openIconDialog, setOpenIconDialog] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState<TIcon | null>(null)
  const { data: icons } = useIconsQuery()
  const { data: manufacturers, isLoading: isManufacturersLoading } = useManufacturersWithSeriesAndModelsQuery()

  const iconById = useMemo(() => {
    const map = new Map<string, TIcon>()
    for (const i of icons || []) map.set(i.id, i)
    return map
  }, [icons])

  useEffect(() => {
    if (data?.iconId) {
      setSelectedIcon(iconById.get(data.iconId) || null)
    } else {
      setSelectedIcon(null)
    }
  }, [data?.iconId, iconById])

  const schema = object()
    .shape({
      name: yup.string().required(t('form-field.required')),
      nameEn: yup.string(),
      defaultChangePercentage: yup.number().min(0).max(100).required(t('form-field.required')),
      extraSeriesRules: yup.array().of(
        yup.object().shape({
          appliesToAllSeries: yup.boolean().required(),
          changePercentage: yup
            .number()
            .nullable()
            .transform((v, o) => (o === '' || o === null || o === undefined ? null : v))
            .min(0)
            .max(100),
          fromYear: yup
            .number()
            .typeError(t('form-field.required'))
            .required(t('form-field.required'))
            .integer()
            .min(1000)
            .max(9999),
          toYear: yup
            .number()
            .typeError(t('form-field.required'))
            .required(t('form-field.required'))
            .integer()
            .min(1000)
            .max(9999)
            .min(yup.ref('fromYear')),
          serie: yup
            .mixed()
            .nullable()
            .when('appliesToAllSeries', {
              is: false,
              then: (s) => s.required(t('form-field.required')),
              otherwise: (s) => s.nullable(),
            }),
        })
      ),
    })
    .required()

  const methods = useForm<TFormInput>({
    // @ts-ignore
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: data?.name || '',
      nameEn: data?.nameEn || '',
      defaultChangePercentage: data?.defaultChangePercentage || 0,
      manufacturer: null,
      extraSeriesRules: [],
    },
  })

  const { handleSubmit, control, formState, reset, setValue, clearErrors } = methods
  const errors = formState.errors
  const manufacturer = useWatch({ control, name: 'manufacturer' })
  const rulesValues = useWatch({ control, name: 'extraSeriesRules' })
  const extraDefaultPct = useWatch({ control, name: 'defaultChangePercentage' }) ?? 0
  const seriesOptions = useMemo(() => (manufacturer?.serieses || []) as TSerie[], [manufacturer])

  const { fields: rulesFields, prepend: prependRule, remove: removeRule } = useFieldArray({
    control,
    name: 'extraSeriesRules',
  })

  useEffect(() => {
    if (!data) return
    if (!manufacturers || manufacturers.length === 0) return

    const selectedManufacturer = data.manufacturerId
      ? (manufacturers.find((manufacturerOption) => manufacturerOption.id === data.manufacturerId) || null)
      : null

    const mappedRules = (data.extraSeriesRules || []).map((r: TExtraSeriesRules) => {
      const seriesId = r.manufacturerSeriesId
      const serie =
        ((selectedManufacturer?.serieses || []) as any[]).find(s => s.id === seriesId || s.dbId === seriesId) || null
      return {
        id: r.id,
        manufacturerSeriesId: r.manufacturerSeriesId ?? null,
        serie,
        fromYear: r.fromYear ?? null,
        toYear: r.toYear ?? null,
        appliesToAllSeries: !!r.appliesToAllSeries,
        changePercentage: r.changePercentage ?? null,
      }
    })

    reset({
      name: data.name || '',
      nameEn: data.nameEn || '',
      defaultChangePercentage: data.defaultChangePercentage || 0,
      manufacturer: selectedManufacturer,
      extraSeriesRules: mappedRules,
    })
  }, [data, manufacturers, reset])

  const onSubmit = (formData: TFormInput) => {
    onConfirm({
      ...(data ? { id: data.id } : {}),
      name: formData.name,
      nameEn: formData.nameEn,
      defaultChangePercentage: formData.defaultChangePercentage,
      sortIndex: data?.sortIndex ?? 0,
      iconId: selectedIcon?.id || null,
      manufacturerId: formData.manufacturer?.id || null,
      extraSeriesRules: (formData.extraSeriesRules || []).map((r) => {
        const manufacturerSeriesId = r.appliesToAllSeries
          ? null
          : ((r.serie?.dbId || r.serie?.id) ?? r.manufacturerSeriesId ?? null)

        const payload: any = {
          manufacturerSeriesId,
          appliesToAllSeries: !!r.appliesToAllSeries,
          fromYear: r.fromYear ?? null,
          toYear: r.toYear ?? null,
          changePercentage: r.changePercentage ?? null,
        }
        if (r.id) payload.id = r.id
        return payload
      }),
    })
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as any)}>
      <Grid container sx={{ mt: 1 }} columnSpacing={3} rowSpacing={0} columns={12}>
        <Grid size={6}>
          <AppControlledTextField
            required
            name='name'
            control={control}
            errors={errors}
            label={t('name', { ns: 'extras' })}
            placeholder={t('name', { ns: 'extras' })}
          />
        </Grid>
        <Grid size={6}>
          <AppControlledTextField
            name='nameEn'
            control={control}
            errors={errors}
            label={t('nameEn', { ns: 'extras' })}
            placeholder={t('nameEn', { ns: 'extras' })}
          />
        </Grid>
        <Grid size={6} >
          <AppControlledTextField
            required
            type='number'
            name='defaultChangePercentage'
            control={control}
            errors={errors}
            label={t('defaultChangePercentage', { ns: 'extras' })}
            placeholder={t('defaultChangePercentage', { ns: 'extras' })}
            slotProps={{
              input: {
                // inputMode: 'numeric',
                endAdornment: <InputAdornment position="start">%</InputAdornment>,
              },
            }}
          />
        </Grid>

        <Grid size={6}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box
              sx={{
                width: 140,
                height: 140,
                border: '1px solid #ccc',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f7f7f9',
                position: 'relative',
              }}
            >
              {selectedIcon?.downloadUri && (
                <AppActionButton
                  type='delete'
                  sx={{ position: 'absolute', top: -10, right: -10 }}
                  onClick={() => setSelectedIcon(null)}
                />
              )}

              {selectedIcon?.downloadUri ? (
                <img
                  src={selectedIcon.downloadUri}
                  alt="preview"
                  style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain', display: 'block' }}
                />
              ) : (
                <Typography sx={{ textAlign: 'center', fontSize: '12px', color: 'text.secondary' }}>
                  {t('noIcon', { ns: 'common' })}
                </Typography>
              )}
            </Box>

            <Button variant='contained' color='primary' onClick={() => setOpenIconDialog(true)}>
              {t('modals.searchIcon', { ns: 'common' })}
            </Button>
          </Box>
        </Grid>

        <Grid size={12} sx={{ mt: 1 }}>
          <AppControlledAutocomplete<TManufacturer>
            name="manufacturer"
            control={control}
            options={manufacturers ?? []}
            loading={isManufacturersLoading}
            label={t('manufacturer', { ns: 'newCar' })}
            placeholder={t('manufacturer', { ns: 'newCar' })}
            getOptionLabel={(m) => {
              if (!m) return ''
              return i18n.language === 'he'
                ? (m.name || m.engName || '')
                : (m.engName || m.name || '')
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onUserChange={() => {
              setValue('extraSeriesRules', [])
            }}
          />
        </Grid>

        <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AppActionButton
              type="add"
              onClick={() => prependRule({
                id: undefined,
                manufacturerSeriesId: null,
                serie: null,
                fromYear: null,
                toYear: null,
                appliesToAllSeries: false,
                changePercentage: typeof extraDefaultPct === 'number' ? extraDefaultPct : null,
              })}
            />
          </Box>
        </Grid>

        <Grid size={12} sx={{ mb: 3 }}>
          <Box sx={{ maxHeight: 260, overflowY: 'auto', pr: 1, pt: 1 }}>
            {rulesFields.map((rule, idx) =>
            (
              <div key={rule.id} style={{ marginBottom: 8 }}>
                <Grid container size={12} columnGap={2} sx={{ flexWrap: 'nowrap', alignItems: 'center' }}>
                  <Grid size={3}>
                    <AppControlledAutocomplete<TSerie>
                      name={`extraSeriesRules.${idx}.serie`}
                      control={control}
                      options={seriesOptions}
                      disabled={!manufacturer || !!rulesValues?.[idx]?.appliesToAllSeries}
                      loading={isManufacturersLoading}
                      label={t('series', { ns: 'newCar' })}
                      placeholder={t('series', { ns: 'newCar' })}
                      getOptionLabel={(serie) => serie?.name || ''}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      onUserChange={(newSerie) => {
                        if (newSerie) {
                          setValue(`extraSeriesRules.${idx}.appliesToAllSeries`, false, { shouldDirty: true, shouldValidate: true })
                          setValue(`extraSeriesRules.${idx}.manufacturerSeriesId`, null, { shouldDirty: true })
                          clearErrors(`extraSeriesRules.${idx}.serie`)
                        }
                      }}
                      errors={errors}
                    />
                  </Grid>
                  <Grid size={1.5}>
                    <AppControlledTextField
                      type="number"
                      name={`extraSeriesRules.${idx}.fromYear`}
                      control={control}
                      errors={errors}
                      label={t('fromYear', { ns: 'newCode' })}
                      placeholder={t('fromYear', { ns: 'newCode' })}
                    />
                  </Grid>
                  <Grid size={1.5}>
                    <AppControlledTextField
                      type="number"
                      name={`extraSeriesRules.${idx}.toYear`}
                      control={control}
                      errors={errors}
                      label={t('toYear', { ns: 'newCode' })}
                      placeholder={t('toYear', { ns: 'newCode' })}
                    />
                  </Grid>
                  <Grid size={2}>
                    <AppControlledTextField
                      type="number"
                      name={`extraSeriesRules.${idx}.changePercentage`}
                      control={control}
                      errors={errors}
                      label={t('ruleChangePercentage', { ns: 'extras' })}
                      placeholder={String(extraDefaultPct)}
                      slotProps={{
                        input: {
                          endAdornment: <InputAdornment position="start">%</InputAdornment>,
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={3.5} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Controller
                      name={`extraSeriesRules.${idx}.appliesToAllSeries`}
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={!!field.value}
                              onChange={(e) => {
                                const checked = (e.target as HTMLInputElement).checked
                                field.onChange(checked)
                                if (checked) {
                                  setValue(`extraSeriesRules.${idx}.serie`, null, { shouldDirty: true, shouldValidate: true })
                                  setValue(`extraSeriesRules.${idx}.manufacturerSeriesId`, null, { shouldDirty: true })
                                  clearErrors(`extraSeriesRules.${idx}.serie`)
                                }
                              }}
                              onBlur={field.onBlur}
                              inputRef={field.ref}
                              name={field.name}
                            />
                          }
                          label={t('appliesToAllSeries', { ns: 'extras' })}
                          sx={{ m: 0, whiteSpace: 'nowrap', '& .MuiFormControlLabel-label': { whiteSpace: 'nowrap' } }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={0.5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 34 }}>
                    <AppActionButton
                      type="delete"
                      onClick={() => removeRule(idx)}
                      sx={{ mb: 0 }}
                    />
                  </Grid>
                </Grid>
              </div>
            )
            )}
          </Box>
        </Grid>

        <Grid size={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              color='primary'
              size='small'
              onClick={onCancel}
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
              loading={isPending}
              sx={{ textTransform: 'capitalize', textWrap: 'nowrap' }}
            >
              {t('modals.save', { ns: 'common' })}
            </Button>
          </Box>
        </Grid>
      </Grid>

      <AppDialog
        open={openIconDialog}
        onClose={() => setOpenIconDialog(false)}
        title={t('modals.searchIcon', { ns: 'common' })}
      >
        <AppIconsSearch
          selectedIcon={selectedIcon}
          onSelect={(icon: TIcon) => {
            setSelectedIcon(icon)
            setOpenIconDialog(false)
          }}
        />
      </AppDialog>
    </form>
  )
}

export default ExtrasForm


