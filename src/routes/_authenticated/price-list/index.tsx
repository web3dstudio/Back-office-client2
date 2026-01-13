import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next'
import { useDeletePriceListMutation, usePriceListsQuery, fetchPriceListPdf } from '../../../query/priceList.query';
import { usePriceListTypesQuery } from '../../../query/priceListTypes.querty';
import AppActionButton from '../../../components/AppActionButton';
import type { TPriceList } from '../../../types';
import { useDateTimeFormat } from '../../../hooks/useDateTimeFormat';
import { Box, Grid, Typography } from '@mui/material';
import AppBackBtn from '../../../components/AppBackBtn';
import StyledPaper from '../../../components/StyledPaper';
import PriceListForm from '../../../components/PriceList/PriceListForm';
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog';
import AppDataTable from '../../../components/AppDataTable';
import type { ColumnDef, SortingState, PaginationState } from '@tanstack/react-table';
import { toast } from 'react-toastify';

export const Route = createFileRoute('/_authenticated/price-list/')({
  component: PriceListPage,
})

const downloadFile = (file: Blob, name: string, download: boolean) => {
  if (file.size === 0) {
    console.error('Received empty blob')
    return
  }
  const url = window.URL.createObjectURL(file)
  if (download) {
    // Скачивание
    const link = document.createElement('a')
    link.download = name
    link.href = url
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } else {
    // Просмотр
    window.open(url, '_blank')
    // URL будет освобожден при закрытии окна
  }
}

