import { useState, useEffect } from "react";
import renderStars from "@/util/renderStars";
import { average_rating } from "@/firebase/firebase";

interface SimilarSpotRatingProps {
  roomNumber: string;
}

export default function SimilarSpotRating({ roomNumber }: SimilarSpotRatingProps) {
    // <{ average: number; totalReviews: number }> is the default value for the rating data - is optional
  const [ratingData, setRatingData] = useState<{ average: number; totalReviews: number }>({ average: 0, totalReviews: 0 });


  useEffect(() => {
    const fetchRating = async () => {
      try {
        const data = await average_rating(roomNumber);
        setRatingData(data);
      } catch (error) {
        console.error(`Error loading rating for room ${roomNumber}:`, error);
        setRatingData({ average: 0, totalReviews: 0 });
      }
    };

    fetchRating();
  }, [roomNumber]);

  return (
    <div className="flex items-center gap-1 mt-1">
      <div className="flex gap-1">{renderStars(ratingData.average)}</div>
      <span className="text-xs text-blue-300 ml-1">
        ({ratingData.totalReviews})
      </span>
    </div>
  );
}
