'use client';

import { Suspense } from 'react';
import { LoadingPage } from "@/components/common/loading";
import { CategoryDetailPage } from '@/components/admin/categories/category-detail-page';
import { useParams } from 'next/navigation';


export default function CategoryDetailPageWrapper() {
  // This is now just a wrapper component that renders the client component
    const {categoryId} = useParams<{
    categoryId: string;
    }>();
 
  return (

      <Suspense fallback={<LoadingPage />}>
        <CategoryDetailPage categoryId={categoryId} />
      </Suspense>
  );
}
