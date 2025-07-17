import { Button, useTheme } from "@mui/material"
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { TAppExtrasItemField } from "../types";


interface IProps {
  index: number;
  name: string;
  field: TAppExtrasItemField;
}

function AppExtrasItemSimple({ index, name, field }: IProps) {
  const { control } = useFormContext()
  const theme = useTheme();
  const { i18n } = useTranslation();

  return (
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
            borderRadius: '20px',
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
  )
}

export default AppExtrasItemSimple