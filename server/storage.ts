// Reuse the drizzle instance from server/db to avoid creating a second
// database client (which can lead to connection resets). server/db.ts
// configures the correct neon-serverless/drizzle client for the
// DATABASE_URL in this project.
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import {
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Post,
  type InsertPost,
  type Comment,
  type InsertComment,
  type PostTag,
  type InsertPostTag,
  users,
  categories,
  posts,
  comments,
  postTags
} from "@shared/schema";
import { randomUUID } from "crypto";

// The actual database client is provided by server/db.ts. That module
// will throw early if DATABASE_URL is not set, so we don't need to
// re-check it here.

// modify the interface with any CRUD methods you might need
export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
  deleteAllUsers(): Promise<boolean>;
  getUsers(): Promise<User[]>;

  // Categories
  getCategory(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  getCategories(): Promise<Category[]>;

  // Posts
  getPost(id: string): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  getPosts(limit?: number, offset?: number): Promise<Post[]>;
  getPostsByCategory(categoryId: string, limit?: number, offset?: number): Promise<Post[]>;
  getPublishedPosts(limit?: number, offset?: number): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: string): Promise<boolean>;

  // Comments
  getCommentsByPost(postId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  // Tags
  getTagsByPost(postId: string): Promise<PostTag[]>;
  addTagToPost(tag: InsertPostTag): Promise<PostTag>;
  removeTagFromPost(postId: string, tag: string): Promise<boolean>;
}

