import { useTranslation } from "react-i18next"
import type { TExtra, TIcon } from "../../types"
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { object } from 'yup'
import { Box, Button, Grid, InputAdornment, Typography } from "@mui/material"
import { useForm } from "react-hook-form"
import AppControlledTextField from "../AppControlledTextField"
import { useEffect, useMemo, useState } from "react"
import AppDialog from "../AppDialog/AppDialog"
import AppIconsSearch from "../AppIconsSearch"
import AppActionButton from "../AppActionButton"
import { useIconsQuery } from "../../query/icons.query"

interface Props {
	data: TExtra | null
	isPending: boolean
	onCancel: () => void
	onConfirm: (data: TExtra) => void
}

type TFormInput = Omit<TExtra, 'id' | 'tosID' | 'apiField' | 'iconId' | 'icon'>

function ExtrasForm({ data, isPending, onCancel, onConfirm }: Props) {
	const { t } = useTranslation()
	const [openIconDialog, setOpenIconDialog] = useState(false)
	const [selectedIcon, setSelectedIcon] = useState<TIcon | null>(null)
	const { data: icons } = useIconsQuery()

	const iconById = useMemo(() => {
		const map = new Map<string, TIcon>()
		for (const i of icons || []) map.set(i.id, i)
		return map
	}, [icons])

	useEffect(() => {
		if (data?.iconId) {
			setSelectedIcon(iconById.get(data.iconId) || null)
		} else {
			setSelectedIcon(null)
		}
	}, [data?.iconId, iconById])

	const schema = object()
		.shape({
			name: yup.string().required(t('form-field.required')),
			nameEn: yup.string().required(t('form-field.required')),
			defaultChangePercentage: yup.number().min(0).max(100).required(t('form-field.required')),
		})
		.required()

	const methods = useForm<TFormInput>({
		// @ts-ignore
		resolver: yupResolver(schema),
		mode: 'onChange',
		defaultValues: {
			name: data?.name || '',
			nameEn: data?.nameEn || '',
			defaultChangePercentage: data?.defaultChangePercentage || 0,
		},
	})

	const { handleSubmit, control, formState, reset } = methods
	const errors = formState.errors

	const onSubmit = (data: any) => {
		onConfirm({ ...data, iconId: selectedIcon?.id || null } as TExtra)
		reset()
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Grid container sx={{ mt: 1 }}>
				<Grid size={12}>
					<AppControlledTextField
						required
						name='name'
						control={control}
						errors={errors}
						label={t('name', { ns: 'extras' })}
						placeholder={t('name', { ns: 'Extras' })}
					/>
				</Grid>
				<Grid size={12}>
					<AppControlledTextField
						required
						name='nameEn'
						control={control}
						errors={errors}
						label={t('nameEn', { ns: 'extras' })}
						placeholder={t('nameEn', { ns: 'extras' })}
					/>
				</Grid>
				<Grid size={12}>
					<AppControlledTextField
						required
						type='number'
						name='defaultChangePercentage'
						control={control}
						errors={errors}
						label={t('defaultChangePercentage', { ns: 'extras' })}
						placeholder={t('defaultChangePercentage', { ns: 'extras' })}
						slotProps={{
							input: {
								// inputMode: 'numeric',
								endAdornment: <InputAdornment position="start">%</InputAdornment>,
							},
						}}
					/>
				</Grid>

				<Grid size={12}>
					<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
						<Box
							sx={{
								width: 140,
								height: 140,
								border: '1px solid #ccc',
								borderRadius: 2,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								background: '#f7f7f9',
								position: 'relative',
							}}
						>
							{selectedIcon?.downloadUri && (
								<AppActionButton
									type='delete'
									sx={{ position: 'absolute', top: -10, right: -10 }}
									onClick={() => setSelectedIcon(null)}
								/>
							)}

							{selectedIcon?.downloadUri ? (
								<img
									src={selectedIcon.downloadUri}
									alt="preview"
									style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain', display: 'block' }}
								/>
							) : (
								<Typography sx={{ textAlign: 'center', fontSize: '12px', color: 'text.secondary' }}>
									{t('noIcon', { ns: 'common' })}
								</Typography>
							)}
						</Box>

						<Button variant='contained' color='primary' onClick={() => setOpenIconDialog(true)}>
							{t('modals.searchIcon', { ns: 'common' })}
						</Button>
					</Box>
				</Grid>

				<Grid size={12}>
					<Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
						<Button
							color='primary'
							size='small'
							onClick={onCancel}
							variant='outlined'
						>
							<Typography sx={{ textWrap: 'nowrap', fontSize: '14px', fontWeight: 'bold' }}>
								{t('modals.cancel', { ns: 'common' })}
							</Typography>
						</Button>
						<Button
							color='primary'
							type='submit'
							variant='contained'
							loading={isPending}
							sx={{ textTransform: 'capitalize', textWrap: 'nowrap' }}

						>
							{t('modals.save', { ns: 'common' })}
						</Button>
					</Box>
				</Grid>
			</Grid>

			<AppDialog
				open={openIconDialog}
				onClose={() => setOpenIconDialog(false)}
				title={t('modals.searchIcon', { ns: 'common' })}
			>
				<AppIconsSearch
					selectedIcon={selectedIcon}
					onSelect={(icon: TIcon) => {
						setSelectedIcon(icon)
						setOpenIconDialog(false)
					}}
				/>
			</AppDialog>

		</form>

	)
}

export default ExtrasForm