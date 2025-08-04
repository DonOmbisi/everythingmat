import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  FolderPlus, 
  Tags, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye,
  Upload,
  Shield,
  LogOut,
  BarChart2,
  PieChart,
  TrendingUp,
  PackageCheck,
  DollarSign,
  ShoppingBag,
  HelpCircle,
  Image as ImageIcon,
  GripVertical,
  FileText,
  EyeOff
} from 'lucide-react';
import { useAdmin, Product } from '../context/AdminContext';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';
import { subcategories as staticSubcategories } from '../data/products';

// Color palette constants
const COLORS = {
  blush: '#F8D7DA',
  beige: '#F5E6DA', 
  softGray: '#BDBDBD',
  charcoal: '#333333'
};

const FIXED_CATEGORIES = [
  'CLOTHING',
  'BREASTFEEDING',
  'POST PARTUM',
  'MUM ESSENTIALS',
  'BABY ESSENTIALS',
  'SELF & BABY CARE'
];

// SKU generation function
const generateSKU = (name: string, category: string) => {
  const prefix = category.substring(0, 3).toUpperCase();
  const nameCode = name.substring(0, 3).toUpperCase().replace(/\s/g, '');
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${nameCode}-${timestamp}`;
};

// Image compression function
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      const maxWidth = 1200;
      const maxHeight = 1200;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        const compressedFile = new File([blob!], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        resolve(compressedFile);
      }, 'image/jpeg', 0.8);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Validation schema
const ProductSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name must be less than 100 characters')
    .required('Product name is required'),
  sku: Yup.string()
    .min(5, 'SKU must be at least 5 characters')
    .max(20, 'SKU must be less than 20 characters'),
  price: Yup.number()
    .positive('Price must be positive')
    .required('Price is required'),
  salePrice: Yup.number()
    .positive('Sale price must be positive')
    .test('sale-price', 'Sale price must be less than regular price', function(value) {
      const { price } = this.parent;
      return !value || !price || value < price;
    }),
  category: Yup.string().required('Category is required'),
  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .required('Description is required'),
  images: Yup.array()
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed'),
  colors: Yup.array()
    .of(Yup.string().min(1, 'Color cannot be empty'))
    .min(1, 'At least one color is required'),
  sizes: Yup.array()
    .of(Yup.string().min(1, 'Size cannot be empty'))
    .min(1, 'At least one size is required'),
});

// Enhanced ProductModal Component
const ProductModal: React.FC<{
  product?: Product;
  onClose: () => void;
  onSave: () => void;
}> = ({ product, onClose, onSave }) => {
  const { addProduct, updateProduct, uploadImage, categories, subcategories } = useAdmin();
  const isEdit = !!product;
  
  const [images, setImages] = useState<Array<{ id: string; file?: File; url: string; isUploading?: boolean }>>(
    product?.images?.map((img, idx) => ({ id: `existing-${idx}`, url: img })) || []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  const initialValues = {
    name: product?.name || '',
    sku: product?.sku || '',
    price: product?.price || '',
    salePrice: product?.salePrice || '',
    category: product?.category || '',
    subcategory: product?.subcategory || '',
    description: product?.description || '',
    badge: product?.badge || '',
    isNew: product?.isNew || false,
    featured: product?.featured || false,
    inStock: product?.inStock ?? true,
    isActive: product?.isActive ?? true,
    colors: product?.colors || [''],
    sizes: product?.sizes || [''],
    features: product?.features || [''],
  };

  // Handle image upload
  const handleImageUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        const compressedFile = await compressImage(file);
        await processImageFile(compressedFile);
      } else {
        await processImageFile(file);
      }
    }
  };

  const processImageFile = async (file: File) => {
    const id = `new-${Date.now()}-${Math.random()}`;
    const url = URL.createObjectURL(file);
    
    setImages(prev => [...prev, { id, file, url, isUploading: true }]);
    
    try {
      const uploadedUrl = await uploadImage(file);
      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, url: uploadedUrl, isUploading: false } : img
      ));
    } catch (error) {
      console.error('Image upload failed:', error);
      setImages(prev => prev.filter(img => img.id !== id));
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleImageUpload(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle image reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setImages(items);
  };

  // Remove image
  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  // Handle form submission
  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      setIsSaving(true);
      
      const productData = {
        ...values,
        images: images.map(img => img.url),
        isActive: isDraft ? false : values.isActive,
        status: isDraft ? 'draft' : 'published',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (isEdit) {
        await updateProduct(product.id, productData);
      } else {
        await addProduct(productData);
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please try again.');
    } finally {
      setIsSaving(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {isEdit ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="text-gray-600 mt-1">
                {isEdit ? 'Update product information' : 'Create a new product for your store'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          <Formik
            initialValues={initialValues}
            validationSchema={ProductSchema}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue, isValid, dirty }) => (
              <Form className="space-y-8">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Basic Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Product Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                        <HelpCircle className="inline h-4 w-4 ml-1 text-gray-400" />
                      </label>
                      <Field
                        name="name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400 transition-colors"
                        placeholder="e.g., Eden Knit Nursing Dress"
                      />
                      <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* SKU */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SKU
                        <HelpCircle className="inline h-4 w-4 ml-1 text-gray-400" />
                      </label>
                      <Field
                        name="sku"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400 transition-colors"
                        placeholder="Will be auto-generated"
                        onChange={(e: any) => {
                          setFieldValue('sku', e.target.value);
                          if (!e.target.value && values.name && values.category) {
                            setFieldValue('sku', generateSKU(values.name, values.category));
                          }
                        }}
                      />
                      <ErrorMessage name="sku" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Regular Price *
                        <HelpCircle className="inline h-4 w-4 ml-1 text-gray-400" />
                      </label>
                      <Field
                        name="price"
                        type="number"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400 transition-colors"
                        placeholder="0.00"
                      />
                      <ErrorMessage name="price" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Sale Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sale Price
                        <HelpCircle className="inline h-4 w-4 ml-1 text-gray-400" />
                      </label>
                      <Field
                        name="salePrice"
                        type="number"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400 transition-colors"
                        placeholder="0.00 (optional)"
                      />
                      <ErrorMessage name="salePrice" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                        <HelpCircle className="inline h-4 w-4 ml-1 text-gray-400" />
                      </label>
                      <Field
                        as="select"
                        name="category"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400 transition-colors"
                      >
                        <option value="">Select a category</option>
                        {FIXED_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </Field>
                      <ErrorMessage name="category" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Subcategory */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subcategory
                        <HelpCircle className="inline h-4 w-4 ml-1 text-gray-400" />
                      </label>
                      <Field
                        as="select"
                        name="subcategory"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400 transition-colors"
                        disabled={!values.category}
                      >
                        <option value="">Select a subcategory</option>
                        {values.category && staticSubcategories[values.category as keyof typeof staticSubcategories]?.map((sub: string) => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                      </Field>
                      {!values.category && (
                        <p className="text-sm text-gray-500 mt-1">Please select a category first</p>
                      )}
                      <ErrorMessage name="subcategory" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Description *</h3>
                  <div className="mb-2">
                    <HelpCircle className="inline h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 ml-1">Use the editor below to create a detailed product description</span>
                  </div>
                  <Field name="description">
                    {({ field }: any) => (
                      <CodeEditor
                        value={field.value}
                        language="markdown"
                        placeholder="Describe your product in detail..."
                        onChange={(evn) => setFieldValue('description', evn.target.value)}
                        padding={15}
                        style={{
                          backgroundColor: '#ffffff',
                          fontFamily: 'ui-monospace,SFMono-Regular,"SF Mono",Consolas,"Liberation Mono",Menlo,monospace',
                          fontSize: 14,
                          minHeight: '150px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                        }}
                      />
                    )}
                  </Field>
                  <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Images */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Product Images *
                  </h3>
                  
                  {/* Drag & Drop Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      images.length === 0 
                        ? 'border-pink-300 bg-pink-50' 
                        : 'border-gray-300 bg-white'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Drag & drop images here
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      or click to browse files (max 10 images, 5MB each)
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors cursor-pointer"
                    >
                      Choose Files
                    </label>
                  </div>

                  {/* Image Preview Grid */}
                  {images.length > 0 && (
                    <div className="mt-6">
                      <p className="text-sm text-gray-600 mb-3">
                        Drag to reorder images. First image will be the main product image.
                      </p>
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="images" direction="horizontal">
                          {(provided: any) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="flex flex-wrap gap-4"
                            >
                              {images.map((image, index) => (
                                <Draggable key={image.id} draggableId={image.id} index={index}>
                                  {(provided: any) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className="relative group"
                                    >
                                      <div
                                        {...provided.dragHandleProps}
                                        className="absolute top-2 left-2 z-10 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
                                      >
                                        <GripVertical className="h-4 w-4 text-gray-500" />
                                      </div>
                                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                                        <img
                                          src={image.url}
                                          alt="Product preview"
                                          className="w-full h-full object-cover"
                                        />
                                        {image.isUploading && (
                                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                          </div>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => removeImage(image.id)}
                                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <X className="h-4 w-4" />
                                        </button>
                                      </div>
                                      {index === 0 && (
                                        <div className="absolute -top-2 -left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                          Main
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </div>
                  )}
                  <ErrorMessage name="images" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Product Options */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Options</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Colors */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Colors *
                      </label>
                      <FieldArray name="colors">
                        {({ push, remove }: any) => (
                          <div className="space-y-2">
                            {values.colors.map((color: string, index: number) => (
                              <div key={index} className="flex gap-2">
                                <Field
                                  name={`colors.${index}`}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
                                  placeholder="e.g., Navy Blue"
                                />
                                {values.colors.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => push('')}
                              className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                            >
                              + Add Color
                            </button>
                          </div>
                        )}
                      </FieldArray>
                      <ErrorMessage name="colors" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Sizes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Sizes *
                      </label>
                      <FieldArray name="sizes">
                        {({ push, remove }: any) => (
                          <div className="space-y-2">
                            {values.sizes.map((size: string, index: number) => (
                              <div key={index} className="flex gap-2">
                                <Field
                                  name={`sizes.${index}`}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
                                  placeholder="e.g., M"
                                />
                                {values.sizes.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => push('')}
                              className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                            >
                              + Add Size
                            </button>
                          </div>
                        )}
                      </FieldArray>
                      <ErrorMessage name="sizes" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>
                </div>

                {/* Product Status */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Status</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Featured Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Featured Product</label>
                        <p className="text-xs text-gray-500">Show this product in featured sections</p>
                      </div>
                      <Switch
                        checked={values.featured}
                        onChange={(checked) => setFieldValue('featured', checked)}
                      />
                    </div>

                    {/* New Product Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">New Product</label>
                        <p className="text-xs text-gray-500">Mark as new arrival</p>
                      </div>
                      <Switch
                        checked={values.isNew}
                        onChange={(checked) => setFieldValue('isNew', checked)}
                      />
                    </div>

                    {/* In Stock Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">In Stock</label>
                        <p className="text-xs text-gray-500">Product is available for purchase</p>
                      </div>
                      <Switch
                        checked={values.inStock}
                        onChange={(checked) => setFieldValue('inStock', checked)}
                      />
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Active</label>
                        <p className="text-xs text-gray-500">Product is visible to customers</p>
                      </div>
                      <Switch
                        checked={values.isActive}
                        onChange={(checked) => setFieldValue('isActive', checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDraft(true);
                      // Trigger form submission
                    }}
                    disabled={!isValid || isSaving}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <EyeOff className="h-4 w-4" />
                    Save as Draft
                  </button>
                  <button
                    type="submit"
                    disabled={!isValid || !dirty || isSaving}
                    className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {isEdit ? 'Update Product' : 'Create Product'}
                      </>
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

// Modern Switch Component
const Switch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pink-200 focus:ring-offset-2 ${
        checked ? 'bg-pink-500' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

// --- Analytics Dashboard Component ---
const AnalyticsDashboard: React.FC = () => {
  const { products } = useAdmin();
  const [sales, setSales] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    const API_BASE_URL = process.env.NODE_ENV === 'production' 
      ? process.env.VITE_API_URL || 'https://everythingmat.onrender.com/api' 
      : '/api';
    let url = `${API_BASE_URL}/sales/analytics`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setSales(data);
        setLoading(false);
      });
    // Fetch site visits for conversion rate
    let visitsUrl = `${API_BASE_URL}/visits/count`;
    if (startDate && endDate) {
      visitsUrl += `?startDate=${startDate}&endDate=${endDate}`;
    }
    fetch(visitsUrl)
      .then(res => res.json())
      .then(data => setVisits(data.count));
  }, [startDate, endDate]);

  // Stock analytics
  const totalProducts = products.length;
  const inStock = products.filter(p => p.inStock).length;
  const outOfStock = totalProducts - inStock;
  const featured = products.filter(p => p.featured).length;
  const newProducts = products.filter(p => p.isNew).length;
  const bestsellers = products.filter(p => p.isBestseller).length;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-4"><BarChart2 className="h-6 w-6 text-black" /> Analytics Dashboard</h2>
      {/* Date Range Picker */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <label className="text-sm font-medium">From:
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="ml-2 border rounded px-2 py-1" />
        </label>
        <label className="text-sm font-medium">To:
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="ml-2 border rounded px-2 py-1" />
        </label>
        {(startDate || endDate) && (
          <button onClick={() => { setStartDate(''); setEndDate(''); }} className="ml-2 text-xs text-gray-500 underline">Clear</button>
        )}
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading analytics...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <ShoppingBag className="h-8 w-8 text-blush mb-2" />
              <div className="text-2xl font-bold">{totalProducts}</div>
              <div className="text-gray-600">Total Products</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <PackageCheck className="h-8 w-8 text-green-500 mb-2" />
              <div className="text-2xl font-bold">{inStock}</div>
              <div className="text-gray-600">In Stock</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <Package className="h-8 w-8 text-red-500 mb-2" />
              <div className="text-2xl font-bold">{outOfStock}</div>
              <div className="text-gray-600">Out of Stock</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <DollarSign className="h-8 w-8 text-yellow-500 mb-2" />
              <div className="text-2xl font-bold">${sales?.totalRevenue?.toLocaleString()}</div>
              <div className="text-gray-600">Total Revenue</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <TrendingUp className="h-8 w-8 text-blue-500 mb-2" />
              <div className="text-2xl font-bold">
                {visits !== null && sales?.totalSales !== undefined ? `${((sales.totalSales / Math.max(visits, 1)) * 100).toFixed(1)}%` : '--'}
              </div>
              <div className="text-gray-600">Conversion Rate</div>
            </div>
          </div>

          {/* Stock breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="font-semibold mb-2 flex items-center gap-2"><PieChart className="h-5 w-5 text-blush" /> Stock Breakdown</div>
              <ul className="space-y-1">
                <li>Featured: <span className="font-bold text-black">{featured}</span></li>
                <li>New: <span className="font-bold text-black">{newProducts}</span></li>
                <li>Bestsellers: <span className="font-bold text-black">{bestsellers}</span></li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow p-6 md:col-span-2">
              <div className="font-semibold mb-2 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-500" /> Sales by Category</div>
              <div className="w-full h-48">
                {/* Bar chart for sales by category */}
                <BarChart data={sales?.salesByCategory || []} />
              </div>
            </div>
          </div>

          {/* Sales over time */}
          <div className="bg-white rounded-xl shadow p-6 mt-8">
            <div className="font-semibold mb-2 flex items-center gap-2"><BarChart2 className="h-5 w-5 text-blue-500" /> Sales Over Time</div>
            <div className="w-full h-64">
              <LineChart data={sales?.salesOverTime || []} />
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="bg-white rounded-xl shadow p-6 mt-8">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold flex items-center gap-2"><TrendingUp className="h-5 w-5 text-blush" /> Top Selling Products</div>
              <button onClick={() => exportTableToCSV('top-sellers-table', 'top_selling_products.csv')} className="text-xs text-gray-500 underline">Export CSV</button>
            </div>
            <div className="overflow-x-auto">
              <table id="top-sellers-table" className="min-w-full text-sm text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 font-semibold">Product</th>
                    <th className="py-2 px-4 font-semibold">Sales</th>
                    <th className="py-2 px-4 font-semibold">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {(sales?.salesByProduct || []).map((prod: any, i: number) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{prod.name}</td>
                      <td className="py-2 px-4">{prod.sales}</td>
                      <td className="py-2 px-4">${prod.revenue?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-xl shadow p-6 mt-8">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold flex items-center gap-2"><Package className="h-5 w-5 text-red-500" /> Low Stock Alerts</div>
              <button onClick={() => exportTableToCSV('low-stock-table', 'low_stock_alerts.csv')} className="text-xs text-gray-500 underline">Export CSV</button>
            </div>
            <div className="overflow-x-auto">
              {products.filter((p: any) => p.inStock === false).length === 0 ? (
                <div className="text-green-600 font-medium">All products are in stock.</div>
              ) : (
                <table id="low-stock-table" className="min-w-full text-sm text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4 font-semibold">Product</th>
                      <th className="py-2 px-4 font-semibold">Category</th>
                      <th className="py-2 px-4 font-semibold">Subcategory</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.filter((p: any) => p.inStock === false).map((prod: any, i: number) => (
                      <tr key={i} className="border-b hover:bg-red-50">
                        <td className="py-2 px-4 text-red-700 font-semibold">{prod.name}</td>
                        <td className="py-2 px-4">{prod.category}</td>
                        <td className="py-2 px-4">{prod.subcategory}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// --- Simple Bar Chart ---
const BarChart: React.FC<{ data: any[] }> = ({ data }) => {
  if (!data.length) return <div className="text-gray-400 text-sm">No data</div>;
  const max = Math.max(...data.map(d => d.sales));
  return (
    <div className="flex items-end h-full gap-2">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1">
          <div
            className="bg-blush rounded-t w-6"
            style={{ height: `${(d.sales / max) * 100}%`, minHeight: 10 }}
            title={`Sales: ${d.sales}`}
          ></div>
          <div className="text-xs mt-1 text-gray-600 text-center break-words">{d.category || d.name}</div>
        </div>
      ))}
    </div>
  );
};

// --- Simple Line Chart ---
const LineChart: React.FC<{ data: any[] }> = ({ data }) => {
  if (!data.length) return <div className="text-gray-400 text-sm">No data</div>;
  const max = Math.max(...data.map(d => d.sales));
  return (
    <svg viewBox="0 0 300 100" className="w-full h-full">
      <polyline
        fill="none"
        stroke="#E6397E"
        strokeWidth="3"
        points={data.map((d, i) => `${(i / (data.length - 1)) * 300},${100 - (d.sales / max) * 90}`).join(' ')}
      />
      {data.map((d, i) => (
        <circle
          key={i}
          cx={(i / (data.length - 1)) * 300}
          cy={100 - (d.sales / max) * 90}
          r="4"
          fill="#E6397E"
        />
      ))}
    </svg>
  );
};

const AdminPage: React.FC = () => {
  const { isAdmin, logoutAdmin } = useAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  if (!isAdmin) {
    return <AdminLogin />;
  }

  const handleLogout = () => {
    logoutAdmin();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-red-600" />
              <h1 className="text-2xl font-serif text-black">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>View Site</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-800 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {[
                { id: 'analytics', label: 'Analytics', icon: BarChart2 },
                { id: 'orders', label: 'Orders', icon: ShoppingBag },
                { id: 'products', label: 'Products', icon: Package },
                { id: 'categories', label: 'Categories', icon: FolderPlus },
                { id: 'subcategories', label: 'Subcategories', icon: Tags }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'analytics' && <AnalyticsDashboard />}
            {activeTab === 'orders' && <AdminOrdersPage />}
            {activeTab === 'products' && (
              <ProductsTab 
                setShowAddProduct={setShowAddProduct}
                setEditingProduct={setEditingProduct}
              />
            )}
            {activeTab === 'categories' && (
              <CategoriesTab 
                setShowAddCategory={setShowAddCategory}
              />
            )}
            {activeTab === 'subcategories' && <SubcategoriesTab />}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddProduct && (
        <ProductModal
          onClose={() => setShowAddProduct(false)}
          onSave={() => {
            setShowAddProduct(false)
          }}
        />
      )}
      {editingProduct && (
        <ProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={() => {
            setEditingProduct(null)
          }}
        />
      )}
      {showAddCategory && (
        <CategoryModal
          onClose={() => setShowAddCategory(false)}
          onSave={() => setShowAddCategory(false)}
        />
      )}
    </div>
  );
};

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginAsAdmin } = useAdmin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const success = await loginAsAdmin(email, password);
      if (!success) {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-black">Admin Access</h1>
          <p className="text-gray-600 mt-2">Enter admin credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Enter admin email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Enter admin password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-3 px-4 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Login as Admin'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Demo credentials:
          </p>
          <p className="text-sm text-gray-500">
            Email: <code className="bg-gray-100 px-2 py-1 rounded">admin@example.com</code>
          </p>
          <p className="text-sm text-gray-500">
            Password: <code className="bg-gray-100 px-2 py-1 rounded">admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
};

const ProductsTab: React.FC<{
  setShowAddProduct: (show: boolean) => void;
  setEditingProduct: (product: Product | null) => void;
}> = ({ setShowAddProduct, setEditingProduct }) => {
  const { products, deleteProduct } = useAdmin();

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-black">Products</h2>
        <button
          onClick={() => setShowAddProduct(true)}
          className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-16 w-16 flex-shrink-0">
                        <img
                          className="h-16 w-16 rounded-lg object-cover"
                          src={product.images[0]}
                          alt={product.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.subcategory}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.category}
                  </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.price}
                      </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.inStock 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CategoriesTab: React.FC<{
  setShowAddCategory: (show: boolean) => void;
}> = ({ setShowAddCategory }) => {
  const { products, categories, deleteCategory } = useAdmin();

  const handleDelete = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category && window.confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      deleteCategory(categoryId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-black">Categories</h2>
        <button
          onClick={() => setShowAddCategory(true)}
          className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-black">{category.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {products.filter((p: Product) => p.category === category.name).length} products
                </p>
              </div>
              <button
                onClick={() => handleDelete(category.id)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SubcategoriesTab: React.FC = () => {
  const { categories, subcategories, addSubcategory, deleteSubcategory } = useAdmin();
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');

  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const handleAddSubcategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubcategory.trim() && selectedCategoryId) {
      addSubcategory({
        name: newSubcategory.trim(),
        categoryId: selectedCategoryId
      });
      setNewSubcategory('');
    }
  };

  const handleDelete = (subcategoryId: string) => {
    const subcategory = subcategories.find(s => s.id === subcategoryId);
    if (subcategory && window.confirm(`Are you sure you want to delete the subcategory "${subcategory.name}"?`)) {
      deleteSubcategory(subcategoryId);
    }
  };

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const currentSubcategories = subcategories.filter(s => s.categoryId === selectedCategoryId);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif text-black">Subcategories</h2>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Category
          </label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleAddSubcategory} className="flex space-x-2">
          <input
            type="text"
            value={newSubcategory}
            onChange={(e) => setNewSubcategory(e.target.value)}
            placeholder="New subcategory name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            required
          />
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Add
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-serif text-black mb-4">
          Subcategories for {selectedCategory?.name || 'Select Category'}
        </h3>
        <div className="flex flex-wrap gap-2">
          {currentSubcategories.map((subcategory) => (
            <div key={subcategory.id} className="flex items-center bg-gray-100 rounded pl-3 pr-2 py-1">
              <span className="text-sm">{subcategory.name}</span>
              <button onClick={() => handleDelete(subcategory.id)} className="ml-2 text-red-500 hover:text-red-700">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CategoryModal: React.FC<{
  onClose: () => void;
  onSave: () => void;
}> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const { addCategory } = useAdmin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCategory(formData);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-serif text-black">Add Category</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="category-slug"
              required
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="bg-black text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium hover:bg-gray-800">
              <Save className="h-4 w-4 inline-block mr-2" />
              Create Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const statusSteps = ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Get auth token if available
    const token = localStorage.getItem('adminToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const API_BASE_URL = process.env.NODE_ENV === 'production' 
      ? process.env.VITE_API_URL || 'https://everythingmat.onrender.com/api' 
      : '/api';
    
    fetch(`${API_BASE_URL}/orders`, { headers })
      .then(async res => {
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('Unauthorized. Admin login required.');
          }
          throw new Error(`Failed to fetch orders: ${res.status}`);
        }
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setOrders([]);
        setLoading(false);
      });
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    // Get auth token
    const token = localStorage.getItem('adminToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const API_BASE_URL = process.env.NODE_ENV === 'production' 
      ? process.env.VITE_API_URL || 'https://everythingmat.onrender.com/api' 
      : '/api';
    
    await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status: newStatus })
    });
    setOrders(orders => orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const filteredOrders = statusFilter === 'All' ? orders : orders.filter(o => o.status === statusFilter);

  return (
    <div className="py-8">
      <h2 className="text-3xl font-serif mb-6">Admin: Orders</h2>
      <div className="mb-4 flex items-center gap-4">
        <label className="font-medium">Filter by status:</label>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="All">All</option>
          {statusSteps.map(step => (
            <option key={step} value={step}>{step}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div>Loading orders...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          Error: {error}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div>No orders found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">Order ID</th>
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} className="border-b">
                  <td className="px-4 py-2">{order.id}</td>
                  <td className="px-4 py-2">{order.userId || 'Guest Order'}</td>
                  <td className="px-4 py-2">{order.date ? order.date.slice(0, 10) : ''}</td>
                  <td className="px-4 py-2">
                    <select
                      value={order.status}
                      onChange={e => handleStatusChange(order.id, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1"
                    >
                      {statusSteps.map(step => (
                        <option key={step} value={step}>{step}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">€{order.total?.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-primary underline"
                      onClick={() => { setSelectedOrder(order); setModalOpen(true); }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Order Details Modal */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full text-center relative animate-fade-in">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-xl font-serif mb-2">Order {selectedOrder.id}</h3>
            <div className="mb-2 text-left">
              <div className="font-semibold">User ID: <span className="font-normal">{selectedOrder.userId}</span></div>
              <div className="font-semibold">Date: <span className="font-normal">{selectedOrder.date ? selectedOrder.date.slice(0, 10) : ''}</span></div>
              <div className="font-semibold">Total: <span className="font-normal">€{selectedOrder.total?.toFixed(2)}</span></div>
              <div className="font-semibold">Status: <span className="font-normal">{selectedOrder.status}</span></div>
            </div>
            <div className="text-left mb-2">
              <div className="font-semibold mb-1">Items:</div>
              <ul className="list-disc list-inside text-gray-600">
                {selectedOrder.items.map((item: any, idx: number) => (
                  <li key={idx}>{item.name} (x{item.quantity})</li>
                ))}
              </ul>
            </div>
            <div className="text-left mb-2">
              <div className="font-semibold mb-1">Status History:</div>
              <ul className="list-disc list-inside text-gray-600">
                {selectedOrder.statusHistory?.map((h: any, idx: number) => (
                  <li key={idx}>{h.step} — {h.date ? h.date.slice(0, 10) : ''}</li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <button
                className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
                onClick={() => setModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- CSV Export Utility ---
function exportTableToCSV(tableId: string, filename: string) {
  const table = document.getElementById(tableId) as HTMLTableElement | null;
  if (!table) return;
  let csv = '';
  for (let i = 0; i < table.rows.length; i++) {
    const row = table.rows[i];
    const rowData = [];
    for (let j = 0; j < row.cells.length; j++) {
      rowData.push('"' + row.cells[j].innerText.replace(/"/g, '""') + '"');
    }
    csv += rowData.join(',') + '\n';
  }
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default AdminPage;