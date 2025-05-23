"use client";

import { UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./button";

interface ImageUploadProps {
  value: string;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  value, 
  onChange,
  disabled 
}) => {
  const [preview, setPreview] = useState<string>(value);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        onChange(file);
        setPreview(URL.createObjectURL(file));
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/gif': [],
    },
    maxFiles: 1,
    disabled,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setPreview("");
  };

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-4 cursor-pointer transition
        ${isDragActive ? "border-primary bg-primary/10" : "border-gray-300"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary"}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center p-4">
        {preview ? (
          <div className="relative w-full flex justify-center">
            <div className="relative h-40 w-40">
              <Image
                src={preview}
                fill
                alt="Upload"
                className="object-contain rounded-md"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-0 right-0 h-6 w-6 rounded-full"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <UploadCloud className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">
              Drag & drop your image here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supported formats: JPEG, PNG, WEBP, GIF
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
