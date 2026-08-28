function ProductCardSkeleton() {
  return (
    <article className="pc pc--skeleton">
      <div className="pc__media">
        <div className="pc__skeleton-img" />
      </div>
      <div className="pc__body">
        <div className="pc__skeleton-line pc__skeleton-line--short" />
        <div className="pc__skeleton-line pc__skeleton-line--tiny" />
        <div className="pc__skeleton-line pc__skeleton-line--medium" />
        <div className="pc__skeleton-line pc__skeleton-line--tiny" />
      </div>
    </article>
  );
}

export default ProductCardSkeleton;
