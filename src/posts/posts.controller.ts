import { Controller, Body, Query, Post, Get, Param } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('/create')
  createPost(@Body() createPostDto: CreatePostDto) {
    return this.postsService.createPost(createPostDto);
  }

  @Get()
  async getPosts(@Query() query: any) {
    return this.postsService.getAllPosts(query);
  }

  @Post('/like/:postId')
  async likePost(@Param('postId') postId: string, @Body() body) {
    return this.postsService.likePost(body.userId, postId);
  }
}
