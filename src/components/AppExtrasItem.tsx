import { Box, Button, Checkbox, OutlinedInput, Typography, useTheme } from "@mui/material"
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { TAppExtrasItemField } from "../types";
import { alpha } from '@mui/material/styles'



interface IProps {
	index: number;
	name: string;
	field: TAppExtrasItemField;
}

function parseOptionalPercent(raw: unknown): number | null {
	if (raw === '' || raw === null || raw === undefined) return null
	const n = typeof raw === 'number' ? raw : Number(raw)
	return Number.isFinite(n) ? n : null
}

function formatYears(fromYear?: number, toYear?: number): string | null {
	if (fromYear == null && toYear == null) return null
	if (fromYear != null && toYear != null) return `${fromYear} – ${toYear}`
	if (fromYear != null) return String(fromYear)
	return String(toYear)
}

function AppExtrasItem({ index, name, field }: IProps) {
	const { control } = useFormContext()
	const theme = useTheme();
	const { i18n } = useTranslation();

	const checked = useWatch({ name: `${name}.${index}.checked` });
	const value = useWatch({ name: `${name}.${index}.value` });
	const selected = useWatch({ name: `${name}.${index}.selected` });
	const defaultPct = field?.ruleChangePercentage ?? field?.defaultChangePercentage ?? 0
	const yearsLabel = formatYears(field?.fromYear, field?.toYear)
	const title = i18n.language === 'he' ? field?.fieldName : field?.fieldNameEn || field?.fieldName

	return (
		<Box sx={{ display: 'flex', alignItems: 'center' }}>
			<Controller
				name={`${name}.${index}.checked`}
				control={control}
				render={({ field }) => (
					<Checkbox
						{...field}
						checked={!!checked}
						color='primary'
						sx={{
							'& .MuiSvgIcon-root': { fontSize: 28 },
						}}
						disabled={!selected}
					/>
				)}
			/>

			<Controller
				name={`${name}.${index}.selected`}
				control={control}
				render={({ field: selectedField }) => (
					<Button
						onClick={() => selectedField.onChange(!selectedField.value)}
						color='primary'
						variant={selectedField.value ? 'contained' : 'outlined'}
						disableElevation
						fullWidth
						sx={{
							borderRadius: '20px 0 0 20px',
							color: selectedField.value ? 'white' : theme.palette.text.primary,
							backgroundColor: selectedField.value ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1),
							fontSize: '14px',
							fontWeight: 'normal',
							textAlign: 'center',
							justifyContent: 'center',
							alignItems: 'center',
							flexDirection: 'column',
							py: 0,
							minHeight: 40,
							height: 40,
							lineHeight: 1.15,
							overflow: 'hidden',
						}}
					>
						<Box
							component="span"
							sx={{
								display: 'block',
								width: '100%',
								textWrap: 'nowrap',
								textOverflow: 'ellipsis',
								overflow: 'hidden',
								textAlign: 'center',
								lineHeight: 1.15,
							}}
						>
							{title}
						</Box>
						{yearsLabel ? (
							<Typography
								component="span"
								sx={{
									display: 'block',
									width: '100%',
									textAlign: 'center',
									opacity: selectedField.value ? 0.85 : 0.7,
									fontSize: '10px',
									fontWeight: 700,
									lineHeight: 1.1,
									mt: 0,
								}}
							>
								{yearsLabel}
							</Typography>
						) : null}
					</Button>
				)}
			/>

			<Controller
				name={`${name}.${index}.value`}
				control={control}
				render={({ field: valueField }) =>
					<OutlinedInput
						color='primary'
						size='small'
						disabled={!selected}
						type="number"
						placeholder={String(defaultPct)}
						value={value === null || value === undefined ? '' : value}
						onChange={(e) => valueField.onChange(parseOptionalPercent(e.target.value))}
						onBlur={valueField.onBlur}
						name={valueField.name}
						inputRef={valueField.ref}
						sx={{
							borderRadius: '0 20px 20px 0 !important',
							border: `0px solid ${theme.palette.primary.main}`,
							backgroundColor: alpha(theme.palette.primary.main, 0.1),
							borderLeft: 'none',
							maxWidth: '70px',
							minWidth: '70px',
							height: 40,
							outline: 'none',
							'& input': {
								fontWeight: value === null || value === undefined || value === '' ? 400 : 700,
								py: 0,
							},
						}} />
				}
			/>
		</Box>
	)
}

export default AppExtrasItem
