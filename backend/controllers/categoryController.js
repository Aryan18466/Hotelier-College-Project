const RoomCategory = require('../models/RoomCategory');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await RoomCategory.find({ isActive: true }).sort({ basePrice: 1 });
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const category = await RoomCategory.create(req.body);
    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await RoomCategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await RoomCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    category.isActive = false;
    await category.save();
    res.status(200).json({
      success: true,
      message: 'Category deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};
