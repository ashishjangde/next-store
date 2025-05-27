'use client';

import React, { useState, useEffect } from 'react';
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
import { PromotionActions, UpdatePromotionDto, Promotion } from '@/api-actions/promotion-actions';

interface EditPromotionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  promotion: Promotion | null;
}

export default function EditPromotionModal({ open, onClose, onSuccess, promotion }: EditPromotionModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdatePromotionDto>({});

  useEffect(() => {
    if (promotion) {
      setFormData({
        name: promotion.name,
        description: promotion.description || '',
        code: promotion.code || '',
        type: promotion.type,
        discount_type: promotion.discount_type,
        discount_value: promotion.discount_value,
        minimum_amount: promotion.minimum_amount,
        maximum_uses: promotion.maximum_uses,
        uses_per_user: promotion.uses_per_user,
        starts_at: new Date(promotion.starts_at),
        ends_at: promotion.ends_at ? new Date(promotion.ends_at) : undefined,
        status: promotion.status,
        is_active: promotion.is_active,
        applicable_categories: promotion.applicable_categories,
        applicable_products: promotion.applicable_products,
      });
    }
  }, [promotion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promotion) return;

    // Validation
    if (!formData.name?.trim()) {
      toast.error('Promotion name is required');
      return;
    }

    if (formData.discount_value !== undefined && formData.discount_value <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }

    if (formData.discount_type === 'PERCENTAGE' && formData.discount_value !== undefined && formData.discount_value > 100) {
      toast.error('Percentage discount cannot exceed 100%');
      return;
    }

    if (formData.type === 'DISCOUNT_CODE' && !formData.code?.trim()) {
      toast.error('Discount code is required for discount code promotions');
      return;
    }    try {
      setLoading(true);
      const response = await PromotionActions.updatePromotion(promotion.id, formData);
      
      if (response.data) {
        toast.success('Promotion updated successfully');
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update promotion');
      console.error('Error updating promotion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    onClose();
  };

  if (!promotion) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Promotion</DialogTitle>
          <DialogDescription>
            Update the promotional campaign details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Promotion Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
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
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your promotion..."
              rows={3}
            />
          </div>

          {formData.type === 'DISCOUNT_CODE' && (
            <div className="space-y-2">
              <Label htmlFor="code">Discount Code *</Label>
              <Input
                id="code"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., SUMMER20"
                className="uppercase"
              />
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
                  value={formData.discount_value || 0}
                  onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Active Status</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>{formData.is_active ? 'Active' : 'Inactive'}</Label>
              </div>
            </div>
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
                    disabled={(date) => formData.starts_at ? date < formData.starts_at : false}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="text-sm text-muted-foreground">
              <p><strong>Current Usage:</strong> {promotion.current_uses} times</p>
              <p><strong>Created:</strong> {format(new Date(promotion.created_at), "PPP")}</p>
              <p><strong>Last Updated:</strong> {format(new Date(promotion.updated_at), "PPP")}</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Promotion'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
