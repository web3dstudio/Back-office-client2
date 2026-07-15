import { createFileRoute } from '@tanstack/react-router'
import { Box, Button, DialogActions, FormControl, Grid, MenuItem, Select, Switch } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { usePriceListLayoutsDeleteMutation, usePriceListLayoutsQuery, usePriceListLayoutsUpdateMutation, usePriceListLayoutsUploadMutation } from '../../../../../query/priceListLayouts.query'
import AppError from '../../../../../components/AppError'
import AppDialog from '../../../../../components/AppDialog/AppDialog'
import { useCallback, useMemo, useState } from 'react'
import type { FileWithPath } from 'react-dropzone'
import AppDropzoneFiles from '../../../../../components/AppDropzoneFiles'
import AppDataTable from '../../../../../components/AppDataTable'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import type { TPriceListLayout } from '../../../../../types'
import { useDateTimeFormat } from '../../../../../hooks/useDateTimeFormat'
import AppActionButton from '../../../../../components/AppActionButton'
import AppConfirmDialog from '../../../../../components/AppDialog/AppConfirmDialog'

export const Route = createFileRoute('/_authenticated/price-list/advertisements/layouts/')({
  component: AdvertisementsLayoutsPage,
})

function AdvertisementsLayoutsPage() {
  const { t } = useTranslation()
  const dateTimeFormat = useDateTimeFormat()
  const { data: layouts, isLoading, isError } = usePriceListLayoutsQuery()
  const { mutate: uploadLayouts, isPending: isUploading } = usePriceListLayoutsUploadMutation()
  const { mutate: deleteLayout, isPending: isDeleting } = usePriceListLayoutsDeleteMutation()
  const { mutate: updateLayout } = usePriceListLayoutsUpdateMutation()
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [files, setFiles] = useState<FileWithPath[]>([])
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selected, setSelected] = useState<TPriceListLayout | null>(null)
  const [loadingDownloadIds, setLoadingDownloadIds] = useState<Set<string>>(new Set())
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false)
  const [previewLayout, setPreviewLayout] = useState<TPriceListLayout | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  if (isError && !isLoading) {
    return <AppError />
  }

  const downloadFile = (file: Blob, name: string) => {
    if (file.size === 0) return
    const url = window.URL.createObjectURL(file)
    const link = document.createElement('a')
    link.download = name
    link.href = url
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleDownload = async (layout: TPriceListLayout) => {
    const url = layout.originalFileName
    if (!url) return
    setLoadingDownloadIds(prev => new Set(prev).add(layout.id))
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      downloadFile(blob, layout.name || 'file')
    } finally {
      setLoadingDownloadIds(prev => {
        const next = new Set(prev)
        next.delete(layout.id)
        return next
      })
    }
  }

  const handleOpenPreview = useCallback((layout: TPriceListLayout) => {
    setPreviewLayout(layout)
    setOpenPreviewDialog(true)
  }, [])

  const columns = useMemo<ColumnDef<TPriceListLayout>[]>(
    () => [
      {
        id: 'preview',
        header: t('preview', { ns: 'priceListAdvertisements' }),
        enableSorting: false,
        enableHiding: false,
        size: 380,
        cell: ({ row }) => {
          if (!row.original.previewFileName) return ''
          const rowId = row.original.id
          const isDownloading = loadingDownloadIds.has(rowId)
          const isPreviewing = openPreviewDialog && previewLayout?.id === rowId
          const isVertical = row.original.orientation === 'Vertical'
          const isFullPage = row.original.orientation === 'FullPage'
          const previewHeight = isFullPage ? 160 : isVertical ? 200 : 70
          return (
            <Box
              onClick={isDownloading || isPreviewing ? undefined : () => handleOpenPreview(row.original)}
              sx={{
                cursor: isDownloading || isPreviewing ? 'not-allowed' : 'pointer',
                width: 320,
                height: previewHeight,
                display: 'flex',
                alignItems: 'center',
                opacity: isDownloading ? 0.6 : 1,
              }}
            >
              <img
                src={row.original.previewFileName || ''}
                alt="preview"
                style={{
                  display: 'block',
                  width: 400,
                  height: previewHeight,
                  objectFit: 'contain',
                  opacity: row.original.isActive ? 1 : 0.4,
                }}
              />
            </Box>
          )
        },
      },
      {
        accessorKey: 'name',
        header: t('name', { ns: 'priceListAdvertisements' }),
        enableSorting: true,
        enableHiding: true,
        size: 260,
      },
      {
        accessorKey: 'colorModel',
        header: t('colorModel', { ns: 'priceListAdvertisements' }),
        enableSorting: true,
        enableHiding: true,
        size: 140,
        cell: ({ row }) => {
          const v = row.original.colorModel
          const size = 16
          const dotSx = (bg: string) => ({
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: bg,
          })

          if (v === 'CMYK') {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', '& > * + *': { ml: -0.5 } }}>
                <Box sx={dotSx('#00bcd4')} />
                <Box sx={dotSx('#e91e63')} />
                <Box sx={dotSx('#ffeb3b')} />
                <Box sx={dotSx('#000000')} />
              </Box>
            )
          }

          if (v === 'RGB' || v === 'sRGB') {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', '& > * + *': { ml: -0.5 } }}>
                <Box sx={dotSx('#f44336')} />
                <Box sx={dotSx('#4caf50')} />
                <Box sx={dotSx('#2196f3')} />
              </Box>
            )
          }

          if (v === 'Gray') {
            return (
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                <Box sx={dotSx('#9e9e9e')} />
              </Box>
            )
          }

          // Unknown / null
          return (
            <Box
              sx={{
                width: size,
                height: size,
                borderRadius: '50%',
                border: '1px solid #9e9e9e',
                color: '#757575',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                lineHeight: 1,
              }}
            >
              ?
            </Box>
          )
        },
      },
      {
        accessorKey: 'layoutType',
        header: t('layoutType', { ns: 'priceListAdvertisements' }),
        enableSorting: true,
        enableHiding: true,
        size: 140,
        cell: ({ row }) => (
          <FormControl size="small" fullWidth>
            <Select
              value={String(row.original.layoutType)}
              onChange={(e) => {
                const nextLayoutType = Number(e.target.value) as any
                updateLayout({
                  id: row.original.id,
                  layoutType: nextLayoutType,
                  // если 0 (Unassigned) — всегда отправляем неактивный
                  isActive: nextLayoutType === 0 ? false : row.original.isActive,
                })
              }}
              variant="standard"
              disableUnderline
              size="small"
              sx={{
                border: 'none',
                fontSize: '0.875rem',
                '&:before': { display: 'none' },
                '&:after': { display: 'none' },
              }}
            >
              <MenuItem value="0">{t('layoutType_unassigned', { ns: 'priceListAdvertisements' })}</MenuItem>
              <MenuItem
                value="1"
                disabled={row.original.orientation === 'Vertical' || row.original.orientation === 'FullPage'}
              >
                {t('layoutType_horizontal', { ns: 'priceListAdvertisements' })}
              </MenuItem>
              <MenuItem
                value="2"
                disabled={row.original.orientation === 'Horizontal' || row.original.orientation === 'FullPage'}
              >
                {t('layoutType_verticalLeft', { ns: 'priceListAdvertisements' })}
              </MenuItem>
              <MenuItem
                value="3"
                disabled={row.original.orientation === 'Horizontal' || row.original.orientation === 'FullPage'}
              >
                {t('layoutType_verticalRight', { ns: 'priceListAdvertisements' })}
              </MenuItem>
              <MenuItem
                value="4"
                disabled={row.original.orientation === 'Horizontal' || row.original.orientation === 'Vertical'}
              >
                {t('layoutType_fullPage', { ns: 'priceListAdvertisements' })}
              </MenuItem>
            </Select>
          </FormControl>
        ),
      },
      {
        accessorKey: 'createdDate',
        header: t('created', { ns: 'priceListAdvertisements' }),
        enableSorting: true,
        enableHiding: true,
        size: 200,
        cell: ({ row }) => dateTimeFormat(row.original.createdDate),
      },
      {
        accessorKey: 'isActive',
        header: t('active', { ns: 'priceListAdvertisements' }),
        enableSorting: true,
        enableHiding: true,
        size: 120,
        cell: ({ row }) => (
          <Switch
            checked={row.original.layoutType === 0 ? false : row.original.isActive}
            disabled={row.original.layoutType === 0}
            onChange={(_e, checked) => {
              updateLayout({
                id: row.original.id,
                layoutType: row.original.layoutType,
                isActive: checked,
              })
            }}
          />
        ),
      },
      {
        id: 'actions',
        header: t('actions', { ns: 'priceListAdvertisements' }),
        enableSorting: false,
        enableHiding: false,
        size: 140,
        minSize: 140,
        maxSize: 140,
        meta: { align: 'right' },
        cell: ({ row }) => {
          const rowId = row.original.id
          const isDownloading = loadingDownloadIds.has(rowId)
          const isPreviewing = openPreviewDialog && previewLayout?.id === rowId
          return (
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'end' }}>
              <AppActionButton
                type="download"
                onClick={() => void handleDownload(row.original)}
                loading={isDownloading}
                disabled={isDownloading || isPreviewing || !row.original.originalFileName}
              />
              <AppActionButton
                type="view"
                onClick={() => handleOpenPreview(row.original)}
                disabled={isDownloading || isPreviewing || !row.original.previewFileName}
              />
              <AppActionButton
                type="delete"
                disabled={isDownloading || isPreviewing}
                onClick={() => {
                  setSelected(row.original)
                  setOpenConfirmDialog(true)
                }}
              />
            </Box>
          )
        },
      },
    ],
    [dateTimeFormat, loadingDownloadIds, handleOpenPreview, openPreviewDialog, previewLayout]
  )

  return (
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
          tableName="priceListLayouts"
          data={layouts ?? []}
          columns={columns}
          isLoading={isLoading}
          hidePagination
          sorting={sorting}
          onSortingChange={setSorting}
          globalFilterFn={(row, _columnId, filterValue) => {
            const q = (filterValue || '').toString().toLowerCase()
            if (!q) return true
            const o = row.original as TPriceListLayout
            const name = o.name?.toString().toLowerCase() || ''
            const created = o.createdDate?.toString().toLowerCase() || ''
            const orientation = o.orientation?.toString().toLowerCase() || ''
            const colorModel = o.colorModel?.toString().toLowerCase() || ''
            const layoutType = o.layoutType?.toString().toLowerCase() || ''
            const active = o.isActive ? 'true' : 'false'
            return (
              name.includes(q) ||
              created.includes(q) ||
              orientation.includes(q) ||
              colorModel.includes(q) ||
              layoutType.includes(q) ||
              active.includes(q)
            )
          }}
          sx={{
            '& th': { py: 1 },
            '& td': { py: 1 },
            '& th:first-of-type': { pl: 0.5 },
            '& td:first-of-type': { pl: 0.5 },
          }}
        />
      </Grid>

      <AppDialog
        open={openAddDialog}
        onClose={() => {
          setOpenAddDialog(false)
          setFiles([])
        }}
        title={t('modals.add', { ns: 'common' })}
        maxWidth="md"
      >
        <AppDropzoneFiles
          files={files}
          onChange={setFiles}
          maxFiles={5}
          maxFileSize={10 * 1024 * 1024}
          accept={{
            'application/pdf': ['.pdf'],
            'image/*': ['.jpg', '.jpeg', '.tif', '.tiff'],
            'application/postscript': ['.eps'],
          }}
        />
        <DialogActions sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setOpenAddDialog(false)
              setFiles([])
            }}
            disabled={isUploading}
          >
            {t('modals.cancel', { ns: 'common' })}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              uploadLayouts(
                { files: files as File[] },
                {
                  onSuccess: () => {
                    setOpenAddDialog(false)
                    setFiles([])
                  },
                }
              )
            }}
            loading={isUploading}
            disabled={files.length === 0 || isUploading}
          >
            {t('modals.save', { ns: 'common' })}
          </Button>
        </DialogActions>
      </AppDialog>

      <AppDialog
        open={openPreviewDialog}
        onClose={() => {
          setOpenPreviewDialog(false)
          setPreviewLayout(null)
        }}
        title={previewLayout?.name || 'Preview'}
        maxWidth="xl"
        sx={{
          '& .MuiDialog-paper': {
            maxWidth: '95vw',
          },
        }}
      >
        {previewLayout?.previewFileName ? (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 2 }}>
            <Box
              sx={{
                boxShadow: '0px 0px 20px rgba(28, 41, 61, .1), 0px 0px 20px rgba(28, 41, 61, 0.06)',
              }}
            >
              <img
                src={previewLayout.previewFileName}
                alt="preview"
                style={{
                  display: 'block',
                  width: previewLayout.orientation === 'Vertical' ? 'auto' : '100%',
                  height: previewLayout.orientation === 'Vertical' ? '85vh' : 'auto',
                  maxWidth: '100%',
                  maxHeight: previewLayout.orientation === 'Vertical' ? '85vh' : '60vh',
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
              setPreviewLayout(null)
            }}
          >
            {t('modals.cancel', { ns: 'common' })}
          </Button>
        </DialogActions>
      </AppDialog>

      <AppConfirmDialog
        title={t('modals.approveDelete', { ns: 'common' })}
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        onSubmit={() => {
          if (!selected?.id) return
          deleteLayout(selected.id, {
            onSuccess: () => {
              setOpenConfirmDialog(false)
              setSelected(null)
            },
          })
        }}
        isPending={isDeleting}
      />
    </Grid>
  )
}


