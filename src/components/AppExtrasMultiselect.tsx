import { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import AppExtrasItem from "./AppExtrasItem"
import { Grid } from "@mui/material";
import type { TAppExtrasItemField } from "../types";

type Props = {
  name?: string
  /** When undefined, field array is not touched (e.g. while loading). */
  items?: TAppExtrasItemField[] | undefined
}

function AppExtrasMultiselect({ name = "extras", items }: Props) {
	const { control } = useFormContext();
	const { fields, replace } = useFieldArray({ control, name });
	const fieldsDefault = control._defaultValues?.[name] || [];

	useEffect(() => {
		if (items === undefined) return
		replace(items ?? [])
	}, [items, replace])

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
