// Define the Attribute interface if it's not already defined elsewhere
interface Attribute {
  id: string;
  name: string;
  display_name: string;
  type: string;
  required?: boolean;
  filterable?: boolean;
  created_at:  Date;
  updated_at: Date;
}

interface CategoryAttribute {
  category_id: string;
  attribute_id: string;
  required: boolean;
  attribute?: Attribute; // References the Attribute type from attribute.d.ts
}

interface Category {
  id: string;
  name: string;
  description?: string | null;
  slug: string;
  image?: string | null;
  is_featured: boolean;
  active: boolean;
  level : 0|1|2
  created_at:  Date;
  updated_at:  Date;
  parent_id?: string | null;
  parent?: Category | null;
  children?: Category[];
  products?: string[];
  attributes?: CategoryAttribute[];
}



