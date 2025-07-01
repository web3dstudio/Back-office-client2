import { createFileRoute } from '@tanstack/react-router'
import StyledPaper from '../../../components/StyledPaper'
import { useIntegralExtrasQuery } from '../../../query/integralExtras.query'
import { Box, Button, Grid, Typography } from '@mui/material'
import AppDataGrid from '../../../components/AppDataGrid'
import { TIntegralExtra } from '../../../types'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useTranslation } from 'react-i18next'

import AppActionButton from '../../../components/AppActionButton'
import { useState } from 'react'
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog'
import AppDialog from '../../../components/AppDialog/AppDialog'
import AppBackBtn from '../../../components/AppBackBtn'


export const Route = createFileRoute('/_authenticated/integral-extras/')({
	component: IntegralExtrasPage,
})

function IntegralExtrasPage() {
	const { t, i18n } = useTranslation()
	const [openFormDialog, setOpenFormDialog] = useState(false)
	const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
	const [action, setAction] = useState('add')

	const { data: integralExtras, isLoading, } = useIntegralExtrasQuery()

	const columns = [
		{
			field: 'name',
			headerName: t('name', { ns: 'integralExtras' }),
			editable: false,
			hideable: false,
			type: 'string',
			flex: 1,
			valueGetter: (_value: any, row: TIntegralExtra) => i18n.language === 'he' ? row.name : row.nameEn,
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
					onEdit(params.row)
				}} />,
				<AppActionButton type='delete' onClick={() => {
					onDelete(params.row)
				}} />
			],
		}
	]

	const onAdd = () => {
		setAction('add')
		// reset(defaultValues)
		setOpenFormDialog(true)
	}

	const onEdit = (_row: TIntegralExtra) => {
		setAction('edit')
		// reset(row)
		setOpenFormDialog(true)
	}

	const onDelete = (_row: TIntegralExtra) => {
		setAction('delete')
		setOpenConfirmDialog(true)
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
					<Button variant='contained' onClick={onAdd}>
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
				/>
			</StyledPaper>

			<AppConfirmDialog
				open={openConfirmDialog}
				onClose={() => setOpenConfirmDialog(false)}
				onSubmit={() => { }}
				title={t('modals.approveDelete', { ns: 'common' })}
			/>

			<AppDialog
				open={openFormDialog}
				onClose={() => setOpenFormDialog(false)}
				onSubmit={() => { }}
				title={t('modals.add', { ns: 'common' })}
			>
				FORM {action}
			</AppDialog>

		</Grid>
	)
}

