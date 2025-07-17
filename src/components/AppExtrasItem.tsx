import { Box, Button, Checkbox, OutlinedInput, useTheme } from "@mui/material"
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { TAppExtrasItemField } from "../types";


interface IProps {
	index: number;
	name: string;
	field: TAppExtrasItemField;
}

function AppExtrasItem({ index, name, field }: IProps) {
	const { control } = useFormContext()
	const theme = useTheme();
	const { i18n } = useTranslation();

	const checked = useWatch({ name: `${name}.${index}.checked` });
	const value = useWatch({ name: `${name}.${index}.value` });
	const selected = useWatch({ name: `${name}.${index}.selected` });

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
						sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
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
							fontSize: '14px',
							fontWeight: 'normal',
							textWrap: 'nowrap',
							textOverflow: 'ellipsis',
							overflow: 'hidden',
							textAlign: 'left',
						}}
					>
						{i18n.language === 'he' ? field?.fieldName : field?.fieldNameEn || field?.fieldName}
					</Button>
				)}
			/>

			<Controller
				name={`${name}.${index}.value`}
				control={control}
				render={({ field }) =>
					<OutlinedInput
						{...field}
						color='primary'
						size='small'
						disabled={!selected}
						value={value ?? 0}
						type="number"
						sx={{
							borderRadius: '0 20px 20px 0 !important',
							border: `0px solid ${theme.palette.primary.main}`,
							borderLeft: 'none',
							maxWidth: '60px',
							outline: 'none',
						}} />
				}
			/>
		</Box>
	)
}

export default AppExtrasItem