export class DbStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const userWithId = { ...insertUser, id };
    await db.insert(users).values(userWithId);
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0]!;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return true; // MySQL doesn't return affected rows in the same way, assume success
  }

  async deleteAllUsers(): Promise<boolean> {
    // Careful with this in production; used by admin to reset users when requested.
    await db.delete(users);
    return true;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Categories
  async getCategory(id: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return result[0];
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const categoryWithId = { ...insertCategory, id };
    await db.insert(categories).values(categoryWithId);
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0]!;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  // Posts
  async getPost(id: string): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return result[0];
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
    return result[0];
  }

  async getPosts(limit = 10, offset = 0): Promise<Post[]> {
    return await db.select().from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getPostsByCategory(categoryId: string, limit = 10, offset = 0): Promise<Post[]> {
    return await db.select().from(posts)
      .where(eq(posts.categoryId, categoryId))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getPublishedPosts(limit = 10, offset = 0): Promise<Post[]> {
    return await db.select().from(posts)
      .where(eq(posts.published, true))
      .orderBy(desc(posts.publishedAt))
      .limit(limit)
      .offset(offset);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = randomUUID();
    const postWithId = {
      ...insertPost,
      id,
      publishedAt: insertPost.published ? new Date() : null,
    };
    await db.insert(posts).values(postWithId);
    const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return result[0]!;
  }

  async updatePost(id: string, updateData: Partial<InsertPost>): Promise<Post | undefined> {
    const updateFields: any = {
      ...updateData,
      updatedAt: new Date(),
    };
    
    if (updateData.published !== undefined) {
      updateFields.publishedAt = updateData.published ? new Date() : null;
    }
    
    await db.update(posts)
      .set(updateFields)
      .where(eq(posts.id, id));
    const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return result[0];
  }

  async deletePost(id: string): Promise<boolean> {
    await db.delete(posts).where(eq(posts.id, id));
    return true;
  }

  // Comments
  async getCommentsByPost(postId: string): Promise<Comment[]> {
    return await db.select().from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const commentWithId = { ...insertComment, id };
    await db.insert(comments).values(commentWithId);
    const result = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
    return result[0]!;
  }

  // Tags
  async getTagsByPost(postId: string): Promise<PostTag[]> {
    return await db.select().from(postTags).where(eq(postTags.postId, postId));
  }

  async addTagToPost(insertTag: InsertPostTag): Promise<PostTag> {
    const id = randomUUID();
    const tagWithId = { ...insertTag, id };
    await db.insert(postTags).values(tagWithId);
    const result = await db.select().from(postTags).where(eq(postTags.id, id)).limit(1);
    return result[0]!;
  }

  async removeTagFromPost(postId: string, tag: string): Promise<boolean> {
    await db.delete(postTags)
      .where(and(eq(postTags.postId, postId), eq(postTags.tag, tag)));
    return true;
  }
}

// Fallback to memory storage if database connection fails
export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private categories: Map<string, Category> = new Map();
  private posts: Map<string, Post> = new Map();
  private comments: Map<string, Comment> = new Map();
  private tags: Map<string, PostTag> = new Map();

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      email: insertUser.email || null,
      role: insertUser.role || "author", // Default new users to author role
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async deleteAllUsers(): Promise<boolean> {
    this.users.clear();
    return true;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Categories
  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug,
    );
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      ...insertCategory,
      id,
      description: insertCategory.description || null,
      createdAt: new Date()
    };
    this.categories.set(id, category);
    return category;
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  // Posts
  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    return Array.from(this.posts.values()).find(
      (post) => post.slug === slug,
    );
  }

  async getPosts(limit = 10, offset = 0): Promise<Post[]> {
    return Array.from(this.posts.values())
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(offset, offset + limit);
  }

  async getPostsByCategory(categoryId: string, limit = 10, offset = 0): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.categoryId === categoryId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(offset, offset + limit);
  }

  async getPublishedPosts(limit = 10, offset = 0): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.published)
      .sort((a, b) => new Date(b.publishedAt || b.createdAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || 0).getTime())
      .slice(offset, offset + limit);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = randomUUID();
    const post: Post = {
      ...insertPost,
      id,
      excerpt: insertPost.excerpt || null,
      featuredImage: insertPost.featuredImage || null,
      authorId: insertPost.authorId || null,
      categoryId: insertPost.categoryId || null,
      published: insertPost.published ?? false,
      publishedAt: insertPost.published ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: string, updateData: Partial<InsertPost>): Promise<Post | undefined> {
    const existingPost = this.posts.get(id);
    if (!existingPost) return undefined;

    const updatedPost: Post = {
      ...existingPost,
      ...updateData,
      updatedAt: new Date(),
      publishedAt: updateData.published ? new Date() : existingPost.publishedAt,
    };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: string): Promise<boolean> {
    return this.posts.delete(id);
  }

  // Comments
  async getCommentsByPost(postId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      id,
      content: insertComment.content,
      authorId: insertComment.authorId || null,
      postId: insertComment.postId || null,
      parentId: insertComment.parentId || null,
      createdAt: new Date()
    };
    this.comments.set(id, comment);
    return comment;
  }

  // Tags
  async getTagsByPost(postId: string): Promise<PostTag[]> {
    return Array.from(this.tags.values()).filter(tag => tag.postId === postId);
  }

  async addTagToPost(insertTag: InsertPostTag): Promise<PostTag> {
    const id = randomUUID();
    const tag: PostTag = {
      id,
      tag: insertTag.tag,
      postId: insertTag.postId || null
    };
    this.tags.set(id, tag);
    return tag;
  }

  async removeTagFromPost(postId: string, tag: string): Promise<boolean> {
    const tagToDelete = Array.from(this.tags.values()).find(
      t => t.postId === postId && t.tag === tag
    );
    if (tagToDelete) {
      return this.tags.delete(tagToDelete.id);
    }
    return false;
  }
}

// Storage configuration for production
let storage: IStorage;

// Always use database storage in production, memory storage only in development
if (process.env.NODE_ENV === "production") {
  console.log("Production environment: using database storage");
  storage = new DbStorage();
} else {
  console.log("Development environment: using database storage with fallback");
  try {
    storage = new DbStorage();
    console.log("Using database storage");
  } catch (error) {
    console.warn("Database connection failed, falling back to memory storage:", error);
    storage = new MemStorage();
  }
}

// Allow switching to memory storage at runtime when the DB is failing in development only
export function useMemoryStorage() {
  if (process.env.NODE_ENV === "production") {
    console.error("Cannot switch to memory storage in production");
    return storage;
  }
  storage = new MemStorage();
  console.warn("Switched to in-memory storage due to DB errors (development fallback)");
  return storage;
}

export { storage };
