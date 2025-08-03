import { createFileRoute } from '@tanstack/react-router'
import { useCarsQuery } from '../../../query/car.query'
import { useDateTimeFormat } from '../../../hooks/useDateTimeFormat'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import type { TCarsList, } from '../../../types'
import { useLocalStorage } from '../../../hooks/useLocalStorage'
import { DataGrid, type GridColDef, type GridPaginationModel, type GridRenderCellParams, type GridSortModel } from '@mui/x-data-grid'
import AppActionButton from '../../../components/AppActionButton'
import { Box, Typography } from '@mui/material'
import { Grid } from '@mui/material'
import AppBackBtn from '../../../components/AppBackBtn'
import StyledPaper from '../../../components/StyledPaper'


export const Route = createFileRoute('/_authenticated/catalog/')({
  component: CatalogPage,
})

function CatalogPage() {
  const { t } = useTranslation()
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selected, setSelected] = useState<TCarsList | null>(null)
  const dateTimeFormat = useDateTimeFormat()

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useLocalStorage('carsTable', {});

  const { data: cars, isLoading } = useCarsQuery(paginationModel.page, {}, sortModel)



  const columns = [
    {
      field: 'manufacturer',
      headerName: t('manufacturer', { ns: 'carCatalog' }),
      editable: false,
      sortable: true,
      hideable: true,
      type: 'string',
      flex: 1,
    },
    {
      field: 'modelCode',
      headerName: t('modelCode', { ns: 'carCatalog' }),
      editable: false,
      sortable: true,
      hideable: true,
      type: 'string',
      flex: 1,
    },

    {
      field: 'model',
      headerName: t('model', { ns: 'carCatalog' }),
      editable: false,
      sortable: true,
      hideable: true,
      type: 'string',
      flex: 1,
    },

    {
      field: 'year',
      headerName: t('year', { ns: 'carCatalog' }),
      editable: false,
      sortable: true,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value: any, row: TCarsList) =>
        row.fromYear === row.toYear ? row.fromYear.toString() : `${row.fromYear} - ${row.toYear}`,
    },
    {
      field: 'volume',
      headerName: t('vol', { ns: 'carCatalog' }),
      editable: false,
      sortable: true,
      hideable: true,
      type: 'string',
      flex: 1,
    },
    {
      field: 'gearbox',
      headerName: t('gearbox', { ns: 'carCatalog' }),
      editable: false,
      sortable: true,
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
      sortable: false,
      getActions: (params: GridRenderCellParams) => [
        <AppActionButton type='view' onClick={() => {

        }} />,

        // <AppActionButton type='download' onClick={() => {
        //   // navigate({
        //   //   to: '/customers/new',
        //   //   search: { duplicateId: params.row.id }
        //   // })
        // }} />,
        // <AppActionButton
        //   type='delete'
        //   onClick={() => {
        //     setSelected(() => params.row)
        //     setOpenConfirmDialog(true)
        //   }}
        // />
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
            {t('catalog', { ns: 'carCatalog' })}
          </Typography>
        </Box>
        {/* <Box>
            <Button variant='contained' onClick={() => {
              navigate({ to: '/opinions/new' })
            }

            }>
              {t('modals.add', { ns: 'common' })}
            </Button>
          </Box> */}
      </Grid>
      <StyledPaper sx={{
        borderRadius: '24px',
        overflow: 'hidden',
        padding: 3,
        width: '100%',
        display: 'flex',
        gap: 2,
      }}>
        {/* <OpinionsFilter
          filters={filtersDraft}
          setFilters={setFiltersDraft}
          onSearch={() => {
            setFilters(filtersDraft);
            setPaginationModel(model => ({ ...model, page: 0 })); // сбросить страницу при поиске
          }}
        /> */}
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
          rows={cars?.data ?? []}
          columns={columns as GridColDef<TCarsList>[]}
          rowCount={cars?.totalRowsNumber ?? 0}
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

export default CatalogPage