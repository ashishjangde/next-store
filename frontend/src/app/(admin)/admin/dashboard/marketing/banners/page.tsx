'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BannerActions, Banner } from '@/api-actions/banner-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Image as ImageIcon,
  Calendar,
  User,
  ArrowUpDown
} from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { CreateBannerModal } from './_components/create-banner-modal';
import { EditBannerModal } from './_components/edit-banner-modal';
import { AlertModal } from '@/components/common/alert-modal';

export default function BannersPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Close any open dropdowns when modals open
  useEffect(() => {
    if (isCreateModalOpen || isEditModalOpen || isDeleteModalOpen || previewBanner) {
      setOpenDropdownId(null);
    }
  }, [isCreateModalOpen, isEditModalOpen, isDeleteModalOpen, previewBanner]);

  // Fetch banners
  const { data: bannersData, isLoading, error } = useQuery({
    queryKey: ['admin-banners', page, limit],
    queryFn: () => BannerActions.getBanners({ page, limit }),
    staleTime: 30000, // 30 seconds
  });

  // Toggle banner status mutation
  const { mutate: toggleBannerStatus } = useMutation({
    mutationFn: (banner: Banner) => 
      BannerActions.updateBanner(banner.id, { is_active: !banner.is_active }),
    onSuccess: () => {
      toast.success('Banner status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
    },
    onError: (error) => {
      console.error('Error updating banner status:', error);
      toast.error('Failed to update banner status');
    },
  });

  // Delete banner mutation
  const { mutate: deleteBanner, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => BannerActions.deleteBanner(id),
    onSuccess: () => {
      toast.success('Banner deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      setIsDeleteModalOpen(false);
      setSelectedBanner(null);
    },
    onError: (error) => {
      console.error('Error deleting banner:', error);
      toast.error('Failed to delete banner');
    },
  });
  const banners = bannersData?.data?.banners || [];
  const totalPages = bannersData?.data?.totalPages || 1;
  const handleEdit = (banner: Banner) => {
    setOpenDropdownId(null); // Close any open dropdown
    setSelectedBanner(banner);
    setIsEditModalOpen(true);
  };

  const handleDelete = (banner: Banner) => {
    setOpenDropdownId(null); // Close any open dropdown
    setSelectedBanner(banner);
    setIsDeleteModalOpen(true);
  };

  const handlePreview = (banner: Banner) => {
    setOpenDropdownId(null); // Close any open dropdown
    setPreviewBanner(banner);
  };

  if (isLoading) {
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-4 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Banner Management</h2>
          </div>
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-4 pt-6">
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-2">Failed to load banners</p>
              <Button 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-banners'] })}
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6">
        {/* Header */}        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Banner Management</h2>
            <p className="text-muted-foreground">
              Manage promotional banners displayed on your website
            </p>
          </div>
          <Button onClick={() => {
            setOpenDropdownId(null); // Close any open dropdown
            setIsCreateModalOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Create Banner
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Banners</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>            <CardContent>
              <div className="text-2xl font-bold">{bannersData?.data?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Banners</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {banners.filter(b => b.is_active).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Banners</CardTitle>
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {banners.filter(b => !b.is_active).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Banners Table */}
        <Card>
          <CardHeader>
            <CardTitle>Banners</CardTitle>
          </CardHeader>
          <CardContent>
            {banners.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No banners</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first banner.
                </p>                <div className="mt-6">
                  <Button onClick={() => {
                    setOpenDropdownId(null); // Close any open dropdown
                    setIsCreateModalOpen(true);
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Banner
                  </Button>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        Sort Order
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell>
                        <div 
                          className="relative w-16 h-10 rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handlePreview(banner)}
                        >
                          <Image
                            src={banner.image_url}
                            alt={banner.title}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-product.svg';
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{banner.title}</div>
                          {banner.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {banner.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={banner.is_active}
                            onCheckedChange={() => toggleBannerStatus(banner)}
                          />
                          <Badge variant={banner.is_active ? "default" : "secondary"}>
                            {banner.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{banner.sort_order}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(banner.created_at), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          {banner.created_by_user?.username || banner.created_by_user?.email || 'Admin'}
                        </div>
                      </TableCell>                      
                      <TableCell className="text-right">
                        <DropdownMenu 
                          open={openDropdownId === banner.id}
                          onOpenChange={(open) => {
                            if (open) {
                              setOpenDropdownId(banner.id);
                            } else {
                              setOpenDropdownId(null);
                            }
                          }}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePreview(banner)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(banner)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(banner)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Banner Modal */}
      <CreateBannerModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
          setIsCreateModalOpen(false);
        }}
      />

      {/* Edit Banner Modal */}
      {selectedBanner && (
        <EditBannerModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          banner={selectedBanner}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
            setIsEditModalOpen(false);
            setSelectedBanner(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => selectedBanner && deleteBanner(selectedBanner.id)}
        loading={isDeleting}
        title="Delete Banner"
        description={`Are you sure you want to delete "${selectedBanner?.title}"? This action cannot be undone.`}
      />

      {/* Banner Preview Modal */}
      {previewBanner && (
        <Dialog open={!!previewBanner} onOpenChange={() => setPreviewBanner(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{previewBanner.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <Image
                  src={previewBanner.image_url}
                  alt={previewBanner.title}
                  fill
                  className="object-cover"
                />
              </div>
              {previewBanner.description && (
                <p className="text-muted-foreground">{previewBanner.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Badge variant={previewBanner.is_active ? "default" : "secondary"}>
                    {previewBanner.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>Sort Order: {previewBanner.sort_order}</div>
                <div>Created: {format(new Date(previewBanner.created_at), 'PPP')}</div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
