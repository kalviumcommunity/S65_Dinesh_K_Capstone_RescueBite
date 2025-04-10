import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { useFood } from "../../context/FoodContext"
import { useAuth } from "../../context/AuthContext"
import { Calendar, Clock, DollarSign, MapPin, Plus, Upload, X } from "lucide-react"
import axios from "axios"
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Clock as ClockIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"

export default function FoodItemForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getFoodItem, createFoodItem, updateFoodItem, loading } = useFood()
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    images: [],
    quantity: 1,
    quantityUnit: "servings",
    category: "meal",
    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      nutFree: false,
      dairyFree: false,
    },
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Format: YYYY-MM-DDThh:mm
    location: {
      type: "Point",
      coordinates: [0, 0],
      address: "",
    },
    price: 0,
    originalPrice: 0,
    isFree: true,
    isPickupOnly: true,
    status: "available"
  })

  const [formErrors, setFormErrors] = useState({})
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [date, setDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000))
  const [time, setTime] = useState(format(new Date(), "HH:mm"))
  const [hour, setHour] = useState("12")
  const [minute, setMinute] = useState("00")

  useEffect(() => {
    if (date) {
      const newDate = new Date(date)
      const currentTime = new Date()
      
      // If date is today and time has already passed, set time to current time + 1 hour
      if (newDate.toDateString() === currentTime.toDateString() && 
          parseInt(hour, 10) < currentTime.getHours()) {
        const newHour = (currentTime.getHours() + 1).toString().padStart(2, '0')
        setHour(newHour)
        setMinute('00')
      } else {
        // Set to selected time
        newDate.setHours(parseInt(hour, 10), parseInt(minute, 10))
      }
      
      setFormData(prev => ({
        ...prev,
        expiresAt: newDate.toISOString().slice(0, 16)
      }))
      
      // Update the time string too
      setTime(`${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`)
    }
  }, [date, hour, minute])

  useEffect(() => {
    if (time) {
      const [h, m] = time.split(':')
      setHour(h)
      setMinute(m)
    }
  }, [time])

  useEffect(() => {
    // If id exists, fetch food item data for editing
    if (id) {
      setIsEditing(true)
      const fetchFoodItem = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/food-items/${id}`, {
            headers: {
              'x-auth-token': localStorage.getItem('token')
            }
          })
          const foodItem = response.data.data
          if (foodItem) {
            // Parse the date and time
            const expiryDate = new Date(foodItem.expiresAt)
            setDate(expiryDate)
            setTime(format(expiryDate, "HH:mm"))

            setFormData({
              ...foodItem,
              expiresAt: expiryDate.toISOString().slice(0, 16),
            })

            // Set image preview URLs
            if (foodItem.images && foodItem.images.length > 0) {
              setImagePreviewUrls(foodItem.images)
            }
          }
        } catch (error) {
          console.error("Error fetching food item:", error)
          setError("Failed to fetch food item")
        }
      }

      fetchFoodItem()
    } else {
      // For new food item, set default date and time
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      setDate(tomorrow)
      setTime(format(tomorrow, "HH:mm"))
      
      // For new food item, use user's location if available
      if (user && user.location && user.location.coordinates) {
        setFormData((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: user.location.coordinates,
            address: user.businessAddress || "",
          },
        }))
      }
    }
  }, [id, getFoodItem, user?.location?.coordinates])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name.startsWith("dietary.")) {
      const dietaryProperty = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        dietary: {
          ...prev.dietary,
          [dietaryProperty]: checked,
        },
      }))
    } else if (name === "isFree") {
      setFormData((prev) => ({
        ...prev,
        isFree: checked,
        price: checked ? 0 : prev.price,
      }))
    } else if (name === "isPickupOnly") {
      setFormData((prev) => ({
        ...prev,
        isPickupOnly: checked,
      }))
    } else if (name === "address") {
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          address: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? Number.parseFloat(value) : value,
      }))
    }

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  const handleImageChange = (e) => {
    e.preventDefault()

    const files = Array.from(e.target.files)
    console.log("Selected files:", files);

    // Limit to 5 images
    if (imageFiles.length + files.length > 5) {
      alert("You can only upload up to 5 images")
      return
    }

    // Update image files
    setImageFiles((prev) => [...prev, ...files])

    // Create preview URLs
    const newImagePreviewUrls = files.map((file) => URL.createObjectURL(file))
    setImagePreviewUrls((prev) => [...prev, ...newImagePreviewUrls])
  }

  const removeImage = (index) => {
    // Remove from preview
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index))

    // If editing and it's an existing image
    if (isEditing && index < formData.images.length) {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }))
    } else {
      // If it's a new image
      const adjustedIndex = isEditing ? index - formData.images.length : index
      setImageFiles((prev) => prev.filter((_, i) => i !== adjustedIndex))
    }
  }

  const validateForm = () => {
    const errors = {}
    const now = new Date()
    const expiryDate = new Date(formData.expiresAt)

    if (!formData.title.trim()) errors.title = "Title is required"
    if (!formData.description.trim()) errors.description = "Description is required"
    if (formData.quantity <= 0) errors.quantity = "Quantity must be greater than 0"
    if (!formData.category) errors.category = "Category is required"
    
    // Add expiration date validation
    if (!formData.expiresAt) {
      errors.expiresAt = "Expiration date is required"
    } else if (expiryDate <= now) {
      errors.expiresAt = "Expiration date must be in the future"
    }
    
    if (!formData.location.address.trim()) errors.address = "Address is required"

    if (!formData.isFree) {
      if (formData.price <= 0) errors.price = "Price must be greater than 0"
      if (formData.originalPrice <= 0) errors.originalPrice = "Original price must be greater than 0"
      if (formData.price >= formData.originalPrice) errors.price = "Price must be less than original price"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);

    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");

    try {
      // STEP 1: First upload the images to Cloudinary
      let cloudinaryImages = [];
      
      if (imageFiles && imageFiles.length > 0) {
        console.log("Uploading images to Cloudinary. Files:", imageFiles.map(f => f.name));
        
        const imagesFormData = new FormData();
        imageFiles.forEach(file => {
          console.log("Appending file:", file.name, file.type, file.size);
          imagesFormData.append("images", file);
        });
        
        try {
          // Set longer timeout for uploads
          const uploadResponse = await axios.post(
            `${API_BASE_URL}/api/food-items/upload`, 
            imagesFormData,
            {
              headers: {
                "x-auth-token": localStorage.getItem("token"),
                "Content-Type": "multipart/form-data"
              },
              timeout: 30000 // 30 seconds timeout for uploads
            }
          );
          
          if (uploadResponse.data.success) {
            cloudinaryImages = uploadResponse.data.data || [];
            console.log("Images uploaded successfully:", cloudinaryImages);
          } else {
            throw new Error(uploadResponse.data.message || "Failed to upload images");
          }
        } catch (uploadError) {
          console.error("Error uploading images:", uploadError);
          const errorMsg = uploadError.response?.data?.message || 
                          uploadError.message || 
                          "Server error";
          throw new Error("Image upload failed: " + errorMsg);
        }
      }
      
      // STEP 2: Submit the form with the uploaded images
      const headers = {
        "x-auth-token": localStorage.getItem("token"),
        "Content-Type": "application/json"
      };
      
      const allImages = [];

      // Process existing images
      if (formData.images && Array.isArray(formData.images)) {
        formData.images.forEach(img => {
          if (typeof img === 'string') {
            allImages.push(img);
          } else if (img && img.url) {
            allImages.push(img.url);
          }
        });
      }

      // Process newly uploaded images
      if (cloudinaryImages && Array.isArray(cloudinaryImages)) {
        cloudinaryImages.forEach(img => {
          if (typeof img === 'string') {
            allImages.push(img);
          } else if (img && img.url) {
            allImages.push(img.url);
          }
        });
      }

      console.log("All images to be saved (URLs only):", allImages);

      // Create a properly formatted food item object
      const foodItemData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        images: allImages,
        quantity: parseInt(formData.quantity) || 1,
        quantityUnit: formData.quantityUnit || "servings",
        category: formData.category || "other",
        dietary: {
          vegetarian: !!formData.dietary.vegetarian,
          vegan: !!formData.dietary.vegan,
          glutenFree: !!formData.dietary.glutenFree,
          nutFree: !!formData.dietary.nutFree,
          dairyFree: !!formData.dietary.dairyFree
        },
        expiresAt: new Date(formData.expiresAt).toISOString(),
        location: {
          type: "Point",
          coordinates: Array.isArray(formData.location?.coordinates) 
            ? formData.location.coordinates.map(c => typeof c === 'string' ? parseFloat(c) : c)
            : [0, 0],
          address: formData.location?.address || ""
        },
        price: formData.isFree ? 0 : (parseFloat(formData.price) || 0),
        originalPrice: parseFloat(formData.originalPrice) || 0,
        isFree: !!formData.isFree,
        isPickupOnly: !!formData.isPickupOnly,
        status: "available"
      };

      console.log("Sending food item data:", JSON.stringify(foodItemData, null, 2));

      let result;
      if (isEditing) {
        result = await axios.put(
          `${API_BASE_URL}/api/food-items/${id}`, 
          foodItemData, 
          { headers }
        );
      } else {
        result = await axios.post(
          `${API_BASE_URL}/api/food-items`, 
          foodItemData, 
          { headers }
        );
      }

      if (result.data.success) {
        // Redirect to appropriate dashboard with fallback
        const accountType = user?.accountType || "individual";
        navigate(accountType === "organization" ? "/inventory" : "/customer");
      } else {
        throw new Error(result.data.message || "Failed to save food item");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(err.message || "Failed to save food item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <h1 className="text-2xl font-bold mb-6">{isEditing ? "Edit Food Item" : "Add Food to Share"}</h1>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Basic Information</h2>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  formErrors.title ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-1 focus:ring-black`}
                placeholder="e.g., Homemade Chocolate Cookies"
              />
              {formErrors.title && <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`w-full px-3 py-2 border ${
                  formErrors.description ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-1 focus:ring-black`}
                placeholder="Describe your food item, including freshness, ingredients, etc."
              />
              {formErrors.description && <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-3 py-2 border ${
                    formErrors.quantity ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-black`}
                />
                {formErrors.quantity && <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>}
              </div>

              <div>
                <label htmlFor="quantityUnit" className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <select
                  id="quantityUnit"
                  name="quantityUnit"
                  value={formData.quantityUnit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="servings">Servings</option>
                  <option value="pieces">Pieces</option>
                  <option value="kg">Kilograms</option>
                  <option value="g">Grams</option>
                  <option value="l">Liters</option>
                  <option value="ml">Milliliters</option>
                  <option value="boxes">Boxes</option>
                  <option value="bags">Bags</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  formErrors.category ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-1 focus:ring-black`}
              >
                <option value="meal">Complete Meal</option>
                <option value="produce">Fresh Produce</option>
                <option value="bakery">Bakery</option>
                <option value="dairy">Dairy</option>
                <option value="pantry">Pantry Items</option>
                <option value="other">Other</option>
              </select>
              {formErrors.category && <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>}
            </div>
          </div>

          {/* Dietary Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Dietary Information</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="vegetarian"
                  name="dietary.vegetarian"
                  checked={formData.dietary.vegetarian}
                  onChange={handleChange}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="vegetarian" className="ml-2 block text-sm text-gray-700">
                  Vegetarian
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="vegan"
                  name="dietary.vegan"
                  checked={formData.dietary.vegan}
                  onChange={handleChange}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="vegan" className="ml-2 block text-sm text-gray-700">
                  Vegan
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="glutenFree"
                  name="dietary.glutenFree"
                  checked={formData.dietary.glutenFree}
                  onChange={handleChange}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="glutenFree" className="ml-2 block text-sm text-gray-700">
                  Gluten Free
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="nutFree"
                  name="dietary.nutFree"
                  checked={formData.dietary.nutFree}
                  onChange={handleChange}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="nutFree" className="ml-2 block text-sm text-gray-700">
                  Nut Free
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="dairyFree"
                  name="dietary.dairyFree"
                  checked={formData.dietary.dairyFree}
                  onChange={handleChange}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="dairyFree" className="ml-2 block text-sm text-gray-700">
                  Dairy Free
                </label>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Images</h2>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="images"
                name="images"
                onChange={handleImageChange}
                multiple
                accept="image/*"
                className="hidden"
              />

              {imagePreviewUrls.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        className="h-32 w-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 mb-4">
                  <Upload className="h-12 w-12 mx-auto mb-2" />
                  <p>Drag and drop images here or click to browse</p>
                </div>
              )}

              {imagePreviewUrls.length < 5 && (
                <label
                  htmlFor="images"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Images
                </label>
              )}

              <p className="text-xs text-gray-500 mt-2">
                You can upload up to 5 images. PNG, JPG, or JPEG (max 5MB each).
              </p>
            </div>
          </div>

          {/* Expiration and Location */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Expiration and Location</h2>

            <div>
              <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-1">
                Expires At (Date and Time) *
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Date Picker */}
                <div className="flex-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <ShadcnCalendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                  {formErrors.expiresAt && <p className="mt-1 text-sm text-red-600">{formErrors.expiresAt}</p>}
                </div>

                {/* Time Picker */}
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ClockIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                For items like fresh food that expire quickly, be sure to set an appropriate time.
              </p>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.location.address}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border ${
                    formErrors.address ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-black`}
                  placeholder="Enter pickup address"
                />
                {formErrors.address && <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPickupOnly"
                name="isPickupOnly"
                checked={formData.isPickupOnly}
                onChange={handleChange}
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              />
              <label htmlFor="isPickupOnly" className="ml-2 block text-sm text-gray-700">
                Pickup only (no delivery)
              </label>
            </div>
          </div>

          {/* Price Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Price Information</h2>

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="isFree"
                name="isFree"
                checked={formData.isFree}
                onChange={handleChange}
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              />
              <label htmlFor="isFree" className="ml-2 block text-sm text-gray-700">
                This item is free
              </label>
            </div>

            {!formData.isFree && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Original Price *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="originalPrice"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className={`w-full pl-10 pr-3 py-2 border ${
                        formErrors.originalPrice ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-1 focus:ring-black`}
                      placeholder="0.00"
                    />
                    {formErrors.originalPrice && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.originalPrice}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Discounted Price *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className={`w-full pl-10 pr-3 py-2 border ${
                        formErrors.price ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-1 focus:ring-black`}
                      placeholder="0.00"
                    />
                    {formErrors.price && <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <Clock className="animate-spin h-4 w-4 mr-2" />
                  {isEditing ? "Updating..." : "Saving..."}
                </span>
              ) : (
                <span>{isEditing ? "Update Food Item" : "Save Food Item"}</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

