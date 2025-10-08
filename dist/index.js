var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  categories: () => categories,
  comments: () => comments,
  postTags: () => postTags,
  posts: () => posts,
  users: () => users
});
import { mysqlTable, text, varchar, timestamp, boolean } from "drizzle-orm/mysql-core";
var users, categories, posts, comments, postTags;
var init_schema = __esm({
  "shared/schema.ts"() {
    users = mysqlTable("users", {
      id: varchar("id", { length: 36 }).primaryKey(),
      username: varchar("username", { length: 255 }).notNull().unique(),
      password: text("password").notNull(),
      email: varchar("email", { length: 255 }),
      role: varchar("role", { length: 50 }).default("reader"),
      // admin, author, reader
      createdAt: timestamp("created_at").defaultNow()
    });
    categories = mysqlTable("categories", {
      id: varchar("id", { length: 36 }).primaryKey(),
      name: varchar("name", { length: 255 }).notNull().unique(),
      slug: varchar("slug", { length: 255 }).notNull().unique(),
      description: text("description"),
      createdAt: timestamp("created_at").defaultNow()
    });
    posts = mysqlTable("posts", {
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
      updatedAt: timestamp("updated_at").defaultNow()
    });
    comments = mysqlTable("comments", {
      id: varchar("id", { length: 36 }).primaryKey(),
      postId: varchar("post_id", { length: 36 }).references(() => posts.id),
      authorId: varchar("author_id", { length: 36 }).references(() => users.id),
      content: text("content").notNull(),
      parentId: varchar("parent_id", { length: 36 }),
      // for nested comments - will be validated in application logic
      createdAt: timestamp("created_at").defaultNow()
    });
    postTags = mysqlTable("post_tags", {
      id: varchar("id", { length: 36 }).primaryKey(),
      postId: varchar("post_id", { length: 36 }).references(() => posts.id),
      tag: varchar("tag", { length: 100 }).notNull()
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  db: () => db,
  ensureSchemaAndDefaults: () => ensureSchemaAndDefaults
});
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
async function ensureSchemaAndDefaults() {
  try {
    const databaseName = connectionConfig.database;
    const requiredTables = ["users", "categories", "posts", "comments", "post_tags"];
    for (const table of requiredTables) {
      const [rows] = await connection.query(
        "SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = ? AND table_name = ?",
        [databaseName, table]
      );
      const cnt = rows && rows[0] ? rows[0].cnt : rows[0]?.cnt ?? 0;
      if (!cnt) {
        console.log(`Table '${table}' not found in database '${databaseName}'. Creating...`);
        await createTableIfMissing(table);
        console.log(`Created table '${table}'`);
      } else {
        console.log(`Table '${table}' already exists`);
      }
    }
    try {
      const defaultCategories = [
        { name: "Technology", slug: "technology", description: "Latest technology news and trends" },
        { name: "Business", slug: "business", description: "Business insights and strategies" },
        { name: "Design", slug: "design", description: "Design trends and inspiration" },
        { name: "Lifestyle", slug: "lifestyle", description: "Lifestyle tips and wellness" },
        { name: "Marketing", slug: "marketing", description: "Marketing strategies and tips" }
      ];
      for (const c of defaultCategories) {
        const existing = await db.select().from(categories).where(eq(categories.slug, c.slug)).limit(1);
        if (!existing[0]) {
          const id = randomUUID();
          await db.insert(categories).values({ ...c, id, createdAt: /* @__PURE__ */ new Date() });
          console.log("Inserted default category:", c.slug);
        }
      }
      const adminUsername = process.env.TEST_ADMIN_USERNAME || "testcraftworld";
      const authorUsername = process.env.TEST_AUTHOR_USERNAME || "author";
      const adminExists = await db.select().from(users).where(eq(users.username, adminUsername)).limit(1);
      if (!adminExists[0]) {
        const id = randomUUID();
        const hashed = await bcrypt.hash(process.env.TEST_ADMIN_PASSWORD || "admin123", 10);
        await db.insert(users).values({ id, username: adminUsername, password: hashed, email: process.env.TEST_ADMIN_EMAIL || null, role: "admin", createdAt: /* @__PURE__ */ new Date() });
        console.log("Inserted default admin user:", adminUsername);
      }
      const authorExists = await db.select().from(users).where(eq(users.username, authorUsername)).limit(1);
      if (!authorExists[0]) {
        const id = randomUUID();
        const hashed = await bcrypt.hash(process.env.TEST_AUTHOR_PASSWORD || "author123", 10);
        await db.insert(users).values({ id, username: authorUsername, password: hashed, email: process.env.TEST_AUTHOR_EMAIL || null, role: "author", createdAt: /* @__PURE__ */ new Date() });
        console.log("Inserted default author user:", authorUsername);
      }
    } catch (seedErr) {
      console.error("Error seeding default categories/users:", seedErr);
    }
  } catch (err) {
    console.error("ensureSchemaAndDefaults failed:", err);
    throw err;
  }
}
async function createTableIfMissing(table) {
  switch (table) {
    case "users":
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id varchar(36) PRIMARY KEY,
          username varchar(255) NOT NULL UNIQUE,
          password text NOT NULL,
          email varchar(255),
          role varchar(50) DEFAULT 'reader',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `);
      break;
    case "categories":
      await connection.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id varchar(36) PRIMARY KEY,
          name varchar(255) NOT NULL UNIQUE,
          slug varchar(255) NOT NULL UNIQUE,
          description text,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `);
      break;
    case "posts":
      await connection.query(`
        CREATE TABLE IF NOT EXISTS posts (
          id varchar(36) PRIMARY KEY,
          title varchar(500) NOT NULL,
          slug varchar(255) NOT NULL UNIQUE,
          excerpt text,
          content text NOT NULL,
          featured_image varchar(500),
          author_id varchar(36),
          category_id varchar(36),
          published tinyint(1) DEFAULT 0,
          published_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (author_id) REFERENCES users(id),
          FOREIGN KEY (category_id) REFERENCES categories(id)
        ) ENGINE=InnoDB;
      `);
      break;
    case "comments":
      await connection.query(`
        CREATE TABLE IF NOT EXISTS comments (
          id varchar(36) PRIMARY KEY,
          post_id varchar(36),
          author_id varchar(36),
          content text NOT NULL,
          parent_id varchar(36),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (post_id) REFERENCES posts(id),
          FOREIGN KEY (author_id) REFERENCES users(id)
        ) ENGINE=InnoDB;
      `);
      break;
    case "post_tags":
      await connection.query(`
        CREATE TABLE IF NOT EXISTS post_tags (
          id varchar(36) PRIMARY KEY,
          post_id varchar(36),
          tag varchar(100) NOT NULL,
          FOREIGN KEY (post_id) REFERENCES posts(id)
        ) ENGINE=InnoDB;
      `);
      break;
    default:
      console.warn("Unknown table requested for creation:", table);
  }
}
var url, connectionConfig, connection, db;
var init_db = __esm({
  "server/db.ts"() {
    init_schema();
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");
    console.log("DATABASE_SSL_BYPASS:", process.env.DATABASE_SSL_BYPASS || "false");
    url = new URL(process.env.DATABASE_URL);
    console.log("Parsed database connection details:");
    console.log("- Host:", url.hostname);
    console.log("- Port:", url.port);
    console.log("- Database:", url.pathname.slice(1));
    console.log("- Username:", url.username ? "Set" : "Not set");
    connectionConfig = {
      host: url.hostname,
      port: parseInt(url.port),
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      // Remove leading slash
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 6e4
      // 60 seconds
    };
    if (process.env.DATABASE_SSL_BYPASS !== "true") {
      connectionConfig.ssl = {
        rejectUnauthorized: false
      };
      console.log("SSL configured with rejectUnauthorized: false");
    } else {
      console.log("SSL bypassed for database connection");
    }
    connection = mysql.createPool(connectionConfig);
    connection.getConnection().then((conn) => {
      console.log("Database connection successful");
      conn.release();
      (async () => {
        try {
          await ensureSchemaAndDefaults();
        } catch (err) {
          console.error("Error ensuring schema/defaults:", err);
        }
      })();
    }).catch((err) => {
      console.error("Database connection failed:", err.message);
      console.error("Connection config:", {
        host: connectionConfig.host,
        port: connectionConfig.port,
        database: connectionConfig.database,
        user: connectionConfig.user ? "Set" : "Not set",
        ssl: connectionConfig.ssl ? "Configured" : "Not configured"
      });
    });
    db = drizzle(connection, { schema: schema_exports, mode: "default" });
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  DbStorage: () => DbStorage,
  MemStorage: () => MemStorage,
  storage: () => storage,
  useMemoryStorage: () => useMemoryStorage
});
import { eq as eq2, desc, and } from "drizzle-orm";
import { randomUUID as randomUUID2 } from "crypto";
function useMemoryStorage(force = false) {
  if (process.env.NODE_ENV === "production" && !force && process.env.DATABASE_FALLBACK_TO_MEMORY !== "true") {
    console.error("Cannot switch to memory storage in production unless DATABASE_FALLBACK_TO_MEMORY=true or force=true");
    return storage;
  }
  storage = new MemStorage();
  console.warn(`Switched to in-memory storage due to DB errors${process.env.NODE_ENV === "production" ? " (production fallback enabled)" : ""}`);
  return storage;
}
var DbStorage, MemStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    init_db();
    init_schema();
    DbStorage = class {
      // Users
      async getUser(id) {
        const result = await db.select().from(users).where(eq2(users.id, id)).limit(1);
        return result[0];
      }
      async getUserByUsername(username) {
        const result = await db.select().from(users).where(eq2(users.username, username)).limit(1);
        return result[0];
      }
      async createUser(insertUser) {
        const id = randomUUID2();
        const userWithId = { ...insertUser, id };
        await db.insert(users).values(userWithId);
        const result = await db.select().from(users).where(eq2(users.id, id)).limit(1);
        return result[0];
      }
      async deleteUser(id) {
        const result = await db.delete(users).where(eq2(users.id, id));
        return true;
      }
      async deleteAllUsers() {
        await db.delete(users);
        return true;
      }
      async getUsers() {
        return await db.select().from(users).orderBy(desc(users.createdAt));
      }
      // Categories
      async getCategory(id) {
        const result = await db.select().from(categories).where(eq2(categories.id, id)).limit(1);
        return result[0];
      }
      async getCategoryBySlug(slug) {
        const result = await db.select().from(categories).where(eq2(categories.slug, slug)).limit(1);
        return result[0];
      }
      async createCategory(insertCategory) {
        const id = randomUUID2();
        const categoryWithId = { ...insertCategory, id };
        await db.insert(categories).values(categoryWithId);
        const result = await db.select().from(categories).where(eq2(categories.id, id)).limit(1);
        return result[0];
      }
      async getCategories() {
        return await db.select().from(categories).orderBy(categories.name);
      }
      // Posts
      async getPost(id) {
        const result = await db.select().from(posts).where(eq2(posts.id, id)).limit(1);
        return result[0];
      }
      async getPostBySlug(slug) {
        const result = await db.select().from(posts).where(eq2(posts.slug, slug)).limit(1);
        return result[0];
      }
      async getPosts(limit = 10, offset = 0) {
        return await db.select().from(posts).orderBy(desc(posts.createdAt)).limit(limit).offset(offset);
      }
      async getPostsByCategory(categoryId, limit = 10, offset = 0) {
        return await db.select().from(posts).where(eq2(posts.categoryId, categoryId)).orderBy(desc(posts.createdAt)).limit(limit).offset(offset);
      }
      async getPublishedPosts(limit = 10, offset = 0) {
        return await db.select().from(posts).where(eq2(posts.published, true)).orderBy(desc(posts.publishedAt)).limit(limit).offset(offset);
      }
      async createPost(insertPost) {
        const id = randomUUID2();
        const postWithId = {
          ...insertPost,
          id,
          publishedAt: insertPost.published ? /* @__PURE__ */ new Date() : null
        };
        await db.insert(posts).values(postWithId);
        const result = await db.select().from(posts).where(eq2(posts.id, id)).limit(1);
        return result[0];
      }
      async updatePost(id, updateData) {
        const updateFields = {
          ...updateData,
          updatedAt: /* @__PURE__ */ new Date()
        };
        if (updateData.published !== void 0) {
          updateFields.publishedAt = updateData.published ? /* @__PURE__ */ new Date() : null;
        }
        await db.update(posts).set(updateFields).where(eq2(posts.id, id));
        const result = await db.select().from(posts).where(eq2(posts.id, id)).limit(1);
        return result[0];
      }
      async deletePost(id) {
        await db.delete(posts).where(eq2(posts.id, id));
        return true;
      }
      // Comments
      async getCommentsByPost(postId) {
        return await db.select().from(comments).where(eq2(comments.postId, postId)).orderBy(desc(comments.createdAt));
      }
      async createComment(insertComment) {
        const id = randomUUID2();
        const commentWithId = { ...insertComment, id };
        await db.insert(comments).values(commentWithId);
        const result = await db.select().from(comments).where(eq2(comments.id, id)).limit(1);
        return result[0];
      }
      // Tags
      async getTagsByPost(postId) {
        return await db.select().from(postTags).where(eq2(postTags.postId, postId));
      }
      async addTagToPost(insertTag) {
        const id = randomUUID2();
        const tagWithId = { ...insertTag, id };
        await db.insert(postTags).values(tagWithId);
        const result = await db.select().from(postTags).where(eq2(postTags.id, id)).limit(1);
        return result[0];
      }
      async removeTagFromPost(postId, tag) {
        await db.delete(postTags).where(and(eq2(postTags.postId, postId), eq2(postTags.tag, tag)));
        return true;
      }
    };
    MemStorage = class {
      users = /* @__PURE__ */ new Map();
      categories = /* @__PURE__ */ new Map();
      posts = /* @__PURE__ */ new Map();
      comments = /* @__PURE__ */ new Map();
      tags = /* @__PURE__ */ new Map();
      // Users
      async getUser(id) {
        return this.users.get(id);
      }
      async getUserByUsername(username) {
        return Array.from(this.users.values()).find(
          (user) => user.username === username
        );
      }
      async createUser(insertUser) {
        const id = randomUUID2();
        const user = {
          ...insertUser,
          id,
          email: insertUser.email || null,
          role: insertUser.role || "author",
          // Default new users to author role
          createdAt: /* @__PURE__ */ new Date()
        };
        this.users.set(id, user);
        return user;
      }
      async deleteUser(id) {
        return this.users.delete(id);
      }
      async deleteAllUsers() {
        this.users.clear();
        return true;
      }
      async getUsers() {
        return Array.from(this.users.values());
      }
      // Categories
      async getCategory(id) {
        return this.categories.get(id);
      }
      async getCategoryBySlug(slug) {
        return Array.from(this.categories.values()).find(
          (category) => category.slug === slug
        );
      }
      async createCategory(insertCategory) {
        const id = randomUUID2();
        const category = {
          ...insertCategory,
          id,
          description: insertCategory.description || null,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.categories.set(id, category);
        return category;
      }
      async getCategories() {
        return Array.from(this.categories.values());
      }
      // Posts
      async getPost(id) {
        return this.posts.get(id);
      }
      async getPostBySlug(slug) {
        return Array.from(this.posts.values()).find(
          (post) => post.slug === slug
        );
      }
      async getPosts(limit = 10, offset = 0) {
        return Array.from(this.posts.values()).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(offset, offset + limit);
      }
      async getPostsByCategory(categoryId, limit = 10, offset = 0) {
        return Array.from(this.posts.values()).filter((post) => post.categoryId === categoryId).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(offset, offset + limit);
      }
      async getPublishedPosts(limit = 10, offset = 0) {
        return Array.from(this.posts.values()).filter((post) => post.published).sort((a, b) => new Date(b.publishedAt || b.createdAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || 0).getTime()).slice(offset, offset + limit);
      }
      async createPost(insertPost) {
        const id = randomUUID2();
        const post = {
          ...insertPost,
          id,
          excerpt: insertPost.excerpt || null,
          featuredImage: insertPost.featuredImage || null,
          authorId: insertPost.authorId || null,
          categoryId: insertPost.categoryId || null,
          published: insertPost.published ?? false,
          publishedAt: insertPost.published ? /* @__PURE__ */ new Date() : null,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.posts.set(id, post);
        return post;
      }
      async updatePost(id, updateData) {
        const existingPost = this.posts.get(id);
        if (!existingPost) return void 0;
        const updatedPost = {
          ...existingPost,
          ...updateData,
          updatedAt: /* @__PURE__ */ new Date(),
          publishedAt: updateData.published ? /* @__PURE__ */ new Date() : existingPost.publishedAt
        };
        this.posts.set(id, updatedPost);
        return updatedPost;
      }
      async deletePost(id) {
        return this.posts.delete(id);
      }
      // Comments
      async getCommentsByPost(postId) {
        return Array.from(this.comments.values()).filter((comment) => comment.postId === postId).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      }
      async createComment(insertComment) {
        const id = randomUUID2();
        const comment = {
          id,
          content: insertComment.content,
          authorId: insertComment.authorId || null,
          postId: insertComment.postId || null,
          parentId: insertComment.parentId || null,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.comments.set(id, comment);
        return comment;
      }
      // Tags
      async getTagsByPost(postId) {
        return Array.from(this.tags.values()).filter((tag) => tag.postId === postId);
      }
      async addTagToPost(insertTag) {
        const id = randomUUID2();
        const tag = {
          id,
          tag: insertTag.tag,
          postId: insertTag.postId || null
        };
        this.tags.set(id, tag);
        return tag;
      }
      async removeTagFromPost(postId, tag) {
        const tagToDelete = Array.from(this.tags.values()).find(
          (t) => t.postId === postId && t.tag === tag
        );
        if (tagToDelete) {
          return this.tags.delete(tagToDelete.id);
        }
        return false;
      }
    };
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
  }
});

// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
init_storage();
import { createServer } from "http";

// server/createSamplePosts.ts
init_storage();
var samplePosts = [
  {
    title: "The Future of Artificial Intelligence: Trends and Predictions for 2024",
    slug: "future-ai-trends-2024",
    content: `# The Future of Artificial Intelligence: Trends and Predictions for 2024

Artificial Intelligence continues to revolutionize industries across the globe. As we stand on the brink of 2024, several groundbreaking trends are shaping the AI landscape.

## Key Trends Shaping AI in 2024

### 1. Multimodal AI Systems
The integration of multiple data types - text, images, audio, and video - is creating more sophisticated AI systems capable of understanding context in ways previously impossible.

### 2. Edge Computing and AI
With the proliferation of IoT devices, AI processing is moving closer to data sources, enabling real-time decision-making and reducing latency.

### 3. Ethical AI and Responsible Development
Organizations are increasingly focusing on developing AI systems that are transparent, fair, and accountable.

### 4. AI in Healthcare
From drug discovery to personalized medicine, AI is transforming healthcare delivery and patient outcomes.

## Predictions for the Coming Year

The next 12 months will see unprecedented growth in AI adoption across sectors. Companies that embrace AI strategically will gain significant competitive advantages.

*Published by Testcraft World Admin*`,
    excerpt: "Explore the cutting-edge trends and predictions shaping the future of artificial intelligence in 2024 and beyond.",
    published: true,
    categoryId: "technology",
    tags: ["AI", "Machine Learning", "Future Tech", "Innovation"]
  },
  {
    title: "Building a Successful Startup: Essential Strategies for Entrepreneurs",
    slug: "building-successful-startup-strategies",
    content: `# Building a Successful Startup: Essential Strategies for Entrepreneurs

Starting a business is one of the most challenging yet rewarding endeavors. Success requires careful planning, execution, and adaptation.

## Core Principles of Startup Success

### 1. Problem-Solution Fit
Identify real problems that customers are willing to pay to solve. Conduct thorough market research and validate your assumptions.

### 2. Build a Strong Team
Surround yourself with talented individuals who share your vision and complement your skills.

### 3. Financial Management
Maintain a clear understanding of your burn rate, runway, and key financial metrics.

### 4. Customer-Centric Approach
Focus relentlessly on customer needs and feedback to guide product development.

## Scaling Your Business

Once you've achieved product-market fit, focus on scaling operations while maintaining quality and customer satisfaction.

*Published by Testcraft World Admin*`,
    excerpt: "Learn the essential strategies and principles that successful entrepreneurs use to build and scale their startups.",
    published: true,
    categoryId: "business",
    tags: ["Entrepreneurship", "Startup", "Business Strategy", "Growth"]
  },
  {
    title: "Modern Web Design Principles: Creating User-Centric Digital Experiences",
    slug: "modern-web-design-principles",
    content: `# Modern Web Design Principles: Creating User-Centric Digital Experiences

In today's digital landscape, web design goes beyond aesthetics. It's about creating meaningful connections between users and digital products.

## Fundamental Design Principles

### 1. User Experience First
Design with the user journey in mind. Every element should serve a purpose and enhance usability.

### 2. Mobile-First Approach
With mobile traffic surpassing desktop, responsive design is no longer optional - it's essential.

### 3. Accessibility Matters
Inclusive design ensures your website works for everyone, regardless of abilities or assistive technologies.

### 4. Performance Optimization
Fast-loading websites improve user satisfaction and search engine rankings.

## Emerging Trends

Stay ahead of the curve with micro-interactions, dark mode, and AI-powered personalization.

*Published by Testcraft World Admin*`,
    excerpt: "Discover the core principles of modern web design that create exceptional user experiences and drive business results.",
    published: true,
    categoryId: "design",
    tags: ["Web Design", "UX", "UI", "Responsive Design"]
  },
  {
    title: "Achieving Work-Life Balance in the Digital Age",
    slug: "work-life-balance-digital-age",
    content: `# Achieving Work-Life Balance in the Digital Age

The boundary between work and personal life has become increasingly blurred. Here are practical strategies for maintaining balance in our always-connected world.

## Setting Boundaries

### 1. Define Work Hours
Establish clear work hours and stick to them. Use tools to automatically block work communications outside these hours.

### 2. Create Physical Separation
Designate specific spaces for work and relaxation to mentally separate professional and personal activities.

### 3. Digital Detox
Regularly disconnect from devices to recharge and focus on meaningful offline activities.

## Building Healthy Habits

Develop routines that support both productivity and well-being. Regular exercise, quality sleep, and social connections are essential.

*Published by Testcraft World Admin*`,
    excerpt: "Practical strategies for maintaining work-life balance in an increasingly connected digital world.",
    published: true,
    categoryId: "lifestyle",
    tags: ["Work-Life Balance", "Wellness", "Productivity", "Digital Detox"]
  },
  {
    title: "Content Marketing Mastery: Strategies That Drive Results",
    slug: "content-marketing-mastery-strategies",
    content: `# Content Marketing Mastery: Strategies That Drive Results

Effective content marketing builds trust, authority, and long-term customer relationships. Here's how to create content that converts.

## Content Strategy Fundamentals

### 1. Audience Research
Understand your target audience's pain points, preferences, and content consumption habits.

### 2. Content Planning
Create a content calendar that aligns with business goals and audience needs.

### 3. Quality Over Quantity
Focus on creating high-value content that provides genuine solutions and insights.

### 4. Multi-Channel Distribution
Leverage various platforms to maximize reach and engagement.

## Measuring Success

Track relevant metrics like engagement rates, conversion rates, and customer lifetime value to optimize your content strategy.

*Published by Testcraft World Admin*`,
    excerpt: "Master the art of content marketing with proven strategies that build authority and drive measurable business results.",
    published: true,
    categoryId: "marketing",
    tags: ["Content Marketing", "SEO", "Social Media", "Strategy"]
  }
];
async function createSamplePosts() {
  try {
    console.log("Creating sample blog posts...");
    const admin = await storage.getUserByUsername("testcraftworld");
    if (!admin) {
      console.error("Admin user not found. Please ensure the admin user is created first.");
      return;
    }
    const categories2 = await storage.getCategories();
    const categoryMap = {};
    categories2.forEach((cat) => {
      categoryMap[cat.slug] = cat.id;
    });
    for (const postData of samplePosts) {
      const existingPost = await storage.getPostBySlug(postData.slug);
      if (existingPost) {
        console.log(`Post "${postData.title}" already exists, skipping...`);
        continue;
      }
      const categoryId = categoryMap[postData.categoryId];
      if (!categoryId) {
        console.error(`Category "${postData.categoryId}" not found, skipping post "${postData.title}"`);
        continue;
      }
      const post = await storage.createPost({
        title: postData.title,
        slug: postData.slug,
        content: postData.content,
        excerpt: postData.excerpt,
        published: postData.published,
        categoryId,
        authorId: admin.id
      });
      for (const tag of postData.tags) {
        await storage.addTagToPost({
          postId: post.id,
          tag
        });
      }
      console.log(`Created post: ${post.title}`);
    }
    console.log("Sample posts creation completed!");
  } catch (error) {
    console.error("Error creating sample posts:", error);
  }
}

// server/routes.ts
import { randomUUID as randomUUID3 } from "crypto";
import bcrypt2 from "bcryptjs";
var sessions = /* @__PURE__ */ new Map();
function isAuthorizedAdmin(req) {
  if (process.env.NODE_ENV === "development") {
    return true;
  }
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return false;
  if (process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN) return true;
  const session = sessions.get(token);
  if (!session) return false;
  if (session.expires < Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}
async function registerRoutes(app2) {
  if (process.env.DATABASE_URL && process.env.NODE_ENV !== "build") {
    const maxRetries = 3;
    let retryCount = 0;
    while (retryCount < maxRetries) {
      try {
        console.log(`Attempting database initialization (attempt ${retryCount + 1}/${maxRetries})`);
        const adminExists = await storage.getUserByUsername(process.env.TEST_ADMIN_USERNAME || "testcraftworld");
        if (!adminExists) {
          const hashed = await bcrypt2.hash(process.env.TEST_ADMIN_PASSWORD || "admin123", 10);
          await storage.createUser({
            username: process.env.TEST_ADMIN_USERNAME || "testcraftworld",
            password: hashed,
            email: process.env.TEST_ADMIN_EMAIL || "blogs_admin@testcraft.in",
            role: "admin"
          });
          console.log("Fixed admin user created:", process.env.TEST_ADMIN_USERNAME || "testcraftworld");
        }
        const authorExists = await storage.getUserByUsername(process.env.TEST_AUTHOR_USERNAME || "author");
        if (!authorExists) {
          const hashed = await bcrypt2.hash(process.env.TEST_AUTHOR_PASSWORD || "author123", 10);
          await storage.createUser({
            username: process.env.TEST_AUTHOR_USERNAME || "author",
            password: hashed,
            email: process.env.TEST_AUTHOR_EMAIL || "testcraftworld@testcraft.in",
            role: "author"
          });
          console.log("Fixed author user created:", process.env.TEST_AUTHOR_USERNAME || "author");
        } else {
          console.log("Fixed author user already exists:", process.env.TEST_AUTHOR_USERNAME || "author");
        }
        const legacyAdminExists = await storage.getUserByUsername("admin");
        if (!legacyAdminExists) {
          const hashed = await bcrypt2.hash(process.env.ADMIN_TOKEN || "admin", 10);
          await storage.createUser({ username: "admin", password: hashed, email: "admin@testcraft.com", role: "admin" });
          console.log("Legacy admin user created");
        }
        const defaultCategories = [
          { name: "Technology", slug: "technology", description: "Latest technology news and trends" },
          { name: "Business", slug: "business", description: "Business insights and strategies" },
          { name: "Design", slug: "design", description: "Design trends and inspiration" },
          { name: "Lifestyle", slug: "lifestyle", description: "Lifestyle tips and wellness" },
          { name: "Marketing", slug: "marketing", description: "Marketing strategies and tips" }
        ];
        for (const categoryData of defaultCategories) {
          const categoryExists = await storage.getCategoryBySlug(categoryData.slug);
          if (!categoryExists) {
            await storage.createCategory(categoryData);
            console.log("Default category created:", categoryData.name);
          }
        }
        await createSamplePosts();
        console.log("Database initialization completed successfully");
        break;
      } catch (error) {
        retryCount++;
        console.error(`Database initialization attempt ${retryCount} failed:`, error.message || error);
        const errMsg = error?.code || error?.message || "";
        if (errMsg && (errMsg === "ETIMEDOUT" || errMsg === "ENOTFOUND" || errMsg.includes("timeout"))) {
          if (process.env.DATABASE_FALLBACK_TO_MEMORY === "true") {
            console.warn("Database appears unreachable (timeout). Falling back to in-memory storage as DATABASE_FALLBACK_TO_MEMORY=true");
            useMemoryStorage(true);
            break;
          } else {
            console.warn("Database unreachable (timeout). To enable automatic fallback to in-memory storage, set DATABASE_FALLBACK_TO_MEMORY=true");
          }
        }
        if (retryCount < maxRetries) {
          const delay = Math.min(1e3 * Math.pow(2, retryCount), 1e4);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          console.error("Database initialization failed after all retries, but continuing server startup");
          if (process.env.NODE_ENV === "production") {
            console.warn("Database initialization failed, but continuing server startup");
          }
        }
      }
    }
  } else {
    console.log("Skipping database initialization (build time or no DATABASE_URL)");
  }
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.get("/api/db-status", async (req, res) => {
    try {
      const usingMemory = storage instanceof await Promise.resolve().then(() => (init_storage(), storage_exports)).then((m) => m.MemStorage).catch(() => Object);
      let dbReachable = false;
      if (!usingMemory) {
        try {
          await (await Promise.resolve().then(() => (init_db(), db_exports))).db.select().from((await Promise.resolve().then(() => (init_schema(), schema_exports))).users).limit(1);
          dbReachable = true;
        } catch (err) {
          dbReachable = false;
        }
      }
      res.json({ storage: usingMemory ? "memory" : "database", dbReachable });
    } catch (err) {
      res.status(500).json({ error: "failed to determine db status", details: String(err) });
    }
  });
  app2.get("/api/posts", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;
      const posts2 = await storage.getPublishedPosts(limit, offset);
      const postsWithAuthors = await Promise.all(posts2.map(async (post) => {
        if (post.authorId) {
          const author = await storage.getUser(post.authorId);
          return { ...post, authorName: author?.username || "Unknown" };
        }
        return { ...post, authorName: "Anonymous" };
      }));
      res.json(postsWithAuthors);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });
  app2.get("/api/posts/:id", async (req, res) => {
    try {
      const post = await storage.getPost(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      let authorName = "Anonymous";
      if (post.authorId) {
        const author = await storage.getUser(post.authorId);
        authorName = author?.username || "Unknown";
      }
      res.json({ ...post, authorName });
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories2 = await storage.getCategories();
      res.json(categories2);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });
  app2.get("/api/posts/:postId/comments", async (req, res) => {
    try {
      const comments2 = await storage.getCommentsByPost(req.params.postId);
      res.json(comments2);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const { name, email, message } = req.body;
      console.log("Contact form:", { name, email, message });
      res.json({ status: "ok" });
    } catch (error) {
      console.error("Error handling contact form:", error);
      res.status(500).json({ error: "Failed to process contact form" });
    }
  });
  app2.post("/api/admin/create-admin", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token || token !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { username, password, email, reset = false } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "username and password required" });
      }
      if (reset) {
        await storage.deleteAllUsers();
      }
      const hashed = await bcrypt2.hash(password, 10);
      const user = await storage.createUser({ username, password: hashed, email, role: "admin" });
      const oneTimeToken = randomUUID3();
      sessions.set(oneTimeToken, { userId: user.id, expires: Date.now() + 1e3 * 60 * 60 });
      res.json({ user: { id: user.id, username: user.username, email: user.email, role: user.role }, token: oneTimeToken });
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).json({ error: "Failed to create admin" });
    }
  });
  app2.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) return res.status(400).json({ error: "username and password required" });
      const user = await storage.getUserByUsername(username);
      if (!user) return res.status(401).json({ error: "invalid credentials" });
      const match = await bcrypt2.compare(password, user.password || "");
      if (!match) return res.status(401).json({ error: "invalid credentials" });
      const session = randomUUID3();
      sessions.set(session, { userId: user.id, expires: Date.now() + 1e3 * 60 * 60 });
      res.json({ token: session, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  app2.post("/api/admin/logout", (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token && sessions.has(token)) {
      sessions.delete(token);
    }
    res.json({ ok: true });
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, email } = req.body;
      if (!username || !password) return res.status(400).json({ error: "username and password required" });
      const existing = await storage.getUserByUsername(username);
      if (existing) return res.status(409).json({ error: "username already exists" });
      const hashed = await bcrypt2.hash(password, 10);
      const user = await storage.createUser({ username, password: hashed, email, role: "author" });
      const session = randomUUID3();
      sessions.set(session, { userId: user.id, expires: Date.now() + 1e3 * 60 * 60 });
      res.json({ token: session, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) return res.status(400).json({ error: "username and password required" });
      const user = await storage.getUserByUsername(username);
      if (!user) return res.status(401).json({ error: "invalid credentials" });
      const match = await bcrypt2.compare(password, user.password || "");
      if (!match) return res.status(401).json({ error: "invalid credentials" });
      const session = randomUUID3();
      sessions.set(session, { userId: user.id, expires: Date.now() + 1e3 * 60 * 60 });
      res.json({ token: session, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token && sessions.has(token)) {
      sessions.delete(token);
    }
    res.json({ ok: true });
  });
  app2.get("/api/admin/users", async (req, res) => {
    try {
      if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
      const users2 = await storage.getUsers();
      const safe = users2.map((u) => ({ id: u.id, username: u.username, email: u.email, role: u.role, createdAt: u.createdAt }));
      res.json(safe);
    } catch (err) {
      console.error("Error listing users:", err);
      res.status(500).json({ error: "Failed to list users" });
    }
  });
  app2.delete("/api/admin/users/:id", async (req, res) => {
    try {
      if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
      const ok = await storage.deleteUser(req.params.id);
      res.json({ ok });
    } catch (err) {
      console.error("Error deleting user:", err);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });
  app2.get("/api/admin/posts", async (req, res) => {
    try {
      if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
      const posts2 = await storage.getPosts(1e3, 0);
      res.json(posts2);
    } catch (err) {
      console.error("Error listing posts:", err);
      res.status(500).json({ error: "Failed to list posts" });
    }
  });
  app2.delete("/api/admin/posts/:id", async (req, res) => {
    try {
      if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
      const ok = await storage.deletePost(req.params.id);
      res.json({ ok });
    } catch (err) {
      console.error("Error deleting post:", err);
      res.status(500).json({ error: "Failed to delete post" });
    }
  });
  app2.put("/api/admin/posts/:id", async (req, res) => {
    try {
      if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
      const updated = await storage.updatePost(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      console.error("Error updating post:", err);
      res.status(500).json({ error: "Failed to update post" });
    }
  });
  app2.post("/api/admin/create-post", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token || token !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      try {
        const post = await storage.createPost(req.body);
        return res.json(post);
      } catch (err) {
        console.error("DB createPost failed, switching to memory storage and retrying:", err);
        try {
          const mem = useMemoryStorage();
          const post = await mem.createPost(req.body);
          return res.json(post);
        } catch (err2) {
          console.error("Memory fallback also failed:", err2);
          return res.status(500).json({ error: "Failed to create post" });
        }
      }
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ error: "Failed to create post" });
    }
  });
  app2.post("/api/admin/create-category", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token || token !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      try {
        const category = await storage.createCategory(req.body);
        return res.json(category);
      } catch (err) {
        console.error("DB createCategory failed, switching to memory storage and retrying:", err);
        try {
          const mem = useMemoryStorage();
          const category = await mem.createCategory(req.body);
          return res.json(category);
        } catch (err2) {
          console.error("Memory fallback also failed:", err2);
          return res.status(500).json({ error: "Failed to create category" });
        }
      }
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  });
  app2.post("/api/user/create-post", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Unauthorized" });
      const session = sessions.get(token);
      if (!session || session.expires < Date.now()) return res.status(401).json({ error: "Unauthorized" });
      const user = await storage.getUser(session.userId);
      if (!user || user.role !== "admin" && user.role !== "author") return res.status(403).json({ error: "Forbidden" });
      const post = await storage.createPost({ ...req.body, authorId: user.id });
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ error: "Failed to create post" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
var __dirname = dirname(fileURLToPath(import.meta.url));
var vite_config_default = defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
import { fileURLToPath as fileURLToPath2 } from "url";
import { dirname as dirname2 } from "path";
var __dirname2 = dirname2(fileURLToPath2(import.meta.url));
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url2 = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url2, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "..", "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  console.warn("Relaxing TLS certificate validation for development (NODE_TLS_REJECT_UNAUTHORIZED=0)");
} else if (process.env.DATABASE_SSL_BYPASS === "true") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  console.warn("WARNING: Bypassing SSL certificate validation for database connection in production");
}
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");
console.log("PORT:", process.env.PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";
  const serverInstance = server.listen({
    port,
    host
  }, () => {
    log(`serving on port ${port}`);
    console.log(`Server is listening on http://${host}:${port}`);
  }).on("error", (err) => {
    console.error("Server failed to start:", err);
    process.exit(1);
  });
  process.on("SIGINT", () => {
    console.log("Received SIGINT, shutting down gracefully");
    serverInstance.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });
  process.on("SIGTERM", () => {
    console.log("Received SIGTERM, shutting down gracefully");
    serverInstance.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });
})();
