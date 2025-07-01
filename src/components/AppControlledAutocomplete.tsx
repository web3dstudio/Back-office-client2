import {
  Autocomplete,
  Box,
  TextField,
  FormControl,
  type SxProps,
  InputLabel,
  useTheme,
} from '@mui/material'
import { type Control, Controller, type FieldErrors } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface GenericOption {
  id: string | number
  name: string
}

interface ControlledAutocompleteProps<
  T extends GenericOption | number | string,
> {
  name: string
  control: Control<any>
  options: T[]
  errors?: FieldErrors
  getOptionLabel?: (option: T) => string
  isOptionEqualToValue?: (option: T, value: T) => boolean
  label?: string
  placeholder?: string | undefined
  defaultValue?: T
  disableClearable?: boolean
  disabled?: boolean
  required?: boolean
  sx?: SxProps
}

export function AppControlledAutocomplete<
  T extends GenericOption | number | string,
>({
  name,
  control,
  options,
  getOptionLabel = (option) => (option as GenericOption)?.name || '',
  isOptionEqualToValue = (option, value) =>
    (option as GenericOption).id === (value as GenericOption)?.id,
  label = undefined,
  placeholder,
  defaultValue,
  disableClearable = false,
  disabled = false,
  required = false,
  sx,
}: ControlledAutocompleteProps<T>) {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue || null}
      render={({ field, fieldState }) => (
        <Autocomplete
          fullWidth
          disableClearable={disableClearable}
          disabled={disabled}
          autoHighlight
          clearOnEscape
          {...field}
          options={options}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={isOptionEqualToValue}
          onChange={(_, data) => field.onChange(data)}
          renderInput={(params) => (
            <FormControl fullWidth variant='outlined' size='small'>
              <InputLabel shrink htmlFor={name} sx={{ fontSize: '20px' }}>
                {label && t(label)}
                {required && (
                  <span style={{ color: 'red', marginBlockStart: '4px' }}>
                    *
                  </span>
                )}
              </InputLabel>
              <TextField
                {...params}
                placeholder={placeholder}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                size='small'
                variant='outlined'
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.09)',
                    },
                    'label + &': {
                      marginTop: theme.spacing(3),
                    },
                  },
                  ...sx,
                }}
              />
            </FormControl>
          )}
          renderOption={(props, option) => {
            const index = options.indexOf(option)
            return (
              <Box component='li' {...props} key={index}>
                {getOptionLabel(option)}
              </Box>
            )
          }}
        />
      )}
    />
  )
}
