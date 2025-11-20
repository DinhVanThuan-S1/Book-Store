/**
 * ==============================================
 * UPLOAD API
 * ==============================================
 * API calls cho upload ảnh lên Cloudinary
 */

import axiosInstance from './axiosConfig';

/**
 * Upload single image
 */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axiosInstance.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Upload multiple images
 */
export const uploadImages = async (files) => {
  const formData = new FormData();
  
  files.forEach(file => {
    formData.append('images', file);
  });

  const response = await axiosInstance.post('/upload/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  console.log('uploadApi - raw response:', response);
  console.log('uploadApi - response stringified:', JSON.stringify(response, null, 2));

  return response;
};

/**
 * Delete image from Cloudinary
 */
export const deleteImage = async (publicId) => {
  const encodedPublicId = encodeURIComponent(publicId);
  const response = await axiosInstance.delete(`/upload/image/${encodedPublicId}`);
  return response.data;
};

export default {
  uploadImage,
  uploadImages,
  deleteImage,
};
