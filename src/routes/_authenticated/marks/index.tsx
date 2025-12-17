import { createFileRoute } from '@tanstack/react-router'
import StyledPaper from '../../../components/StyledPaper'
import { Box, Button, Grid, Typography } from '@mui/material'
import AppDataTable from '../../../components/AppDataTable'
import type { TMark } from '../../../types'
import { type ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import AppActionButton from '../../../components/AppActionButton'
import { useMemo, useState } from 'react'
import { type SortingState } from '@tanstack/react-table'
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog'
import AppDialog from '../../../components/AppDialog/AppDialog'
import AppBackBtn from '../../../components/AppBackBtn'
import AppError from '../../../components/AppError'
import { useIconsQuery } from '../../../query/icons.query'
import { useMarksCreateMutation, useMarksDeleteMutation, useMarksQuery, useMarksUpdateMutation } from '../../../query/marks.query'
import MarksForm from '../../../components/Marks/MarksForm'
import type { TMarkCreate, TMarkUpdate } from '../../../query/marks.query'

export const Route = createFileRoute('/_authenticated/marks/')({
  component: MarksPage,
})

function MarksPage() {
  const { t } = useTranslation()
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selected, setSelected] = useState<TMark | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  const { data: marks, isLoading, isError } = useMarksQuery()
  const { data: icons } = useIconsQuery()
  const { mutate: addMutation } = useMarksCreateMutation()
  const { mutate: updateMutation } = useMarksUpdateMutation()
  const { mutate: deleteMutation, isPending: isDeleting } = useMarksDeleteMutation()

  const columns = useMemo<ColumnDef<TMark>[]>(() => [
    {
      id: 'icon',
      header: 'Icon',
      enableSorting: false,
      enableHiding: true,
      size: 70,
      cell: ({ row }) => {
        const iconId = row.original.iconId
        const iconSrc = iconId ? (icons || []).find(i => i.id === iconId)?.downloadUri : null
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
      header: t('name', { ns: 'carMarks' }),
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      size: 80,
      meta: { align: 'right' },
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
    },
  ], [t, icons])

  const onSubmit = (payload: TMarkCreate | TMarkUpdate) => {
    if (selected) {
      updateMutation({ id: selected.id, data: payload }, { onSuccess: () => setOpenFormDialog(false) })
    } else {
      addMutation(payload, { onSuccess: () => setOpenFormDialog(false) })
    }
  }

  const onDelete = () => {
    if (selected) deleteMutation(selected.id)
    setOpenConfirmDialog(false)
  }

  if (isError && !isLoading) return <AppError />

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <AppBackBtn children={t('back', { ns: 'common' })} />
      </Grid>

      <Grid size={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {t('title', { ns: 'carMarks' })}
          </Typography>
        </Box>
        <Box>
          <Button variant='contained' onClick={() => {
            setSelected(null)
            setOpenFormDialog(true)
          }}>
            {t('modals.add', { ns: 'common' })}
          </Button>
        </Box>
      </Grid>

      <StyledPaper sx={{ overflow: 'hidden', padding: 3, display: 'flex', gap: 2 }}>
        <AppDataTable
          tableName='marks'
          data={marks ?? []}
          columns={columns}
          isLoading={isLoading}
          manualPagination={false}
          sorting={sorting}
          onSortingChange={setSorting}
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
        <MarksForm
          data={selected}
          isPending={false}
          onCancel={() => setOpenFormDialog(false)}
          onConfirm={(data) => onSubmit(data)}
        />
      </AppDialog>
    </Grid>
  )
}


