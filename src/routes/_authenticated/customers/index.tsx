import { createFileRoute, useNavigate } from '@tanstack/react-router'
import StyledPaper from '../../../components/StyledPaper'
import { useOpinionsQuery, useOpinionsSendMutation } from '../../../query/opinios.query';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import type { OpinionsFilters, TCustomer, TCustomerList, TOpinionList } from '../../../types';
import { DataGrid, type GridColDef, type GridPaginationModel, type GridRenderCellParams, type GridSortModel, type GridColumnVisibilityModel } from '@mui/x-data-grid';
import AppActionButton from '../../../components/AppActionButton';
import { useDateTimeFormat } from '../../../hooks/useDateTimeFormat'
import useCurrencyFormat from '../../../hooks/useCurrencyFormat';
import { Box, Button, Grid, Tooltip, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import AppBackBtn from '../../../components/AppBackBtn';
import OpinionsFilter from '../../../components/Opinions/OpinionsFilter';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { useCustomersListQuery } from '../../../query/customers.query';
import CustomerFilter from '../../../components/Customers/CustomerFilter';

export const Route = createFileRoute('/_authenticated/customers/')({
  component: CustomersPage,
})

type CustomersFilters = {
  Name: string
}

function CustomersPage() {
  const { t } = useTranslation()
  const dateTimeFormat = useDateTimeFormat()
  const { formatCurrency } = useCurrencyFormat()
  const navigate = useNavigate({ from: '/customers' })


  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useLocalStorage('customersTable', {});
  const [sendingOpinionId, setSendingOpinionId] = useState<string | null>(null)

  const [filtersDraft, setFiltersDraft] = useState<CustomersFilters>({
    Name: '',

  });
  const [filters, setFilters] = useState<CustomersFilters>(filtersDraft);

  const { data: customers, isLoading } = useCustomersListQuery(paginationModel.page, filters, sortModel)

  const columns = [
    {
      field: 'fullname',
      headerName: t('fullname', { ns: 'customers' }),
      editable: false,
      hideable: false,
      type: 'string',
      flex: 1,
      valueGetter: (_value: any, row: TCustomerList) => row.firstName + ' ' + row.middleName + ' ' + row.lastName,
    },

    {
      field: 'company',
      headerName: t('company', { ns: 'customers' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
    },
    {
      field: 'mobileNumber',
      headerName: t('mobileNumber', { ns: 'customers' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
    },
    {
      field: 'email',
      headerName: t('email', { ns: 'customers' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
    },
    {
      field: 'address',
      headerName: t('address', { ns: 'customers' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value: any, row: TCustomerList) => row.city + ' ' + row.street + ' ' + row.houseNumber + ' ' + row.zipCode,
    },
    {
      field: 'type',
      headerName: t('type', { ns: 'customers' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value: any, row: TCustomerList) => row.type,
    },
    {
      field: 'subscriptionValidity',
      headerName: t('subscriptionValidity', { ns: 'customers' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value: any, row: TCustomerList) => dateTimeFormat(row.subscriptionValidity),
    },
    {
      field: 'dailyQueries',
      headerName: t('dailyQueries', { ns: 'customers' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
    },

    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      hideable: false,
      getActions: (params: GridRenderCellParams) => [
        <AppActionButton type='duplicate' onClick={() => {
          // navigate({ to: '/customers/$id', params: { id: params.row.id } })
        }} />,
        <AppActionButton
          type='delete'
          onClick={() => {
            // setSendingOpinionId(params.row.id)
            // sendOpinion(params.row.id)
          }}
        />
      ],
    },
  ]

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
            {t('title', { ns: 'customers' })}
          </Typography>
        </Box>
        <Box>
          <Button variant='contained' onClick={() => {
            navigate({ to: '/customers/new' })
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
        <CustomerFilter
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
          rows={customers?.data ?? []}
          columns={columns as GridColDef<TCustomerList>[]}
          rowCount={customers?.totalRowsNumber ?? 0}
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
          pageSizeOptions={[20]}
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