export function PlaceholderGrid({ className = '' }) {
  return (
    <div className={`story-box-grid ${className}`} aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <div className="story-empty-box" key={index} />
      ))}
    </div>
  );
}
