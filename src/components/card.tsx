import { motion } from 'motion/react';
import { useState } from 'react';
import { useRouter } from 'next/router';

interface StudySpot {
  Building: string;
  'Room Number': string;
  'Seating Spaces': string;
  'Group/Individual': string;
  'Type of space': string;
}

interface StudySpotCardProps {
  spot: StudySpot;
  overallRating?: number;
  totalReviews?: number;
  onClick?: () => void;
}

const StudySpotCard: React.FC<StudySpotCardProps> = ({ spot, overallRating = 0, totalReviews = 0, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  // Generate a unique ID for the spot (Building + Room Number)
  const spotId = `${spot.Building}-${spot['Room Number']}`.replace(/\s+/g, '-').toLowerCase();

  const getSpaceIcon = (spaceType: string) => {
    switch (spaceType.toLowerCase()) {
      case 'library':
        return '📚';
      case 'quiet study':
        return '🤫';
      case 'collaborative study':
        return '👥';
      case 'study room':
        return '🏠';
      case 'study lab':
        return '🔬';
      case 'common area':
        return '🪑';
      case 'study pods':
        return '📱';
      case 'study hall':
        return '🎓';
      default:
        return '📖';
    }
  };

  //  star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className="text-yellow-400">
            ⭐
          </span>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="text-yellow-400">
            ⭐
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-300">
            ☆
          </span>
        );
      }
    }
    return stars;
  };

  return (
    <motion.div
      className="relative bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 overflow-hidden flex flex-col h-90"
      whileHover={{
        scale: 1.02,
        y: -5,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      layoutId={spotId}
    >
      {/* Header with icon and building name */}
      <motion.div
        className="flex items-center gap-3 mb-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="text-3xl">{getSpaceIcon(spot['Type of space'])}</div>
        <div>
          <h3 className="text-lg font-semibold text-white">{spot.Building}</h3>
          <p className="text-sm text-gray-300">Room {spot['Room Number']}</p>
        </div>
      </motion.div>

      {/* Rating section */}
      <motion.div
        className="mb-4 p-3 bg-white/5 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Overall Rating</span>
          <span className="text-sm text-gray-400">({totalReviews} reviews)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">{renderStars(overallRating)}</div>
          <span className="text-lg font-bold text-white ml-2">
            {overallRating > 0 ? overallRating.toFixed(1) : 'N/A'}
          </span>
        </div>
      </motion.div>

      {/* Details grid */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Capacity</p>
          <p className="text-white font-medium">{spot['Seating Spaces']} seats</p>
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Space Type</p>
          <p className="text-white font-medium">{spot['Type of space']}</p>
        </div>
      </motion.div>

      {/* More Details Button - anchored full-width at bottom */}
      <motion.div
        className="mt-auto -mx-6 -mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <button
          className="w-full px-6 py-3 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-b-xl border-t border-white/20 transition-colors cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/study-spot/${spotId}`);
          }}
        >
          More Details
        </button>
      </motion.div>

      {/* Hover effect overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-xl pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default StudySpotCard;
