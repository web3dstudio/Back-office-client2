import { Box, Button, Grid, Radio, Switch, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Controller, useForm } from 'react-hook-form'
import { useMemo } from 'react'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { object } from 'yup'
import { usePriceListLayoutsQuery } from '../../query/priceListLayouts.query'
import type { TPricelistLayoutSchedule } from '../../types'
import AppControlledTextField from '../AppControlledTextField'
import { AppControlledMonthYearPicker } from '../AppControlledMonthYearPicker'
import AppControlledSelect from '../AppControlledSelect'
import dayjs from 'dayjs'

type TFormInput = Omit<TPricelistLayoutSchedule, 'layout'>

type TProps = {
  schedule: TPricelistLayoutSchedule | null
  isPending: boolean
  onCancel: () => void
  onConfirm: (data: TFormInput) => void
}

export default function PriceListLayoutScheduleForm({ schedule, isPending, onCancel, onConfirm }: TProps) {
  const { t } = useTranslation()
  const { data: layouts } = usePriceListLayoutsQuery()

  const schema = object()
    .shape({
      layoutId: yup.string().required(t('form-field.required', { ns: 'common' })),
      fromDate: yup.string().required(t('form-field.required', { ns: 'common' })),
      toDate: yup
        .string()
        .nullable()
        .test('toDate-not-less-than-fromDate', 'To date must be >= From date', function (toDate) {
          const fromDate = this.parent?.fromDate
          if (!toDate || !fromDate) return true
          // both are YYYY-MM-DD, lex compare works
          return String(toDate) >= String(fromDate)
        }),
      fromPage: yup.number().min(14).required(t('form-field.required', { ns: 'common' })),
      toPage: yup
        .number()
        .min(14)
        .required(t('form-field.required', { ns: 'common' }))
        .test('toPage-not-less-than-fromPage', 'To page must be >= From page', function (toPage) {
          const fromPage = this.parent?.fromPage
          if (typeof toPage !== 'number' || typeof fromPage !== 'number') return true
          return toPage >= fromPage
        }),
      priority: yup.number().min(1).required(t('form-field.required', { ns: 'common' })),
      repeatCount: yup
        .number()
        .integer()
        .min(1)
        .max(100)
        .required(t('form-field.required', { ns: 'common' })),
      isActive: yup.boolean().required(),
      id: yup.string().optional(),
    })
    .required()

  const methods = useForm<TFormInput>({
    // @ts-ignore
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      id: schedule?.id || '',
      layoutId: schedule?.layoutId || '',
      fromDate: schedule?.fromDate || dayjs().startOf('month').format('YYYY-MM-DD'),
      toDate: schedule?.toDate || '',
      fromPage: Math.max(schedule?.fromPage ?? 14, 14),
      toPage: schedule?.toPage ?? 999,
      priority: schedule?.priority ?? 1,
      repeatCount: schedule?.repeatCount ?? 1,
      isActive: schedule?.isActive ?? true,
    },
  })

  const { handleSubmit, control, formState, reset, watch, setValue } = methods
  const formValues = watch()
  const activeLayouts = useMemo(() => (layouts ?? []).filter((layout) => layout.isActive), [layouts])
  const selectedLayout = activeLayouts.find((layout) => layout.id === formValues.layoutId)

  const submit = (data: any) => {
    const normalized: TFormInput = {
      ...(data as TFormInput),
      toDate: data?.toDate ? String(data.toDate) : null,
    }
    onConfirm(normalized)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {/* Left column: fields + preview */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Box
                sx={{
                  width: '100%',
                  height: 140,
                  mb: 3,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: 140,
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {!!selectedLayout?.previewFileName && (
                    <img
                      src={selectedLayout.previewFileName}
                      alt="layout preview"
                      style={{ display: 'block', width: '100%', height: 140, objectFit: 'contain' }}
                    />
                  )}
                  {!selectedLayout?.previewFileName && (
                    <Typography sx={{ color: 'text.secondary' }}>
                      {t('selectLayout', { ns: 'priceListAdvertisements' })}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <AppControlledMonthYearPicker
                name="fromDate"
                control={control}
                errors={formState.errors}
                label={t('fromDate', { ns: 'priceListAdvertisements' })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AppControlledMonthYearPicker
                name="toDate"
                control={control}
                errors={formState.errors}
                label={t('toDate', { ns: 'priceListAdvertisements' })}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <AppControlledTextField
                required
                name="fromPage"
                control={control}
                errors={formState.errors}
                label={t('fromPage', { ns: 'priceListAdvertisements' })}
                placeholder={t('fromPage', { ns: 'priceListAdvertisements' })}
                type="number"
                slotProps={{ htmlInput: { min: 14 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AppControlledTextField
                required
                name="toPage"
                control={control}
                errors={formState.errors}
                label={t('toPage', { ns: 'priceListAdvertisements' })}
                placeholder={t('toPage', { ns: 'priceListAdvertisements' })}
                type="number"
                slotProps={{ htmlInput: { min: Math.max(14, Number(formValues.fromPage) || 14) } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <AppControlledSelect
                name="priority"
                control={control}
                errors={formState.errors}
                label={t('priority', { ns: 'priceListAdvertisements' })}
                required
                options={[
                  { value: 1, label: '1 - High' },
                  { value: 2, label: '2' },
                  { value: 3, label: '3' },
                  { value: 4, label: '4' },
                  { value: 5, label: '5' },
                  { value: 6, label: '6' },
                  { value: 7, label: '7' },
                  { value: 8, label: '8' },
                  { value: 9, label: '9 - Low' },
                ]}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <AppControlledTextField
                required
                name="repeatCount"
                control={control}
                errors={formState.errors}
                label={t('repeatCount', { ns: 'priceListAdvertisements' })}
                placeholder={t('repeatCount', { ns: 'priceListAdvertisements' })}
                type="number"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={Boolean(field.value)} onChange={(_e, checked) => field.onChange(checked)} />
                  )}
                />
                <Box>{t('active', { ns: 'priceListAdvertisements' })}</Box>
              </Box>
            </Grid>
          </Grid>
        </Grid>

        {/* Right column: layouts list with radio + scroll */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box
            sx={{
              maxHeight: '50vh',
              overflowY: 'auto',
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: 2,
              p: 1,
            }}
          >
            {activeLayouts.length === 0 ? (
              <Typography sx={{ color: 'text.secondary', p: 1 }}>
                {t('noActiveLayouts', { ns: 'priceListAdvertisements' })}
              </Typography>
            ) : (
              activeLayouts.map((layout) => {
                const checked = layout.id === formValues.layoutId
                return (
                  <Box
                    key={layout.id}
                    onClick={() => {
                      setValue('layoutId', layout.id, { shouldDirty: true, shouldValidate: true })
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      borderRadius: 1,
                      cursor: 'pointer',
                      backgroundColor: checked ? 'rgba(0,0,0,0.04)' : 'transparent',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
                    }}
                  >
                    <Radio checked={checked} />
                    {!!layout.previewFileName && (
                      <Box
                        component="img"
                        src={layout.previewFileName}
                        alt="preview"
                        loading="lazy"
                        sx={{ width: 160, height: 48, objectFit: 'contain', flex: '0 0 auto' }}
                      />
                    )}
                    <Box sx={{ flex: '1 1 auto' }}>{layout.name}</Box>
                  </Box>
                )
              })
            )}
          </Box>
        </Grid>

        <Grid size={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button color="primary" size="small" onClick={onCancel} variant="outlined">
              <Typography sx={{ textWrap: 'nowrap', fontSize: '14px', fontWeight: 'bold' }}>
                {t('modals.cancel', { ns: 'common' })}
              </Typography>
            </Button>
            <Button
              color="primary"
              type="submit"
              variant="contained"
              loading={isPending}
              disabled={
                isPending ||
                !formState.isValid ||
                !formValues.layoutId ||
                !formValues.fromDate
              }
            >
              <Typography sx={{ textWrap: 'nowrap' }}>
                {t('modals.save', { ns: 'common' })}
              </Typography>
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  )
}


