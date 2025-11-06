/**
 * Cloud Functions for AI Photo Gallery - Simplified Version
 *
 * This function automatically generates optimized thumbnails when images are uploaded
 * to Firebase Storage and updates Firestore with the URLs for instant UI updates.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sharp = require("sharp");
const path = require("path");
const os = require("os");
const fs = require("fs");

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Generate optimized WebP + thumbnails when a new image is uploaded
 */
exports.generateThumbnails = functions
  .region("us-west1")
  .runWith({
    timeoutSeconds: 540,
    memory: "2GB",
  })
  .storage.object()
  .onFinalize(async (object) => {
    const filePath = object.name;
    const contentType = object.contentType;
    const fileName = path.basename(filePath);
    const fileDir = path.dirname(filePath);

    console.log("🖼️ File uploaded:", filePath);

    // Exit conditions
    if (!filePath.startsWith("uploads/")) {
      console.log("⏭️ Skipping: Not in uploads directory");
      return null;
    }

    if (!contentType || !contentType.startsWith("image/")) {
      console.log("⏭️ Skipping: Not an image file");
      return null;
    }

    if (fileName.includes("_thumb_") || fileName.includes("_optimized")) {
      console.log("⏭️ Skipping: Already processed");
      return null;
    }

    const bucket = admin.storage().bucket(object.bucket);
    const tempFilePath = path.join(os.tmpdir(), fileName);

    try {
      // Download original image
      console.log("📥 Downloading original image...");
      await bucket.file(filePath).download({ destination: tempFilePath });

      // Create optimized WebP version
      const optimizedFileName = fileName.replace(/\.[^.]+$/, "_optimized.webp");
      const optimizedFilePath = path.join(fileDir, optimizedFileName);
      const optimizedTempPath = path.join(os.tmpdir(), optimizedFileName);

      console.log("🔄 Converting to optimized WebP...");
      await sharp(tempFilePath)
        .webp({
          quality: 90,
          effort: 4,
          smartSubsample: true,
        })
        .toFile(optimizedTempPath);

      // Upload optimized version
      await bucket.upload(optimizedTempPath, {
        destination: optimizedFilePath,
        metadata: {
          contentType: "image/webp",
          cacheControl: "public, max-age=31536000",
        },
      });

      console.log("✅ Optimized WebP uploaded:", optimizedFilePath);

      // Get optimized URL
      const optimizedUrl = await bucket.file(optimizedFilePath).getSignedUrl({
        action: "read",
        expires: "03-09-2491",
      });

      // Generate thumbnails
      const thumbnailSizes = [
        { width: 200, height: 200, suffix: "_thumb_200", quality: 80 },
        { width: 800, height: 800, suffix: "_thumb_800", quality: 85 },
      ];

      const generatedUrls = {
        optimizedUrl: optimizedUrl[0],
      };

      const uploadPromises = thumbnailSizes.map(async (size) => {
        const thumbFileName = fileName.replace(
          /\.[^.]+$/,
          `${size.suffix}.webp`
        );
        const thumbFilePath = path.join(fileDir, thumbFileName);
        const thumbTempPath = path.join(os.tmpdir(), thumbFileName);

        console.log(`🔄 Generating ${size.width}x${size.height} thumbnail...`);

        await sharp(optimizedTempPath)
          .resize(size.width, size.height, {
            fit: "cover",
            position: "centre",
          })
          .webp({ quality: size.quality, effort: 4 })
          .toFile(thumbTempPath);

        await bucket.upload(thumbTempPath, {
          destination: thumbFilePath,
          metadata: {
            contentType: "image/webp",
            cacheControl: "public, max-age=31536000",
          },
        });

        const thumbUrl = await bucket.file(thumbFilePath).getSignedUrl({
          action: "read",
          expires: "03-09-2491",
        });

        if (size.suffix === "_thumb_200") {
          generatedUrls.thumbUrl = thumbUrl[0];
        } else if (size.suffix === "_thumb_800") {
          generatedUrls.mediumUrl = thumbUrl[0];
        }

        fs.unlinkSync(thumbTempPath);
        console.log(`✅ ${size.width}x${size.height} thumbnail uploaded`);
      });

      await Promise.all(uploadPromises);

      console.log("🎉 All images processed successfully");

      // Update Firestore
      try {
        console.log("📝 Updating Firestore with thumbnail URLs...");

        const db = admin.firestore();
        const configRef = db.collection("gallery").doc("config");
        const configDoc = await configRef.get();

        if (configDoc.exists) {
          const config = configDoc.data();
          let photoUpdated = false;

          if (config.albums && Array.isArray(config.albums)) {
            config.albums.forEach((album, albumIndex) => {
              if (album.photos && Array.isArray(album.photos)) {
                album.photos.forEach((photo, photoIndex) => {
                  if (photo.path === filePath) {
                    config.albums[albumIndex].photos[photoIndex] = {
                      ...photo,
                      ...generatedUrls,
                    };
                    photoUpdated = true;
                    console.log(
                      `✅ Updated photo ${photo.id} with thumbnail URLs`
                    );
                  }
                });
              }
            });
          }

          if (photoUpdated) {
            await configRef.set(config);
            console.log(
              "🎉 Firestore updated successfully! UI will refresh instantly."
            );
          } else {
            console.log("⚠️ Photo not found in Firestore config");
          }
        }
      } catch (firestoreError) {
        console.error("❌ Error updating Firestore:", firestoreError);
      }

      // Cleanup
      fs.unlinkSync(tempFilePath);
      fs.unlinkSync(optimizedTempPath);

      return null;
    } catch (error) {
      console.error("❌ Error in image processing:", error);

      // Cleanup on error
      try {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        const optimizedTempPath = path.join(
          os.tmpdir(),
          fileName.replace(/\.[^.]+$/, "_optimized.webp")
        );
        if (fs.existsSync(optimizedTempPath)) fs.unlinkSync(optimizedTempPath);
      } catch (cleanupError) {
        console.error("⚠️ Error cleaning up temp files:", cleanupError);
      }

      return null;
    }
  });

/**
 * Clean up thumbnails when original image is deleted
 */
exports.deleteThumbnails = functions
  .region("us-west1")
  .storage.object()
  .onDelete(async (object) => {
    const filePath = object.name;
    const fileName = path.basename(filePath);
    const fileDir = path.dirname(filePath);

    if (
      !filePath.startsWith("uploads/") ||
      fileName.includes("_thumb_") ||
      fileName.includes("_optimized")
    ) {
      return null;
    }

    console.log(
      "🗑️ Original deleted, cleaning up processed versions:",
      filePath
    );

    const bucket = admin.storage().bucket(object.bucket);
    const filesToDelete = [
      "_optimized.webp",
      "_thumb_200.webp",
      "_thumb_800.webp",
    ];

    const deletePromises = filesToDelete.map(async (suffix) => {
      const processedFileName = fileName.replace(/\.[^.]+$/, suffix);
      const processedFilePath = path.join(fileDir, processedFileName);

      try {
        await bucket.file(processedFilePath).delete();
        console.log(`✅ Deleted: ${processedFilePath}`);
      } catch (error) {
        if (error.code !== 404) {
          console.error(`⚠️ Error deleting ${processedFilePath}:`, error);
        }
      }
    });

    await Promise.all(deletePromises);
    console.log("✅ Cleanup completed");

    return null;
  });
