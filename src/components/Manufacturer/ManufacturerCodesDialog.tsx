import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import type { ManufacturerCode, ManufacturerCodeUpsertDto } from "../../types"
import { Box, Button, DialogActions } from "@mui/material"
import { useForm, useFieldArray, FormProvider } from "react-hook-form"
import AppDialog from "../AppDialog/AppDialog"
import AppControlledTextField from "../AppControlledTextField"
import AppActionButton from "../AppActionButton"
import { useManufacturerCodesMutation } from "../../query/manufacturers.query"

interface Props {
  open: boolean
  onClose: () => void
  manufacturerId: string
  codes: ManufacturerCode[]
}

function ManufacturerCodesDialog({ open, onClose, manufacturerId, codes }: Props) {
  const { t } = useTranslation()
  const { mutate: saveCodes, isPending: isCodesSaving } = useManufacturerCodesMutation()

  const formMethods = useForm<{ codes: ManufacturerCode[] }>({
    defaultValues: {
      codes: codes.length > 0 ? codes : [{ id: '', oldId: null, manufacturerId, code: '' }]
    }
  })

  const { control, handleSubmit, reset } = formMethods
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'codes'
  })

  // Обновляем форму при изменении пропса codes
  useEffect(() => {
    const defaultCodes = codes.length > 0 ? codes : [{ id: '', oldId: null, manufacturerId, code: '' }]
    reset({
      codes: defaultCodes
    }, {
      keepDefaultValues: false
    })
  }, [codes, manufacturerId, reset])

  const onSave = (data: { codes: ManufacturerCode[] }) => {
    const filteredCodes: ManufacturerCodeUpsertDto[] = data.codes
      .filter(item => item.code)
      .map(code => ({
        id: code.id || undefined,
        code: code.code || ''
      }))

    saveCodes(
      { manufacturerId, codes: filteredCodes },
      {
        onSuccess: () => {
          onClose()
        }
      }
    )
  }

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={t('manufacturerCodes', { ns: 'manufacturers' })}
      maxWidth="sm"
    >
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSave)}>
          <Box sx={{ maxHeight: '400px', overflowY: 'auto', mb: 2 }}>
            {fields.map((field, index) => (
              <Box
                key={field.id}
                sx={{
                  display: 'flex',
                  gap: 3,
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <AppControlledTextField
                    name={`codes.${index}.code`}
                    control={control}
                    label=""
                    placeholder={t('code', { ns: 'manufacturers' })}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        'label + &': {
                          marginTop: 0,
                        },
                      },
                    }}
                    slotProps={{
                      input: {
                        inputProps: {
                          maxLength: 5,
                          pattern: '[0-9]*',
                          inputMode: 'numeric',
                        },
                        onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                            e.preventDefault()
                          }
                        },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0, mb: 3 }}>
                  <AppActionButton
                    type="delete"
                    sx={{
                      me: 1,
                    }}
                    onClick={() => {
                      if (fields.length === 1) {
                        reset({
                          codes: [{ id: '', oldId: null, manufacturerId, code: '' }]
                        })
                      } else {
                        remove(index)
                      }
                    }}
                  />
                  {index === fields.length - 1 && (
                    <AppActionButton
                      type="add"
                      onClick={() => append({ id: '', oldId: null, manufacturerId, code: '' })}
                    />
                  )}
                  {index !== fields.length - 1 && (
                    <Box sx={{ width: '28px', height: '28px' }} />
                  )}
                </Box>
              </Box>
            ))}
          </Box>
          <DialogActions sx={{ px: 0, pb: 0 }}>
            <Button
              variant="outlined"
              onClick={onClose}
            >
              {t('modals.cancel', { ns: 'common' })}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isCodesSaving}
            >
              {t('modals.save', { ns: 'common' })}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </AppDialog>
  )
}

export default ManufacturerCodesDialog

