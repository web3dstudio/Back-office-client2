import { useTranslation } from "react-i18next"
import type { TOwner } from "../../types"
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { object } from 'yup'
import { Box, Button, Grid, InputAdornment, Typography } from "@mui/material"
import { useForm } from "react-hook-form"
import AppControlledTextField from "../AppControlledTextField"
import AppControlledSelect from '../AppControlledSelect';


interface Props {
	data: TOwner | null
	isPending: boolean
	onCancel: () => void
	onConfirm: (data: TOwner) => void
}

type TFormInput = Omit<TOwner, 'id'>


function OwnersForm({ data, isPending, onCancel, onConfirm }: Props) {
	const { t } = useTranslation()

	const mileageAdjustmentTypeOptions = [
		{ value: 1, label: `− ${t('subtract', { ns: 'owners' })}` },
		{ value: 2, label: `÷ ${t('divide', { ns: 'owners' })}` },
		{ value: 3, label: `× ${t('multiply', { ns: 'owners' })}` },
		{ value: 4, label: `+ ${t('add', { ns: 'owners' })}` },
	];

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
			lessThanYearChangePercentage: data?.lessThanYearChangePercentage || 0,
			ownerCountAdjustmentFactor: data?.ownerCountAdjustmentFactor || 0,
			mileageAdjustmentType: data?.mileageAdjustmentType || 3,
			mileageAdjustmentFactor: data?.mileageAdjustmentFactor || 1,
		},
	})

	const { handleSubmit, control, formState, reset } = methods
	const errors = formState.errors

	const onSubmit = (data: any) => {
		onConfirm(data)
		reset()
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Grid container columns={12} columnSpacing={2} sx={{ mt: 1 }}>
				<Grid size={12} dir='rtl'>
					<AppControlledTextField
						required
						name='name'
						control={control}
						errors={errors}
						label={t('name', { ns: 'owners' })}
						placeholder={t('name', { ns: 'owners' })}
					/>
				</Grid>
				<Grid size={12} dir='ltr'>
					<AppControlledTextField
						required
						name='nameEn'
						control={control}
						errors={errors}
						label={t('nameEn', { ns: 'owners' })}
						placeholder={t('nameEn', { ns: 'owners' })}
					/>
				</Grid>
				<Grid size={6}>
					<AppControlledTextField
						required
						type='number'
						name='defaultChangePercentage'
						control={control}
						errors={errors}
						label={t('defaultChangePercentage', { ns: 'owners' })}
						placeholder={t('defaultChangePercentage', { ns: 'owners' })}
						slotProps={{
							input: {
								// inputMode: 'numeric',
								endAdornment: <InputAdornment position="start">%</InputAdornment>,
							},
						}}
					/>
				</Grid>

				<Grid size={6}>
					<AppControlledTextField
						required
						type='number'
						name='lessThanYearChangePercentage'
						control={control}
						errors={errors}
						label={t('lessThanYearChangePercentage', { ns: 'owners' })}
						placeholder={t('lessThanYearChangePercentage', { ns: 'owners' })}
						slotProps={{
							input: {
								// inputMode: 'numeric',
								endAdornment: <InputAdornment position="start">%</InputAdornment>,
							},
						}}
					/>
				</Grid>

				<Grid size={12}>
					<AppControlledTextField
						required
						type='number'
						name='ownerCountAdjustmentFactor'
						control={control}
						errors={errors}
						label={t('ownerCountAdjustmentFactor', { ns: 'owners' })}
						placeholder={t('ownerCountAdjustmentFactor', { ns: 'owners' })}
					/>
				</Grid>


				{/* mileageAdjustmentType */}
				<Grid size={6}>
					<AppControlledSelect
						name="mileageAdjustmentType"
						control={control}
						errors={errors}
						label={t('mileageAdjustmentType', { ns: 'owners' })}
						options={mileageAdjustmentTypeOptions}
						required
					/>
				</Grid>

				<Grid size={6}>
					<AppControlledTextField
						required
						type='number'
						name='mileageAdjustmentFactor'
						control={control}
						errors={errors}
						label={t('mileageAdjustmentFactor', { ns: 'owners' })}
						placeholder={t('mileageAdjustmentFactor', { ns: 'owners' })}
					/>
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
						>
							<Typography sx={{ textWrap: 'nowrap' }}>
								{t('modals.save', { ns: 'common' })}
							</Typography>
						</Button>
					</Box>
				</Grid>
			</Grid>


		</form>

	)
}

export default OwnersForm