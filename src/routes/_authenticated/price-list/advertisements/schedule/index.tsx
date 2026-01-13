import { createFileRoute } from '@tanstack/react-router'
import AppLoading from '../../../../../components/AppLoading'
import AppError from '../../../../../components/AppError'
import {
  usePriceListLayoutScheduleCreateMutation,
  usePriceListLayoutScheduleDeleteMutation,
  usePriceListLayoutSchedulesQuery,
  usePriceListLayoutScheduleUpdateMutation,
} from '../../../../../query/priceListLayoutSchedules.query'
import { Box, Button, DialogActions, Grid, Switch } from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import AppDialog from '../../../../../components/AppDialog/AppDialog'
import { useTranslation } from 'react-i18next'
import PriceListLayoutScheduleForm from '../../../../../components/PriceListAdvertisements/PriceListLayoutScheduleForm'
import { usePriceListLayoutsQuery } from '../../../../../query/priceListLayouts.query'
import AppDataTable from '../../../../../components/AppDataTable'
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table'
import type { TPricelistLayoutSchedule } from '../../../../../types'
import AppActionButton from '../../../../../components/AppActionButton'
import AppConfirmDialog from '../../../../../components/AppDialog/AppConfirmDialog'
import { useDateTimeFormat } from '../../../../../hooks/useDateTimeFormat'
import { useMonthYearFormat } from '../../../../../hooks/useMonthYearFormat'
import AllInclusiveIcon from '@mui/icons-material/AllInclusive'

export const Route = createFileRoute('/_authenticated/price-list/advertisements/schedule/')({
  component: AdvertisementsSchedulePage,
})

