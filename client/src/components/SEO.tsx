import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export default function SEO({
  title = "Testcraft World - Expert Insights on Technology, Business & Design",
  description = "Discover expert insights on technology, business, design, marketing, and lifestyle. Join our community of professionals sharing cutting-edge knowledge and industry best practices.",
  keywords = "technology, business, design, marketing, lifestyle, blogs, insights, professional content",
  image = "https://testcraftworld.com/og-image.jpg",
  url = "https://testcraftworld.com/",
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = []
}: SEOProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;

      if (element) {
        element.content = content;
      } else {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        element.content = content;
        document.head.appendChild(element);
      }
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', author || 'Testcraft World');

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);
    if (section) updateMetaTag('article:section', section, true);
    if (publishedTime) updateMetaTag('article:published_time', publishedTime, true);
    if (modifiedTime) updateMetaTag('article:modified_time', modifiedTime, true);
    if (author) updateMetaTag('article:author', author, true);

    // Twitter tags
    updateMetaTag('twitter:title', title, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:image', image, true);

    // Article tags
    tags.forEach(tag => {
      updateMetaTag('article:tag', tag, true);
    });

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonicalLink) {
      canonicalLink.href = url;
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.href = url;
      document.head.appendChild(canonicalLink);
    }

    // Structured data for articles
    if (type === 'article' && author && publishedTime) {
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": description,
        "image": image,
        "author": {
          "@type": "Person",
          "name": author
        },
        "publisher": {
          "@type": "Organization",
          "name": "Testcraft World",
          "logo": {
            "@type": "ImageObject",
            "url": "https://testcraftworld.com/logo.png"
          }
        },
        "datePublished": publishedTime,
        "dateModified": modifiedTime || publishedTime,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": url
        },
        "keywords": tags.join(', ')
      };

      let scriptElement = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      if (scriptElement) {
        scriptElement.textContent = JSON.stringify(structuredData);
      } else {
        scriptElement = document.createElement('script');
        scriptElement.type = 'application/ld+json';
        scriptElement.textContent = JSON.stringify(structuredData);
        document.head.appendChild(scriptElement);
      }
    }

  }, [title, description, keywords, image, url, type, publishedTime, modifiedTime, author, section, tags]);

  return null; // This component doesn't render anything
}