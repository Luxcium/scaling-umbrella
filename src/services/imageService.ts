import { z } from 'zod';
import { PrismaClient, Prisma } from '@prisma/client';
import { Result } from '../types/core/Result';

/**
 * Initialize Prisma client as a singleton
 */
const prisma = new PrismaClient();

/**
 * Schema for validating image query parameters
 */
export const ImageQuerySchema = z.object({
  zipPath: z.string().min(1, 'Zip path is required'),
  imageName: z.string().optional(),
});

/**
 * Type for the validated image query parameters
 */
export type ImageQuery = z.infer<typeof ImageQuerySchema>;

/**
 * Retrieves images from a specific zip file
 * @param input - Query parameters that may be unvalidated
 * @returns Result containing either images or an error
 */
export async function getImages(input: unknown): Promise<Result<any[], Error>> {
  const validation = ImageQuerySchema.safeParse(input);

  if (!validation.success) {
    return Result.failure(
      new Error(`Invalid query parameters: ${validation.error.message}`)
    );
  }

  try {
    const images = await prisma.image.findMany({
      where: {
        zipFile: {
          zipPath: validation.data.zipPath,
        },
        ...(validation.data.imageName
          ? { filename: { contains: validation.data.imageName } }
          : {}),
      },
    });

    return Result.success(images);
  } catch (error) {
    return Result.failure(
      error instanceof Error
        ? error
        : new Error('Unknown error occurred while fetching images')
    );
  }
}

/**
 * Schema for creating a new image record
 */
export const CreateImageSchema = z.object({
  zipPath: z.string().min(1, 'Zip path is required'),
  filename: z.string().min(1, 'Filename is required'),
  contentType: z.string().default('image/jpeg'),
  size: z.number().int().positive('Size must be a positive integer'),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Type for the validated image creation parameters
 */
export type CreateImageInput = z.infer<typeof CreateImageSchema>;

/**
 * Creates a new image record associated with a zip file
 * @param input - Image creation parameters that may be unvalidated
 * @returns Result containing either the created image or an error
 */
export async function createImage(input: unknown): Promise<Result<any, Error>> {
  const validation = CreateImageSchema.safeParse(input);

  if (!validation.success) {
    return Result.failure(
      new Error(`Invalid image data: ${validation.error.message}`)
    );
  }

  try {
    const zipFile = await prisma.zipFile.upsert({
      where: { zipPath: validation.data.zipPath },
      update: {},
      create: { zipPath: validation.data.zipPath },
    });

    const image = await prisma.image.create({
      data: {
        filename: validation.data.filename,
        contentType: validation.data.contentType,
        size: validation.data.size,
        metadata:
          (validation.data.metadata as Prisma.InputJsonValue) || undefined,
        zipFile: { connect: { id: zipFile.id } },
      },
    });

    return Result.success(image);
  } catch (error) {
    return Result.failure(
      error instanceof Error
        ? error
        : new Error('Unknown error occurred while creating image')
    );
  }
}
