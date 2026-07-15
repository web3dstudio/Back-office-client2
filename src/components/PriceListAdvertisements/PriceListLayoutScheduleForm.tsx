import { Box, Button, FormControlLabel, Grid, Radio, RadioGroup, Switch, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Controller, useForm } from 'react-hook-form'
import { useEffect, useMemo } from 'react'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { object } from 'yup'
import { usePriceListLayoutsQuery } from '../../query/priceListLayouts.query'
import { usePriceListLayoutSchedulesQuery } from '../../query/priceListLayoutSchedules.query'
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

/** Hebrew price list: even = Right, odd = Left. Spreads: 14-15, 16-17, … */
const FIRST_PAGE = 14
type TSide = 'Left' | 'Right'

function sideFromPage(page: number): TSide {
  return page % 2 === 0 ? 'Right' : 'Left'
}

/** Within natural spread (even Right + odd Left): flip side without leaving the pair. */
function pageInSpreadForSide(page: number, side: TSide): number {
  const baseEven = page % 2 === 0 ? page : page - 1
  const even = Math.max(baseEven, FIRST_PAGE)
  return side === 'Right' ? even : even + 1
}

/** Match side by increasing page if needed, then skip occupied (+2 keeps side). */
function nextFreePage(startPage: number, side: TSide, occupied: Set<number>): number {
  let p = Math.max(FIRST_PAGE, Math.floor(startPage) || FIRST_PAGE)
  if (sideFromPage(p) !== side) {
    p += 1 // go up to the other side of the same / next slot
  }
  if (sideFromPage(p) !== side) {
    p = pageInSpreadForSide(p, side)
  }
  while (occupied.has(p)) {
    p += 2
  }
  return p
}

/** Layout types from EPriceListAdvertisementLayoutType (types.d.ts — no runtime enum). */
const LAYOUT_HORIZONTAL = 1
const LAYOUT_VERTICAL_LEFT = 2
const LAYOUT_VERTICAL_RIGHT = 3
const LAYOUT_FULL_PAGE = 4
/** Trim FullPage ≈ 177×250 mm (левая боковая → правая боковая × высота боковой) */
const FULL_PAGE_ASPECT = '177 / 250'
const SIDE_STRIP_WIDTH_PCT = (15 / 145) * 100
const HEADER_HEIGHT_PCT = (30 / 250) * 100

type TAdSlot = 'full' | 'header' | 'left' | 'right'

function isFullPageLayout(layout: { layoutType?: number; orientation?: string } | undefined | null): boolean {
  if (!layout) return false
  return layout.layoutType === LAYOUT_FULL_PAGE || layout.orientation === 'FullPage'
}

function adSlotForLayout(layout: { layoutType?: number; orientation?: string } | undefined | null): TAdSlot | null {
  if (!layout) return null
  if (layout.layoutType === LAYOUT_FULL_PAGE || layout.orientation === 'FullPage') return 'full'
  if (layout.layoutType === LAYOUT_HORIZONTAL || layout.orientation === 'Horizontal') return 'header'
  if (layout.layoutType === LAYOUT_VERTICAL_LEFT) return 'left'
  if (layout.layoutType === LAYOUT_VERTICAL_RIGHT) return 'right'
  return null
}

/** Vertical Left → odd only; Vertical Right → even only. 999 = open end, keep. */
function snapPageForAdSlot(page: number, slot: TAdSlot | null): number {
  if (page === 999) return 999
  let p = Math.max(FIRST_PAGE, Math.floor(Number(page)) || FIRST_PAGE)
  if (slot === 'left' && p % 2 === 0) p += 1
  if (slot === 'right' && p % 2 !== 0) p += 1
  return p
}

function SpreadGrayLines() {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '6px',
        px: '10%',
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}
    >
      {[0.92, 0.78, 0.88, 0.65, 0.9, 0.72, 0.85, 0.6, 0.8, 0.7, 0.86, 0.68].map((w, i) => (
        <Box
          key={i}
          sx={{
            height: 2,
            width: `${w * 100}%`,
            backgroundColor: '#cfcfcf',
            borderRadius: 1,
            alignSelf: i % 3 === 2 ? 'flex-end' : 'flex-start',
            flexShrink: 0,
          }}
        />
      ))}
    </Box>
  )
}

