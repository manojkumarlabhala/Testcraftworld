# Testcraft Blogs - Design Guidelines

## Design Approach

**Selected Approach:** Reference-Based with System Principles  
**Primary References:** Medium (content readability), Ghost (professional aesthetic), Dev.to (community engagement)  
**Supporting System:** Material Design principles for consistent component behavior

**Core Design Principles:**
- Content-first hierarchy with exceptional readability
- Professional, modern aesthetic that builds trust
- Clean, distraction-free reading experience
- Balanced functionality without overwhelming users

## Color Palette

**Light Mode:**
- Primary Brand: 220 70% 50% (Professional blue)
- Background: 0 0% 100% (Pure white)
- Surface: 220 15% 97% (Subtle gray)
- Text Primary: 220 20% 15% (Near black)
- Text Secondary: 220 10% 45% (Medium gray)
- Border: 220 15% 88% (Light gray)
- Accent: 160 60% 45% (Trust-building teal)
- Success: 142 70% 45%
- Warning: 38 90% 50%
- Error: 0 70% 50%

**Dark Mode:**
- Primary Brand: 220 70% 55% (Lighter blue for contrast)
- Background: 220 20% 10% (Deep charcoal)
- Surface: 220 15% 15% (Elevated charcoal)
- Text Primary: 220 15% 95% (Near white)
- Text Secondary: 220 10% 70% (Light gray)
- Border: 220 15% 25% (Dark border)
- Accent: 160 50% 50%

## Typography

**Font Families:**
- Headings: 'Inter', sans-serif (weights: 600, 700, 800)
- Body: 'Inter', sans-serif (weights: 400, 500)
- Code: 'JetBrains Mono', monospace (weight: 400)

**Type Scale:**
- Hero Title: text-5xl md:text-6xl font-bold
- Page Title: text-4xl font-bold
- Section Heading: text-3xl font-bold
- Card Title: text-xl font-semibold
- Body Large: text-lg
- Body: text-base leading-relaxed
- Body Small: text-sm
- Caption: text-xs

**Reading Optimization:**
- Article content: max-w-2xl with leading-8 for optimal readability
- Line height: 1.75 for body text
- Paragraph spacing: mb-6

## Layout System

**Spacing Primitives:** Consistently use Tailwind units of 2, 4, 8, 12, 16, 20 (p-2, p-4, p-8, etc.)

**Grid System:**
- Container: max-w-7xl mx-auto px-4 md:px-8
- Article Container: max-w-4xl mx-auto
- Dashboard: Grid layout with max-w-screen-2xl

**Breakpoints:**
- Mobile: < 768px (single column)
- Tablet: 768px - 1024px (2 columns where appropriate)
- Desktop: > 1024px (3-4 columns for grids)

## Component Library

**Navigation:**
- Sticky header with backdrop-blur-md, border-b, height h-16
- Logo on left, main nav center, user menu right
- Mobile: Hamburger menu with slide-in drawer
- Categories in horizontal scroll on mobile, full nav on desktop

**Blog Cards:**
- Featured card: Large image (aspect-ratio-16/9), overlay gradient with title
- Standard card: Thumbnail left (w-48), content right on desktop; stacked on mobile
- Card includes: category badge, title, excerpt (2 lines), author avatar, date, read time
- Hover: subtle shadow-lg transition, slight scale transform

**Article Layout:**
- Hero: Full-width featured image (h-96), title overlay with gradient backdrop-blur
- Breadcrumbs above title
- Author card: Avatar, name, bio, follow button
- Table of contents: Sticky sidebar on desktop (hidden on mobile)
- Content area: Prose styling with consistent spacing
- Related posts: 3-column grid at bottom

**Comment Section:**
- Nested threading with visual indent (border-l-2)
- Avatar + username + timestamp
- Reply and like actions
- Moderation badges for admin/author

**Admin Dashboard:**
- Sidebar navigation (w-64) with icons + labels
- Main content area with cards for metrics
- Data tables with search, filter, pagination
- Analytics charts with clean, minimalist styling

**Forms:**
- Rich text editor toolbar: Floating above content area
- Image upload: Drag-drop zone with preview
- Input fields: Consistent height h-12, border rounded-lg
- Labels above inputs, helper text below

**SEO Elements:**
- Meta preview card showing how post appears in search/social
- Keyword tags with badge styling
- Character count indicators for titles/descriptions

**Monetization Components:**
- Ad slots: Clearly labeled, subtle border, separate from content
- Newsletter CTA: Prominent card with input + button, background accent color
- Sponsored badge: Small, tasteful indicator on posts

**Authentication:**
- Modal overlay for sign-in/sign-up
- Google sign-in button with official styling
- Role badges: Different colors for Admin (purple), Author (blue), Reader (gray)

## Images

**Hero Section:**
- Full-width hero image (1920x800px) featuring modern blog/content creation theme
- Overlay with gradient (from black/50% to transparent) for text readability
- CTA buttons with backdrop-blur-sm background

**Blog Post Images:**
- Featured images: 1200x630px (Open Graph optimized)
- Thumbnail images: 400x300px for cards
- Author avatars: 48x48px (circular)

**Dashboard:**
- Placeholder illustrations for empty states
- Icon library: Use Heroicons for consistent iconography

## Dark/Light Mode

**Toggle Implementation:**
- Sun/moon icon button in header (top-right)
- Smooth transition-colors duration-200 on all elements
- Persist preference in localStorage
- Default to system preference on first visit

## Animations

**Minimal & Purposeful:**
- Page transitions: Fade-in only (duration-200)
- Card hover: Scale 102% with shadow increase
- Button interactions: Built-in states only
- Loading states: Subtle skeleton screens or spinner
- NO scroll animations, parallax, or complex motion

## Accessibility

**Standards:**
- WCAG AA compliance minimum
- All interactive elements: min-height 44px
- Focus states: ring-2 ring-primary with ring-offset-2
- Alt text required for all images
- Semantic HTML structure
- Keyboard navigation fully supported
- Dark mode maintains 4.5:1 contrast ratios

## Performance Considerations

- Lazy load images below fold
- Optimize hero images with next-gen formats
- Limit icon library to used icons only
- Efficient font loading with display-swap
- Minimize JavaScript for reader pages