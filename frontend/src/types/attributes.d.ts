interface Attribute {
  id: string;
  name: string;
  description?: string;
  type: string;
  values?: AttributeValue[];
  created_at: string;
  updated_at: string;
}

interface AttributeValue {
  id: string;
  attribute_id: string;
  value: string;
  display_value?: string;
}

interface AttributesListResponse {
  data: Attribute[];
  total: number;
  page: number;
  limit: number;
}

interface CategoryAttribute {
  category_id: string;
  attribute_id: string;
  required: boolean;
  category?: Category;
  attribute?: Attribute;
}
