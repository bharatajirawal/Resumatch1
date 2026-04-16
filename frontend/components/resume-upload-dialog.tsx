"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ResumeUpload } from "@/components/resume-upload"
import { PlusCircle } from "lucide-react"

interface ResumeUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ResumeUploadDialog({ open, onOpenChange, onSuccess }: ResumeUploadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-primary" />
            Upload New Resume
          </DialogTitle>
          <DialogDescription>
            Add another resume to your profile for different job types or industries.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
          <ResumeUpload 
            onUploadSuccess={() => {
              if (onSuccess) onSuccess();
              onOpenChange(false);
            }} 
            defaultPrimary={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
