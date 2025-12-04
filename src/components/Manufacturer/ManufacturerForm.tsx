import { useTranslation } from "react-i18next"
import type { TManufacturer } from "../../types"
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { object } from 'yup'
import { Box, Button, Grid, Typography } from "@mui/material"
import { useForm } from "react-hook-form"
import AppControlledTextField from "../AppControlledTextField"
import AppDropzoneField from "../AppDropzoneField"
import { useState } from "react"

interface Props {
	data: TManufacturer | null
	isPending: boolean
	onCancel: () => void
	onConfirm: (data: TManufacturer) => void
}

type TFormInput = Omit<TManufacturer, 'id'>

function ManufacturerForm({ data, isPending, onCancel, onConfirm }: Props) {
	const { t } = useTranslation()

	const [files, setFiles] = useState<File[]>([])

	const schema = object()
		.shape({
			name: yup.string().required(t('form-field.required')),
			engName: yup.string().required(t('form-field.required')),
			manufacturerCode: yup.string().required(t('form-field.required')).max(5, t('form-field.required')),
		})
		.required()

	const methods = useForm<TFormInput>({
		// @ts-ignore
		resolver: yupResolver(schema),
		mode: 'onChange',
		reValidateMode: 'onChange',
		defaultValues: {
			name: data?.name || '',
			engName: data?.engName || '',
			manufacturerCode: data?.manufacturerCode || '',
		},
	})

	const { handleSubmit, control, formState, reset } = methods
	const errors = formState.errors

	const onSubmit = (data: any) => {
		onConfirm({ ...data, files })
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
						label={t('name', { ns: 'manufacturers' })}
						placeholder={t('name', { ns: 'manufacturers' })}
					/>
				</Grid>
				<Grid size={12}>
					<AppControlledTextField
						required
						name='engName'
						control={control}
						errors={errors}
						label={t('engName', { ns: 'manufacturers' })}
						placeholder={t('engName', { ns: 'manufacturers' })}
					/>
				</Grid>
				<Grid size={12}>
					<AppControlledTextField
						required
						name='manufacturerCode'
						control={control}
						errors={errors}
						label={t('manufacturerCode', { ns: 'manufacturers' })}
						placeholder={t('manufacturerCode', { ns: 'manufacturers' })}
						slotProps={{
							input: {
								inputProps: {
									maxLength: 5,
								},
							},
						}}
					/>
				</Grid>

				<Grid size={12} sx={{ mb: 3, pt: 2 }}>
					<AppDropzoneField
						name='manufacturerLogo'
						label={t('logo', { ns: 'manufacturers' })}
						maxFiles={1}
						onChange={(files) => {
							setFiles(files)
						}}
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

export default ManufacturerForm