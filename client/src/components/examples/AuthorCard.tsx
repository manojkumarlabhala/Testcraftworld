import AuthorCard from '../AuthorCard';

export default function AuthorCardExample() {
  return (
    <div className="p-8 max-w-2xl">
      <AuthorCard
  name="Testcraft author"
        bio="Technology writer and software engineer with 10+ years of experience in web development. Passionate about AI, cloud computing, and modern web technologies."
        articleCount={24}
      />
    </div>
  );
}
