"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface WithdrawConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function WithdrawConfirmDialog({ isOpen, onClose, onConfirm }: WithdrawConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await onConfirm()
      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to withdraw application. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Withdraw Application</DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to withdraw your application?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Alert variant="destructive" className="flex items-start">
            <AlertCircle className="h-5 w-5 mt-0.5 mr-2" />
            <AlertDescription>
              This will withdraw your application. You can reapply for this job again if you change your mind.
            </AlertDescription>
          </Alert>
        </div>

        {error && (
          <div className="mb-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter className="sm:justify-between gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? "Withdrawing..." : "Yes, Withdraw"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
