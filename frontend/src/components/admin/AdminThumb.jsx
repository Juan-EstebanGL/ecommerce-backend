export default function AdminThumb({ imageUrl, alt, thumbClassName, placeholderClassName, children }) {
  return (
    <div className={thumbClassName}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.nextSibling.style.display = "flex";
          }}
        />
      ) : null}
      <span
        className={placeholderClassName}
        style={{ display: imageUrl ? "none" : "flex" }}
      >
        {children}
      </span>
    </div>
  );
}
