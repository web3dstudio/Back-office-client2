import { createFileRoute, useNavigate } from '@tanstack/react-router'
import StyledPaper from '../../../components/StyledPaper'
import { useUsersQuery, useDeleteUserMutation } from '../../../query/users.query'
import { useTranslation } from 'react-i18next'
import { useState, useMemo } from 'react'
import type { IUser } from '../../../query/users.query'
import AppActionButton from '../../../components/AppActionButton'
import { Box, Typography, Grid, Button } from '@mui/material'
import AppBackBtn from '../../../components/AppBackBtn'
import AppDataTable from '../../../components/AppDataTable'
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog'
import type { ColumnDef, SortingState, PaginationState } from '@tanstack/react-table'

export const Route = createFileRoute('/_authenticated/users/')({
  component: UsersPage,
})

function UsersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const [sorting, setSorting] = useState<SortingState>([])
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null)

  const { data: users, isLoading } = useUsersQuery(
    pagination.pageIndex,
    {},
    sorting.map(s => ({ field: s.id, sort: s.desc ? 'desc' : 'asc' }))
  )
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUserMutation()

  const handleDeleteUser = () => {
    if (selectedUser?.id) {
      deleteUser(selectedUser.id, {
        onSuccess: () => {
          setOpenConfirmDialog(false)
          setSelectedUser(null)
        },
      })
    }
  }

  const columns = useMemo<ColumnDef<IUser>[]>(
    () => [
      {
        id: 'fullname',
        header: t('fullName', { ns: 'users' }),
        enableSorting: true,
        enableHiding: false,
        size: 200,
        minSize: 150,
        maxSize: 300,
        cell: ({ row }) => `${row.original.firstName || ''} ${row.original.lastName || ''}`.trim(),
      },
      {
        accessorKey: 'userName',
        header: t('userName', { ns: 'users' }),
        enableSorting: true,
        enableHiding: true,
        size: 150,
        minSize: 100,
        maxSize: 200,
      },
      {
        accessorKey: 'mobileNumber',
        header: t('phone', { ns: 'users' }),
        enableSorting: true,
        enableHiding: true,
        size: 150,
        minSize: 100,
        maxSize: 200,
      },
      {
        accessorKey: 'email',
        header: t('email', { ns: 'users' }),
        enableSorting: true,
        enableHiding: true,
        size: 200,
        minSize: 150,
        maxSize: 300,
      },
      {
        accessorKey: 'address',
        header: t('address', { ns: 'users' }),
        enableSorting: true,
        enableHiding: true,
        size: 200,
        minSize: 150,
        maxSize: 300,
      },
      {
        accessorKey: 'position',
        header: t('position', { ns: 'users' }),
        enableSorting: true,
        enableHiding: true,
        size: 150,
        minSize: 100,
        maxSize: 200,
      },
      {
        accessorKey: 'department',
        header: t('department', { ns: 'users' }),
        enableSorting: true,
        enableHiding: true,
        size: 150,
        minSize: 100,
        maxSize: 200,
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
            <AppActionButton
              type='edit'
              onClick={() => {
                navigate({ to: '/users/$id', params: { id: row.original.id } })
              }}
            />
            <AppActionButton
              type='duplicate'
              onClick={() => {
                console.log('Duplicate user:', row.original.id)
              }}
            />
            <AppActionButton
              type='delete'
              onClick={() => {
                setSelectedUser(row.original)
                setOpenConfirmDialog(true)
              }}
            />
          </Box>
        ),
      },
    ],
    [t]
  )

  return (
    <>
      <Grid container spacing={3}>
        <Grid size={12}>
          <AppBackBtn children={t('back', { ns: 'common' })} />
        </Grid>
        <Grid size={12}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
              {t('title', { ns: 'users' })}
            </Typography>
          </Box>
        </Grid>

        <StyledPaper
          sx={{
            borderRadius: '24px',
            overflow: 'hidden',
            padding: 3,
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 600, color: 'primary.main' }}
            >
              {users?.totalRowsNumber ?? 0}
            </Typography>
            <Typography variant="body1">
              {t('totalUsers', { ns: 'users' })}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => {
              navigate({ to: '/users/new' })
            }}
          >
            {t('add', { ns: 'users' })}
          </Button>
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
            tableName="users"
            data={users?.data ?? []}
            columns={columns}
            isLoading={isLoading}
            manualPagination={true}
            sorting={sorting}
            onSortingChange={setSorting}
            pagination={pagination}
            onPaginationChange={setPagination}
            totalPages={users?.totalPagesNumber ?? 1}
            currentPage={users?.currentPageNumber ?? pagination.pageIndex + 1}
          />
        </StyledPaper>
      </Grid>

      <AppConfirmDialog
        open={openConfirmDialog}
        onClose={() => {
          setOpenConfirmDialog(false)
          setSelectedUser(null)
        }}
        onSubmit={handleDeleteUser}
        title={t('modals.approveDelete', { ns: 'common' })}
        isPending={isDeleting}
      />
    </>
  )
}
