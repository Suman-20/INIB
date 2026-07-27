import mongoose from "mongoose";

const searchSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
    },

    temperature: {
      type: Number,
    },

    condition: {
      type: String,
    },

    humidity: {
      type: Number,
    },

    searchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Search = mongoose.model("Search", searchSchema);

export default Search;