import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Upload, X, FileImage, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  value: string | string[];
  onChange: (files: File[] | File | null) => void;
  disabled?: boolean;
  multiple?: boolean;
  onReorder?: (newOrder: string[]) => void;
}

export default function CustomImageUpload({
  value,
  onChange,
  disabled = false,
  multiple = false,
  onReorder
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert value to array for consistent handling
  const valueArray = Array.isArray(value) ? value : value ? [value] : [];

  // Generate preview URLs for existing images
  useEffect(() => {
    if (valueArray.length > 0) {
      // If values are already URLs, use them directly
      if (valueArray.every(v => typeof v === 'string' && (v.startsWith('http') || v.startsWith('data:')))) {
        setPreviews(valueArray);
      }
    } else {
      setPreviews([]);
    }
  }, [valueArray]);

  const validateFile = (file: File): boolean => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload only image files (JPEG, PNG, GIF, WebP)');
      return false;
    }

    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return false;
    }

    return true;
  };

  const handleFiles = useCallback((newFiles: File[]) => {
    setError('');
    
    const validFiles = newFiles.filter(validateFile);
    
    if (validFiles.length === 0) return;

    // Create preview URLs safely
    const newPreviews = validFiles.map(file => {
      try {
        return URL.createObjectURL(file);
      } catch (error) {
        console.error('Error creating object URL:', error);
        return '';
      }
    }).filter(url => url !== '');

    if (multiple) {
      setPreviews(prev => {
        const updatedPreviews = [...prev, ...newPreviews];
        return updatedPreviews.slice(0, 10); // Limit to 10 images
      });
      setFiles(prev => [...prev, ...validFiles].slice(0, 10));
      onChange(validFiles);
    } else {
      setPreviews([newPreviews[0]]);
      setFiles([validFiles[0]]);
      onChange(validFiles[0]);
    }

    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [multiple, onChange]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [disabled, handleFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const removeImage = (index: number) => {
    setPreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      return newPreviews;
    });

    setFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      if (multiple) {
        onChange(newFiles);
      } else {
        onChange(null);
      }
      return newFiles;
    });
  };

  // Handle drag and drop reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDropReorder = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    setPreviews(prev => {
      const newPreviews = [...prev];
      const [draggedItem] = newPreviews.splice(draggedIndex, 1);
      newPreviews.splice(targetIndex, 0, draggedItem);
      
      if (onReorder) {
        onReorder(newPreviews);
      }
      
      return newPreviews;
    });

    setFiles(prev => {
      const newFiles = [...prev];
      const [draggedItem] = newFiles.splice(draggedIndex, 1);
      newFiles.splice(targetIndex, 0, draggedItem);
      return newFiles;
    });
    
    setDraggedIndex(null);
  };

  // Cleanup object URLs when component unmounts or previews change
  useEffect(() => {
    return () => {
      previews.forEach(preview => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [previews]);

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-gray-400 cursor-pointer'}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className={`
            p-3 rounded-full transition-colors
            ${dragActive ? 'bg-blue-100' : 'bg-gray-100'}
            ${error ? 'bg-red-100' : ''}
          `}>
            {error ? (
              <AlertCircle className="w-8 h-8 text-red-500" />
            ) : (
              <Upload className={`w-8 h-8 ${dragActive ? 'text-blue-500' : 'text-gray-500'}`} />
            )}
          </div>
          
          <div>
            <p className={`text-lg font-medium ${error ? 'text-red-700' : 'text-gray-700'}`}>
              {error || (dragActive ? 'Drop images here' : 'Upload images')}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {multiple ? 'Select multiple files or drag and drop' : 'Select a file or drag and drop'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              JPEG, PNG, GIF, WebP up to 5MB
              {multiple && <span> (Max 10 images)</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            {multiple ? `Selected Images (${previews.length})` : 'Selected Image'}
          </h4>
          
          <div className={`
            grid gap-4 
            ${multiple ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 max-w-xs'}
          `}>
            {previews.map((preview, index) => (
              <div
                key={index}
                className="relative group"
                draggable={multiple}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropReorder(e, index)}
              >
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Remove button */}
                <button
                  onClick={() => removeImage(index)}
                  disabled={disabled}
                  className="
                    absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200
                    hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed
                    focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                  "
                >
                  <X className="w-4 h-4" />
                </button>
                
                {/* File info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="text-xs truncate">Image {index + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for multiple mode */}
      {multiple && previews.length === 0 && !error && (
        <div className="mt-4 text-center">
          <FileImage className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No images selected</p>
        </div>
      )}
    </div>
  );
}
 