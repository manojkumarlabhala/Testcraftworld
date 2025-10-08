import { sql } from "drizzle-orm";
import { mysqlTable, text, varchar, timestamp, boolean, int } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").default("reader"), // admin, author, reader
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = mysqlTable("posts", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  featuredImage: text("featured_image"),
  authorId: varchar("author_id", { length: 36 }).references(() => users.id),
  categoryId: varchar("category_id", { length: 36 }).references(() => categories.id),
  published: boolean("published").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const comments = mysqlTable("comments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  postId: varchar("post_id", { length: 36 }).references(() => posts.id),
  authorId: varchar("author_id", { length: 36 }).references(() => users.id),
  content: text("content").notNull(),
  parentId: varchar("parent_id", { length: 36 }), // for nested comments - will be validated in application logic
  createdAt: timestamp("created_at").defaultNow(),
});

export const postTags = mysqlTable("post_tags", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  postId: varchar("post_id", { length: 36 }).references(() => posts.id),
  tag: text("tag").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
  description: true,
});

export const insertPostSchema = createInsertSchema(posts).pick({
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  featuredImage: true,
  authorId: true,
  categoryId: true,
  published: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  postId: true,
  authorId: true,
  content: true,
  parentId: true,
});

export const insertPostTagSchema = createInsertSchema(postTags).pick({
  postId: true,
  tag: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertPostTag = z.infer<typeof insertPostTagSchema>;

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type PostTag = typeof postTags.$inferSelect;
