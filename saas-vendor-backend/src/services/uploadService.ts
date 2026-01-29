import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import config from '../config/environment';

/**
 * Upload Service using Cloudinary
 * Handles file uploads for profile images, deal images, and KYC documents
 */
export class UploadService {
  private static initialized = false;

  /**
   * Initialize Cloudinary with credentials
   */
  static initialize(): void {
    if (this.initialized) return;

    if (!config.cloudinaryCloudName || !config.cloudinaryApiKey || !config.cloudinaryApiSecret) {
      console.warn('⚠️  Cloudinary credentials not configured. Upload service will be unavailable.');
      return;
    }

    cloudinary.config({
      cloud_name: config.cloudinaryCloudName,
      api_key: config.cloudinaryApiKey,
      api_secret: config.cloudinaryApiSecret,
    });

    this.initialized = true;
    console.log('✅ Cloudinary initialized');
  }

  /**
   * Upload file to Cloudinary
   */
  private static async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    folder: string,
    resourceType: 'image' | 'raw' = 'image'
  ): Promise<string> {
    try {
      if (!this.initialized) this.initialize();
      if (!config.cloudinaryCloudName) throw new Error('Cloudinary not configured');

      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `saas-vendor/${folder}`,
            resource_type: resourceType,
            public_id: fileName,
            overwrite: true,
            quality: 'auto',
          },
          (error: any, result: any) => {
            if (error) {
              reject(new Error(`Cloudinary upload failed: ${error.message}`));
            } else {
              resolve(result.secure_url);
            }
          }
        );

        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    } catch (error: any) {
      console.error('❌ Error uploading file:', error.message);
      throw error;
    }
  }

  /**
   * Upload profile image
   */
  static async uploadProfileImage(
    fileBuffer: Buffer,
    userId: string
  ): Promise<string> {
    try {
      const fileName = `profile-${userId}-${Date.now()}`;
      const url = await this.uploadFile(fileBuffer, fileName, 'profiles', 'image');
      console.log(`✅ Profile image uploaded for user ${userId}`);
      return url;
    } catch (error: any) {
      console.error('❌ Error uploading profile image:', error.message);
      throw new Error(`Failed to upload profile image: ${error.message}`);
    }
  }

  /**
   * Upload deal image
   */
  static async uploadDealImage(
    fileBuffer: Buffer,
    dealId: string
  ): Promise<string> {
    try {
      const fileName = `deal-${dealId}-${Date.now()}`;
      const url = await this.uploadFile(fileBuffer, fileName, 'deals', 'image');
      console.log(`✅ Deal image uploaded for deal ${dealId}`);
      return url;
    } catch (error: any) {
      console.error('❌ Error uploading deal image:', error.message);
      throw new Error(`Failed to upload deal image: ${error.message}`);
    }
  }

  /**
   * Upload gallery images for deals
   */
  static async uploadGalleryImages(
    fileBuffers: Buffer[],
    dealId: string
  ): Promise<string[]> {
    try {
      const uploadPromises = fileBuffers.map((buffer, index) => {
        const fileName = `gallery-${dealId}-${index}-${Date.now()}`;
        return this.uploadFile(buffer, fileName, 'deals/gallery', 'image');
      });

      const urls = await Promise.all(uploadPromises);
      console.log(`✅ ${urls.length} gallery images uploaded for deal ${dealId}`);
      return urls;
    } catch (error: any) {
      console.error('❌ Error uploading gallery images:', error.message);
      throw new Error(`Failed to upload gallery images: ${error.message}`);
    }
  }

  /**
   * Upload KYC document (PDF or image)
   */
  static async uploadKYCDocument(
    fileBuffer: Buffer,
    userId: string,
    fileName: string
  ): Promise<string> {
    try {
      const isImage = fileName.match(/\.(jpg|jpeg|png|gif)$/i);
      const resourceType = isImage ? 'image' : 'raw';
      const fileNameWithId = `kyc-${userId}-${Date.now()}-${fileName}`;

      const url = await this.uploadFile(fileBuffer, fileNameWithId, 'kyc', resourceType);
      console.log(`✅ KYC document uploaded for user ${userId}`);
      return url;
    } catch (error: any) {
      console.error('❌ Error uploading KYC document:', error.message);
      throw new Error(`Failed to upload KYC document: ${error.message}`);
    }
  }

  /**
   * Delete file from Cloudinary
   */
  static async deleteFile(publicId: string): Promise<void> {
    try {
      if (!this.initialized) this.initialize();
      if (!config.cloudinaryCloudName) throw new Error('Cloudinary not configured');

      await cloudinary.uploader.destroy(publicId);
      console.log(`✅ File deleted from Cloudinary: ${publicId}`);
    } catch (error: any) {
      console.error('❌ Error deleting file:', error.message);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Get upload URL with signature for direct upload from client
   */
  static getSignedUploadURL(folder: string): {
    url: string;
    signature: string;
    timestamp: number;
    api_key: string;
    cloud_name: string;
  } {
    try {
      if (!this.initialized) this.initialize();
      if (!config.cloudinaryCloudName || !config.cloudinaryApiSecret) {
        throw new Error('Cloudinary not configured');
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const uploadPath = `saas-vendor/${folder}`;

      const signatureData = cloudinary.utils.sign_request(
        { timestamp, folder: uploadPath } as any,
        config.cloudinaryApiSecret as any
      ) as any;

      return {
        url: `https://api.cloudinary.com/v1_1/${config.cloudinaryCloudName}/image/upload`,
        signature: signatureData.signature || '',
        timestamp,
        api_key: config.cloudinaryApiKey || '',
        cloud_name: config.cloudinaryCloudName,
      };
    } catch (error: any) {
      console.error('❌ Error generating signed URL:', error.message);
      throw new Error(`Failed to generate upload URL: ${error.message}`);
    }
  }

  /**
   * Get transformation URL for optimization
   */
  static getOptimizedImageUrl(
    imageUrl: string,
    width?: number,
    height?: number,
    quality: 'auto' | 'low' | 'good' | 'best' = 'auto'
  ): string {
    try {
      if (!config.cloudinaryCloudName) throw new Error('Cloudinary not configured');

      let transformations = [
        `c_fill`,
        `q_${quality}`,
      ];

      if (width) transformations.push(`w_${width}`);
      if (height) transformations.push(`h_${height}`);

      const transformString = transformations.join(',');
      const pattern = new RegExp(`/upload/`);

      return imageUrl.replace(pattern, `/upload/${transformString}/`);
    } catch (error: any) {
      console.error('❌ Error getting optimized URL:', error.message);
      return imageUrl; // Return original URL on error
    }
  }

  /**
   * Upload video (for deal demo videos)
   */
  static async uploadVideo(
    fileBuffer: Buffer,
    dealId: string,
    fileName: string
  ): Promise<string> {
    try {
      const fileNameWithId = `demo-video-${dealId}-${Date.now()}-${fileName}`;
      const url = await this.uploadFile(fileBuffer, fileNameWithId, 'demo-videos', 'raw');
      console.log(`✅ Demo video uploaded for deal ${dealId}`);
      return url;
    } catch (error: any) {
      console.error('❌ Error uploading video:', error.message);
      throw new Error(`Failed to upload video: ${error.message}`);
    }
  }
}
