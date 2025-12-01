import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import {
  FormControl,
  InputLabel,
  FormHelperText,
  useTheme,
  Box,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useRef } from 'react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import {
  MenuButtonBold,
  MenuButtonItalic,
  MenuButtonAlignLeft,
  MenuButtonAlignCenter,
  MenuButtonAlignRight,
  MenuButtonBlockquote,
  MenuButtonImageUpload,
  MenuControlsContainer,
  MenuButtonBulletedList,
  MenuButtonOrderedList,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditor,
  type RichTextEditorRef,
} from 'mui-tiptap'
import type { SxProps } from '@mui/system'

interface ControlledRichTextEditorProps {
  name: string
  control: Control<any>
  errors?: FieldErrors
  label: string
  placeholder?: string
  sx?: SxProps
  required?: boolean
  disabled?: boolean
}

const ControlledRichTextEditor = ({
  name,
  control,
  errors,
  label,
  sx = {},
  required = false,
  disabled = false,
}: ControlledRichTextEditorProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const rteRef = useRef<RichTextEditorRef>(null)

  // Локальная функция get для вложенных путей
  const get = (obj: any, path: string) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj)

  const errorObj = get(errors, name)
  const errorMessage = errorObj?.message

  return (
    <Controller
      name={name}
      disabled={disabled}
      control={control}
      render={({ field }) => (
        <FormControl
          error={!!errorMessage}
          fullWidth
          variant='outlined'
          size='small'
        >
          <InputLabel shrink htmlFor={name} sx={{ fontSize: '20px' }}>
            {t(label)}
            {required && (
              <span style={{ color: 'red', marginBlockStart: '4px' }}>*</span>
            )}
          </InputLabel>
          <Box>
            <RichTextEditor
              ref={rteRef}
              extensions={[
                StarterKit,
                TextAlign.configure({
                  types: ['heading', 'paragraph'],
                }),
                Image.configure({
                  inline: true,
                  allowBase64: true,
                }),
              ]}
              content={field.value || ''}
              onUpdate={({ editor }) => {
                field.onChange(editor.getHTML())
              }}
              editable={!disabled}
              renderControls={() => (
                <MenuControlsContainer>
                  <MenuSelectHeading />
                  <MenuDivider />
                  <MenuButtonBold />
                  <MenuButtonItalic />
                  <MenuDivider />
                  <MenuButtonAlignLeft />
                  <MenuButtonAlignCenter />
                  <MenuButtonAlignRight />
                  <MenuDivider />
                  <MenuButtonBlockquote />
                  <MenuDivider />
                  <MenuButtonBulletedList />
                  <MenuButtonOrderedList />
                  <MenuDivider />
                  <MenuButtonImageUpload
                    onUploadFiles={async (files: File[]) => {
                      // Преобразуем файлы в base64 для вставки в редактор
                      return files.map((file) => ({
                        src: URL.createObjectURL(file),
                        alt: file.name,
                      }))
                    }}
                  />
                </MenuControlsContainer>
              )}
              sx={{
                marginTop: theme.spacing(2),
                borderRadius: '24px',
                overflow: 'hidden',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '24px',
                  '&.Mui-focused fieldset': {
                    boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.09)',
                  },
                },
                '& .mui-tiptap-RichTextContent-root': {
                  borderRadius: '24px',
                  minHeight: '600px',
                },
                '& .mui-tiptap-RichTextEditor-root': {
                  borderRadius: '24px',
                },
                ...sx,
              }}
            />
          </Box>
          {!errorMessage && (
            <FormHelperText margin='dense'> </FormHelperText>
          )}
          {errorMessage && (
            <FormHelperText margin='dense'>
              {errorMessage}
            </FormHelperText>
          )}
        </FormControl>
      )}
    />
  )
}

export default ControlledRichTextEditor

