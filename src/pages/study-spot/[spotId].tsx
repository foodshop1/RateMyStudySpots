import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'motion/react';
import { add_review, get_spot_reviews, average_rating } from '@/firebase/firebase';
import studySpotsData from '@/study-spots-data.json';
// import StudySpotCard from '@/components/card'; // eslint-disable-line @typescript-eslint/no-unused-vars

interface StudySpot {
  Building: string;
  'Room Number': string;
  'Seating Spaces': string;
  'Group/Individual': string;
  'Type of space': string;
  spotId: string;
  rating: {
    average: number;
    totalReviews: number;
  };
}

interface RawStudySpot {
  Building: string;
  'Room Number': string;
  'Seating Spaces': string;
  'Group/Individual': string;
  'Type of space': string;
}

interface Review {
  text: string;
  rating: number;
  author: string;
  timestamp: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  tags?: string[];
  amenities?: {
    noiseLevel?: number;
    outletAvailability?: number;
    wifiStrength?: number;
    lighting?: number;
  };
}

export default function StudySpotDetail() {
  const router = useRouter();
  const { spotId } = router.query;
  const [studySpot, setStudySpot] = useState<StudySpot | null>(null);
  const [reviews, setReviews] = useState<{ [key: string]: Review }>({});
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [newReview, setNewReview] = useState({
    text: '',
    rating: 5,
    author: '',
    tags: [] as string[],
    amenities: {
      noiseLevel: 3,
      outletAvailability: 3,
      wifiStrength: 3,
      lighting: 3,
    },
  });
  const [reviewFilter, setReviewFilter] = useState('all'); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [reviewSort, setReviewSort] = useState('newest'); // eslint-disable-line @typescript-eslint/no-unused-vars

  // Find the study spot from the data
  useEffect(() => {
    if (spotId) {
      const spot = studySpotsData.study_spaces.find(
        (s) => `${s.Building}-${s['Room Number']}`.replace(/\s+/g, '-').toLowerCase() === spotId
      );

      if (spot) {
        loadSpotData(spot);
      } else {
        setLoading(false);
      }
    }
  }, [spotId]);

  const loadSpotData = async (spot: RawStudySpot) => {
    try {
      // Get rating data from Firebase
      const ratingData = await average_rating(spot['Room Number']);

      // Get reviews from Firebase
      const spotReviews = await get_spot_reviews(spot['Room Number']);

      setStudySpot({
        ...spot,
        spotId: spot['Room Number'],
        rating: ratingData,
      });
      setReviews(spotReviews);
    } catch (error) {
      console.error('Error loading spot data:', error);
      // Fallback with default data
      setStudySpot({
        ...spot,
        spotId: spot['Room Number'],
        rating: { average: 0, totalReviews: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studySpot || !newReview.text.trim() || !newReview.author.trim()) return;

    try {
      await add_review(
        {
          text: newReview.text,
          rating: newReview.rating,
          author: newReview.author,
        },
        studySpot.spotId
      );

      // Reload data to show new review
      await loadSpotData(studySpot);

      // Reset form
      setNewReview({
        text: '',
        rating: 5,
        author: '',
        tags: [],
        amenities: {
          noiseLevel: 3,
          outletAvailability: 3,
          wifiStrength: 3,
          lighting: 3,
        },
      });
      setShowReviewForm(false);
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

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

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className="text-yellow-400 text-xl">
            ⭐
          </span>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="text-yellow-400 text-xl">
            ⭐
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-300 text-xl">
            ☆
          </span>
        );
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!studySpot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-2">Study Spot Not Found</h1>
          <p className="text-blue-200 mb-4">The study spot you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Study Spots
          </button>
        </div>
      </div>
    );
  }

  // Get similar study spots
  const getSimilarSpots = () => {
    if (!studySpot) return [];
    return studySpotsData.study_spaces
      .filter(
        (spot) =>
          spot['Type of space'] === studySpot['Type of space'] && spot['Room Number'] !== studySpot['Room Number']
      )
      .slice(0, 3);
  };

  // Filter and sort reviews
  const getFilteredReviews = () => {
    let filtered = Object.entries(reviews);

    // Filter by rating
    if (reviewFilter !== 'all') {
      const minRating = parseInt(reviewFilter);
      filtered = filtered.filter(([, review]) => review.rating >= minRating);
    }

    // Sort reviews
    filtered.sort(([, a], [, b]) => {
      switch (reviewSort) {
        case 'newest':
          return (
            (b.timestamp?.toDate?.() || new Date(0)).getTime() - (a.timestamp?.toDate?.() || new Date(0)).getTime()
          );
        case 'oldest':
          return (
            (a.timestamp?.toDate?.() || new Date(0)).getTime() - (b.timestamp?.toDate?.() || new Date(0)).getTime()
          );
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Get rating breakdown for the chart
  const getRatingBreakdown = () => {
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    Object.values(reviews).forEach((review) => {
      const rating = Math.floor(review.rating);
      if (rating >= 1 && rating <= 5) {
        breakdown[rating as keyof typeof breakdown]++;
      }
    });

    return breakdown;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950">
      {/* Hero Section */}
      <div className="relative">
        <div className="aspect-[16/6] w-full overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-blue-800 to-blue-900 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-8xl mb-4">{getSpaceIcon(studySpot['Type of space'])}</div>
              <div className="text-4xl mb-2">Photo Coming Soon</div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-4xl font-bold mb-2">{studySpot.Building}</h1>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              {renderStars(studySpot.rating.average)}
              <span className="ml-1">{studySpot.rating.average > 0 ? studySpot.rating.average.toFixed(1) : 'N/A'}</span>
            </div>
            <span>({studySpot.rating.totalReviews} reviews)</span>
            <div className="flex items-center gap-1">
              <span>📍</span>
              <span>Room {studySpot['Room Number']}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="mb-6 flex items-center gap-2 text-blue-200 hover:text-white transition-colors"
        >
          <span>←</span> Back to Study Spots
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-200">
                    {studySpot.rating.average > 0 ? studySpot.rating.average.toFixed(1) : 'N/A'}
                  </div>
                  <div className="text-sm text-blue-300">Overall Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-200">{studySpot.rating.totalReviews}</div>
                  <div className="text-sm text-blue-300">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-200">{studySpot['Seating Spaces']}</div>
                  <div className="text-sm text-blue-300">Max Capacity</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">87%</div>
                  <div className="text-sm text-blue-300">Availability</div>
                </div>
              </div>
            </motion.div>

            {/* Amenities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-sm flex items-center gap-1">
                  📶 Wi-Fi
                </span>
                <span className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-sm flex items-center gap-1">
                  🔌 Outlets
                </span>
                <span className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-sm flex items-center gap-1">
                  🤫 Quiet
                </span>
                <span className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-sm flex items-center gap-1">
                  ☀️ Natural Light
                </span>
                <span className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-sm flex items-center gap-1">
                  🕐 Late Hours
                </span>
                <span className="px-3 py-1 bg-red-500/20 text-red-200 rounded-full text-sm flex items-center gap-1">
                  👥 Collaborative
                </span>
                <span className="px-3 py-1 bg-red-500/20 text-red-200 rounded-full text-sm flex items-center gap-1">
                  🍕 Food
                </span>
                <span className="px-3 py-1 bg-red-500/20 text-red-200 rounded-full text-sm flex items-center gap-1">
                  📝 Whiteboard
                </span>
              </div>
            </motion.div>

            {/* Description & Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg"
            >
              <h2 className="text-xl font-semibold text-white mb-4">About This Space</h2>
              <p className="text-blue-200 leading-relaxed mb-6">
                A peaceful, dedicated {studySpot['Type of space'].toLowerCase()} space perfect for{' '}
                {studySpot['Group/Individual'].toLowerCase()} work. This room features comfortable seating, ample
                natural light, and is designed to minimize distractions for students who need focused study time.
              </p>

              <div className="border-t border-white/20 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-blue-200">🕐</span>
                  <h3 className="font-semibold text-white">Hours</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-white">Monday - Thursday</span>
                    <span className="text-blue-200">7:00 AM - 11:00 PM</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-white">Friday</span>
                    <span className="text-blue-200">7:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-white">Saturday</span>
                    <span className="text-blue-200">9:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-white">Sunday</span>
                    <span className="text-blue-200">10:00 AM - 11:00 PM</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Reviews Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Reviews</h2>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 bg-white/20 text-white text-sm rounded-lg hover:bg-white/30 transition-colors">
                    🔍 Filter
                  </button>
                  <button className="px-3 py-1 bg-white/20 text-white text-sm rounded-lg hover:bg-white/30 transition-colors">
                    ↕️ Sort
                  </button>
                </div>
              </div>

              {/* Rating Breakdown */}
              <div className="flex items-center gap-6 pb-6 border-b border-white/20">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-200">
                    {studySpot.rating.average > 0 ? studySpot.rating.average.toFixed(1) : 'N/A'}
                  </div>
                  <div className="flex gap-1 justify-center">{renderStars(studySpot.rating.average)}</div>
                  <div className="text-sm text-blue-300">{studySpot.rating.totalReviews} reviews</div>
                </div>
                <div className="flex-1 space-y-2">
                  {(() => {
                    const breakdown = getRatingBreakdown();
                    const totalReviews = Object.values(breakdown).reduce((sum, count) => sum + count, 0);

                    return [5, 4, 3, 2, 1].map((stars) => {
                      const count = breakdown[stars as keyof typeof breakdown];
                      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                      return (
                        <div key={stars} className="flex items-center gap-2">
                          <span className="text-sm w-6 text-white">{stars}</span>
                          <span className="text-yellow-400">⭐</span>
                          <div className="flex-1 bg-white/20 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-blue-300 w-8">{count}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              <div className="space-y-4 mt-6">
                {Object.keys(reviews).length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📝</div>
                    <p className="text-blue-200">No reviews yet. Be the first to review this study spot!</p>
                  </div>
                ) : (
                  getFilteredReviews().map(([reviewId, review]) => (
                    <div key={reviewId} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white">{review.author}</h3>
                          <p className="text-sm text-white/60">
                            {review.timestamp?.toDate ? review.timestamp.toDate().toLocaleDateString() : 'Recently'}
                          </p>
                        </div>
                        <div className="flex gap-1">{renderStars(review.rating)}</div>
                      </div>

                      <p className="text-blue-200 leading-relaxed mb-3">{review.text}</p>

                      {/* Review Tags */}
                      {review.tags && review.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {review.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-200 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}

                <div className="text-center pt-4">
                  <button className="px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors">
                    Load More Reviews
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Review Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Write a Review</h2>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">Your Name</label>
                    <input
                      type="text"
                      value={newReview.author}
                      onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                      className="w-full px-4 py-2 bg-white/30 border border-blue-200/50 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">Overall Rating</label>
                    <select
                      value={newReview.rating}
                      onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-white/30 border border-blue-200/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value={5} className="bg-blue-800">
                        ⭐⭐⭐⭐⭐ (5 stars)
                      </option>
                      <option value={4} className="bg-blue-800">
                        ⭐⭐⭐⭐ (4 stars)
                      </option>
                      <option value={3} className="bg-blue-800">
                        ⭐⭐⭐ (3 stars)
                      </option>
                      <option value={2} className="bg-blue-800">
                        ⭐⭐ (2 stars)
                      </option>
                      <option value={1} className="bg-blue-800">
                        ⭐ (1 star)
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-semibold mb-2">Review</label>
                  <textarea
                    value={newReview.text}
                    onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                    className="w-full px-4 py-2 bg-white/30 border border-blue-200/50 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 h-24 resize-none"
                    placeholder="Share your experience at this study spot..."
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Submit Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg"
            >
              <div className="space-y-4">
                <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                  📍 Get Directions
                </button>
                <button className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                  👥 Check Availability
                </button>
                <button className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                  📊 View Live Updates
                </button>
              </div>
            </motion.div>

            {/* Similar Study Spots */}
            {getSimilarSpots().length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg"
              >
                <h2 className="text-lg font-semibold text-white mb-4">Similar Study Spots</h2>
                <div className="space-y-4">
                  {getSimilarSpots().map((spot, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => {
                        const spotId = `${spot.Building}-${spot['Room Number']}`.replace(/\s+/g, '-').toLowerCase();
                        router.push(`/study-spot/${spotId}`);
                      }}
                    >
                      <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center text-2xl">
                        {getSpaceIcon(spot['Type of space'])}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-white truncate">{spot.Building}</h4>
                        <p className="text-xs text-blue-200">Room {spot['Room Number']}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="flex gap-1">{renderStars(4.3)}</div>
                          <span className="text-xs text-blue-300 ml-1">(189)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
