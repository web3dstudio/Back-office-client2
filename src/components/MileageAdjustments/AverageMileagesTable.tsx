import { useTranslation } from "react-i18next";
import { useAverageMileagesQuery, useUpdateAverageMileagesMutation } from "../../query/averageMileages.query";
import type { TAverageMileage } from "../../types";
import AppDataGrid from "../AppDataGrid";
import type { GridCellEditStopParams, GridColDef } from "@mui/x-data-grid";


export default function AverageMileagesTable() {
  const { t } = useTranslation()
  const { data: averageMileagesData, isLoading } = useAverageMileagesQuery()
  const { mutate: updateAverageMileagesMutation } = useUpdateAverageMileagesMutation()

  const columns = [
    {
      field: 'yearOffset',
      headerName: t('year'),
      flex: 0.5,
      editable: false,
      hideable: true,
      type: 'string',
      valueGetter: (_value: any, row: TAverageMileage) => new Date().getFullYear() - row.yearOffset,
    },
    {
      field: 'averageMileageMin',
      headerName: t('averageMileageMin'),
      flex: 1,

      editable: true,
      hideable: true,

    },
    {
      field: 'averageMileageMax',
      headerName: t('averageMileageMax'),
      flex: 1,

      editable: true,
      hideable: true,
    },
  ]

  const updateAverageMileages = (params: GridCellEditStopParams<TAverageMileage>) => {
    console.log(params)
    updateAverageMileagesMutation({
      id: params.id.toString(),
      field: params.field as 'averageMileageMin' | 'averageMileageMax',
      value: params.value.toString(),
    })
  }

  return (<>
    <AppDataGrid
      tableName="mileageAdjustments"
      rows={averageMileagesData ? averageMileagesData : []}
      columns={columns as GridColDef<TAverageMileage>[]}
      isLoading={isLoading}
      editMode="cell"
      onCellEditStop={(params: GridCellEditStopParams<TAverageMileage>, _event: any) => {
        updateAverageMileages(params)
      }}
    />
  </>)
}