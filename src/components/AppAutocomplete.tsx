import {
  Autocomplete,
  Box,
  TextField,
  FormControl,
  type SxProps,
  InputLabel,
  useTheme,
  FormHelperText,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

interface AppAutocompleteProps<T> {
  value: T | null
  onChange: (value: T | null) => void
  options: T[]
  getOptionLabel?: (option: T) => string
  isOptionEqualToValue?: (option: T, value: T) => boolean
  label?: string
  placeholder?: string | undefined
  disableClearable?: boolean
  disabled?: boolean
  required?: boolean
  sx?: SxProps
  groupBy?: (option: T) => string
  loading?: boolean
  onUserChange?: (value: T | null) => void
  error?: boolean
  helperText?: string
}

export function AppAutocomplete<T>({
  value,
  onChange,
  options,
  getOptionLabel = () => '',
  isOptionEqualToValue = (option, value) => option === value,
  label = undefined,
  placeholder,
  disableClearable = false,
  disabled = false,
  required = false,
  sx,
  groupBy,
  loading,
  onUserChange,
  error = false,
  helperText,
}: AppAutocompleteProps<T>) {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <Autocomplete
      fullWidth
      disableClearable={disableClearable}
      disabled={disabled}
      groupBy={groupBy}
      loading={loading}
      autoHighlight
      clearOnEscape
      value={value}
      options={options}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      onChange={(event, data) => {
        onChange(data)
        if (event?.type === 'click' || event?.type === 'keydown') {
          onUserChange?.(data)
        }
      }}
      renderInput={(params) => (
        <FormControl fullWidth variant='outlined' size='small'>
          <InputLabel shrink htmlFor={params.id} sx={{ fontSize: '20px' }}>
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
            error={error}
            helperText={helperText}
            size='small'
            variant='outlined'
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.09)',
                },
                'label + &': {
                  marginTop: theme.spacing(2),
                },
              },
              ...sx,
            }}
          />
          {!helperText && (
            <FormHelperText margin='dense'> </FormHelperText>
          )}
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
  )
}
