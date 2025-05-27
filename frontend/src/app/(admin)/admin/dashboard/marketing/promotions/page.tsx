'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Percent,
  Tag,
  TrendingUp,
  Users,
  Copy,
  Pause,
  Play
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { PromotionActions, Promotion } from '@/api-actions/promotion-actions';
import CreatePromotionModal from './_components/create-promotion-modal';
import EditPromotionModal from './_components/edit-promotion-modal';
import { formatCurrency } from '@/lib/utils';

interface PromotionStats {
  totalPromotions: number;
  activePromotions: number;
  totalUsage: number;
  totalSavings: number;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [stats, setStats] = useState<PromotionStats>({
    totalPromotions: 0,
    activePromotions: 0,
    totalUsage: 0,
    totalSavings: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  const fetchPromotions = async () => {
    try {
      setLoading(true);      const statusParam = statusFilter === 'all' ? undefined : statusFilter;
      const response = await PromotionActions.getAllPromotions(currentPage, 10, statusParam);
      
      if (response.data) {
        setPromotions(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      toast.error('Failed to fetch promotions');
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchStats = async () => {
    try {
      const response = await PromotionActions.getPromotionStats();
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchPromotions();
    fetchStats();
  }, [currentPage, statusFilter]);

  const handleCreatePromotion = () => {
    setShowCreateModal(true);
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setShowEditModal(true);
  };

  const handleDeletePromotion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;    try {
      const response = await PromotionActions.deletePromotion(id);
      if (response.data) {
        toast.success('Promotion deleted successfully');
        fetchPromotions();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to delete promotion');
      console.error('Error deleting promotion:', error);
    }
  };

  const handleToggleStatus = async (promotion: Promotion) => {
    try {
      const newStatus = promotion.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';      const response = await PromotionActions.updatePromotion(promotion.id, {
        status: newStatus
      });
      
      if (response.data) {
        toast.success(`Promotion ${newStatus.toLowerCase()} successfully`);
        fetchPromotions();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to update promotion status');
      console.error('Error updating promotion:', error);
    }
  };

  const copyPromotionCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Promotion code copied to clipboard');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { variant: 'secondary' as const, label: 'Draft' },
      ACTIVE: { variant: 'default' as const, label: 'Active' },
      PAUSED: { variant: 'outline' as const, label: 'Paused' },
      EXPIRED: { variant: 'destructive' as const, label: 'Expired' },
      CANCELLED: { variant: 'destructive' as const, label: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getDiscountDisplay = (promotion: Promotion) => {
    if (promotion.discount_type === 'PERCENTAGE') {
      return `${promotion.discount_value}%`;
    } else if (promotion.discount_type === 'FIXED_AMOUNT') {
      return formatCurrency(promotion.discount_value);
    } else {
      return 'Free Shipping';
    }
  };

  const filteredPromotions = promotions.filter(promotion =>
    promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (promotion.code && promotion.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Promotions</h2>
            <p className="text-muted-foreground">
              Manage discount codes, special offers, and promotional campaigns
            </p>
          </div>
          <Button onClick={handleCreatePromotion}>
            <Plus className="mr-2 h-4 w-4" />
            Create Promotion
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Promotions</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPromotions}</div>
              <p className="text-xs text-muted-foreground">
                All time promotions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Promotions</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePromotions}</div>
              <p className="text-xs text-muted-foreground">
                Currently running
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalSavings)}</div>
              <p className="text-xs text-muted-foreground">
                Customer savings to date
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsage}</div>
              <p className="text-xs text-muted-foreground">
                Times promotions used
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search promotions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PAUSED">Paused</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Promotions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Loading promotions...
                    </TableCell>
                  </TableRow>
                ) : filteredPromotions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No promotions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPromotions.map((promotion) => (
                    <TableRow key={promotion.id}>
                      <TableCell className="font-medium">
                        {promotion.name}
                      </TableCell>
                      <TableCell>
                        {promotion.code ? (
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-1 py-0.5 rounded text-sm">
                              {promotion.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyPromotionCode(promotion.code!)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Auto-applied</span>
                        )}
                      </TableCell>
                      <TableCell>{promotion.type.replace('_', ' ')}</TableCell>
                      <TableCell>{getDiscountDisplay(promotion)}</TableCell>
                      <TableCell>
                        {promotion.current_uses}
                        {promotion.maximum_uses && ` / ${promotion.maximum_uses}`}
                      </TableCell>
                      <TableCell>{getStatusBadge(promotion.status)}</TableCell>
                      <TableCell>
                        {promotion.ends_at ? 
                          new Date(promotion.ends_at).toLocaleDateString() : 
                          'No expiry'
                        }
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditPromotion(promotion)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(promotion)}>
                              {promotion.status === 'ACTIVE' ? (
                                <>
                                  <Pause className="mr-2 h-4 w-4" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeletePromotion(promotion.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreatePromotionModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchPromotions();
          fetchStats();
          setShowCreateModal(false);
        }}
      />

      <EditPromotionModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPromotion(null);
        }}
        promotion={selectedPromotion}
        onSuccess={() => {
          fetchPromotions();
          fetchStats();
          setShowEditModal(false);
          setSelectedPromotion(null);
        }}
      />
    </div>
  );
}
