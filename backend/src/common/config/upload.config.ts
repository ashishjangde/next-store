export const uploadConfig = {
  profilePicture: {
    destination: './uploads/profiles',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: /\.(jpg|jpeg|png|gif)$/,
    errorMessage: 'Only image files (jpg, jpeg, png, gif) are allowed!'
  },
  document: {
    destination: './uploads/documents',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: /\.(pdf|doc|docx)$/,
    errorMessage: 'Only document files (pdf, doc, docx) are allowed!'
  },
  categoryImage: {
    destination: './uploads/categories',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: /\.(jpg|jpeg|png|gif)$/,
    errorMessage: 'Only image files (jpg, jpeg, png, gif) are allowed!'
  },
  productImages: {
    destination: './uploads/products',
    maxSize: 8 * 1024 * 1024, // 8MB
    allowedTypes: /\.(jpg|jpeg|png|gif|webp)$/,
    errorMessage: 'Only image files (jpg, jpeg, png, gif, webp) are allowed!'
  },
  // Add more upload configurations as needed
};