function AdvertisementsSchedulePage() {
  const { t } = useTranslation()
  const { data: schedules, isLoading: isLoadingSchedules, isError: isErrorSchedules } = usePriceListLayoutSchedulesQuery()
  usePriceListLayoutsQuery()
  const { mutate: createSchedule, isPending: isCreating } = usePriceListLayoutScheduleCreateMutation()
  const { mutate: updateSchedule, isPending: isUpdating } = usePriceListLayoutScheduleUpdateMutation()
  const { mutate: deleteSchedule, isPending: isDeleting } = usePriceListLayoutScheduleDeleteMutation()
  const dateTimeFormat = useDateTimeFormat()
  const monthYearFormat = useMonthYearFormat()

  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<TPricelistLayoutSchedule | null>(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [scheduleToDelete, setScheduleToDelete] = useState<TPricelistLayoutSchedule | null>(null)
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false)
  const [previewSchedule, setPreviewSchedule] = useState<TPricelistLayoutSchedule | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

  const data = schedules ?? []
  const totalPages = Math.max(1, Math.ceil(data.length / pagination.pageSize))

  const handleOpenPreview = useCallback((scheduleRow: TPricelistLayoutSchedule) => {
    setPreviewSchedule(scheduleRow)
    setOpenPreviewDialog(true)
  }, [])

  const columns = useMemo<ColumnDef<TPricelistLayoutSchedule>[]>(
    () => [
      {
        id: 'preview',
        header: t('preview', { ns: 'priceListAdvertisements' }),
        enableSorting: false,
        enableHiding: false,
        size: 240,
        cell: ({ row }) => {
          const previewFileName = row.original.layout?.previewFileName || ''

          if (!previewFileName) return ''
          const rowId = row.original.id
          const isPreviewing = openPreviewDialog && previewSchedule?.id === rowId
          return (
            <Box
              onClick={
                isPreviewing
                  ? undefined
                  : (e) => {
                    e.stopPropagation()
                    handleOpenPreview(row.original)
                  }
              }
              sx={{
                cursor: isPreviewing ? 'not-allowed' : 'pointer',
                width: 220,
                height: 50,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <img
                src={previewFileName}
                alt="preview"
                style={{ display: 'block', width: 220, height: 50, objectFit: 'contain', opacity: row.original.isActive ? 1 : 0.4 }}
              />
            </Box>
          )
        },
      },
      { accessorKey: 'fromDate', header: t('fromDate', { ns: 'priceListAdvertisements' }), enableSorting: true, size: 140, cell: ({ row }) => monthYearFormat(row.original.fromDate) },
      {
        accessorKey: 'toDate',
        header: t('toDate', { ns: 'priceListAdvertisements' }),
        enableSorting: true,
        size: 140,
        cell: ({ row }) => (row.original.toDate ? monthYearFormat(row.original.toDate) : <AllInclusiveIcon fontSize="small" />),
      },
      { accessorKey: 'fromPage', header: t('fromPage', { ns: 'priceListAdvertisements' }), enableSorting: true, size: 100 },
      { accessorKey: 'toPage', header: t('toPage', { ns: 'priceListAdvertisements' }), enableSorting: true, size: 100 },
      { accessorKey: 'priority', header: t('priority', { ns: 'priceListAdvertisements' }), enableSorting: true, size: 100 },
      { accessorKey: 'repeatCount', header: t('repeatCount', { ns: 'priceListAdvertisements' }), enableSorting: true, size: 120 },
      {
        accessorKey: 'isActive',
        header: t('active', { ns: 'priceListAdvertisements' }),
        enableSorting: true,
        size: 110,
        cell: ({ row }) => (
          <Switch
            checked={row.original.isActive}
            onChange={(_e, checked) => {
              const { layout: _layout, ...payload } = row.original
              updateSchedule(
                { ...payload, isActive: checked },
                { onSuccess: () => { } }
              )
            }}
          />
        ),
      },
      {
        accessorKey: 'createdDate',
        header: t('created', { ns: 'priceListAdvertisements' }),
        enableSorting: true,
        size: 110,
        cell: ({ row }) => (row.original.createdDate ? dateTimeFormat(row.original.createdDate) : ''),
      },
      {
        id: 'actions',
        header: t('actions', { ns: 'priceListAdvertisements' }),
        enableSorting: false,
        enableHiding: false,
        size: 120,
        meta: { align: 'right' },
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'end' }}>
            <AppActionButton
              type="edit"
              onClick={() => {
                setSelectedSchedule(row.original)
                setOpenEditDialog(true)
              }}
            />
            <AppActionButton
              type="delete"
              onClick={() => {
                setScheduleToDelete(row.original)
                setOpenDeleteDialog(true)
              }}
            />
          </Box>
        ),
      },
    ],
    [dateTimeFormat, t, monthYearFormat, updateSchedule, handleOpenPreview, openPreviewDialog, previewSchedule]
  )

  if (isLoadingSchedules) return <AppLoading />
  if (isErrorSchedules) return <AppError />

  return (
    <>
      <Grid
        container
        spacing={3}
        sx={{
          width: '100%',
        }}
      >
        <Grid
          size={12}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box />
          <Box>
            <Button
              variant="contained"
              onClick={() => {
                setOpenAddDialog(true)
              }}
            >
              {t('modals.add', { ns: 'common' })}
            </Button>
          </Box>
        </Grid>

        <Grid size={12}>
          <AppDataTable
            tableName="priceListLayoutSchedules"
            data={data}
            columns={columns}
            sorting={sorting}
            onSortingChange={setSorting}
            pagination={pagination}
            onPaginationChange={setPagination}
            totalPages={totalPages}
          />
        </Grid>
      </Grid>

      <AppDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        title={t('modals.add', { ns: 'common' })}
        maxWidth="lg"
      >
        <PriceListLayoutScheduleForm
          schedule={null}
          isPending={isCreating}
          onCancel={() => setOpenAddDialog(false)}
          onConfirm={(scheduleData) => {
            const { id: _id, ...payload } = scheduleData
            createSchedule(payload, {
              onSuccess: () => setOpenAddDialog(false),
            })
          }}
        />
      </AppDialog>

      <AppDialog
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false)
          setSelectedSchedule(null)
        }}
        title={t('modals.edit', { ns: 'common' })}
        maxWidth="lg"
      >
        <PriceListLayoutScheduleForm
          schedule={selectedSchedule}
          isPending={isUpdating}
          onCancel={() => {
            setOpenEditDialog(false)
            setSelectedSchedule(null)
          }}
          onConfirm={(scheduleData) => {
            if (!selectedSchedule?.id) return
            const { layout: _layout, ...selectedWithoutLayout } = selectedSchedule
            updateSchedule(
              {
                ...selectedWithoutLayout,
                ...scheduleData,
              },
              {
                onSuccess: () => {
                  setOpenEditDialog(false)
                  setSelectedSchedule(null)
                },
              }
            )
          }}
        />
      </AppDialog>

      <AppDialog
        open={openPreviewDialog}
        onClose={() => {
          setOpenPreviewDialog(false)
          setPreviewSchedule(null)
        }}
        title={previewSchedule?.layout?.name || 'Preview'}
        maxWidth="xl"
        sx={{
          '& .MuiDialog-paper': {
            maxWidth: '95vw',
          },
        }}
      >
        {previewSchedule?.layout?.previewFileName ? (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 2 }}>
            <Box
              sx={{
                boxShadow: '0px 0px 20px rgba(28, 41, 61, .1), 0px 0px 20px rgba(28, 41, 61, 0.06)',
              }}
            >
              <img
                src={previewSchedule.layout.previewFileName}
                alt="preview"
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: '85vh',
                  objectFit: 'contain',
                }}
              />
            </Box>
          </Box>
        ) : (
          <></>
        )}
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              setOpenPreviewDialog(false)
              setPreviewSchedule(null)
            }}
          >
            {t('modals.cancel', { ns: 'common' })}
          </Button>
        </DialogActions>
      </AppDialog>

      <AppConfirmDialog
        title={t('modals.approveDelete', { ns: 'common' })}
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false)
          setScheduleToDelete(null)
        }}
        onSubmit={() => {
          if (!scheduleToDelete?.id) return
          deleteSchedule(scheduleToDelete.id, {
            onSuccess: () => {
              setOpenDeleteDialog(false)
              setScheduleToDelete(null)
            },
          })
        }}
        isPending={isDeleting}
      />
    </>
  )
}


