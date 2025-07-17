import { useFieldArray, useFormContext } from "react-hook-form";
import AppExtrasItem from "./AppExtrasItem"
import { Grid } from "@mui/material";


function AppExtrasMultiselect({ name = "extras" }) {
	const { control } = useFormContext();
	const { fields } = useFieldArray({ control, name });
	const fieldsDefault = control._defaultValues?.[name] || [];


	return (
		<Grid container columns={{ xs: 12 }} spacing={2}>
			{fields.map((field, index) => {
				return (
					<Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={field.id}>
						<AppExtrasItem
							key={field.id}
							index={index}
							name={name}
							field={{ ...fieldsDefault[index], ...field }}
						/>
					</Grid>
				);
			})}
		</Grid>
	);
}

export default AppExtrasMultiselect