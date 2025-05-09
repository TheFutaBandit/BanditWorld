import z from 'zod';

export const SignUpSchema = z.object({
    username: z.string(),
    password: z.string().min(8),
    type: z.enum(["User", "Admin"])
})

export const SignInSchema = z.object({
    username: z.string(),
    password: z.string().min(8)
})

export const UpdateMetadataSchema = z.object({
    avatarId: z.string(),
})

export const CreateSpaceSchema = z.object({
    name: z.string(),
    dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
    mapId: z.string().optional()
})

export const DeleteSpaceSchema = z.string();

export const AddElementSchema = z.object({
    elementId: z.string(),
    spaceId: z.string(),
    x: z.number().lte(1000),
    y: z.number().lte(1000)
    //you can include an error check here with gte and lte remember
})

export const DeleteElementSchema = z.object({
    id: z.string(),
})

export const CreateElementSchema = z.object({
    imageUrl: z.string(),
    width: z.number(),
    height: z.number(),
    static: z.boolean(),
})

export const UpdateElementSchema = z.object({
    imageUrl: z.string(),
})

export const CreateAvatarSchema = z.object({
    imageUrl: z.string(),
    name: z.string(),
})

export const CreateMapSchema = z.object({
    thumbnail: z.string(),
    dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
    name: z.string(),
    defaultElements: z.array(z.object({
        elementId: z.string(),
        x: z.number(),
        y: z.number(),
    }))
})

export const UpdateMetadataIds = z.string();

declare global {
    namespace Express {
      export interface Request {
        userId?: string;
      }
    }
  }