import { createFileRoute } from '@tanstack/react-router'
import StyledPaper from '../../../components/StyledPaper'
import { useIntegralExtrasAddMutation, useIntegralExtrasDeleteMutation, useIntegralExtrasQuery, useIntegralExtrasUpdateMutation } from '../../../query/integralExtras.query'
import { Box, Button, Grid, Typography } from '@mui/material'
import AppDataGrid from '../../../components/AppDataGrid'
import type { TIntegralExtra } from '../../../types'
import { type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid'
import { useTranslation } from 'react-i18next'
import AppActionButton from '../../../components/AppActionButton'
import { useState } from 'react'
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog'
import AppDialog from '../../../components/AppDialog/AppDialog'
import AppBackBtn from '../../../components/AppBackBtn'
import IntegralExtrasForm from '../../../components/IntegralExtras/IntegralExtrasForm'
import AppError from '../../../components/AppError'


export const Route = createFileRoute('/_authenticated/integral-extras/')({
	component: IntegralExtrasPage,
})

function IntegralExtrasPage() {
	const { t } = useTranslation()
	const [openFormDialog, setOpenFormDialog] = useState(false)
	const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
	const [selected, setSelected] = useState<TIntegralExtra | null>(null)

	const { data: integralExtras, isLoading, isError } = useIntegralExtrasQuery()
	const { mutate: addMutation } = useIntegralExtrasAddMutation()
	const { mutate: updateMutation } = useIntegralExtrasUpdateMutation()
	const { mutate: deleteMutation } = useIntegralExtrasDeleteMutation()

	const columns = [
		{
			field: 'name',
			headerName: t('name', { ns: 'integralExtras' }),
			editable: false,
			hideable: true,
			type: 'string',
			flex: 1,
			valueGetter: (_value: any, row: TIntegralExtra) => row.name,
		},
		{
			field: 'nameEn',
			headerName: t('nameEn', { ns: 'integralExtras' }),
			editable: false,
			hideable: true,
			type: 'string',
			flex: 1,
			valueGetter: (_value: any, row: TIntegralExtra) => row.nameEn,
		},
		{
			field: 'defaultChangePercentage',
			headerName: t('defaultChangePercentage', { ns: 'integralExtras' }),
			editable: false,
			hideable: false,
			type: 'string',
			flex: 1,
		},
		{
			field: 'actions',
			type: 'actions',
			headerName: 'Actions',
			width: 100,
			hideable: false,
			getActions: (params: GridRenderCellParams) => [
				<AppActionButton type='edit' onClick={() => {
					setSelected(() => params.row)
					setOpenFormDialog(true)
				}} />,
				<AppActionButton type='delete' onClick={() => {
					setSelected(() => params.row)
					setOpenConfirmDialog(true)
				}} />
			],
		}
	]

	const onSubmit = (data: TIntegralExtra) => {
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
						{t('title', { ns: 'integralExtras' })}
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
					borderRadius: '24px',
					boxShadow:
						'0px 0px 20px rgba(28, 41, 61, .1), 0px 0px 20px rgba(28, 41, 61, 0.06);',
					overflow: 'hidden',
					padding: 3,
					width: '100%',
					display: 'flex',
					gap: 2,
				}}
			>
				<AppDataGrid
					tableName='integralExtrasTable'
					rows={integralExtras ?? []}
					columns={columns as GridColDef<TIntegralExtra>[]}
					editMode='row'
					isLoading={isLoading}
					hideFooterSelectedRowCount={true}
					initialState={{
						filter: {
							filterModel: {
								items: [],
								quickFilterValues: [],
							},
						},
					}}
				/>
			</StyledPaper>

			<AppConfirmDialog
				open={openConfirmDialog}
				onClose={() => setOpenConfirmDialog(false)}
				onSubmit={onDelete}
				title={t('modals.approveDelete', { ns: 'common' })}
			/>

			<AppDialog
				open={openFormDialog}
				onClose={() => setOpenFormDialog(false)}
				title={selected ? t('modals.edit', { ns: 'common' }) : t('modals.add', { ns: 'common' })}
				maxWidth='sm'
			>
				<IntegralExtrasForm
					data={selected}
					isPending={false}
					onCancel={() => setOpenFormDialog(false)}
					onConfirm={(data) => onSubmit(data)}
				/>
			</AppDialog>
		</Grid>
	)
}

