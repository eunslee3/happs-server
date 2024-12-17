import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private readonly prismaService: PrismaService) {}
  async createPost(createPostDto: CreatePostDto): Promise<any> {
    try{
      const createdPost = await this.prismaService.post.create({
        data: {
          ...createPostDto
        }
      })
      return createdPost;
    } catch (err) {
      console.error(err);
      return {
        status: 400,
        message: `Failed to create post`,
        error: err.message
      }
    }
  }

  async getAllPosts(filters?: any): Promise<any> {
    try{
      const { title, location, tags, ...rest } = filters;

      return this.prismaService.post.findMany({
        where: {
          ...rest,
          ...(title && {
            title: { contains: title, mode: 'insensitive' },
          }),
          ...(location && {
            location: { contains: location, mode: 'insensitive' },
          }),
          ...(tags && {
            tags: { hasSome: Array.isArray(tags) ? tags : [tags] },
          }),
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      console.error(err);
      return {
        status: 400,
        message: `Failed to get all posts`,
        error: err.message
      }
    }
  }

  async likePost(userId: string, postId: string) {
    try {
      return await this.prismaService.$transaction(async (prisma) => {
        const existingLike = await prisma.like.findFirst({
          where: { userId, postId },
        });
  
        if (existingLike) {
          await prisma.like.delete({
            where: { id: existingLike.id },
          });
          await prisma.post.update({
            where: { id: postId },
            data: { likes: { decrement: 1 } },
          });
          return {
            status: 200,
            message: 'Post unliked successfully',
          };
        }
  
        await prisma.like.create({
          data: { userId, postId },
        });
  
        await prisma.post.update({
          where: { id: postId },
          data: { likes: { increment: 1 } },
        });
        return {
          status: 200,
          message: 'Post liked successfully',
        };
      });
    } catch (err) {
      console.error('Error in likePost:', err);
      return {
        status: 500,
        message: 'An error occurred while processing the like/unlike action.',
        error: err.message,
      };
    }
  }
  
}
