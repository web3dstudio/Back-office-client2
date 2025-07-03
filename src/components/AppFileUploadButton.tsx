import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface IProps {
  onChange: (files: FileList) => void
  isPending?: boolean
  acceptFiles?: string
}

export default function InputFileUpload({ onChange, isPending = false, acceptFiles = '' }: IProps) {
  const { t } = useTranslation()
  return (
    <Button
      component="label"
      role={undefined}
      variant="contained"
      tabIndex={-1}
      loading={isPending}
    >
      {t('modals.add', { ns: 'common' })}
      <VisuallyHiddenInput
        type="file"
        onChange={(event) => {
          if (event.target.files) onChange(event.target.files);
        }}
        multiple
        accept={acceptFiles}
      />
    </Button>
  );
}