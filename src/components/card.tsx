import { motion } from "motion/react";
import { useState } from "react";
import { useRouter } from "next/router";
import renderStars from "@/util/renderStars";

interface StudySpot {
  Building: string;
  "Room Number": string;
  "Seating Spaces": string;
  "Group/Individual": string;
  "Type of space": string;
}

interface StudySpotCardProps {
  spot: StudySpot;
  overallRating?: number;
  totalReviews?: number;
}

const StudySpotCard: React.FC<StudySpotCardProps> = ({
  spot,
  overallRating = 0,
  totalReviews = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  // Generate a unique ID for the spot (Building + Room Number)
  const spotId = `${spot.Building}-${spot["Room Number"]}`
    .replace(/\s+/g, "-")
    .toLowerCase();

  const getSpaceIcon = (spaceType: string) => {
    switch (spaceType.toLowerCase()) {
      case "library":
        return "📚";
      case "quiet study":
        return "🤫";
      case "collaborative study":
        return "👥";
      case "study room":
        return "🏠";
      case "study lab":
        return "🔬";
      case "common area":
        return "🪑";
      case "study pods":
        return "📱";
      case "study hall":
        return "🎓";
      default:
        return "📖";
    }
  };

  return (

    <motion.div
      className="relative bg-white backdrop-blur-sm rounded-xl p-6 border border-white/20 overflow-hidden flex flex-col h-80 cursor-pointer"
      whileHover={{
        scale: 1.02,
        y: -5,
        transition: { duration: 0.2 },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileTap={{ scale: 0.98 }}
      layoutId={spotId}
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/study-spot/${spotId}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(`/study-spot/${spotId}`);
        }
      }}
    >
      {/* Header with icon and building name */}
      <motion.div
        className="flex items-center gap-3 mb-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="text-3xl">{getSpaceIcon(spot["Type of space"])}</div>
        <div>
          <h3 className="text-lg font-semibold text-black">{spot.Building}</h3>
          <p className="text-sm text-gray-400">Room {spot["Room Number"]}</p>
        </div>
      </motion.div>
      <div className="border-t border-gray-200"></div>

      

      {/* Rating section */}
      <motion.div
        className="mb-4 p-3 bg-white/5 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Overall Rating</span>
          <span className="text-sm text-gray-400">
            ({totalReviews} reviews)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">{renderStars(overallRating)}</div>
          <span className="text-lg font-bold text-black ml-2">
            {overallRating > 0 ? overallRating.toFixed(1) : "N/A"}
          </span>
        </div>
      </motion.div>
      <div className="border-t border-gray-200"></div>


      {/* Details grid */}
      <motion.div
        className="flex items-stretch divide-x divide-gray-200" // 👈 auto adds vertical line
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex-1 bg-white/5 p-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Capacity</p>
          <p className="text-black font-medium">{spot["Seating Spaces"]} seats</p>
        </div>

        <div className="flex-1 bg-white/5 p-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Space Type</p>
          <p className="text-black font-medium">{spot["Type of space"]}</p>
        </div>
      </motion.div>

      {/* Hover effect overlay with blur and button */}
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-xl pointer-events-none flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg pointer-events-auto cursor-pointer"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: isHovered ? 1 : 0.8, 
            opacity: isHovered ? 1 : 0 
          }}
          transition={{ duration: 0.2, delay: 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/study-spot/${spotId}`);
          }}
        >
          Click for more info
        </motion.button>
      </motion.div>
      
    </motion.div>
    
  );
};

export default StudySpotCard;