function AdSlotPreview({
  slot,
  previewUrl,
  show,
}: {
  slot: TAdSlot
  previewUrl?: string | null
  show: boolean
}) {
  if (!show || slot === 'full') return null

  const pos =
    slot === 'header'
      ? {
          top: '4%',
          left: '4%',
          width: '92%',
          height: `${HEADER_HEIGHT_PCT}%`,
        }
      : slot === 'left'
        ? {
            top: '4%',
            left: 0,
            width: `${SIDE_STRIP_WIDTH_PCT}%`,
            height: '92%',
          }
        : {
            top: '4%',
            right: 0,
            width: `${SIDE_STRIP_WIDTH_PCT}%`,
            height: '92%',
          }

  return (
    <Box
      sx={{
        position: 'absolute',
        zIndex: 2,
        boxSizing: 'border-box',
        border: '1px dashed #9e9e9e',
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...pos,
      }}
    >
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="ad slot"
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center',
          }}
        />
      ) : null}
    </Box>
  )
}

export default function PriceListLayoutScheduleForm({ schedule, isPending, onCancel, onConfirm }: TProps) {
  const { t } = useTranslation()
  const { data: layouts } = usePriceListLayoutsQuery()
  const { data: allSchedules } = usePriceListLayoutSchedulesQuery()

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
      fromPage: Math.max(schedule?.fromPage ?? FIRST_PAGE, FIRST_PAGE),
      toPage: schedule?.toPage ?? 999,
      priority: schedule?.priority ?? 1,
      repeatCount: schedule?.repeatCount ?? 1,
      isActive: schedule?.isActive ?? true,
    },
  })

  const { handleSubmit, control, formState, reset, watch, setValue, getValues } = methods
  const formValues = watch()
  const activeLayouts = useMemo(() => (layouts ?? []).filter((layout) => layout.isActive), [layouts])
  const selectedLayout = activeLayouts.find((layout) => layout.id === formValues.layoutId)
  const isFullPage = isFullPageLayout(selectedLayout)

  const occupiedFullPages = useMemo(() => {
    const set = new Set<number>()
    for (const s of allSchedules ?? []) {
      if (!s.isActive) continue
      if (schedule?.id && s.id === schedule.id) continue
      if (!isFullPageLayout(s.layout)) continue
      // FullPage: one page (fromPage === toPage after save)
      if (s.fromPage === s.toPage) {
        set.add(s.fromPage)
      } else {
        for (let p = s.fromPage; p <= s.toPage && p < 1000; p++) set.add(p)
      }
    }
    return set
  }, [allSchedules, schedule?.id])

  const syncFullPageFields = (page: number, side: TSide) => {
    const free = nextFreePage(page, side, occupiedFullPages)
    setValue('fromPage', free, { shouldDirty: true, shouldValidate: true })
    setValue('toPage', free, { shouldDirty: true, shouldValidate: true })
    setValue('repeatCount', 1, { shouldDirty: true, shouldValidate: true })
    setValue('priority', 1, { shouldDirty: true, shouldValidate: true })
  }

  const syncVerticalParityPages = (slot: TAdSlot) => {
    const from = snapPageForAdSlot(Number(getValues('fromPage')) || FIRST_PAGE, slot)
    let to = snapPageForAdSlot(Number(getValues('toPage')) || from, slot)
    if (to !== 999 && to < from) to = from
    setValue('fromPage', from, { shouldDirty: true, shouldValidate: true })
    setValue('toPage', to, { shouldDirty: true, shouldValidate: true })
  }

  // When switching layout — normalize FullPage / vertical parity
  useEffect(() => {
    if (isFullPage) {
      const page = Math.max(Number(formValues.fromPage) || FIRST_PAGE, FIRST_PAGE)
      syncFullPageFields(page, sideFromPage(page))
      return
    }
    const slot = adSlotForLayout(selectedLayout)
    if (slot === 'left' || slot === 'right') {
      syncVerticalParityPages(slot)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullPage, formValues.layoutId])

  const currentSide = sideFromPage(Math.max(Number(formValues.fromPage) || FIRST_PAGE, FIRST_PAGE))
  const adSlot = adSlotForLayout(selectedLayout)
  const isVerticalSide = adSlot === 'left' || adSlot === 'right'

  const submit = (data: any) => {
    let normalized: TFormInput = {
      ...(data as TFormInput),
      toDate: data?.toDate ? String(data.toDate) : null,
    }
    if (isFullPage) {
      const page = nextFreePage(Number(normalized.fromPage) || FIRST_PAGE, sideFromPage(Number(normalized.fromPage) || FIRST_PAGE), occupiedFullPages)
      normalized = {
        ...normalized,
        fromPage: page,
        toPage: page,
        repeatCount: 1,
        priority: 1,
      }
    } else if (adSlot === 'left' || adSlot === 'right') {
      const from = snapPageForAdSlot(Number(normalized.fromPage) || FIRST_PAGE, adSlot)
      let to = snapPageForAdSlot(Number(normalized.toPage) || from, adSlot)
      if (to !== 999 && to < from) to = from
      normalized = { ...normalized, fromPage: from, toPage: to }
    }
    onConfirm(normalized)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Box
                sx={{
                  width: '100%',
                  mb: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.75,
                }}
              >
                {/* Open book LTR: Left/odd | Right/even — never flip with locale */}
                <Box
                  dir="ltr"
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    height: 240,
                    border: '1px solid #bdbdbd',
                    borderRadius: 1,
                    overflow: 'hidden',
                    backgroundColor: '#eeeeee',
                    direction: 'ltr',
                  }}
                >
                  {(['Left', 'Right'] as TSide[]).map((side) => {
                    const pageNum = pageInSpreadForSide(Number(formValues.fromPage) || FIRST_PAGE, side)
                    const isFullActive = isFullPage && currentSide === side
                    // Outer field only: Left strip on Left page, Right strip on Right page (never gutter)
                    const showStripOnThisPage =
                      adSlot === 'header' ||
                      (adSlot === 'left' && side === 'Left') ||
                      (adSlot === 'right' && side === 'Right')
                    const highlightStripPage = showStripOnThisPage && isVerticalSide
                    const clickable = isFullPage
                    return (
                      <Box
                        key={side}
                        onClick={() => {
                          if (!clickable) return
                          syncFullPageFields(pageNum, side)
                        }}
                        sx={{
                          height: '100%',
                          aspectRatio: FULL_PAGE_ASPECT,
                          cursor: clickable ? 'pointer' : 'default',
                          position: 'relative',
                          backgroundColor: isFullActive || highlightStripPage ? '#fff' : '#f5f5f5',
                          borderRight: side === 'Left' ? '1px solid #bdbdbd' : 'none',
                          boxShadow: isFullActive || highlightStripPage ? 'inset 0 0 0 1px #9e9e9e' : 'none',
                          overflow: 'hidden',
                        }}
                      >
                        <Typography
                          sx={{
                            position: 'absolute',
                            top: 4,
                            ...(side === 'Left' ? { left: 6 } : { right: 6 }),
                            fontSize: 10,
                            lineHeight: 1,
                            color: '#000',
                            zIndex: 3,
                            pointerEvents: 'none',
                          }}
                        >
                          {pageNum}
                        </Typography>

                        {/* Page body = gray lines, except FullPage active leaf */}
                        {isFullActive ? (
                          selectedLayout?.previewFileName ? (
                            <img
                              src={selectedLayout.previewFileName}
                              alt="layout preview"
                              style={{
                                display: 'block',
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                objectPosition: 'center',
                              }}
                            />
                          ) : (
                            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 1 }}>
                              <Typography sx={{ color: 'text.secondary', fontSize: 12, textAlign: 'center' }}>
                                {t('selectLayout', { ns: 'priceListAdvertisements' })}
                              </Typography>
                            </Box>
                          )
                        ) : (
                          <SpreadGrayLines />
                        )}

                        {adSlot && adSlot !== 'full' && (
                          <AdSlotPreview
                            slot={adSlot}
                            previewUrl={selectedLayout?.previewFileName}
                            show={showStripOnThisPage}
                          />
                        )}
                      </Box>
                    )
                  })}
                </Box>
                <Typography sx={{ fontSize: 11, color: '#9e9e9e' }}>
                  {!selectedLayout
                    ? t('selectLayout', { ns: 'priceListAdvertisements' })
                    : isFullPage
                      ? currentSide === 'Right'
                        ? t('spreadSide_right', { ns: 'priceListAdvertisements' })
                        : t('spreadSide_left', { ns: 'priceListAdvertisements' })
                      : adSlot === 'header'
                        ? t('layoutType_horizontal', { ns: 'priceListAdvertisements' })
                        : adSlot === 'left'
                          ? t('layoutType_verticalLeft', { ns: 'priceListAdvertisements' })
                          : adSlot === 'right'
                            ? t('layoutType_verticalRight', { ns: 'priceListAdvertisements' })
                            : selectedLayout.name}
                </Typography>
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

            {isFullPage && (
              <Grid size={12}>
                <Typography sx={{ mb: 0.5, fontSize: '0.875rem' }}>
                  {t('spreadSide', { ns: 'priceListAdvertisements' })}
                </Typography>
                {/* Physical order: Left | Right — never flip with locale/RTL */}
                <RadioGroup
                  row
                  dir="ltr"
                  value={currentSide}
                  onChange={(_e, value) => {
                    const side = value as TSide
                    // Same spread: 14↔15, 16↔17… then skip occupied
                    const inSpread = pageInSpreadForSide(Number(formValues.fromPage) || FIRST_PAGE, side)
                    syncFullPageFields(inSpread, side)
                  }}
                  sx={{ direction: 'ltr', flexDirection: 'row' }}
                >
                  <FormControlLabel
                    value="Left"
                    control={<Radio size="small" />}
                    label={t('spreadSide_left', { ns: 'priceListAdvertisements' })}
                    sx={{ marginInlineEnd: 2 }}
                  />
                  <FormControlLabel
                    value="Right"
                    control={<Radio size="small" />}
                    label={t('spreadSide_right', { ns: 'priceListAdvertisements' })}
                  />
                </RadioGroup>
              </Grid>
            )}

            <Grid size={{ xs: 12, md: 6 }}>
              <AppControlledTextField
                required
                name="fromPage"
                control={control}
                errors={formState.errors}
                label={t('fromPage', { ns: 'priceListAdvertisements' })}
                placeholder={t('fromPage', { ns: 'priceListAdvertisements' })}
                type="number"
                slotProps={{
                  htmlInput: {
                    min: isVerticalSide && adSlot === 'left' ? 15 : FIRST_PAGE,
                    step: isVerticalSide ? 2 : 1,
                  },
                }}
                onBlur={() => {
                  if (isFullPage) {
                    const raw = Math.max(Number(formValues.fromPage) || FIRST_PAGE, FIRST_PAGE)
                    syncFullPageFields(raw, sideFromPage(raw))
                    return
                  }
                  if (adSlot === 'left' || adSlot === 'right') {
                    syncVerticalParityPages(adSlot)
                  }
                }}
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
                disabled={isFullPage}
                slotProps={{
                  htmlInput: {
                    min: Math.max(
                      isVerticalSide && adSlot === 'left' ? 15 : FIRST_PAGE,
                      Number(formValues.fromPage) || FIRST_PAGE,
                    ),
                    step: isVerticalSide ? 2 : 1,
                  },
                }}
                onBlur={() => {
                  if (adSlot === 'left' || adSlot === 'right') {
                    syncVerticalParityPages(adSlot)
                  }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <AppControlledSelect
                name="priority"
                control={control}
                errors={formState.errors}
                label={t('priority', { ns: 'priceListAdvertisements' })}
                required
                disabled={isFullPage}
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
                disabled={isFullPage}
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
                const full = isFullPageLayout(layout)
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
                        sx={{
                          width: full ? 80 : 160,
                          height: full ? 110 : 48,
                          objectFit: 'contain',
                          flex: '0 0 auto',
                        }}
                      />
                    )}
                    <Box sx={{ flex: '1 1 auto' }}>
                      {layout.name}
                      {full && (
                        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                          {t('layoutType_fullPage', { ns: 'priceListAdvertisements' })}
                        </Typography>
                      )}
                    </Box>
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
