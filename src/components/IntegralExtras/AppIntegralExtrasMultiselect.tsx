import { useFieldArray, useFormContext } from "react-hook-form";
import AppExtrasItem from "../AppExtrasItem"


function AppIntegralExtrasMultiselect({ name = "extras" }) {
	const { control } = useFormContext();
	const { fields } = useFieldArray({ control, name });
	const fieldsDefault = control._defaultValues?.[name] || [];


	return (
		<>
			{fields.map((field, index) => {
				return (
					<AppExtrasItem
						key={field.id}
						index={index}
						name={name}
						field={{ ...fieldsDefault[index], ...field }}
					/>
				);
			})}
		</>
	);
}

export default AppIntegralExtrasMultiselect