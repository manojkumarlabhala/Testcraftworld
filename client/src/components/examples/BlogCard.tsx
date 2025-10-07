import BlogCard from '../BlogCard';
import techImage from '@assets/generated_images/Technology_blog_featured_image_dd2e4c29.png';
import businessImage from '@assets/generated_images/Business_blog_featured_image_50624b2f.png';

export default function BlogCardExample() {
  return (
    <div className="p-8 space-y-8 max-w-4xl">
      <BlogCard
        id="1"
        title="The Future of AI in Software Development"
        excerpt="Exploring how artificial intelligence is revolutionizing the way we write code and build applications in 2024."
        category="Technology"
        author={{ name: "Sarah Johnson" }}
        publishedAt="Mar 15, 2024"
        readTime="8 min read"
        image={techImage}
        featured={true}
      />
      
      <div className="grid md:grid-cols-2 gap-6">
        <BlogCard
          id="2"
          title="Building Scalable Startups in 2024"
          excerpt="Key strategies and insights for entrepreneurs looking to scale their business effectively."
          category="Business"
          author={{ name: "Michael Chen" }}
          publishedAt="Mar 12, 2024"
          readTime="6 min read"
          image={businessImage}
        />
        <BlogCard
          id="3"
          title="The Rise of Remote Work Culture"
          excerpt="How companies are adapting to the new normal and creating better work-life balance."
          category="Business"
          author={{ name: "Emma Wilson" }}
          publishedAt="Mar 10, 2024"
          readTime="5 min read"
          image={businessImage}
        />
      </div>
    </div>
  );
}
