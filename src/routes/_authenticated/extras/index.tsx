import { createFileRoute } from '@tanstack/react-router'
import StyledPaper from '../../../components/StyledPaper'
import {
  useExtrasAddMutation,
  useExtrasDeleteMutation,
  useExtrasQuery,
  useExtrasUpdateMutation
} from '../../../query/extras.query'
import { Box, Button, Grid, Typography } from '@mui/material'
import AppDataTable from '../../../components/AppDataTable'
import type { TExtra } from '../../../types'
import { type ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import AppActionButton from '../../../components/AppActionButton'
import { useState, useMemo } from 'react'
import { type SortingState, type PaginationState } from '@tanstack/react-table'
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog'
import AppDialog from '../../../components/AppDialog/AppDialog'
import AppBackBtn from '../../../components/AppBackBtn'
import AppError from '../../../components/AppError'
import ExtrasForm from '../../../components/Extras/IntegralExtrasForm'
import { useIconsQuery } from '../../../query/icons.query'


export const Route = createFileRoute('/_authenticated/extras/')({
  component: IntegralExtrasPage,
})

function IntegralExtrasPage() {
  const { t } = useTranslation()
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selected, setSelected] = useState<TExtra | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const { data: extras, isLoading, isError } = useExtrasQuery()
  const { data: icons } = useIconsQuery()
  const { mutate: addMutation } = useExtrasAddMutation()
  const { mutate: updateMutation } = useExtrasUpdateMutation()
  const { mutate: deleteMutation, isPending: isDeleting } = useExtrasDeleteMutation()

  const columns = useMemo<ColumnDef<TExtra>[]>(() => [
    {
      id: 'icon',
      header: t('icon', { ns: 'extras' }),
      enableSorting: false,
      enableHiding: true,
      size: 70,
      cell: ({ row }) => {
        const iconId = (row.original as any)?.iconId as string | null | undefined
        const iconInline = (row.original as any)?.icon as string | null | undefined
        const iconSrc =
          iconInline ||
          (iconId ? (icons || []).find(i => i.id === iconId)?.downloadUri : null) ||
          null

        if (!iconSrc) return null
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <img src={iconSrc} alt="icon" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          </Box>
        )
      },
    },
    {
      accessorKey: 'name',
      header: t('name', { ns: 'extras' }),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'nameEn',
      header: t('nameEn', { ns: 'extras' }),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'defaultChangePercentage',
      header: t('defaultChangePercentage', { ns: 'extras' }),
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: 'actions',
      header: t('actions', { ns: 'extras' }),
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      size: 80,
      meta: {
        align: 'right'
      },
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'end' }}>
          <AppActionButton type='edit' onClick={() => {
            setSelected(row.original)
            setOpenFormDialog(true)
          }} />
          <AppActionButton type='delete' onClick={() => {
            setSelected(row.original)
            setOpenConfirmDialog(true)
          }} />
        </Box>
      ),
    }
  ], [t, icons])

  const onSubmit = (data: TExtra) => {
    if (selected) {
      updateMutation({ ...data, id: selected.id }, {
        onSuccess: () => {
          setOpenFormDialog(false)
        }
      })
    } else {
      addMutation(data, {
        onSuccess: () => {
          setOpenFormDialog(false)
        }
      })
    }
  }

  const onDelete = () => {
    if (selected) {
      deleteMutation(selected?.id)
    }
    setOpenConfirmDialog(false)
  }

  if (isError && !isLoading) {
    return <AppError />
  }

  return (
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
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {t('title', { ns: 'extras' })}
          </Typography>
        </Box>
        <Box>
          <Button variant='contained' onClick={() => {
            setSelected(null)
            setOpenFormDialog(true)
          }

          }>
            {t('modals.add', { ns: 'common' })}
          </Button>
        </Box>
      </Grid>

      <StyledPaper
        sx={{
          overflow: 'hidden',
          padding: 3,
          display: 'flex',
          gap: 2,
        }}
      >
        <AppDataTable
          tableName='extras'
          data={extras ?? []}
          columns={columns}
          isLoading={isLoading}
          manualPagination={false}
          sorting={sorting}
          onSortingChange={setSorting}
          pagination={pagination}
          onPaginationChange={setPagination}
          totalPages={Math.ceil((extras?.length || 0) / pagination.pageSize) || 1}
        />
      </StyledPaper>

      <AppConfirmDialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        onSubmit={onDelete}
        title={t('modals.approveDelete', { ns: 'common' })}
        isPending={isDeleting}
      />

      <AppDialog
        open={openFormDialog}
        onClose={() => setOpenFormDialog(false)}
        title={selected ? t('modals.edit', { ns: 'common' }) : t('modals.add', { ns: 'common' })}
        maxWidth='sm'
      >
        <ExtrasForm
          data={selected}
          isPending={false}
          onCancel={() => setOpenFormDialog(false)}
          onConfirm={(data) => onSubmit(data)}
        />
      </AppDialog>
    </Grid>
  )
}

