import { Checkbox, FormControlLabel, type SxProps } from "@mui/material";
import { Controller } from "react-hook-form";

export default function AppControlledCheckbox({ name, control, label, sx }
  : { name: string, control: any, label: string, sx: SxProps }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormControlLabel
          control={<Checkbox {...field} />}
          label={label}
          sx={sx}
        />
      )}
    />
  )
}