import { useEffect, useState, useMemo } from "react"
import { useMileageAppreciationsQuery, useUpdateMileageAppreciationsMutation } from "../../query/mileageAppreciations.query"
import { useTranslation } from "react-i18next"
import AppDataTable from "../AppDataTable"
import type { ColumnDef, SortingState } from "@tanstack/react-table"
import type { TMileageAppreciation } from "../../types"
import { TextField } from "@mui/material"


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
  const [sorting, setSorting] = useState<SortingState>([])
  const [editingCell, setEditingCell] = useState<{ rowId: string, field: string } | null>(null)
  const [editValue, setEditValue] = useState('')

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
    }
  }, [mileageAppreciationsData])

  const columns = useMemo<ColumnDef<TRow>[]>(() => {
    if (!mileageAppreciationsData || mileageAppreciationsData.length === 0) return []

    const uniquePercents = [...new Set(mileageAppreciationsData.map((item: TMileageAppreciation) => item.percent))]
    uniquePercents.sort((a, b) => Number(a) - Number(b))

    const yearColumn: ColumnDef<TRow> = {
      accessorKey: 'yearOffset',
      header: t('year'),
      enableSorting: true,
      enableHiding: true,
      size: 150,
      minSize: 100,
      maxSize: 200,
      cell: ({ row }) => {
        const currentYear = new Date().getFullYear()
        return currentYear - row.original.yearOffset
      },
    }

    const dynamicColumns: ColumnDef<TRow>[] = uniquePercents.map(percent => ({
      accessorKey: `${percent}%`,
      header: `${percent}%`,
      enableSorting: false,
      enableHiding: true,
      size: 120,
      minSize: 80,
      maxSize: 150,
      cell: ({ row }) => {
        const field = `${percent}%`
        const isEditing = editingCell?.rowId === row.original.id.toString() && editingCell?.field === field

        if (isEditing) {
          return (
            <TextField
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => {
                const originalId = row.original._ids[field]
                if (originalId) {
                  updateMileageAppreciationsMutation({
                    id: originalId,
                    mileageThreshold: +editValue,
                  })
                }
                setEditingCell(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const originalId = row.original._ids[field]
                  if (originalId) {
                    updateMileageAppreciationsMutation({
                      id: originalId,
                      mileageThreshold: +editValue,
                    })
                  }
                  setEditingCell(null)
                } else if (e.key === 'Escape') {
                  setEditingCell(null)
                }
              }}
              autoFocus
              size="small"
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            />
          )
        }

        return (
          <div
            onClick={() => {
              setEditingCell({ rowId: row.original.id.toString(), field })
              setEditValue(row.original[field]?.toString() || '')
            }}
            style={{ cursor: 'pointer', padding: '8px' }}
          >
            {row.original[field]?.toString() || ''}
          </div>
        )
      },
    }))

    return [yearColumn, ...dynamicColumns]
  }, [mileageAppreciationsData, t, editingCell, editValue, updateMileageAppreciationsMutation])

  return (<>
    <AppDataTable
      tableName="mileageAppreciations"
      data={rows}
      columns={columns}
      isLoading={isLoading}
      manualPagination={false}
      sorting={sorting}
      onSortingChange={setSorting}
      hidePagination={true}
      globalFilterFn={(row, _columnId, filterValue) => {
        const currentYear = new Date().getFullYear()
        const displayYear = currentYear - row.original.yearOffset
        const yearMatch = displayYear.toString().toLowerCase().includes(filterValue.toLowerCase())

        // Поиск по всем динамическим колонкам с процентами
        const percentMatches = Object.keys(row.original)
          .filter(key => key.includes('%'))
          .some(key => row.original[key]?.toString().toLowerCase().includes(filterValue.toLowerCase()))

        return yearMatch || percentMatches
      }}
      sx={{
        '& .MuiTableCell-root': {
          paddingTop: '4px',
          paddingBottom: '4px',
        }
      }}
    />
  </>)
}