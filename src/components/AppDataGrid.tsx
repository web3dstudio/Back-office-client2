import {
  DataGrid,
  type GridColDef,
  type GridEditMode,
  type GridPaginationModel,
  type GridRowClassNameParams,
  type GridRowSelectionModel,
  type GridValidRowModel
} from '@mui/x-data-grid'
import i18next from 'i18next'
import { heIL, enUS } from '@mui/x-data-grid/locales'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useState } from 'react'
import { Box, type SxProps, Typography } from '@mui/material'


interface Props<T extends GridValidRowModel> {
  rows: T[]
  columns: GridColDef<T>[]
  isLoading: boolean
  isError?: boolean
  tableName: string
  checkboxSelection?: boolean
  onRowSelectionModelChange?: (newSelectionModel: GridRowSelectionModel) => void
  columnGroupingModel?: any,
  rowModesModel?: any,
  onRowModesModelChange?: any,
  onRowEditStop?: any,
  processRowUpdate?: any,
  editMode?: GridEditMode,
  getRowClassName?: (params: GridRowClassNameParams) => string,
  sx?: SxProps,
  hideFooterSelectedRowCount?: boolean,
  headerHeight?: number,
  initialState?: any,
  columnVisibilityModel?: any,
}

const AppDataGrid = <T extends GridValidRowModel>({
  rows,
  columns,
  isLoading,
  isError,
  tableName,
  checkboxSelection = false,
  onRowSelectionModelChange,
  columnGroupingModel,
  editMode = "row",
  rowModesModel,
  onRowModesModelChange,
  onRowEditStop,
  processRowUpdate,
  getRowClassName,
  sx,
  hideFooterSelectedRowCount = false,
  initialState,
  columnVisibilityModel,
}: Props<T>) => {
  const localeText =
    i18next.language === 'he'
      ? heIL.components.MuiDataGrid.defaultProps.localeText
      : enUS.components.MuiDataGrid.defaultProps.localeText

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  })

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel(model)
  }
  const [tableFields, setTableFields] = useLocalStorage(tableName + '_cols', {})

  const NoRowsOverlay = () => {
    return (
      <>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          {!isLoading && !isError && (
            <Typography variant='body2'>No data</Typography>
          )}
        </Box>
      </>
    )
  }

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      loading={isLoading}
      checkboxSelection={checkboxSelection}
      onRowSelectionModelChange={onRowSelectionModelChange}
      disableVirtualization
      pagination
      paginationModel={paginationModel}
      onPaginationModelChange={handlePaginationChange}
      columnVisibilityModel={{ ...tableFields, ...columnVisibilityModel }}
      onColumnVisibilityModelChange={(e: any) => setTableFields(e)}
      localeText={localeText}
      style={{ width: '100%' }}
      slots={{
        noRowsOverlay: NoRowsOverlay,
      }}
      columnGroupingModel={columnGroupingModel}
      editMode={editMode}
      rowModesModel={rowModesModel}
      onRowModesModelChange={onRowModesModelChange}
      onRowEditStop={onRowEditStop}
      processRowUpdate={processRowUpdate}
      getRowClassName={getRowClassName}
      sx={sx}
      hideFooterSelectedRowCount={hideFooterSelectedRowCount}
      initialState={initialState}
      showToolbar
      autosizeOnMount
    />
  )
}

export default AppDataGrid
