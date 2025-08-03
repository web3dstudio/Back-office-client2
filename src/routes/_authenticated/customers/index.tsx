import { createFileRoute, useNavigate } from '@tanstack/react-router'
import StyledPaper from '../../../components/StyledPaper'
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import type { TCustomerList, TCustomerType } from '../../../types';
import { DataGrid, type GridColDef, type GridPaginationModel, type GridRenderCellParams, type GridSortModel, } from '@mui/x-data-grid';
import AppActionButton from '../../../components/AppActionButton';
import { useDateTimeFormat } from '../../../hooks/useDateTimeFormat'
import { Box, Button, Grid, Typography } from '@mui/material';
import AppBackBtn from '../../../components/AppBackBtn';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { useCustomersDeleteMutation, useCustomersListQuery } from '../../../query/customers.query';
import CustomerFilter from '../../../components/Customers/CustomerFilter';
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog';

export const Route = createFileRoute('/_authenticated/customers/')({
  component: CustomersPage,
})

export type CustomersFilters = {
  Fullname: string,
  CustomerTypeIds: string[]
}

function CustomersPage() {
  const { t } = useTranslation()
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selected, setSelected] = useState<TCustomerList | null>(null)

  const dateTimeFormat = useDateTimeFormat()
  const navigate = useNavigate({ from: '/customers' })


  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useLocalStorage('customersTable', {});

  const [filtersDraft, setFiltersDraft] = useState<CustomersFilters>({
    Fullname: '',
    CustomerTypeIds: [],
  });
  const [filters, setFilters] = useState<CustomersFilters>(filtersDraft);

  const { data: customers, isLoading } = useCustomersListQuery(paginationModel.page, {
    Fullname: filters.Fullname,
    CustomerTypeIds: filters.CustomerTypeIds.join(',')
  }, sortModel)
  const { mutate: deleteCustomer, isPending: isDeleting } = useCustomersDeleteMutation()

  const handleDeleteCustomer = () => {
    if (selected?.id) {
      deleteCustomer(selected?.id, {
        onSuccess: () => {
          setOpenConfirmDialog(false)
          setSelected(null)
        }
      })
    }
  }

  const columns = [
    {
      field: 'fullname',
      headerName: t('fullName', { ns: 'customers' }),
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
      headerName: t('mobile', { ns: 'customers' }),
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
      valueGetter: (_value: any, row: TCustomerList) => row.customerTypes.map((type: TCustomerType) => type.name).join(', '),
    },
    {
      field: 'subscriptionValidity',
      headerName: t('subValidity', { ns: 'customers' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value: any, row: TCustomerList) => dateTimeFormat(row.subscriptionValidity),
    },
    {
      field: 'dailyQueries',
      headerName: t('queries', { ns: 'customers' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 140,
      hideable: false,
      getActions: (params: GridRenderCellParams) => [
        <AppActionButton type='edit' onClick={() => {
          navigate({ to: '/customers/$id', params: { id: params.row.id } })
        }} />,
        <AppActionButton type='duplicate' onClick={() => {
          navigate({
            to: '/customers/new',
            search: { duplicateId: params.row.id }
          })
        }} />,
        <AppActionButton
          type='delete'
          onClick={() => {
            setSelected(() => params.row)
            setOpenConfirmDialog(true)
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

    <AppConfirmDialog
      open={openConfirmDialog}
      onClose={() => setOpenConfirmDialog(false)}
      onSubmit={handleDeleteCustomer}
      title={t('modals.approveDelete', { ns: 'common' })}
      isPending={isDeleting}
    />
  </>)
}