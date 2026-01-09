import Button from '@mui/material/Button';
import { Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export function FileDropzoneButton() {
  const { getRootProps, getInputProps } = useDropzone({
    noClick: true,
    multiple: true,
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <Button variant="outlined" startIcon={<Upload size={16} />}>
        파일 드롭
      </Button>
    </div>
  );
}
