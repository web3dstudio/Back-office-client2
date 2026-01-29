import { createFileRoute, useNavigate } from '@tanstack/react-router'
import StyledPaper from '../../../components/StyledPaper'
import { useSupportArticlesQuery, useSupportArticleDeleteMutation } from '../../../query/supportArticles.query'
import { useTranslation } from 'react-i18next'
import { useState, useMemo } from 'react'
import type { TSupportArticleList } from '../../../types'
import AppActionButton from '../../../components/AppActionButton'
import { Box, Typography, Grid } from '@mui/material'
import LinkButton from '../../../components/LinkButton'
import AppBackBtn from '../../../components/AppBackBtn'
import AppDataTable from '../../../components/AppDataTable'
import type { ColumnDef, SortingState, PaginationState } from '@tanstack/react-table'
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog'
import { useDateTimeFormat } from '../../../hooks/useDateTimeFormat'

export const Route = createFileRoute('/_authenticated/tech-support/')({
  component: TechSupportPage,
})

function TechSupportPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dateTimeFormat = useDateTimeFormat()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const [sorting, setSorting] = useState<SortingState>([])
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)

  const { data: articles, isLoading } = useSupportArticlesQuery(
    pagination.pageIndex,
    {},
    sorting.map(s => ({ field: s.id, sort: s.desc ? 'desc' : 'asc' }))
  )

  const { mutate: deleteArticle, isPending: isDeleting } = useSupportArticleDeleteMutation()

  const handleDelete = () => {
    if (selectedArticleId) {
      deleteArticle(selectedArticleId)
      setOpenConfirmDialog(false)
      setSelectedArticleId(null)
    }
  }

  const columns = useMemo<ColumnDef<TSupportArticleList>[]>(
    () => [
      {
        accessorKey: 'title',
        header: t('name', { ns: 'techSupport' }),
        enableSorting: true,
        enableHiding: false,
        size: 300,
        minSize: 200,
        maxSize: 400,
      },
      {
        accessorKey: 'categoryName',
        header: t('category', { ns: 'techSupport' }),
        enableSorting: true,
        enableHiding: true,
        size: 200,
        minSize: 150,
        maxSize: 300,
      },
      {
        accessorKey: 'application',
        header: t('application', { ns: 'techSupport' }),
        enableSorting: true,
        enableHiding: true,
        size: 150,
        minSize: 100,
        maxSize: 200,
        cell: ({ row }) => {
          const applicationId = row.original.application
          return t(String(applicationId), { ns: 'newSupportArticle' })
        },
      },
      {
        accessorKey: 'updatedAt',
        header: t('updatedAt', { ns: 'techSupport' }) || 'Updated At',
        enableSorting: true,
        enableHiding: true,
        size: 150,
        minSize: 120,
        maxSize: 200,
        cell: ({ row }) => {
          return row.original.updatedAt ? dateTimeFormat(row.original.updatedAt) : '–'
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
            <AppActionButton
              type='edit'
              onClick={() => {
                navigate({ to: `/tech-support/${row.original.id}` })
              }}
            />
            <AppActionButton
              type='delete'
              onClick={() => {
                setSelectedArticleId(row.original.id)
                setOpenConfirmDialog(true)
              }}
            />
          </Box>
        ),
      },
    ],
    [t, navigate]
  )

  return (
    <>
      <Grid container spacing={3}>
        <Grid size={12}>
          <AppBackBtn children={t('back', { ns: 'common' })} />
        </Grid>
        <Grid size={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
              {t('title', { ns: 'techSupport' })}
            </Typography>
            <LinkButton to="/tech-support/new" variant="contained">
              {t('add', { ns: 'techSupport' })}
            </LinkButton>
          </Box>
        </Grid>

        <Grid size={12}>
          <StyledPaper
            sx={{
              borderRadius: '24px',
              overflow: 'hidden',
              padding: 3,
              width: '100%',
            }}
          >
            <AppDataTable
              data={articles?.data || []}
              columns={columns}
              isLoading={isLoading}
              pagination={pagination}
              onPaginationChange={setPagination}
              sorting={sorting}
              onSortingChange={setSorting}
              totalPages={articles?.totalPagesNumber ?? 1}
              currentPage={articles?.currentPageNumber ?? pagination.pageIndex + 1}
              manualPagination={true}
              globalFilterFn={(row, _columnId, filterValue) => {
                const titleMatch = row.original.title?.toLowerCase().includes(filterValue.toLowerCase()) || false
                const categoryMatch = row.original.categoryName?.toLowerCase().includes(filterValue.toLowerCase()) || false
                const applicationMatch = t(String(row.original.application), { ns: 'newSupportArticle' })?.toLowerCase().includes(filterValue.toLowerCase()) || false
                return titleMatch || categoryMatch || applicationMatch
              }}
            />
          </StyledPaper>
        </Grid>
      </Grid>

      <AppConfirmDialog
        open={openConfirmDialog}
        onClose={() => {
          setOpenConfirmDialog(false)
          setSelectedArticleId(null)
        }}
        onSubmit={handleDelete}
        title={t('modals.approveDelete', { ns: 'common' })}
        isPending={isDeleting}
      />
    </>
  )
}
