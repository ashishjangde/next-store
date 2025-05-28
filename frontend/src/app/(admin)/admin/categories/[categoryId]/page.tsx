import { Suspense } from 'react';
import { LoadingPage } from "@/components/common/loading";
import { CategoryDetailPage } from '@/app/(admin)/admin/dashboard/categories/[categoryId]/_components/category-detail-page';


export default async function CategoryDetailPageWrapper(
  {
  params
  }: {
    params: Promise<{ categoryId: string }>;
  }
) {

  const { categoryId } = await params;

  return (

      <Suspense fallback={<LoadingPage />}>
        <CategoryDetailPage categoryId={categoryId} />
      </Suspense>
  );
}
