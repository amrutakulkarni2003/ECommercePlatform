export default function Loader() {
  return (
    <div className="loader-page" role="status" aria-live="polite">
      <span className="loader-ring" />
      <span>Gathering the good stuff...</span>
    </div>
  );
}
