const Star = ({ fill = 1 }: { fill: number }) => {
  return (
    <span
      style={{
        display: "inline-block",
        position: "relative",
        width: 20,
        height: 20,
      }}
    >
      <svg
        width={20}
        height={20}
        viewBox="0 0 20 20"
        fill="none"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <path
          d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.564-.955L10 0l2.948 5.955 6.564.955-4.756 4.635 1.122 6.545z"
          fill="#d1d5db" // Tailwind gray-300
        />
      </svg>
      <svg
        width={20}
        height={20}
        viewBox="0 0 20 20"
        fill="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          clipPath: `inset(0 ${100 - fill * 100}% 0 0)`,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <path
          d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.564-.955L10 0l2.948 5.955 6.564.955-4.756 4.635 1.122 6.545z"
          fill="#facc15" // Tailwind yellow-400
        />
      </svg>
    </span>
  );
};
const renderStars = (rating: number) => {
  const stars = [];

  for (let i = 0; i < 5; i++) {
    const starFill = Math.max(0, rating - i);
    stars.push(<Star key={i} fill={starFill} />);
  }
  return stars;
};

export default renderStars;
