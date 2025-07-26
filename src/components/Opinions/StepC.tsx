import { useTranslation } from "react-i18next"
import { Controller, useFormContext } from "react-hook-form"
import { Box, Button, Checkbox, FormControlLabel, Grid, InputAdornment } from "@mui/material"
import { AppControlledDatePicker } from "../AppControlledDatePicker"
import AppControlledTextField from "../AppControlledTextField"


interface TProps {
  onStepComplete: (stepData: any) => void
}

export default function StepС({ onStepComplete }: TProps) {
  const { t } = useTranslation()
  const { control, formState } = useFormContext()
  const errors = formState.errors


  return (
    <Box sx={{ width: '100%' }}>
      <Grid container columns={12} columnSpacing={2} rowSpacing={1} sx={{ width: '100%' }}>
        <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>

          <FormControlLabel
            labelPlacement="bottom"
            control={
              <Controller
                name="update2Visible"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    {...field}
                    checked={!!field.value}
                    onChange={e => {
                      field.onChange(e.target.checked)
                    }}
                  />
                )}
              />
            }
            label={t('visible', { ns: 'opinion' })}
          />
        </Grid>

        <Grid size={4}>
          <AppControlledDatePicker
            name="update2Date"
            control={control}
            errors={errors}
            label={t('updateDate', { ns: 'opinion' })}
          />
        </Grid>

        <Grid size={4}>
          <AppControlledTextField
            name="update2ExtraPrice"
            type="number"
            control={control}
            errors={errors}
            label={t('xPrice', { ns: 'opinion' })}
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">
                  {'₪'}
                </InputAdornment>,
              },
            }}
          />
        </Grid>

        <Grid size={4}>
          <AppControlledTextField
            name="update2Price"
            type="number"
            control={control}
            errors={errors}
            label={t('updatePrice', { ns: 'opinion' })}
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">
                  {'₪'}
                </InputAdornment>,
              },
            }}
          />
        </Grid>

        <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="primary" onClick={onStepComplete}>
            {t('save', { ns: 'opinion' })}
          </Button>
        </Grid>
      </Grid>
    </Box>
  )
} 