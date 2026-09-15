import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      maxlength: [80, "Category name cannot exceed 80 characters"]
    },
    slug: {
      type: String,
      required: [true, "Category slug is required"],
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    image: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// slug and name uniqueness indexes are automatically created by unique: true
const Category = mongoose.model("Category", categorySchema);

export default Category;
