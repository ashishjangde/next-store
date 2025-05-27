'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { BannerActions, BannerCreateInput } from '@/api-actions/banner-actions';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import CustomImageUpload from '@/components/common/custom-image-upload';

interface CreateBannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type FormData = {
  title: string;
  description?: string;
  image: File | null;
  is_active: boolean;
  sort_order: number;
};

export const CreateBannerModal = ({ open, onOpenChange, onSuccess }: CreateBannerModalProps) => {
  const [imagePreview, setImagePreview] = useState<string>('');

  const form = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      image: null,
      is_active: true,
      sort_order: 1,
    },
  });

  const { mutate: createBanner, isPending } = useMutation({
    mutationFn: (data: FormData) => {
      if (!data.image) {
        throw new Error('Please select an image');
      }

      const bannerData: BannerCreateInput = {
        title: data.title,
        description: data.description || undefined,
        image: data.image,
        is_active: data.is_active,
        sort_order: data.sort_order,
      };

      return BannerActions.createBanner(bannerData);
    },
    onSuccess: () => {
      toast.success('Banner created successfully');
      form.reset();
      setImagePreview('');
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Error creating banner:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to create banner';
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: FormData) => {
    if (!data.image) {
      toast.error('Please select an image');
      return;
    }
    createBanner(data);
  };

  const handleImageChange = (files: File[] | File | null) => {
    if (files) {
      const file = Array.isArray(files) ? files[0] : files;
      form.setValue('image', file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      form.setValue('image', null);
      setImagePreview('');
    }
  };

  const handleClose = () => {
    if (!isPending) {
      form.reset();
      setImagePreview('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Banner</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              rules={{ required: 'Title is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder="Enter banner title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isPending}
                      placeholder="Enter banner description"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of the banner content
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload */}
            <FormField
              control={form.control}
              name="image"
              rules={{ required: 'Please select an image' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner Image</FormLabel>
                  <FormControl>
                    <CustomImageUpload
                      value={imagePreview}
                      disabled={isPending}
                      onChange={handleImageChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload a high-quality image for your banner. Recommended size: 1920x600px
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Settings Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sort Order */}
              <FormField
                control={form.control}
                name="sort_order"
                rules={{ 
                  required: 'Sort order is required',
                  min: { value: 1, message: 'Sort order must be at least 1' }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled={isPending}
                        placeholder="1"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Lower numbers appear first
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Active Status */}
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-end space-y-2">
                    <FormLabel>Status</FormLabel>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isPending}
                        />
                      </FormControl>
                      <span className="text-sm text-muted-foreground">
                        {field.value ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <FormDescription>
                      Only active banners are displayed on the website
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Banner
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
