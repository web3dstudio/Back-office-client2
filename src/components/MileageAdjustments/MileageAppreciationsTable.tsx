import { useEffect, useState } from "react"
import { useMileageAppreciationsQuery, useUpdateMileageAppreciationsMutation } from "../../query/mileageAppreciations.query"
import { useTranslation } from "react-i18next"
import AppDataGrid from "../AppDataGrid"
import type { GridCellEditStopParams, GridColDef, MuiEvent } from "@mui/x-data-grid"
import type { TMileageAppreciation } from "../../types"


type TRow = {
  id: number | string;
  yearOffset: number;
  _ids: Record<string, string>;
  [percent: string]: number | string | Record<string, string>;
};

type TAccumulator = Record<number, TRow>;


export default function MileageAppreciationsTable() {
  const { t } = useTranslation()
  const { data: mileageAppreciationsData, isLoading } = useMileageAppreciationsQuery()
  const { mutate: updateMileageAppreciationsMutation } = useUpdateMileageAppreciationsMutation()

  const [rows, setRows] = useState<TRow[]>([])
  const [columns, setColumns] = useState<GridColDef[]>([]);

  useEffect(() => {
    if (mileageAppreciationsData && mileageAppreciationsData.length > 0) {
      const groupedByYear = mileageAppreciationsData.reduce((accumulator: TAccumulator, currentItem: TMileageAppreciation) => {
        const { yearOffset, percent, mileageThreshold, id } = currentItem
        const key = yearOffset

        if (!accumulator[key]) {
          accumulator[key] = {
            id: key,
            yearOffset: yearOffset,
            _ids: {},
          }
        }
        accumulator[key][`${percent}%`] = mileageThreshold
        accumulator[key]._ids[`${percent}%`] = id

        return accumulator
      }, {})
      setRows(Object.values(groupedByYear))

      const uniquePercents = [...new Set(mileageAppreciationsData.map((item: TMileageAppreciation) => item.percent))]
      uniquePercents.sort((a, b) => Number(a) - Number(b))

      const yearColumn: GridColDef = {
        field: 'yearOffset',
        headerName: t('year'),
        flex: 0.5,
        editable: false,
        sortable: false,
        disableColumnMenu: true,
        type: 'string',
        valueGetter: (_value: any, row: TRow) => {
          const currentYear = new Date().getFullYear()
          const year = currentYear - row.yearOffset
          return year
        },
      }

      const dynamicColumns: GridColDef[] = uniquePercents.map(percent => ({
        field: `${percent}%`,
        headerName: `${percent}%`,
        type: 'string',
        flex: 0.3,
        editable: true,
        sortable: false,
        disableColumnMenu: true,
      }))

      setColumns([yearColumn, ...dynamicColumns])
    }
  }, [mileageAppreciationsData])

  const updateMileageAppreciations = (params: GridCellEditStopParams<TRow>, value: string) => {
    const { id: rowId, field } = params
    const updatedRow = rows.find((row: TRow) => row.id === rowId)

    if (updatedRow) {
      const originalId = updatedRow._ids[field]

      if (originalId) {
        updateMileageAppreciationsMutation({
          id: originalId,
          mileageThreshold: Number(value),
        })
      }
    }
  }

  return (<>
    <AppDataGrid
      tableName="mileageAppreciations"
      rows={rows}
      columns={columns}
      isLoading={isLoading}
      editMode="cell"
      onCellEditStop={(params: GridCellEditStopParams<TRow>, event: MuiEvent<React.SyntheticEvent>) => {
        updateMileageAppreciations(params, (event.target as HTMLInputElement).value)
      }}
    />
  </>)
}