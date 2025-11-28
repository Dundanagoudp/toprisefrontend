'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { Loader2, CreditCard, AlertCircle } from 'lucide-react'
import {
  getBankDetails,
  createBankDetails,
  updateBankDetails,
  UserBankDetails,
} from '@/service/user/userService'
import { getUserIdFromToken } from '@/utils/auth'

interface BankDetailsPromptModalProps {
  isOpen: boolean
  onClose: () => void
  onBankDetailsAdded: () => void
}

export default function BankDetailsPromptModal({
  isOpen,
  onClose,
  onBankDetailsAdded,
}: BankDetailsPromptModalProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [bankDetails, setBankDetails] = useState<UserBankDetails>({
    account_number: '',
    ifsc_code: '',
    account_type: '',
    bank_account_holder_name: '',
    bank_name: '',
  })

  const userId = getUserIdFromToken()

  useEffect(() => {
    if (isOpen && userId) {
      fetchBankDetails()
    }
  }, [isOpen, userId])

  const fetchBankDetails = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const response = await getBankDetails(userId)
      if (response.success && response.data) {
        setBankDetails({
          account_number: response.data.account_number || '',
          ifsc_code: response.data.ifsc_code || '',
          account_type: response.data.account_type || '',
          bank_account_holder_name: response.data.bank_account_holder_name || '',
          bank_name: response.data.bank_name || '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch bank details:', error)
      // If bank details don't exist, that's fine - we'll create them
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!userId) {
      showToast('User ID not found', 'error')
      return
    }

    // Validate required fields
    if (
      !bankDetails.account_number ||
      !bankDetails.ifsc_code ||
      !bankDetails.bank_name ||
      !bankDetails.bank_account_holder_name ||
      !bankDetails.account_type
    ) {
      showToast('Please fill in all bank details fields', 'error')
      return
    }

    try {
      setSaving(true)

      // Check if bank details already exist
      const existingResponse = await getBankDetails(userId)
      const bankDetailsExist =
        existingResponse.success &&
        existingResponse.data &&
        (existingResponse.data.account_number ||
          existingResponse.data.ifsc_code ||
          existingResponse.data.bank_name)

      let response
      if (bankDetailsExist) {
        // Update existing bank details
        response = await updateBankDetails(userId, bankDetails)
      } else {
        // Create new bank details
        response = await createBankDetails(userId, bankDetails)
      }

      if (response.success) {
        showToast('Bank details saved successfully', 'success')
        onBankDetailsAdded()
        onClose()
      } else {
        showToast(response.message || 'Failed to save bank details', 'error')
      }
    } catch (error: any) {
      console.error('Failed to save bank details:', error)
      showToast(error.message || 'Failed to save bank details', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleGoToProfile = () => {
    router.push('/profile?tab=profile&section=bank-details')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <DialogTitle>Bank Details Required</DialogTitle>
              <DialogDescription className="mt-1">
                To process your refund for this COD order, please add your bank
                details first.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading bank details...
              </span>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">
                      Why do we need your bank details?
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      For COD orders, refunds are processed directly to your
                      bank account. Please provide your bank details to receive
                      your refund.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="account_number">Account Number *</Label>
                    <Input
                      id="account_number"
                      value={bankDetails.account_number}
                      onChange={(e) =>
                        setBankDetails({
                          ...bankDetails,
                          account_number: e.target.value,
                        })
                      }
                      placeholder="Enter account number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ifsc_code">IFSC Code *</Label>
                    <Input
                      id="ifsc_code"
                      value={bankDetails.ifsc_code}
                      onChange={(e) =>
                        setBankDetails({
                          ...bankDetails,
                          ifsc_code: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="Enter IFSC code"
                      maxLength={11}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank_name">Bank Name *</Label>
                  <Input
                    id="bank_name"
                    value={bankDetails.bank_name}
                    onChange={(e) =>
                      setBankDetails({
                        ...bankDetails,
                        bank_name: e.target.value,
                      })
                    }
                    placeholder="Enter bank name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank_account_holder_name">
                    Account Holder Name *
                  </Label>
                  <Input
                    id="bank_account_holder_name"
                    value={bankDetails.bank_account_holder_name}
                    onChange={(e) =>
                      setBankDetails({
                        ...bankDetails,
                        bank_account_holder_name: e.target.value,
                      })
                    }
                    placeholder="Enter account holder name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account_type">Account Type *</Label>
                  <Select
                    value={bankDetails.account_type || ''}
                    onValueChange={(value) => {
                      if (
                        [
                          'Savings',
                          'Current',
                          'Fixed Deposit',
                          'Recurring Deposit',
                        ].includes(value)
                      ) {
                        setBankDetails({
                          ...bankDetails,
                          account_type: value,
                        })
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Savings">Savings</SelectItem>
                      <SelectItem value="Current">Current</SelectItem>
                      <SelectItem value="Fixed Deposit">Fixed Deposit</SelectItem>
                      <SelectItem value="Recurring Deposit">
                        Recurring Deposit
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Bank Details'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGoToProfile}
                  className="flex-1"
                >
                  Go to Profile
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

