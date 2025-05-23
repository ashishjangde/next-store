"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CategoryDetailsTabProps {
  category: Category;
}

export const CategoryDetailsTab = ({ category }: CategoryDetailsTabProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <dt className="font-semibold">ID:</dt>
              <dd className="col-span-2 break-all">{category.id}</dd>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <dt className="font-semibold">Name:</dt>
              <dd className="col-span-2">{category.name}</dd>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <dt className="font-semibold">Slug:</dt>
              <dd className="col-span-2">{category.slug}</dd>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <dt className="font-semibold">Status:</dt>
              <dd className="col-span-2">
                {category.active ? (
                  <Badge className="bg-green-500">Active</Badge>
                ) : (
                  <Badge variant="destructive">Inactive</Badge>
                )}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <dt className="font-semibold">Featured:</dt>
              <dd className="col-span-2">
                {category.is_featured ? (
                  <Badge className="bg-amber-500">Featured</Badge>
                ) : (
                  <Badge variant="outline">Not Featured</Badge>
                )}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <dt className="font-semibold">Created:</dt>
              <dd className="col-span-2">
                {formatDate(category.created_at.toString())}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <dt className="font-semibold">Updated:</dt>
              <dd className="col-span-2">
                {formatDate(category.updated_at.toString())}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Category Image</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            {category.image ? (
              <div className="relative h-60 w-60 overflow-hidden rounded-md border">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 240px"
                />
              </div>
            ) : (
              <div className="flex h-60 w-60 items-center justify-center rounded-md border border-dashed bg-muted text-muted-foreground">
                No image available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parent Category</CardTitle>
          </CardHeader>
          <CardContent>
            {category.parent ? (
              <Link
                href={`/admin/dashboard/categories/${category.parent.id}`}
                className="text-blue-600 hover:underline flex items-center gap-2"
              >
                {category.parent.name}
              </Link>
            ) : (
              <span className="text-muted-foreground">
                This is a root category (no parent)
              </span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            {category.description ? (
              <p>{category.description}</p>
            ) : (
              <span className="text-muted-foreground">
                No description available
              </span>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
