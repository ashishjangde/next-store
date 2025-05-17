interface ICategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  image: string;
  is_featured: boolean;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface ICreateCategory {
  name: string;
  description: string;
  slug: string;
  image?: File | null;
  is_featured?: boolean;
  active?: boolean;
  sort_order?: number;
}

interface IUpdateCategory {
  name?: string;
  description?: string;
  slug?: string;
  image?: File | null;
  is_featured?: boolean;
  active?: boolean;
  sort_order?: number;
}

interface ICategoriesResponse {
  categories: ICategory[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
