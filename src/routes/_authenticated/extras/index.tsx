import { createFileRoute } from '@tanstack/react-router'
import StyledPaper from '../../../components/StyledPaper'
import {
  useExtrasAddMutation,
  useExtrasDeleteMutation,
  useExtrasQuery,
  useExtrasUpdateMutation
} from '../../../query/extras.query'
import { Box, Button, Grid, Typography } from '@mui/material'
import AppDataTable from '../../../components/AppDataTable'
import type { TExtra } from '../../../types'
import type { TExtraUpsert } from '../../../query/extras.query'
import { type ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import AppActionButton from '../../../components/AppActionButton'
import { useState, useMemo } from 'react'
import { type SortingState, type PaginationState } from '@tanstack/react-table'
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog'
import AppDialog from '../../../components/AppDialog/AppDialog'
import AppBackBtn from '../../../components/AppBackBtn'
import AppError from '../../../components/AppError'
import ExtrasForm from '../../../components/Extras/ExtrasForm'
import { useIconsQuery } from '../../../query/icons.query'
import { useManufacturersWithSeriesAndModelsQuery } from '../../../query/manufacturers.query'


export const Route = createFileRoute('/_authenticated/extras/')({
  component: ExtrasPage,
})

function ExtrasPage() {
  const { t } = useTranslation()
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selected, setSelected] = useState<TExtra | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const { data: extras, isLoading, isError } = useExtrasQuery()
  const { data: manufacturers } = useManufacturersWithSeriesAndModelsQuery()
  const { data: icons } = useIconsQuery()
  const { mutate: addMutation } = useExtrasAddMutation()
  const { mutate: updateMutation } = useExtrasUpdateMutation()
  const { mutate: deleteMutation, isPending: isDeleting } = useExtrasDeleteMutation()

  const columns = useMemo<ColumnDef<TExtra>[]>(() => [
    {
      id: 'icon',
      header: t('icon', { ns: 'extras' }),
      enableSorting: false,
      enableHiding: true,
      size: 70,
      cell: ({ row }) => {
        const iconId = (row.original as any)?.iconId as string | null | undefined
        const iconInline = (row.original as any)?.icon as string | null | undefined
        const iconSrc =
          iconInline ||
          (iconId ? (icons || []).find(i => i.id === iconId)?.downloadUri : null) ||
          null

        if (!iconSrc) return null
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <img src={iconSrc} alt="icon" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          </Box>
        )
      },
    },
    {
      accessorKey: 'name',
      header: t('name', { ns: 'extras' }),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'nameEn',
      header: t('nameEn', { ns: 'extras' }),
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: 'manufacturer',
      header: t('manufacturer', { ns: 'newCar' }),
      enableSorting: false,
      enableHiding: true,
      cell: ({ row }) => {
        const extra = row.original as any
        const manufacturerId = extra?.manufacturerId || extra?.manufacturer?.id || null
        const nameFromExtra = extra?.manufacturer?.name || null
        if (nameFromExtra) return nameFromExtra
        const m = manufacturerId ? (manufacturers || []).find(mm => mm.id === manufacturerId) : null
        return m ? (m.name || m.engName || '') : ''
      },
    },
    {
      id: 'series',
      header: t('series', { ns: 'newCar' }),
      enableSorting: false,
      enableHiding: true,
      size: 240,
      cell: ({ row }) => {
        const extra = row.original as any
        const manufacturerId = extra?.manufacturerId || extra?.manufacturer?.id || null
        const m = manufacturerId ? (manufacturers || []).find(mm => mm.id === manufacturerId) : null
        const serieses = Array.isArray(m?.serieses) ? m!.serieses : []
        const rules = Array.isArray(extra?.extraSeriesRules) ? extra.extraSeriesRules : []

        const formatYears = (fromYear: number | null | undefined, toYear: number | null | undefined) => {
          const short = (y: number) => String(y).slice(-2)
          if (fromYear == null && toYear == null) return null
          if (fromYear != null && toYear != null) return `${short(fromYear)}–${short(toYear)}`
          if (fromYear != null) return short(fromYear)
          return short(toYear as number)
        }

        type SeriesLabel = { key: string; name: string; years: string | null }
        const items: SeriesLabel[] = []
        const seen = new Set<string>()

        for (const r of rules) {
          const years = formatYears(r?.fromYear, r?.toYear)
          let name: string | null = null
          if (r?.appliesToAllSeries) {
            name = t('all', { ns: 'extras' })
          } else {
            const seriesId = r?.manufacturerSeriesId
            if (!seriesId) continue
            const serie = serieses.find((s: any) => s.id === seriesId || s.dbId === seriesId) || null
            name = serie?.name || null
          }
          if (!name) continue
          const key = `${name}|${years ?? ''}`
          if (seen.has(key)) continue
          seen.add(key)
          items.push({ key, name, years })
        }

        items.sort((a, b) => a.name.localeCompare(b.name))
        if (!items.length) return ''

        return (
          <Box component="span" sx={{ display: 'inline' }}>
            {items.map((item, i) => (
              <Box key={item.key} component="span">
                <Box
                  component="span"
                  sx={{
                    display: 'inline-block',
                    whiteSpace: 'nowrap',
                    unicodeBidi: 'isolate',
                  }}
                >
                  <Box component="span" dir="auto" sx={{ display: 'inline' }}>
                    {item.name}
                  </Box>
                  {item.years ? (
                    <>
                      {'\u00A0'}
                      <Box component="span" dir="ltr" sx={{ display: 'inline', unicodeBidi: 'isolate' }}>
                        {`(${item.years})`}
                      </Box>
                    </>
                  ) : null}
                </Box>
                {i < items.length - 1 ? ', ' : ''}
              </Box>
            ))}
          </Box>
        )
      },
    },
    {
      id: 'actions',
      header: t('actions', { ns: 'extras' }),
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      size: 80,
      meta: {
        align: 'right'
      },
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'end' }}>
          <AppActionButton type='edit' onClick={() => {
            setSelected(row.original)
            setOpenFormDialog(true)
          }} />
          <AppActionButton type='delete' onClick={() => {
            setSelected(row.original)
            setOpenConfirmDialog(true)
          }} />
        </Box>
      ),
    }
  ], [t, icons, manufacturers])

  const onSubmit = (data: TExtraUpsert) => {
    if (selected) {
      updateMutation({ ...data, id: selected.id }, {
        onSuccess: () => {
          setOpenFormDialog(false)
        }
      })
    } else {
      addMutation(data, {
        onSuccess: () => {
          setOpenFormDialog(false)
        }
      })
    }
  }

  const onDelete = () => {
    if (selected) {
      deleteMutation(selected?.id)
    }
    setOpenConfirmDialog(false)
  }

  if (isError && !isLoading) {
    return <AppError />
  }

  return (
    <Grid container spacing={3} >
      <Grid size={12}>
        <AppBackBtn children={t('back', { ns: 'common' })} />
      </Grid>
      <Grid
        size={12}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {t('title', { ns: 'extras' })}
          </Typography>
        </Box>
        <Box>
          <Button variant='contained' onClick={() => {
            setSelected(null)
            setOpenFormDialog(true)
          }

          }>
            {t('modals.add', { ns: 'common' })}
          </Button>
        </Box>
      </Grid>

      <StyledPaper
        sx={{
          overflow: 'hidden',
          padding: 3,
          display: 'flex',
          gap: 2,
        }}
      >
        <AppDataTable
          tableName='extras'
          data={extras ?? []}
          columns={columns}
          isLoading={isLoading}
          manualPagination={false}
          sorting={sorting}
          onSortingChange={setSorting}
          initialColumnVisibility={{
            icon: false,
            nameEn: false,
          }}
          pagination={pagination}
          onPaginationChange={setPagination}
          totalPages={Math.ceil((extras?.length || 0) / pagination.pageSize) || 1}
          globalFilterFn={(row, _columnId, filterValue) => {
            const normalize = (v: unknown) =>
              String(v ?? '')
                .toLowerCase()
                .replace(/[\u2013\u2014\u2212]/g, '-') // en/em/minus → hyphen
                .replace(/\s+/g, ' ')
                .trim()

            const q = normalize(filterValue)
            if (!q) return true

            const shortYear = (y: number) => String(y).slice(-2)
            const formatYears = (fromYear: number | null | undefined, toYear: number | null | undefined) => {
              if (fromYear == null && toYear == null) return null
              if (fromYear != null && toYear != null) {
                // Index short + full forms so "20-25", "20–25", "2020-2025" all match
                return [
                  `${shortYear(fromYear)}-${shortYear(toYear)}`,
                  `${fromYear}-${toYear}`,
                ].join(' ')
              }
              if (fromYear != null) return `${shortYear(fromYear)} ${fromYear}`
              return `${shortYear(toYear as number)} ${toYear}`
            }

            const extra: any = row.original
            const manufacturerId = extra?.manufacturerId || extra?.manufacturer?.id || null
            const nameFromExtra = extra?.manufacturer?.name || null
            const resolvedManufacturer =
              nameFromExtra ||
              (manufacturerId ? (manufacturers || []).find(mm => mm.id === manufacturerId) : null)
            const manufacturerText =
              typeof resolvedManufacturer === 'string'
                ? resolvedManufacturer
                : resolvedManufacturer
                  ? [
                      resolvedManufacturer.name,
                      resolvedManufacturer.engName,
                    ].filter(Boolean).join(' ')
                  : ''

            const m = manufacturerId ? (manufacturers || []).find(mm => mm.id === manufacturerId) : null
            const serieses = Array.isArray(m?.serieses) ? m!.serieses : []
            const rules = Array.isArray(extra?.extraSeriesRules) ? extra.extraSeriesRules : []

            const seriesParts: string[] = []
            for (const r of rules) {
              const years = formatYears(r?.fromYear, r?.toYear)
              if (r?.appliesToAllSeries) {
                seriesParts.push([t('all', { ns: 'extras' }), years].filter(Boolean).join(' '))
                continue
              }
              const seriesId = r?.manufacturerSeriesId
              if (!seriesId) continue
              const serie = serieses.find((s: any) => s.id === seriesId || s.dbId === seriesId) || null
              if (!serie?.name) continue
              seriesParts.push([serie.name, years].filter(Boolean).join(' '))
            }

            const haystack = normalize([
              extra?.name,
              extra?.nameEn,
              manufacturerText,
              ...seriesParts,
            ].filter(Boolean).join(' '))

            return haystack.includes(q)
          }}
        />
      </StyledPaper>

      <AppConfirmDialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        onSubmit={onDelete}
        title={t('modals.approveDelete', { ns: 'common' })}
        isPending={isDeleting}
      />

      <AppDialog
        open={openFormDialog}
        onClose={() => setOpenFormDialog(false)}
        title={selected ? t('modals.edit', { ns: 'common' }) : t('modals.add', { ns: 'common' })}
        maxWidth='md'
      >
        <ExtrasForm
          data={selected}
          isPending={false}
          onCancel={() => setOpenFormDialog(false)}
          onConfirm={(data) => onSubmit(data)}
        />
      </AppDialog>
    </Grid>
  )
}

