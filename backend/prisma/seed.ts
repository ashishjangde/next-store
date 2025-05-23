import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Define your attributes
const attributes = [
  {
    name: 'Size',
    type: 'string',
    description: 'Available sizes for apparel',
    values: ['XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL', '6XL', '0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20', '22', '24', '26', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', '50'],
  },
  {
    name: 'Color',
    type: 'string',
    description: 'Available colors',
    values: ['Red', 'Blue', 'Black', 'White', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Brown', 'Gray', 'Grey', 'Navy', 'Maroon', 'Teal', 'Turquoise', 'Lime', 'Olive', 'Silver', 'Gold', 'Beige', 'Tan', 'Ivory', 'Cream', 'Khaki', 'Burgundy', 'Magenta', 'Cyan', 'Coral', 'Salmon', 'Peach', 'Rose', 'Lavender', 'Mint', 'Sage', 'Charcoal', 'Slate', 'Indigo', 'Violet', 'Crimson', 'Scarlet', 'Emerald', 'Forest', 'Royal Blue', 'Sky Blue', 'Baby Blue', 'Hot Pink', 'Fuchsia', 'Plum', 'Wine'],
  },
  {
    name: 'Material',
    type: 'string',
    description: 'Material type',
    values: ['Cotton', 'Polyester', 'Wool', 'Silk', 'Linen', 'Denim', 'Leather', 'Suede', 'Cashmere', 'Velvet', 'Corduroy', 'Fleece', 'Spandex', 'Elastane', 'Lycra', 'Rayon', 'Viscose', 'Bamboo', 'Hemp', 'Nylon', 'Canvas', 'Twill', 'Satin', 'Chiffon', 'Georgette', 'Organza', 'Tulle', 'Mesh', 'Jersey', 'Knit', 'Flannel', 'Chambray', 'Poplin', 'Oxford', 'Voile', 'Crepe', 'Jacquard', 'Brocade', 'Taffeta', 'Mohair', 'Alpaca', 'Merino', 'Angora', 'Pashmina'],
  },
  {
    name: 'Gender',
    type: 'string',
    description: 'Target gender',
    values: ['Men', 'Women', 'Unisex', 'Boys', 'Girls', 'Kids', 'Toddler', 'Infant', 'Baby', 'Teen', 'Junior', 'Petite', 'Plus Size', 'Maternity'],
  },
  {
    name: 'Fit',
    type: 'string',
    description: 'Fit type',
    values: ['Slim', 'Regular', 'Loose', 'Relaxed', 'Skinny', 'Straight', 'Bootcut', 'Flare', 'Wide Leg', 'Tapered', 'Athletic', 'Compression', 'Oversized', 'Fitted', 'Tailored', 'Classic', 'Modern', 'Vintage', 'Cropped', 'High-Rise', 'Mid-Rise', 'Low-Rise', 'Drop Waist', 'Empire Waist', 'A-Line', 'Bodycon', 'Boyfriend', 'Girlfriend', 'Mom Fit', 'Dad Fit'],
  },
  {
    name: 'Category',
    type: 'string',
    description: 'Product category',
    values: ['T-Shirts', 'Shirts', 'Blouses', 'Sweaters', 'Hoodies', 'Jackets', 'Coats', 'Blazers', 'Vests', 'Cardigans', 'Pants', 'Jeans', 'Shorts', 'Skirts', 'Dresses', 'Jumpsuits', 'Rompers', 'Overalls', 'Suits', 'Lingerie', 'Underwear', 'Bras', 'Panties', 'Boxers', 'Briefs', 'Socks', 'Tights', 'Leggings', 'Activewear', 'Swimwear', 'Pajamas', 'Robes', 'Nightgowns', 'Tank Tops', 'Camisoles', 'Polo Shirts', 'Henley', 'Button-Down', 'Flannel Shirts', 'Graphic Tees', 'Watches', 'Belts', 'Wallets', 'Purses', 'Handbags', 'Backpacks', 'Messenger Bags', 'Clutches', 'Tote Bags', 'Crossbody Bags', 'Shoulder Bags', 'Laptop Bags', 'Briefcases', 'Duffle Bags', 'Fanny Packs', 'Belt Bags', 'Card Holders', 'Money Clips', 'Coin Purses', 'Travel Wallets', 'Phone Cases', 'Wristbands', 'Bracelets', 'Necklaces', 'Earrings', 'Rings', 'Sunglasses', 'Reading Glasses', 'Hats', 'Caps', 'Beanies', 'Scarves', 'Gloves', 'Mittens', 'Ties', 'Bow Ties', 'Pocket Squares', 'Cufflinks', 'Suspenders', 'Hair Accessories', 'Headbands', 'Hair Clips', 'Scrunchies'],
  },
  {
    name: 'Season',
    type: 'string',
    description: 'Seasonal category',
    values: ['Spring', 'Summer', 'Fall', 'Winter', 'All Season', 'Transitional', 'Holiday', 'Resort', 'Back to School', 'Vacation'],
  },
  {
    name: 'Occasion',
    type: 'string',
    description: 'Occasion or use case',
    values: ['Casual', 'Formal', 'Business', 'Work', 'Party', 'Wedding', 'Date Night', 'Weekend', 'Vacation', 'Beach', 'Sports', 'Gym', 'Running', 'Yoga', 'Loungewear', 'Sleep', 'Outdoor', 'Travel', 'School', 'Interview'],
  },
  {
    name: 'Style',
    type: 'string',
    description: 'Fashion style',
    values: ['Classic', 'Modern', 'Vintage', 'Retro', 'Bohemian', 'Minimalist', 'Preppy', 'Edgy', 'Romantic', 'Sporty', 'Streetwear', 'Grunge', 'Gothic', 'Punk', 'Hipster', 'Chic', 'Elegant', 'Trendy', 'Timeless', 'Contemporary', 'Gen Z', 'Y2K', 'Cottagecore', 'Dark Academia', 'Light Academia', 'E-Girl', 'E-Boy', 'Soft Girl', 'VSCO Girl', 'Indie', 'Alt', 'Kawaii', 'Harajuku', 'Normcore', 'Gorpcore', 'Barbiecore', 'Coquette', 'Clean Girl', 'That Girl', 'Old Money', 'Quiet Luxury', 'Maximalist', 'Art Hoe', 'Cottage Witch', 'Fairycore', 'Kidcore'],
  },
  {
    name: 'Sleeve Length',
    type: 'string',
    description: 'Sleeve length options',
    values: ['Sleeveless', 'Cap Sleeve', 'Short Sleeve', 'Three Quarter', '3/4 Sleeve', 'Long Sleeve', 'Extra Long', 'Bell Sleeve', 'Flutter Sleeve', 'Puff Sleeve', 'Raglan', 'Dolman', 'Kimono Sleeve'],
  },
  {
    name: 'Neckline',
    type: 'string',
    description: 'Neckline styles',
    values: ['Crew Neck', 'V-Neck', 'Scoop Neck', 'Round Neck', 'Boat Neck', 'Off Shoulder', 'One Shoulder', 'Halter', 'Strapless', 'High Neck', 'Turtle Neck', 'Mock Neck', 'Cowl Neck', 'Square Neck', 'Sweetheart', 'Deep V', 'Keyhole', 'Choker Neck'],
  },
  {
    name: 'Pattern',
    type: 'string',
    description: 'Patterns and prints',
    values: ['Solid', 'Striped', 'Plaid', 'Checkered', 'Polka Dot', 'Floral', 'Abstract', 'Geometric', 'Animal Print', 'Leopard', 'Zebra', 'Snake', 'Camouflage', 'Tie Dye', 'Ombre', 'Color Block', 'Tribal', 'Paisley', 'Damask', 'Houndstooth', 'Argyle', 'Gingham', 'Toile', 'Ikat', 'Chevron'],
  },
  {
    name: 'Closure',
    type: 'string',
    description: 'Closure types',
    values: ['Button', 'Zip', 'Zipper', 'Snap', 'Hook and Eye', 'Velcro', 'Tie', 'Drawstring', 'Elastic', 'Belt', 'Buckle', 'Magnetic', 'Pull Over', 'Wrap', 'Lace Up'],
  },
  {
    name: 'Length',
    type: 'string',
    description: 'Garment length',
    values: ['Cropped', 'Short', 'Regular', 'Long', 'Extra Long', 'Tunic', 'Mini', 'Midi', 'Maxi', 'Floor Length', 'Ankle Length', 'Knee Length', 'Above Knee', 'Below Knee', 'Thigh High', 'Hip Length', 'Waist Length'],
  },
  {
    name: 'Features',
    type: 'string',
    description: 'Special features',
    values: ['Pockets', 'Hood', 'Drawstring', 'Adjustable', 'Reversible', 'Convertible', 'Wrinkle Free', 'Stain Resistant', 'Water Resistant', 'Breathable', 'Moisture Wicking', 'Quick Dry', 'UV Protection', 'Anti-Microbial', 'Thermal', 'Insulated', 'Lined', 'Unlined', 'Padded', 'Reinforced']
  },
  {
    name: 'Watch Type',
    type: 'string',
    description: 'Watch categories',
    values: ['Analog', 'Digital', 'Smart Watch', 'Hybrid', 'Chronograph', 'Automatic', 'Mechanical', 'Quartz', 'Solar', 'Kinetic', 'Dive Watch', 'Sports Watch', 'Dress Watch', 'Fashion Watch', 'Luxury Watch', 'Casual Watch', 'Military Watch', 'Pilot Watch', 'Racing Watch', 'GMT Watch', 'Moon Phase', 'Skeleton Watch', 'Vintage Watch', 'Designer Watch', 'Fitness Tracker', 'Apple Watch', 'Samsung Watch', 'Garmin', 'Fitbit'],
  },
  {
    name: 'Watch Band Material',
    type: 'string',
    description: 'Watch band materials',
    values: ['Leather', 'Metal', 'Stainless Steel', 'Gold', 'Silver', 'Rose Gold', 'Titanium', 'Ceramic', 'Rubber', 'Silicone', 'NATO Strap', 'Canvas', 'Nylon', 'Mesh', 'Chain', 'Bracelet', 'Sport Band', 'Milanese Loop', 'Leather Loop', 'Magnetic', 'Quick Release', 'Alligator', 'Crocodile', 'Suede', 'Fabric', 'Plastic', 'Resin'],
  },
  {
    name: 'Watch Size',
    type: 'string',
    description: 'Watch case sizes',
    values: ['28mm', '30mm', '32mm', '34mm', '36mm', '38mm', '40mm', '42mm', '44mm', '46mm', '48mm', '50mm', 'Small', 'Medium', 'Large', 'Extra Large', 'Oversized', 'Compact', 'Unisex Size', 'Mens Size', 'Womens Size'],
  },
  {
    name: 'Belt Width',
    type: 'string',
    description: 'Belt width measurements',
    values: ['0.75 inch', '1 inch', '1.25 inch', '1.5 inch', '1.75 inch', '2 inch', '2.5 inch', '3 inch', 'Skinny', 'Narrow', 'Medium', 'Wide', 'Extra Wide', 'Statement', 'Thin', 'Thick', 'Standard', 'Plus Size'],
  },
  {
    name: 'Belt Type',
    type: 'string',
    description: 'Belt categories',
    values: ['Dress Belt', 'Casual Belt', 'Western Belt', 'Designer Belt', 'Chain Belt', 'Waist Belt', 'Hip Belt', 'Corset Belt', 'Obi Belt', 'Reversible Belt', 'Braided Belt', 'Studded Belt', 'Mesh Belt', 'Rope Belt', 'Fabric Belt', 'Elastic Belt', 'Stretch Belt', 'Statement Belt', 'Vintage Belt', 'Luxury Belt', 'Fashion Belt', 'Work Belt', 'Formal Belt', 'Sports Belt'],
  },
  {
    name: 'Belt Buckle',
    type: 'string',
    description: 'Belt buckle types',
    values: ['Pin Buckle', 'Automatic Buckle', 'Slide Buckle', 'D-Ring', 'Double D-Ring', 'Ratchet Buckle', 'Magnetic Buckle', 'Designer Buckle', 'Logo Buckle', 'Plain Buckle', 'Decorative Buckle', 'Vintage Buckle', 'Metal Buckle', 'Plastic Buckle', 'Wooden Buckle', 'Leather Buckle', 'Statement Buckle', 'Minimalist Buckle'],
  },
  {
    name: 'Wallet Type',
    type: 'string',
    description: 'Wallet categories',
    values: ['Bifold', 'Trifold', 'Money Clip', 'Card Holder', 'Slim Wallet', 'Traditional Wallet', 'Travel Wallet', 'Phone Wallet', 'Wristlet', 'Clutch Wallet', 'Checkbook Wallet', 'Coin Wallet', 'RFID Wallet', 'Smart Wallet', 'Minimalist Wallet', 'Designer Wallet', 'Luxury Wallet', 'Vintage Wallet', 'Chain Wallet', 'Zip Wallet', 'Snap Wallet', 'Magnetic Wallet', 'Cardholder Wallet', 'Front Pocket Wallet', 'Back Pocket Wallet'],
  },
  {
    name: 'Wallet Features',
    type: 'string',
    description: 'Wallet special features',
    values: ['RFID Blocking', 'Coin Pocket', 'ID Window', 'Multiple Card Slots', 'Cash Compartment', 'Zip Pocket', 'Phone Holder', 'Key Ring', 'Removable Card Case', 'Detachable Strap', 'Wrist Strap', 'Chain Attachment', 'Magnetic Closure', 'Snap Closure', 'Zipper Closure', 'Button Closure', 'Elastic Band', 'Thumb Slide', 'Quick Access', 'Slim Profile', 'Expandable', 'Water Resistant', 'Scratch Resistant', 'Lightweight', 'Compact'],
  },
  {
    name: 'Age Group',
    type: 'string',
    description: 'Target age demographics',
    values: ['Gen Z', 'Millennial', 'Gen X', 'Baby Boomer', 'Teen', 'Young Adult', '18-25', '26-35', '36-45', '46-55', '55+', 'College Student', 'Professional', 'Mature', 'Senior', 'Youth', 'Adult'],
  },
  {
    name: 'Brand Tier',
    type: 'string',
    description: 'Brand positioning',
    values: ['Luxury', 'Premium', 'Designer', 'High-End', 'Mid-Range', 'Affordable', 'Budget', 'Fast Fashion', 'Sustainable', 'Ethical', 'Artisan', 'Handmade', 'Custom', 'Bespoke', 'Mass Market', 'Boutique', 'Independent', 'Mainstream', 'Niche', 'Exclusive'],
  },
  {
    name: 'Technology',
    type: 'string',
    description: 'Tech features and smart capabilities',
    values: ['Smart Features', 'Bluetooth', 'WiFi', 'GPS', 'Heart Rate Monitor', 'Step Counter', 'Sleep Tracking', 'Notification Alerts', 'Music Control', 'Voice Assistant', 'Touchscreen', 'Water Resistant', 'Wireless Charging', 'Long Battery Life', 'App Integration', 'NFC Payment', 'Health Monitoring', 'Fitness Tracking', 'Weather Updates', 'Phone Connectivity', 'Social Media Integration', 'Camera Remote', 'Find My Phone', 'Activity Tracking']
  }
];
  for (const attr of attributes) {
    const attribute = await prisma.attribute.create({
      data: {
        name: attr.name,
        type: attr.type,
        description: attr.description,
        values: {
          create: attr.values.map((value) => ({
            value,
            display_value: value,
          })),
        },
      },
    });

    console.log(`Seeded attribute: ${attribute.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
