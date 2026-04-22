// frontend/src/pages/admin/AddProduct.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Upload, Plus } from 'lucide-react';
import API from '../../api/axios.js';
import toast from 'react-hot-toast';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    brand: '',
    stock: '',
  });

  // Handle text input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle image selection
  // UNIQUE CONCEPT: Image Preview Before Upload
  // User sees image before saving to server
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    // Create preview URLs using FileReader
    // WHY FileReader? Converts file to URL for preview
    const previews = files.map((file) => {
      return URL.createObjectURL(file);
      // Creates temporary URL like "blob://..."
      // Only works in browser — not saved anywhere
    });
    setImagePreview(previews);
  };

  // ========================
  // AI GENERATE DESCRIPTION
  // This is AI Feature 3!
  // ========================
  const handleGenerateDescription = async () => {
    // Validate required fields first
    if (!form.name || !form.category || !form.brand) {
      toast.error('Please fill Name, Category and Brand first!');
      return;
    }

    setAiLoading(true);
    try {
      // Call our backend AI route
      const { data } = await API.post('/ai/generate-description', {
        name: form.name,
        category: form.category,
        brand: form.brand,
        price: form.price || 0,
      });

      // Auto-fill description with AI response
      setForm((prev) => ({
        ...prev,
        description: data.description,
      }));

      toast.success('AI description generated! ✨');
    } catch {
      toast.error('AI generation failed. Please write manually.');
    } finally {
      setAiLoading(false);
    }
  };

  // Submit product form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setLoading(true);
    try {
      // Use FormData because we send files + text together
      const formData = new FormData();

      // Add text fields
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      // Add images
      images.forEach((image) => {
        formData.append('images', image);
      });

      await API.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Product added successfully! 🎉');
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Add New Product
        </h1>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-5">

          {/* PRODUCT NAME */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="iPhone 15 Pro"
              required
              className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* CATEGORY + BRAND — side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option>Electronics</option>
                <option>Clothing</option>
                <option>Footwear</option>
                <option>Books</option>
                <option>Home & Kitchen</option>
                <option>Sports</option>
                <option>Beauty</option>
                <option>Toys</option>
                <option>Grocery</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Brand *
              </label>
              <input
                type="text"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="Apple"
                required
                className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* ======================== */}
          {/* AI DESCRIPTION SECTION  */}
          {/* ======================== */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description *
              </label>

              {/* AI GENERATE BUTTON */}
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={aiLoading}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                <Sparkles size={14} />
                {aiLoading ? 'Generating...' : 'Generate with AI ✨'}
              </button>
            </div>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Click 'Generate with AI' button above or write manually..."
              required
              rows={4}
              className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <p className="text-xs text-gray-400 mt-1">
              💡 Fill Name, Category and Brand first — then click Generate with AI
            </p>
          </div>

          {/* PRICE + DISCOUNT PRICE */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Original Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="129999"
                required
                min="0"
                className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount Price (₹)
              </label>
              <input
                type="number"
                name="discountPrice"
                value={form.discountPrice}
                onChange={handleChange}
                placeholder="119999"
                min="0"
                className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* STOCK */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Stock Quantity *
            </label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              placeholder="50"
              required
              min="0"
              className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* IMAGE UPLOAD WITH PREVIEW */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Images *
            </label>

            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Upload size={24} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">
                Click to upload images
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {/* IMAGE PREVIEWS */}
            {imagePreview.length > 0 && (
              <div className="flex gap-3 mt-3 flex-wrap">
                {imagePreview.map((preview, index) => (
                  <img
                    key={index}
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border dark:border-gray-600"
                  />
                ))}
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-4 rounded-xl text-lg transition-colors"
          >
            <Plus size={20} />
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;