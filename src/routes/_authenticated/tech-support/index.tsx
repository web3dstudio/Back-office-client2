import { createFileRoute, useNavigate } from '@tanstack/react-router'
import StyledPaper from '../../../components/StyledPaper'
import { useSupportArticlesQuery } from '../../../query/supportArticles.query'
import { useTranslation } from 'react-i18next'
import { useState, useMemo } from 'react'
import type { TSupportArticle } from '../../../types'
import AppActionButton from '../../../components/AppActionButton'
import { Box, Typography, Grid, Button } from '@mui/material'
import AppBackBtn from '../../../components/AppBackBtn'
import AppDataTable from '../../../components/AppDataTable'
import type { ColumnDef, SortingState, PaginationState } from '@tanstack/react-table'

export const Route = createFileRoute('/_authenticated/tech-support/')({
  component: TechSupportPage,
})

function TechSupportPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const [sorting, setSorting] = useState<SortingState>([])

  const { data: articles, isLoading } = useSupportArticlesQuery(
    pagination.pageIndex,
    {},
    sorting.map(s => ({ field: s.id, sort: s.desc ? 'desc' : 'asc' }))
  )

  const columns = useMemo<ColumnDef<TSupportArticle>[]>(
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
                // TODO: Navigate to edit page when route is created
                console.log('Edit article:', row.original.id)
              }}
            />
            <AppActionButton
              type='delete'
              onClick={() => {
                console.log('Delete article:', row.original.id)
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
            <Button
              variant="contained"
              onClick={() => {
                navigate({ to: '/tech-support/new' })
              }}
            >
              {t('add', { ns: 'techSupport' })}
            </Button>
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
            />
          </StyledPaper>
        </Grid>
      </Grid>
    </>
  )
}