function PriceListPage() {
  const { t, i18n } = useTranslation()
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selected, setSelected] = useState<TPriceList | null>(null)
  const [loadingViewPdfIds, setLoadingViewPdfIds] = useState<Set<string>>(new Set())
  const [loadingDownloadPdfIds, setLoadingDownloadPdfIds] = useState<Set<string>>(new Set())
  const dateTimeFormat = useDateTimeFormat()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const [sorting, setSorting] = useState<SortingState>([]);

  const { data: priceListTypes } = usePriceListTypesQuery()
  const { data: priceLists, isLoading } = usePriceListsQuery(pagination.pageIndex, {}, sorting.map(s => ({ field: s.id, sort: s.desc ? 'desc' : 'asc' })))
  const { mutate: deletePriceList, isPending: isDeleting } = useDeletePriceListMutation()

  const columns = useMemo<ColumnDef<TPriceList>[]>(
    () => [
      {
        accessorKey: 'date',
        header: t('date', { ns: 'priceList' }),
        enableSorting: true,
        enableHiding: true,
        size: 200,
        minSize: 150,
        maxSize: 300,
        cell: ({ row }) => dateTimeFormat(row.original.date),
      },
      {
        accessorKey: 'priceListType',
        header: t('priceListType', { ns: 'priceList' }),
        enableSorting: false,
        enableHiding: true,
        size: 200,
        minSize: 150,
        maxSize: 300,
        cell: ({ row }) => priceListTypes?.find(type => type.id === row.original.priceListType)?.name,
      },
      {
        accessorKey: 'carTypes',
        header: t('carTypes', { ns: 'priceList' }),
        enableSorting: false,
        enableHiding: true,
        size: 300,
        minSize: 200,
        maxSize: 400,
        cell: ({ row }) => row.original.carTypes.map(type => type?.name).join(', '),
      },
      {
        accessorKey: 'engineTypes',
        header: t('title', { ns: 'engineTypes' }),
        enableSorting: false,
        enableHiding: true,
        size: 300,
        minSize: 200,
        maxSize: 400,
        cell: ({ row }) => {
          const types = row.original.engineTypes || []
          if (types.length === 0) {
            return t('all', { ns: 'priceList' })
          }
          return types
            .map(type => (i18n.language?.startsWith('he') ? type?.name : (type?.nameEn || type?.name)))
            .join(', ')
        },
      },
      {
        id: 'years',
        header: t('years', { ns: 'priceList' }),
        enableSorting: false,
        enableHiding: true,
        size: 140,
        minSize: 120,
        maxSize: 180,
        cell: ({ row }) => {
          const from = row.original.yearOfFirstRegistration
          const to = row.original.upToYearOfManufacture
          if (from === null || from === undefined || to === null || to === undefined) return ''
          return `${from} - ${to}`
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        enableHiding: false,
        size: 140,
        minSize: 140,
        maxSize: 140,
        meta: { align: 'right' },
        cell: ({ row }) => {
          const rowId = row.original.id
          const isViewing = loadingViewPdfIds.has(rowId)
          const isDownloading = loadingDownloadPdfIds.has(rowId)

          const handleView = async () => {
            setLoadingViewPdfIds(prev => new Set(prev).add(rowId))
            try {
              const blob = await fetchPriceListPdf(rowId)
              const fileName = `price-list-${rowId}.pdf`
              downloadFile(blob, fileName, false)
              toast.success(t('priceList_pdf_opened_successfully', { ns: 'notifications' }) || 'PDF opened successfully')
            } catch (error) {
              console.error('Error fetching PDF:', error)
              toast.error(t('error_occurred', { ns: 'notifications' }) || 'Error occurred')
            } finally {
              setLoadingViewPdfIds(prev => {
                const next = new Set(prev)
                next.delete(rowId)
                return next
              })
            }
          }

          const handleDownload = async () => {
            setLoadingDownloadPdfIds(prev => new Set(prev).add(rowId))
            try {
              const blob = await fetchPriceListPdf(rowId)
              const fileName = `price-list-${rowId}.pdf`
              downloadFile(blob, fileName, true)
              toast.success(t('priceList_pdf_downloaded_successfully', { ns: 'notifications' }) || 'PDF downloaded successfully')
            } catch (error) {
              console.error('Error downloading PDF:', error)
              toast.error(t('error_occurred', { ns: 'notifications' }) || 'Error occurred')
            } finally {
              setLoadingDownloadPdfIds(prev => {
                const next = new Set(prev)
                next.delete(rowId)
                return next
              })
            }
          }

          return (
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'end' }}>
              <AppActionButton
                type='view'
                onClick={handleView}
                loading={isViewing}
                disabled={isViewing || isDownloading}
              />
              <AppActionButton
                type='download'
                onClick={handleDownload}
                loading={isDownloading}
                disabled={isViewing || isDownloading}
              />
              <AppActionButton
                type='delete'
                disabled={isViewing || isDownloading}
                onClick={() => {
                  setSelected(() => row.original)
                  setOpenConfirmDialog(true)
                }}
              />
            </Box>
          )
        },
      },
    ],
    [t, dateTimeFormat, priceListTypes, loadingViewPdfIds, loadingDownloadPdfIds]
  )

  const handleDeletePriceList = () => {
    if (selected) {
      deletePriceList(selected.id, {
        onSuccess: () => {
          setOpenConfirmDialog(false)
          setSelected(null)
        }
      })
    }
  }

  return (<>
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
          <Typography variant="h5" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
            {t('title', { ns: 'priceList' })}
          </Typography>
        </Box>
        <Box>

        </Box>
      </Grid>
      <StyledPaper sx={{
        borderRadius: '24px',
        overflow: 'hidden',
        padding: 3,
        width: '100%',
        display: 'flex',
        gap: 2,
      }}>
        <PriceListForm />
      </StyledPaper>

      <StyledPaper
        sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          padding: 3,
          width: '100%',
          display: 'flex',
          gap: 2,
        }}
      >
        <AppDataTable
          tableName='priceList'
          data={priceLists?.data ?? []}
          columns={columns}
          isLoading={isLoading}
          manualPagination={true}
          sorting={sorting}
          onSortingChange={setSorting}
          pagination={pagination}
          onPaginationChange={setPagination}
          totalPages={priceLists?.totalPagesNumber ?? 1}
          currentPage={priceLists?.currentPageNumber ?? pagination.pageIndex + 1}
          globalFilterFn={(row, _columnId, filterValue) => {
            const dateMatch = dateTimeFormat(row.original.date).toLowerCase().includes(filterValue.toLowerCase())
            const typeMatch = priceListTypes?.find(type => type.id === row.original.priceListType)?.name?.toLowerCase().includes(filterValue.toLowerCase()) || false
            const carTypesMatch = row.original.carTypes.map((type: any) => type?.name).join(', ').toLowerCase().includes(filterValue.toLowerCase())
            return dateMatch || typeMatch || carTypesMatch
          }}
        />
      </StyledPaper>
    </Grid>

    <AppConfirmDialog
      open={openConfirmDialog}
      onClose={() => setOpenConfirmDialog(false)}
      onSubmit={handleDeletePriceList}
      title={t('modals.approveDelete', { ns: 'common' })}
      isPending={isDeleting}
    />
  </>)
}




