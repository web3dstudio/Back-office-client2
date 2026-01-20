import { createFileRoute } from '@tanstack/react-router'
import { Box, Chip } from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import ErrorIcon from '@mui/icons-material/Error'
import { useReportsCustomersQuery, useCustomerRenewalMutation, useCustomerExclusionMutation } from '../../../../query/reportsCustomers.query'
import { useState, useMemo } from 'react'
import AppLoading from '../../../../components/AppLoading'
import AppError from '../../../../components/AppError'
import StyledPaper from '../../../../components/StyledPaper'
import AppDataTable from '../../../../components/AppDataTable'
import type { ColumnDef, SortingState, PaginationState } from '@tanstack/react-table'
import type { TCustomer } from '../../../../types'
import { useTranslation } from 'react-i18next'
import { useDateTimeFormat } from '../../../../hooks/useDateTimeFormat'
import AppActionButton from '../../../../components/AppActionButton'
import AppConfirmDialog from '../../../../components/AppDialog/AppConfirmDialog'

export const Route = createFileRoute('/_authenticated/reports/subscription/')({
  component: SubscriptionPage,
})

function SubscriptionPage() {
  const { t } = useTranslation()
  const dateTimeFormat = useDateTimeFormat()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [sorting, setSorting] = useState<SortingState>([])

  const page = pagination.pageIndex + 1
  const { data: customers, isLoading, error } = useReportsCustomersQuery({ page, pageSize: pagination.pageSize })
  const { mutate: renewCustomer, isPending: isRenewing } = useCustomerRenewalMutation()
  const { mutate: excludeCustomer, isPending: isExcluding } = useCustomerExclusionMutation()
  const [openRenewalDialog, setOpenRenewalDialog] = useState(false)
  const [openExclusionDialog, setOpenExclusionDialog] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)

  const rows = useMemo<TCustomer[]>(() => {
    return Array.isArray(customers?.data) ? customers.data : []
  }, [customers])

  const columns = useMemo<ColumnDef<TCustomer>[]>(
    () => [
      {
        id: 'name',
        header: t('name', { ns: 'customerReports' }),
        enableSorting: true,
        enableHiding: true,
        size: 200,
        minSize: 150,
        maxSize: 300,
        cell: ({ row }) => {
          const parts = [row.original.firstName, row.original.middleName, row.original.lastName].filter(Boolean)
          return parts.join(' ')
        },
      },
      {
        accessorKey: 'company',
        header: t('company', { ns: 'customerReports' }),
        enableSorting: true,
        enableHiding: true,
        size: 150,
        minSize: 100,
        maxSize: 200,
      },
      {
        accessorKey: 'mobileNumber',
        header: t('phone', { ns: 'customerReports' }),
        enableSorting: true,
        enableHiding: true,
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: 'email',
        header: t('email', { ns: 'customerReports' }),
        enableSorting: true,
        enableHiding: true,
        size: 200,
        minSize: 150,
        maxSize: 300,
      },
      {
        id: 'address',
        header: t('address', { ns: 'customerReports' }),
        enableSorting: true,
        enableHiding: true,
        size: 250,
        minSize: 200,
        maxSize: 350,
        cell: ({ row }) => {
          const parts = [row.original.city, row.original.street, row.original.houseNumber, row.original.zipCode].filter(Boolean)
          return parts.join(' ')
        },
      },
      {
        accessorKey: 'subscriptionValidity',
        header: t('subValidity', { ns: 'customerReports' }),
        enableSorting: true,
        enableHiding: true,
        size: 150,
        minSize: 120,
        maxSize: 200,
        cell: ({ row }) => {
          const validity = row.original.subscriptionValidity
          const exclusion = row.original.subscriptionExclusion

          // Если клиент исключен из подписки
          if (exclusion === true) {
            return (
              <Chip
                icon={<BlockIcon />}
                label={t('exclusion', { ns: 'customerReports' })}
                color="default"
                size="small"
              />
            )
          }

          // Если дата не установлена
          if (!validity) {
            return dateTimeFormat(validity)
          }

          // Проверяем, прошла ли дата (сравниваем только дату, без времени)
          try {
            const validityDate = new Date(validity)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            validityDate.setHours(0, 0, 0, 0)

            // Если дата меньше сегодняшней - подписка истекла
            if (validityDate < today) {
              return (
                <Chip
                  icon={<ErrorIcon />}
                  label={t('expired', { ns: 'customerReports' })}
                  color="error"
                  size="small"
                />
              )
            }
          } catch (error) {
            // Если не удалось распарсить дату, показываем как есть
            return dateTimeFormat(validity)
          }

          // Иначе показываем отформатированную дату
          return dateTimeFormat(validity)
        },
      },
      {
        accessorKey: 'dailyQueries',
        header: t('maxQueries', { ns: 'customerReports' }),
        enableSorting: true,
        enableHiding: true,
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        id: 'actions',
        header: t('actions', { ns: 'common' }),
        enableSorting: false,
        enableHiding: false,
        size: 100,
        minSize: 100,
        maxSize: 100,
        meta: { align: 'right' },
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'end' }}>
            <AppActionButton
              type="refresh"
              onClick={() => {
                setSelectedCustomerId(row.original.id)
                setOpenRenewalDialog(true)
              }}
              loading={isRenewing}
              disabled={isExcluding}
            />
            <AppActionButton
              type="block"
              onClick={() => {
                setSelectedCustomerId(row.original.id)
                setOpenExclusionDialog(true)
              }}
              disabled={isRenewing || isExcluding}
              loading={isExcluding}
            />
          </Box>
        ),
      },
    ],
    [t, dateTimeFormat, isRenewing, isExcluding, setOpenRenewalDialog, setOpenExclusionDialog, setSelectedCustomerId]
  )

  return (
    <Box>
      <StyledPaper sx={{ mt: 3 }}>
        {isLoading ? (
          <AppLoading />
        ) : error ? (
          <AppError error={error} />
        ) : (
          <AppDataTable
            tableName="subscription"
            data={rows}
            columns={columns}
            isLoading={isLoading}
            manualPagination={true}
            sorting={sorting}
            onSortingChange={setSorting}
            pagination={pagination}
            onPaginationChange={setPagination}
            totalPages={customers?.totalPagesNumber ?? 1}
            currentPage={customers?.currentPageNumber ?? pagination.pageIndex + 1}
          />
        )}
      </StyledPaper>

      <AppConfirmDialog
        open={openRenewalDialog}
        onClose={() => {
          setOpenRenewalDialog(false)
          setSelectedCustomerId(null)
        }}
        onSubmit={() => {
          if (selectedCustomerId) {
            renewCustomer(selectedCustomerId, {
              onSuccess: () => {
                setOpenRenewalDialog(false)
                setSelectedCustomerId(null)
              },
            })
          }
        }}
        title={t('modals.approveDelete', { ns: 'common' })}
        isPending={isRenewing}
        confirmText={t('modals.save', { ns: 'common' })}
        confirmColor="primary"
      />

      <AppConfirmDialog
        open={openExclusionDialog}
        onClose={() => {
          setOpenExclusionDialog(false)
          setSelectedCustomerId(null)
        }}
        onSubmit={() => {
          if (selectedCustomerId) {
            excludeCustomer(selectedCustomerId, {
              onSuccess: () => {
                setOpenExclusionDialog(false)
                setSelectedCustomerId(null)
              },
            })
          }
        }}
        title={t('modals.approveDelete', { ns: 'common' })}
        isPending={isExcluding}
        confirmText={t('modals.delete', { ns: 'common' })}
        confirmColor="error"
      />
    </Box>
  )
}
