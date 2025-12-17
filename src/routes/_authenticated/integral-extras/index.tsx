import { createFileRoute } from '@tanstack/react-router'
import StyledPaper from '../../../components/StyledPaper'
import { useIntegralExtrasAddMutation, useIntegralExtrasDeleteMutation, useIntegralExtrasQuery, useIntegralExtrasUpdateMutation } from '../../../query/integralExtras.query'
import { Box, Button, Grid, Typography } from '@mui/material'
import AppDataTable from '../../../components/AppDataTable'
import type { TIntegralExtra } from '../../../types'
import { type ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import AppActionButton from '../../../components/AppActionButton'
import { useState, useMemo } from 'react'
import { type SortingState } from '@tanstack/react-table'
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog'
import AppDialog from '../../../components/AppDialog/AppDialog'
import AppBackBtn from '../../../components/AppBackBtn'
import IntegralExtrasForm from '../../../components/IntegralExtras/IntegralExtrasForm'
import AppError from '../../../components/AppError'
import { useIconsQuery } from '../../../query/icons.query'


export const Route = createFileRoute('/_authenticated/integral-extras/')({
	component: IntegralExtrasPage,
})

function IntegralExtrasPage() {
	const { t } = useTranslation()
	const [openFormDialog, setOpenFormDialog] = useState(false)
	const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
	const [selected, setSelected] = useState<TIntegralExtra | null>(null)
	const [sorting, setSorting] = useState<SortingState>([])

	const { data: integralExtras, isLoading, isError } = useIntegralExtrasQuery()
	const { data: icons } = useIconsQuery()
	const { mutate: addMutation } = useIntegralExtrasAddMutation()
	const { mutate: updateMutation } = useIntegralExtrasUpdateMutation()
	const { mutate: deleteMutation } = useIntegralExtrasDeleteMutation()

	const columns = useMemo<ColumnDef<TIntegralExtra>[]>(() => [
		{
			id: 'icon',
			header: t('icon', { ns: 'integralExtras' }),
			enableSorting: false,
			enableHiding: true,
			size: 70,
			cell: ({ row }) => {
				const iconId = (row.original as any)?.iconId as string | null | undefined
				const iconInline = (row.original as any)?.icon as string | null | undefined
				const iconSrc =
					iconInline ||
					(iconId ? (icons || []).find(i => i.id === iconId)?.downloadUri : null) ||
					null

				if (!iconSrc) return null
				return (
					<Box sx={{ display: 'flex', justifyContent: 'center' }}>
						<img src={iconSrc} alt="icon" style={{ width: 28, height: 28, objectFit: 'contain' }} />
					</Box>
				)
			},
		},
		{
			accessorKey: 'name',
			header: t('name', { ns: 'integralExtras' }),
			enableSorting: true,
			enableHiding: true,
		},
		{
			accessorKey: 'nameEn',
			header: t('nameEn', { ns: 'integralExtras' }),
			enableSorting: true,
			enableHiding: true,

		},
		{
			accessorKey: 'defaultChangePercentage',
			header: t('defaultChangePercentage', { ns: 'integralExtras' }),
			enableSorting: true,
			enableHiding: false,
		},
		{
			id: 'actions',
			header: t('actions', { ns: 'integralExtras' }),
			enableSorting: false,
			enableHiding: false,
			enableResizing: false,
			size: 30,
			meta: {
				align: 'right'
			},
			cell: ({ row }) => (
				<Box sx={{ display: 'flex', gap: 1, justifyContent: 'end' }}>
					<AppActionButton type='edit' onClick={() => {
						setSelected(row.original)
						setOpenFormDialog(true)
					}} />
					<AppActionButton type='delete' onClick={() => {
						setSelected(row.original)
						setOpenConfirmDialog(true)
					}} />
				</Box>
			),
		}
	], [t, icons])

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
				<AppDataTable
					tableName='integralExtras'
					data={integralExtras ?? []}
					columns={columns}
					isLoading={isLoading}
					manualPagination={false}
					sorting={sorting}
					onSortingChange={setSorting}
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

