export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory: string;
  colors: string[];
  sizes: string[];
  images: string[];
  description: string;
  features: string[];
  isNew: boolean;
  isBestseller: boolean;
  inStock: boolean;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Elegant Maternity Wrap Dress',
    price: 129,
    originalPrice: 159,
    category: 'CLOTHING',
    subcategory: 'Dresses',
    colors: ['Black', 'Navy', 'Burgundy'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    images: [
      'https://images.pexels.com/photos/7155710/pexels-photo-7155710.jpeg',
      'https://images.pexels.com/photos/7155711/pexels-photo-7155711.jpeg',
      'https://images.pexels.com/photos/7155712/pexels-photo-7155712.jpeg'
    ],
    description: 'A sophisticated wrap dress designed for comfort and style throughout your pregnancy. Made from premium jersey fabric with a flattering silhouette.',
    features: [
      'Adjustable wrap design',
      'Premium jersey fabric',
      'Machine washable',
      'Nursing friendly'
    ],
    isNew: true,
    isBestseller: false,
    inStock: true
  },
  {
    id: '2',
    name: 'Nursing Support Bra',
    price: 45,
    category: 'BREASTFEEDING',
    subcategory: 'Bras',
    colors: ['Nude', 'Black', 'White'],
    sizes: ['32B', '34B', '36B', '38B', '32C', '34C', '36C', '38C'],
    images: [
      'https://images.pexels.com/photos/7156336/pexels-photo-7156336.jpeg',
      'https://images.pexels.com/photos/7156337/pexels-photo-7156337.jpeg'
    ],
    description: 'Comfortable and supportive nursing bra with easy-access clips for convenient breastfeeding.',
    features: [
      'Easy-access nursing clips',
      'Soft cotton blend',
      'Wire-free comfort',
      'Adjustable straps'
    ],
    isNew: false,
    isBestseller: true,
    inStock: true
  },
  {
    id: '3',
    name: 'Postpartum Recovery Shorts',
    price: 35,
    category: 'POST PARTUM',
    subcategory: 'Postpartum Garments',
    colors: ['Black', 'Nude'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    images: [
      'https://images.pexels.com/photos/7156340/pexels-photo-7156340.jpeg',
      'https://images.pexels.com/photos/7156341/pexels-photo-7156341.jpeg'
    ],
    description: 'Supportive recovery shorts designed for postpartum comfort and healing.',
    features: [
      'Gentle compression',
      'Breathable fabric',
      'Seamless design',
      'Machine washable'
    ],
    isNew: true,
    isBestseller: false,
    inStock: true
  },
  {
    id: '4',
    name: 'Designer Diaper Bag',
    price: 149,
    category: 'MUM ESSENTIALS',
    subcategory: 'Diaper Bags',
    colors: ['Black', 'Tan', 'Navy'],
    sizes: ['One Size'],
    images: [
      'https://images.pexels.com/photos/7156342/pexels-photo-7156342.jpeg',
      'https://images.pexels.com/photos/7156343/pexels-photo-7156343.jpeg'
    ],
    description: 'Stylish and functional diaper bag with multiple compartments for all your baby essentials.',
    features: [
      'Multiple compartments',
      'Insulated bottle holders',
      'Changing pad included',
      'Stroller straps'
    ],
    isNew: false,
    isBestseller: true,
    inStock: true
  },
  {
    id: '5',
    name: 'Organic Baby Onesie Set',
    price: 39,
    category: 'BABY ESSENTIALS',
    subcategory: 'Baby Clothing',
    colors: ['White', 'Pink', 'Blue'],
    sizes: ['0-3M', '3-6M', '6-9M', '9-12M'],
    images: [
      'https://images.pexels.com/photos/7156344/pexels-photo-7156344.jpeg',
      'https://images.pexels.com/photos/7156345/pexels-photo-7156345.jpeg'
    ],
    description: 'Soft organic cotton onesie set perfect for your little one\'s delicate skin.',
    features: [
      '100% organic cotton',
      'Snap closures',
      'Machine washable',
      'Hypoallergenic'
    ],
    isNew: true,
    isBestseller: false,
    inStock: true
  },
  {
    id: '6',
    name: 'Bump Butter Moisturizer',
    price: 28,
    category: 'SELF & BABY CARE',
    subcategory: 'Bump Butter',
    colors: ['Natural'],
    sizes: ['100ml', '200ml'],
    images: [
      'https://images.pexels.com/photos/7156346/pexels-photo-7156346.jpeg',
      'https://images.pexels.com/photos/7156347/pexels-photo-7156347.jpeg'
    ],
    description: 'Nourishing bump butter to keep your skin soft and hydrated during pregnancy.',
    features: [
      'Natural ingredients',
      'Deep moisturizing',
      'Stretch mark prevention',
      'Pleasant scent'
    ],
    isNew: false,
    isBestseller: true,
    inStock: true
  }
];

export const categories = [
  'CLOTHING',
  'BREASTFEEDING',
  'POST PARTUM',
  'MUM ESSENTIALS',
  'BABY ESSENTIALS',
  'SELF & BABY CARE'
];

export const subcategories = {
  'CLOTHING': [
    'Dresses',
    'Tops',
    'Skirts',
    'Denim',
    'Coverups',
    'Shorts',
    'Official Pants',
    'Casual Pants',
    'Shirts',
    'Leggings',
    'Jump suits',
    'Pajamas',
    'Lounge Wear',
    'Tees',
    'Sets',
    'Ocassional',
    'Mum & Baby Outfits',
    'Underwear'
  ],
  'BREASTFEEDING': [
    'Bras',
    'Camis',
    'Breast Pads',
    'Milk Storage Bags',
    'Milk Carrier',
    'Breastmilk Freezer Organisers',
    'Breastfeeding & Lactation Support',
    'Lactation Teas',
    'Natural Fruit Hydration Mix',
    'Cocoa & Hot Chocolate',
    'Flours',
    'Soups'
  ],
  'POST PARTUM': [
    'Maternity Pads',
    'Cooling Pads',
    'Perri Bottles',
    'Recovery Packs',
    'Postpartum Garments'
  ],
  'MUM ESSENTIALS': [
    'Diaper Bags',
    'Mommy Bags',
    'Breast Pumps',
    'Mama Hospital Kit'
  ],
  'BABY ESSENTIALS': [
    'Baby Clothing',
    'Baby Accessories',
    'Baby Feeding',
    'Baby Sleep'
  ],
  'SELF & BABY CARE': [
    'Bump Butter',
    'Body Souffle',
    'Baby Souffle',
    'Baby Massage Oil',
    'Shower Steamers'
  ]
};