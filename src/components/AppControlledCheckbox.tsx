import { Checkbox, FormControlLabel, type SxProps } from "@mui/material";
import { Controller } from "react-hook-form";

export default function AppControlledCheckbox({ name, control, label, sx }
  : { name: string, control: any, label: string, sx?: SxProps }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormControlLabel
          control={
            <Checkbox
              checked={!!field.value}
              onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
              onBlur={field.onBlur}
              inputRef={field.ref}
              name={field.name}
            />
          }
          label={label}
          sx={sx}
        />
      )}
    />
  )
}