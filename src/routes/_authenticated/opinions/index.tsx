import { createFileRoute, useNavigate } from '@tanstack/react-router'
import StyledPaper from '../../../components/StyledPaper'
import { useOpinionsQuery, useOpinionsSendMutation } from '../../../query/opinios.query';
import { useTranslation } from 'react-i18next';
import { useState, useMemo } from 'react';
import type { OpinionsFilters, TOpinionList } from '../../../types';
import AppActionButton from '../../../components/AppActionButton';
import { useDateTimeFormat } from '../../../hooks/useDateTimeFormat'
import useCurrencyFormat from '../../../hooks/useCurrencyFormat';
import { Box, Button, Grid, Tooltip, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import PhotoIcon from '@mui/icons-material/Photo';
import AppBackBtn from '../../../components/AppBackBtn';
import OpinionsFilter from '../../../components/Opinions/OpinionsFilter';
import AppDataTable from '../../../components/AppDataTable';
import type { ColumnDef, SortingState, PaginationState } from '@tanstack/react-table';


export const Route = createFileRoute('/_authenticated/opinions/')({
  component: OpinionsPage,
})

function OpinionsPage() {
  const { t } = useTranslation()
  const dateTimeFormat = useDateTimeFormat()
  const { formatCurrency } = useCurrencyFormat()
  const navigate = useNavigate({ from: '/opinions' })

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [sendingOpinionId, setSendingOpinionId] = useState<string | null>(null)


  const [filtersDraft, setFiltersDraft] = useState<OpinionsFilters>({
    FromDate: '',
    ToDate: '',
    Number: '',
    OrdererName: '',
    LicenseNumber: '',
    TozeretName: '',
    DegemName: '',
    ManufacturerCode: '',
    ManufacturerName: '',
    ManufacturerYear: '',
    UpdateFromDate: '',
    UpdateToDate: '',
  });
  const [filters, setFilters] = useState<OpinionsFilters>(filtersDraft);

  const { data: opinions, isLoading } = useOpinionsQuery(pagination.pageIndex, filters, sorting.map(s => ({ field: s.id, sort: s.desc ? 'desc' : 'asc' })))

  const { mutate: sendOpinion, isPending: isSendingOpinion } = useOpinionsSendMutation()

  const columns = useMemo<ColumnDef<TOpinionList>[]>(
    () => [
      {
        accessorKey: 'number',
        header: t('id', { ns: 'options' }),
        enableSorting: true,
        enableHiding: false,
        size: 100,
        minSize: 80,
        maxSize: 150,
      },
      {
        id: 'images',
        accessorKey: 'hasImages',
        header: t('images', { ns: 'options' }),
        enableSorting: false,
        enableHiding: true,
        size: 60,
        minSize: 40,
        maxSize: 80,
        cell: ({ row }) => {
          const hasImages = (row.original as any).hasImages
          if (!hasImages) return null
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'start', width: '100%', height: '100%' }}>
              <PhotoIcon fontSize="small" />
            </Box>
          )
        },
      },
      {
        accessorKey: 'manufacturerName',
        header: t('manufacturer', { ns: 'options' }),
        enableSorting: true,
        enableHiding: true,
        size: 150,
        minSize: 100,
        maxSize: 200,
      },
      {
        accessorKey: 'modelCode',
        header: t('modelCode', { ns: 'options' }),
        enableSorting: true,
        enableHiding: true,
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: 'model',
        header: t('model', { ns: 'options' }),
        enableSorting: true,
        enableHiding: true,
        size: 150,
        minSize: 100,
        maxSize: 200,
      },
      {
        accessorKey: 'volume',
        header: t('volume', { ns: 'options' }),
        enableSorting: true,
        enableHiding: true,
        size: 100,
        minSize: 80,
        maxSize: 120,
      },
      {
        accessorKey: 'ordererName',
        header: t('orderer', { ns: 'options' }),
        enableSorting: true,
        enableHiding: true,
        size: 150,
        minSize: 100,
        maxSize: 200,
      },
      {
        accessorKey: 'inspectionDate',
        header: t('insDate', { ns: 'options' }),
        enableSorting: true,
        enableHiding: true,
        size: 120,
        minSize: 100,
        maxSize: 150,
        cell: ({ row }) => dateTimeFormat(row.original.inspectionDate),
      },
      {
        accessorKey: 'receptionDate',
        header: t('recDate', { ns: 'options' }),
        enableSorting: true,
        enableHiding: true,
        size: 120,
        minSize: 100,
        maxSize: 150,
        cell: ({ row }) => dateTimeFormat(row.original.receptionDate),
      },
      {
        accessorKey: 'manufacturerYear',
        header: t('year', { ns: 'options' }),
        enableSorting: true,
        enableHiding: true,
        size: 80,
        minSize: 60,
        maxSize: 100,
      },
      {
        accessorKey: 'price',
        header: t('price', { ns: 'options' }),
        enableSorting: true,
        enableHiding: true,
        size: 120,
        minSize: 100,
        maxSize: 150,
        cell: ({ row }) => formatCurrency(row.original.price),
      },
      {
        accessorKey: 'nextUpdateDate',
        header: t('updateDate', { ns: 'options' }),
        enableSorting: true,
        enableHiding: true,
        size: 120,
        minSize: 100,
        maxSize: 150,
        cell: ({ row }) => dateTimeFormat(row.original.nextUpdateDate),
      },
      {
        id: 'sendDate',
        header: t('sendDate', { ns: 'options' }),
        enableSorting: true,
        enableHiding: true,
        size: 100,
        minSize: 80,
        maxSize: 120,
        cell: ({ row }) => {
          const icons = [
            { show: !!row.original?.opinionSend, tip: row.original?.opinionSendDate },
            { show: !!row.original?.update1Send, tip: row.original?.update1SendDate },
            { show: !!row.original?.update2Send, tip: row.original?.update2SendDate },
            { show: !!row.original?.update3Send, tip: row.original?.update3SendDate },
          ];
          return (
            <>
              {icons.map(
                (item, idx) =>
                  item.show && (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                      <Tooltip key={idx} title={item.tip ? dateTimeFormat(item.tip) : ''}>
                        <CheckIcon color="success" sx={{ mr: 0.5 }} />
                      </Tooltip>
                    </Box>
                  )
              )}
            </>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        enableHiding: false,
        size: 100,
        minSize: 100,
        maxSize: 100,
        meta: { align: 'right' },
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'end' }}>
            <AppActionButton type='edit' onClick={() => {
              navigate({ to: '/opinions/$id', params: { id: row.original.id } })
            }} />
            <AppActionButton
              type='send'
              onClick={() => {
                setSendingOpinionId(row.original.id)
                sendOpinion(row.original.id)
              }}
              loading={isSendingOpinion && sendingOpinionId === row.original.id}
            />
          </Box>
        ),
      },
    ],
    [t, dateTimeFormat, formatCurrency, navigate, sendOpinion, isSendingOpinion, sendingOpinionId]
  )

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
            {t('title', { ns: 'options' })}
          </Typography>
        </Box>
        <Box>
          <Button variant='contained' onClick={() => {
            navigate({ to: '/opinions/new' })
          }

          }>
            {t('modals.add', { ns: 'common' })}
          </Button>
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
        <OpinionsFilter
          filters={filtersDraft}
          setFilters={setFiltersDraft}
          onSearch={() => {
            setFilters(filtersDraft);
            setPagination(prev => ({ ...prev, pageIndex: 0 })); // сбросить страницу при поиске
          }}
        />
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
          tableName='opinions'
          data={opinions?.data ?? []}
          columns={columns}
          isLoading={isLoading}
          manualPagination={true}
          sorting={sorting}
          onSortingChange={setSorting}
          pagination={pagination}
          onPaginationChange={setPagination}
          totalPages={opinions?.totalPagesNumber ?? 1}
          currentPage={opinions?.currentPageNumber ?? pagination.pageIndex + 1}
          globalFilterFn={(row, _columnId, filterValue) => {
            const numberMatch = row.original.number?.toString().toLowerCase().includes(filterValue.toLowerCase()) || false
            const manufacturerMatch = row.original.manufacturerName?.toString().toLowerCase().includes(filterValue.toLowerCase()) || false
            const modelCodeMatch = row.original.modelCode?.toString().toLowerCase().includes(filterValue.toLowerCase()) || false
            const modelMatch = row.original.model?.toString().toLowerCase().includes(filterValue.toLowerCase()) || false
            const volumeMatch = row.original.volume?.toString().toLowerCase().includes(filterValue.toLowerCase()) || false
            const ordererMatch = row.original.ordererName?.toString().toLowerCase().includes(filterValue.toLowerCase()) || false
            const yearMatch = row.original.manufacturerYear?.toString().toLowerCase().includes(filterValue.toLowerCase()) || false
            const priceMatch = formatCurrency(row.original.price)?.toLowerCase().includes(filterValue.toLowerCase()) || false
            return numberMatch || manufacturerMatch || modelCodeMatch || modelMatch || volumeMatch || ordererMatch || yearMatch || priceMatch
          }}
        />
      </StyledPaper>
    </Grid>
  </>)
}