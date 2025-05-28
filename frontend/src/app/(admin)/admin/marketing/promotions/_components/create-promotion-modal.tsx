'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { PromotionActions, CreatePromotionDto } from '@/api-actions/promotion-actions';

interface CreatePromotionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePromotionModal({ open, onClose, onSuccess }: CreatePromotionModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePromotionDto>({
    name: '',
    description: '',
    code: '',
    type: 'DISCOUNT_CODE',
    discount_type: 'PERCENTAGE',
    discount_value: 0,
    minimum_amount: undefined,
    maximum_uses: undefined,
    uses_per_user: undefined,
    starts_at: new Date(),
    ends_at: undefined,
    applicable_categories: [],
    applicable_products: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Promotion name is required');
      return;
    }

    if (formData.discount_value <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }

    if (formData.discount_type === 'PERCENTAGE' && formData.discount_value > 100) {
      toast.error('Percentage discount cannot exceed 100%');
      return;
    }    if (formData.type === 'DISCOUNT_CODE' && !formData.code?.trim()) {
      // Code will be auto-generated on the backend if not provided
      // toast.error('Discount code is required for discount code promotions');
      // return;
    }try {
      setLoading(true);
      const response = await PromotionActions.createPromotion(formData);
      
      if (response.data) {
        toast.success('Promotion created successfully');
        onSuccess();
        resetForm();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create promotion');
      console.error('Error creating promotion:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      code: '',
      type: 'DISCOUNT_CODE',
      discount_type: 'PERCENTAGE',
      discount_value: 0,
      minimum_amount: undefined,
      maximum_uses: undefined,
      uses_per_user: undefined,
      starts_at: new Date(),
      ends_at: undefined,
      applicable_categories: [],
      applicable_products: [],
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Promotion</DialogTitle>
          <DialogDescription>
            Create a new promotional campaign with discount codes and special offers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Promotion Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Summer Sale 2024"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Promotion Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DISCOUNT_CODE">Discount Code</SelectItem>
                  <SelectItem value="AUTOMATIC_DISCOUNT">Automatic Discount</SelectItem>
                  <SelectItem value="BUNDLE_OFFER">Bundle Offer</SelectItem>
                  <SelectItem value="SEASONAL_SALE">Seasonal Sale</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your promotion..."
              rows={3}
            />
          </div>          {formData.type === 'DISCOUNT_CODE' && (
            <div className="space-y-2">
              <Label htmlFor="code">Discount Code (Optional)</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., SUMMER20 (leave empty to auto-generate)"
                className="uppercase"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to automatically generate a unique code
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount_type">Discount Type</Label>
              <Select
                value={formData.discount_type}
                onValueChange={(value: any) => setFormData({ ...formData, discount_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                  <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.discount_type !== 'FREE_SHIPPING' && (
              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  Discount Value * {formData.discount_type === 'PERCENTAGE' ? '(%)' : '(₹)'}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  min="0"
                  max={formData.discount_type === 'PERCENTAGE' ? '100' : undefined}
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minimum_amount">Minimum Order Amount (₹)</Label>
              <Input
                id="minimum_amount"
                type="number"
                min="0"
                value={formData.minimum_amount || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  minimum_amount: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maximum_uses">Maximum Total Uses</Label>
              <Input
                id="maximum_uses"
                type="number"
                min="1"
                value={formData.maximum_uses || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  maximum_uses: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                placeholder="Unlimited"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="uses_per_user">Uses Per User</Label>
              <Input
                id="uses_per_user"
                type="number"
                min="1"
                value={formData.uses_per_user || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  uses_per_user: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                placeholder="Unlimited"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.starts_at && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.starts_at ? format(formData.starts_at, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.starts_at}
                    onSelect={(date) => setFormData({ ...formData, starts_at: date || new Date() })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.ends_at && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.ends_at ? format(formData.ends_at, "PPP") : "No end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.ends_at}
                    onSelect={(date) => setFormData({ ...formData, ends_at: date })}
                    disabled={(date) => date < formData.starts_at}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Promotion'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
