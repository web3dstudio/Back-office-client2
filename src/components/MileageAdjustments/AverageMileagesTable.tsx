import { useTranslation } from "react-i18next";
import { useAverageMileagesQuery, useUpdateAverageMileagesMutation } from "../../query/averageMileages.query";
import type { TAverageMileage } from "../../types";
import AppDataTable from "../AppDataTable";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { TextField } from "@mui/material";


export default function AverageMileagesTable() {
  const { t } = useTranslation()
  const { data: averageMileagesData, isLoading } = useAverageMileagesQuery()
  const { mutate: updateAverageMileagesMutation } = useUpdateAverageMileagesMutation()

  const [sorting, setSorting] = useState<SortingState>([])
  const [editingCell, setEditingCell] = useState<{ rowId: string, field: string } | null>(null)
  const [editValue, setEditValue] = useState('')

  const columns = useMemo<ColumnDef<TAverageMileage>[]>(
    () => [
      {
        accessorKey: 'yearOffset',
        header: t('year'),
        enableSorting: true,
        enableHiding: true,
        size: 150,
        minSize: 100,
        maxSize: 200,
        filterFn: (row, _columnId, filterValue) => {
          const currentYear = new Date().getFullYear()
          const displayYear = currentYear - row.original.yearOffset
          return displayYear.toString().toLowerCase().includes(filterValue.toLowerCase())
        },
        cell: ({ row }) => {
          const currentYear = new Date().getFullYear()
          return currentYear - row.original.yearOffset
        },
      },
      {
        accessorKey: 'averageMileageMin',
        header: t('averageMileageMin'),
        enableSorting: true,
        enableHiding: true,
        size: 200,
        minSize: 150,
        maxSize: 300,
        cell: ({ row }) => {
          const isEditing = editingCell?.rowId === row.original.id && editingCell?.field === 'averageMileageMin'

          if (isEditing) {
            return (
              <TextField
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => {
                  updateAverageMileagesMutation({
                    id: row.original.id,
                    field: 'averageMileageMin',
                    value: editValue,
                  })
                  setEditingCell(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateAverageMileagesMutation({
                      id: row.original.id,
                      field: 'averageMileageMin',
                      value: editValue,
                    })
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
                setEditingCell({ rowId: row.original.id, field: 'averageMileageMin' })
                setEditValue(row.original.averageMileageMin.toString())
              }}
              style={{ cursor: 'pointer', padding: '8px' }}
            >
              {row.original.averageMileageMin}
            </div>
          )
        },
      },
      {
        accessorKey: 'averageMileageMax',
        header: t('averageMileageMax'),
        enableSorting: true,
        enableHiding: true,
        size: 200,
        minSize: 150,
        maxSize: 300,
        cell: ({ row }) => {
          const isEditing = editingCell?.rowId === row.original.id && editingCell?.field === 'averageMileageMax'

          if (isEditing) {
            return (
              <TextField
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => {
                  updateAverageMileagesMutation({
                    id: row.original.id,
                    field: 'averageMileageMax',
                    value: editValue,
                  })
                  setEditingCell(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateAverageMileagesMutation({
                      id: row.original.id,
                      field: 'averageMileageMax',
                      value: editValue,
                    })
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
                setEditingCell({ rowId: row.original.id, field: 'averageMileageMax' })
                setEditValue(row.original.averageMileageMax.toString())
              }}
              style={{ cursor: 'pointer', padding: '8px' }}
            >
              {row.original.averageMileageMax}
            </div>
          )
        },
      },
    ],
    [t, editingCell, editValue, updateAverageMileagesMutation]
  )

  return (<>
    <AppDataTable
      tableName="averageMileages"
      data={averageMileagesData ? averageMileagesData : []}
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
        const minMatch = row.original.averageMileageMin.toString().toLowerCase().includes(filterValue.toLowerCase())
        const maxMatch = row.original.averageMileageMax.toString().toLowerCase().includes(filterValue.toLowerCase())
        return yearMatch || minMatch || maxMatch
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