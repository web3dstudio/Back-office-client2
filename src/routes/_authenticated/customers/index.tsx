import { createFileRoute, useNavigate } from '@tanstack/react-router'
import StyledPaper from '../../../components/StyledPaper'
import { useTranslation } from 'react-i18next';
import { useState, useMemo } from 'react';
import type { TCustomerList, TCustomerType } from '../../../types';
import AppActionButton from '../../../components/AppActionButton';
import { useDateTimeFormat } from '../../../hooks/useDateTimeFormat'
import { Box, Button, Grid, Typography } from '@mui/material';
import AppBackBtn from '../../../components/AppBackBtn';
import { useCustomersDeleteMutation, useCustomersListQuery } from '../../../query/customers.query';
import CustomerFilter from '../../../components/Customers/CustomerFilter';
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog';
import AppDataTable from '../../../components/AppDataTable';
import type { ColumnDef, SortingState, PaginationState } from '@tanstack/react-table';

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


  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const [sorting, setSorting] = useState<SortingState>([]);

  const [filtersDraft, setFiltersDraft] = useState<CustomersFilters>({
    Fullname: '',
    CustomerTypeIds: [],
  });
  const [filters, setFilters] = useState<CustomersFilters>(filtersDraft);

  const { data: customers, isLoading } = useCustomersListQuery(pagination.pageIndex, {
    Fullname: filters.Fullname,
    CustomerTypeIds: filters.CustomerTypeIds.join(',')
  }, sorting.map(s => ({ field: s.id, sort: s.desc ? 'desc' : 'asc' })))
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

  const columns = useMemo<ColumnDef<TCustomerList>[]>(
    () => [
      {
        accessorKey: 'fullname',
        header: t('fullName', { ns: 'customers' }),
        enableSorting: true,
        enableHiding: false,
        size: 200,
        minSize: 150,
        maxSize: 300,
        cell: ({ row }) => row.original.firstName + ' ' + row.original.middleName + ' ' + row.original.lastName,
      },
      {
        accessorKey: 'company',
        header: t('company', { ns: 'customers' }),
        enableSorting: true,
        enableHiding: true,
        size: 150,
        minSize: 100,
        maxSize: 200,
      },
      {
        accessorKey: 'mobileNumber',
        header: t('mobile', { ns: 'customers' }),
        enableSorting: true,
        enableHiding: true,
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: 'email',
        header: t('email', { ns: 'customers' }),
        enableSorting: true,
        enableHiding: true,
        size: 200,
        minSize: 150,
        maxSize: 300,
      },
      {
        accessorKey: 'address',
        header: t('address', { ns: 'customers' }),
        enableSorting: true,
        enableHiding: true,
        size: 250,
        minSize: 200,
        maxSize: 350,
        cell: ({ row }) => row.original.city + ' ' + row.original.street + ' ' + row.original.houseNumber + ' ' + row.original.zipCode,
      },
      {
        accessorKey: 'type',
        header: t('type', { ns: 'customers' }),
        enableSorting: true,
        enableHiding: true,
        size: 150,
        minSize: 100,
        maxSize: 200,
        cell: ({ row }) => row.original.customerTypes.map((type: TCustomerType) => type.name).join(', '),
      },
      {
        accessorKey: 'subscriptionValidity',
        header: t('subValidity', { ns: 'customers' }),
        enableSorting: true,
        enableHiding: true,
        size: 120,
        minSize: 100,
        maxSize: 150,
        cell: ({ row }) => dateTimeFormat(row.original.subscriptionValidity),
      },
      {
        accessorKey: 'dailyQueries',
        header: t('queries', { ns: 'customers' }),
        enableSorting: true,
        enableHiding: true,
        size: 100,
        minSize: 80,
        maxSize: 120,
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
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'end' }}>
            <AppActionButton type='edit' onClick={() => {
              navigate({ to: '/customers/$id', params: { id: row.original.id } })
            }} />
            <AppActionButton type='duplicate' onClick={() => {
              navigate({
                to: '/customers/new',
                search: { duplicateId: row.original.id }
              })
            }} />
            <AppActionButton
              type='delete'
              onClick={() => {
                setSelected(() => row.original)
                setOpenConfirmDialog(true)
              }}
            />
          </Box>
        ),
      },
    ],
    [t, dateTimeFormat, navigate]
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
          tableName='customers'
          data={customers?.data ?? []}
          columns={columns}
          isLoading={isLoading}
          manualPagination={true}
          sorting={sorting}
          onSortingChange={setSorting}
          pagination={pagination}
          onPaginationChange={setPagination}
          totalPages={customers?.totalPagesNumber ?? 1}
          currentPage={customers?.currentPageNumber ?? pagination.pageIndex + 1}
          globalFilterFn={(row, _columnId, filterValue) => {
            const fullnameMatch = (row.original.firstName + ' ' + row.original.middleName + ' ' + row.original.lastName).toLowerCase().includes(filterValue.toLowerCase())
            const companyMatch = row.original.company?.toString().toLowerCase().includes(filterValue.toLowerCase()) || false
            const mobileMatch = row.original.mobileNumber?.toString().toLowerCase().includes(filterValue.toLowerCase()) || false
            const emailMatch = row.original.email?.toString().toLowerCase().includes(filterValue.toLowerCase()) || false
            const addressMatch = (row.original.city + ' ' + row.original.street + ' ' + row.original.houseNumber + ' ' + row.original.zipCode).toLowerCase().includes(filterValue.toLowerCase())
            const typeMatch = row.original.customerTypes.map((type: TCustomerType) => type.name).join(', ').toLowerCase().includes(filterValue.toLowerCase())
            const queriesMatch = row.original.dailyQueries?.toString().toLowerCase().includes(filterValue.toLowerCase()) || false
            return fullnameMatch || companyMatch || mobileMatch || emailMatch || addressMatch || typeMatch || queriesMatch
          }}
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