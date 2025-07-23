'use client'

import * as React from 'react'
import { Upload, X, File, Image, FileText, AlertCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

interface FileUploadProps {
  onFilesChange: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxSize?: number // in bytes
  maxFiles?: number
  disabled?: boolean
  className?: string
  children?: React.ReactNode
  showPreview?: boolean
  allowedTypes?: string[]
  onError?: (error: string) => void
}

export function FileUpload({
  onFilesChange,
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = multiple ? 10 : 1,
  disabled = false,
  className,
  children,
  showPreview = true,
  allowedTypes,
  onError,
}: FileUploadProps) {
  const [files, setFiles] = React.useState<File[]>([])
  const [dragActive, setDragActive] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `File "${file.name}" is too large. Maximum size is ${formatFileSize(maxSize)}.`
    }

    if (allowedTypes && !allowedTypes.includes(file.type)) {
      return `File "${file.name}" has an unsupported format.`
    }

    return null
  }

  const handleFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    const validFiles: File[] = []
    let errorMessage: string | null = null

    // Check total file count
    if (files.length + fileArray.length > maxFiles) {
      errorMessage = `Cannot upload more than ${maxFiles} file${maxFiles > 1 ? 's' : ''}.`
      setError(errorMessage)
      onError?.(errorMessage)
      return
    }

    // Validate each file
    for (const file of fileArray) {
      const validation = validateFile(file)
      if (validation) {
        errorMessage = validation
        break
      }
      validFiles.push(file)
    }

    if (errorMessage) {
      setError(errorMessage)
      onError?.(errorMessage)
      return
    }

    const updatedFiles = multiple ? [...files, ...validFiles] : validFiles
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
    setError(null)
  }

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles) {
      handleFiles(droppedFiles)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const openFileDialog = () => {
    inputRef.current?.click()
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />
    }
    if (file.type.includes('pdf') || file.type.includes('document')) {
      return <FileText className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors',
          dragActive && 'border-primary bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer hover:border-muted-foreground/50'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!disabled ? openFileDialog : undefined}
      >
        {children || (
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-sm">
              <span className="font-medium">Click to upload</span> or drag and drop
            </div>
            <div className="text-xs text-muted-foreground">
              {accept && `Accepted formats: ${accept}`}
              {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
              {multiple && ` • Max files: ${maxFiles}`}
            </div>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showPreview && files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <div className="flex items-center space-x-2">
                  {getFileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// File Upload with Progress
interface FileUploadWithProgressProps extends FileUploadProps {
  onUpload: (files: File[]) => Promise<void>
  uploadText?: string
  uploadingText?: string
}

export function FileUploadWithProgress({
  onUpload,
  uploadText = 'Upload Files',
  uploadingText = 'Uploading...',
  ...props
}: FileUploadWithProgressProps) {
  const [files, setFiles] = React.useState<File[]>([])
  const [uploading, setUploading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles)
    props.onFilesChange(newFiles)
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setProgress(0)

    try {
      // Simulate progress for demo - replace with actual upload progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      await onUpload(files)
      setProgress(100)
      
      // Clear files after successful upload
      setTimeout(() => {
        setFiles([])
        setProgress(0)
        setUploading(false)
      }, 1000)
    } catch (error) {
      console.error('Upload failed:', error)
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-4">
      <FileUpload
        {...props}
        onFilesChange={handleFilesChange}
        disabled={props.disabled || uploading}
      />
      
      {files.length > 0 && (
        <div className="space-y-2">
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{uploadingText}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
          
          <Button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="w-full"
          >
            {uploading ? uploadingText : uploadText}
          </Button>
        </div>
      )}
    </div>
  )
}

// Hook for managing file upload state
export function useFileUpload() {
  const [files, setFiles] = React.useState<File[]>([])
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const addFiles = React.useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const removeFile = React.useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const clearFiles = React.useCallback(() => {
    setFiles([])
  }, [])

  const uploadFiles = React.useCallback(async (uploadFn: (files: File[]) => Promise<void>) => {
    if (files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      await uploadFn(files)
      setFiles([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [files])

  return {
    files,
    uploading,
    error,
    setFiles,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    setError,
  }
}