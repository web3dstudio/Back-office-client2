
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { FormControl, InputLabel, FormHelperText, useTheme, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { SxProps } from '@mui/system';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

interface AppControlledCheckboxesTagsProps<T> {
  name: string;
  control: Control<any>;
  options: T[];
  errors?: FieldErrors;
  getOptionLabel?: (option: T) => string;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  label?: string;
  placeholder?: string;
  required?: boolean;
  sx?: SxProps;
  loading?: boolean;
}

export default function AppControlledCheckboxesTags<T = any>({
  name,
  control,
  options,
  errors,
  getOptionLabel = (option: any) => option.title,
  isOptionEqualToValue,
  label,
  placeholder,
  required = false,
  sx,
  loading = false,
}: AppControlledCheckboxesTagsProps<T>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const errorMessage = typeof errors?.[name]?.message === 'string' ? errors[name]?.message : undefined;

  // Автоматически определяем функцию сравнения по id, если есть, иначе по ссылке
  const defaultIsOptionEqualToValue = (option: any, value: any) => {
    if (option && value && option.id !== undefined && value.id !== undefined) {
      return option.id === value.id;
    }
    return option === value;
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Autocomplete
          loading={loading}
          multiple
          disableCloseOnSelect
          id={name}
          options={options}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={isOptionEqualToValue || defaultIsOptionEqualToValue}
          value={field.value || []}
          onChange={(_, value) => field.onChange(value)}
          renderOption={(props, option, { selected }) => {
            const { key, ...optionProps } = props;
            return (
              <li key={key} {...optionProps}>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {getOptionLabel(option)}
              </li>
            );
          }}
          renderInput={(params) => (
            <FormControl
              fullWidth
              variant="standard"
              size="medium"
              error={!!errorMessage}
              sx={{ ...sx }}
            >
              <InputLabel
                shrink
                htmlFor={name}
                sx={{
                  fontSize: '20px',
                  // marginInlineStart: 3,
                  position: 'absolute',
                  top: '-6px',
                  left: '14px',
                  background: 'white',
                  zIndex: 1,
                  pointerEvents: 'none',
                }}
              >
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
                error={!!errorMessage}
                helperText={errorMessage}
                size="medium"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    '&.Mui-focused fieldset': {
                      boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.09)',
                      borderRadius: '20px',
                    },
                    'label + &': {
                      marginTop: theme.spacing(2),
                    },
                  },
                }}
                slotProps={{
                  input: {
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  },
                }}
              />
              {!errorMessage && <FormHelperText margin="dense"> </FormHelperText>}
              {errorMessage && (
                <FormHelperText margin="dense">{errorMessage}</FormHelperText>
              )}
            </FormControl>
          )}
          sx={{ ...sx }}
        />
      )}
    />
  );
}