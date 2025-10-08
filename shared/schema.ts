import { sql } from "drizzle-orm";
import { mysqlTable, text, varchar, timestamp, boolean, int } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  email: varchar("email", { length: 255 }),
  role: varchar("role", { length: 50 }).default("reader"), // admin, author, reader
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = mysqlTable("posts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  featuredImage: varchar("featured_image", { length: 500 }),
  authorId: varchar("author_id", { length: 36 }).references(() => users.id),
  categoryId: varchar("category_id", { length: 36 }).references(() => categories.id),
  published: boolean("published").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const comments = mysqlTable("comments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  postId: varchar("post_id", { length: 36 }).references(() => posts.id),
  authorId: varchar("author_id", { length: 36 }).references(() => users.id),
  content: text("content").notNull(),
  parentId: varchar("parent_id", { length: 36 }), // for nested comments - will be validated in application logic
  createdAt: timestamp("created_at").defaultNow(),
});

export const postTags = mysqlTable("post_tags", {
  id: varchar("id", { length: 36 }).primaryKey(),
  postId: varchar("post_id", { length: 36 }).references(() => posts.id),
  tag: varchar("tag", { length: 100 }).notNull(),
});

// Use explicit insert types to avoid complex inferred types from drizzle-zod
export type InsertUser = {
  username: string;
  password: string;
  email?: string | null;
  role?: string;
};

export type InsertCategory = {
  name: string;
  slug: string;
  description?: string | null;
};

export type InsertPost = {
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  featuredImage?: string | null;
  authorId?: string | null;
  categoryId?: string | null;
  published?: boolean;
};

export type InsertComment = {
  postId: string;
  authorId?: string | null;
  content: string;
  parentId?: string | null;
};

export type InsertPostTag = {
  postId: string;
  tag: string;
};

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type PostTag = typeof postTags.$inferSelect;
