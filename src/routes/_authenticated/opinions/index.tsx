import { createFileRoute, useNavigate } from '@tanstack/react-router'
import StyledPaper from '../../../components/StyledPaper'
import { useOpinionsQuery } from '../../../query/opinios.query';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import type { OpinionsFilters, TOpinionList } from '../../../types';
import { DataGrid, type GridColDef, type GridPaginationModel, type GridRenderCellParams, type GridSortModel, type GridColumnVisibilityModel } from '@mui/x-data-grid';
import AppActionButton from '../../../components/AppActionButton';
import { useDateTimeFormat } from '../../../hooks/useDateTimeFormat'
import useCurrencyFormat from '../../../hooks/useCurrencyFormat';
import { Box, Button, Grid, Tooltip, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import AppBackBtn from '../../../components/AppBackBtn';
import OpinionsFilter from '../../../components/Opinions/OpinionsFilter';
import { useLocalStorage } from '../../../hooks/useLocalStorage';


export const Route = createFileRoute('/_authenticated/opinions/')({
  component: OpinionsPage,
})

function OpinionsPage() {
  const { t } = useTranslation()
  const dateTimeFormat = useDateTimeFormat()
  const { formatCurrency } = useCurrencyFormat()
  const navigate = useNavigate({ from: '/opinions' })

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useLocalStorage('opinionsTable', {});

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

  const { data: opinions, isLoading } = useOpinionsQuery(paginationModel.page, filters, sortModel)

  const columns = [
    {
      field: 'number',
      headerName: t('id', { ns: 'options' }),
      editable: false,
      hideable: false,
      type: 'string',
      flex: 1,
      valueGetter: (_value: any, row: TOpinionList) => row.number,
    },
    {
      field: 'manufacturerName',
      headerName: t('manufacturer', { ns: 'options' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
    },
    {
      field: 'modelCode',
      headerName: t('modelCode', { ns: 'options' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
    },
    {
      field: 'model',
      headerName: t('model', { ns: 'options' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
    },
    {
      field: 'volume',
      headerName: t('volume', { ns: 'options' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
    },
    {
      field: 'ordererName',
      headerName: t('orderer', { ns: 'options' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
    },
    {
      field: 'inspectionDate',
      headerName: t('insDate', { ns: 'options' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value: any, row: TOpinionList) => dateTimeFormat(row.inspectionDate),
    },
    {
      field: 'receptionDate',
      headerName: t('recDate', { ns: 'options' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value: any, row: TOpinionList) => dateTimeFormat(row.receptionDate),
    },
    {
      field: 'manufacturerYear',
      headerName: t('year', { ns: 'options' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
    },
    {
      field: 'price',
      headerName: t('price', { ns: 'options' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value: any, row: TOpinionList) => formatCurrency(row.price),
    },
    {
      field: 'nextUpdateDate',
      headerName: t('updateDate', { ns: 'options' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value: any, row: TOpinionList) => dateTimeFormat(row.nextUpdateDate),
    },
    {
      field: 'sendDate',
      headerName: "",
      editable: false,
      hideable: true,
      sortable: true,
      type: 'string',
      width: 100,
      renderCell: ({ row }: { row: TOpinionList }) => {
        const icons = [
          { show: !!row?.opinionSend, tip: row?.opinionSendDate },
          { show: !!row?.update1Send, tip: row?.update1SendDate },
          { show: !!row?.update2Send, tip: row?.update2SendDate },
          { show: !!row?.update3Send, tip: row?.update3SendDate },
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
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      hideable: false,
      getActions: (params: GridRenderCellParams) => [
        <AppActionButton type='edit' onClick={() => {
          navigate({ to: '/opinions/edit/$id', params: { id: params.row.id } })
        }} />,
        <AppActionButton type='send' onClick={() => {
          // setSelected(() => params.row)
          // setOpenConfirmDialog(true)
        }} />
      ],
    },
  ]

  console.log(sortModel)

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
            setPaginationModel(model => ({ ...model, page: 0 })); // сбросить страницу при поиске
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
        <DataGrid
          rows={opinions?.data ?? []}
          columns={columns as GridColDef<TOpinionList>[]}
          rowCount={opinions?.totalRowsNumber ?? 0}
          loading={isLoading}
          pagination
          paginationMode="server"
          paginationModel={paginationModel}
          sortingMode="server"
          sortModel={sortModel}
          disableColumnMenu
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(newModel) => {
            setColumnVisibilityModel(newModel);
          }}
          onSortModelChange={(model: GridSortModel) => {
            setSortModel(model)
          }}
          onPaginationModelChange={(model: GridPaginationModel) => {
            setPaginationModel(model)
          }}
          getRowId={(row) => row.id}
          pageSizeOptions={[10]}
          sx={{
            '& .MuiDataGrid-row:nth-of-type(odd)': {
              backgroundColor: '#f5f5f5',
            },
          }}
          showToolbar
        />
      </StyledPaper>
    </Grid>
  </>)
}