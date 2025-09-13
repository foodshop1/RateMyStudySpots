import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import StudySpotCard from '@/components/card';
import studySpotsData from '@/study-spots-data.json';
import { average_rating } from '@/firebase/firebase';

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

interface HomeProps {
  initialSpots: StudySpot[]; // array of StudySpot objects (array of study spot data)
}

export default function Home({ initialSpots }: HomeProps) {
  // <StudySpot[]> tells studySpots & setStudySpots to be an array of StudySpot objects
  const [studySpots, setStudySpots] = useState<StudySpot[]>(initialSpots);
  const [filteredSpots, setFilteredSpots] = useState<StudySpot[]>(initialSpots);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCapacity, setSelectedCapacity] = useState('all');

  useEffect(() => {
    let filtered = studySpots;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (spot) =>
          spot.Building.toLowerCase().includes(searchTerm.toLowerCase()) ||
          spot['Room Number'].toLowerCase().includes(searchTerm.toLowerCase()) ||
          spot['Type of space'].toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by space type
    if (selectedType !== 'all') {
      filtered = filtered.filter((spot) => spot['Type of space'].toLowerCase() === selectedType.toLowerCase());
    }

    // Filter by capacity
    if (selectedCapacity !== 'all') {
      filtered = filtered.filter((spot) => {
        const capacity = parseInt(spot['Seating Spaces']);
        switch (selectedCapacity) {
          case 'small':
            return capacity <= 20;
          case 'medium':
            return capacity > 20 && capacity <= 40;
          case 'large':
            return capacity > 40;
          default:
            return true;
        }
      });
    }

    setFilteredSpots(filtered);
  }, [searchTerm, selectedType, selectedCapacity, studySpots]);

  const getUniqueSpaceTypes = () => {
    const types = studySpots.map((spot) => spot['Type of space']);
    return ['all', ...Array.from(new Set(types))];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          {/* School Logo */}
          <div className="mb-8">
            <img src="/uoft.png" alt="University of Toronto Logo" className="h-48 mx-auto drop-shadow-lg" />
          </div>

          <h1 className="text-5xl font-bold text-white mb-4">Rate My Study Spots</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Discover and rate the best study spaces on campus. Find your perfect spot for individual study, group
            collaboration, or quiet reading.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-8 border border-blue-200/30 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-white text-sm font-semibold mb-2">Search Study Spots</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by building, room, or space type..."
                className="w-full px-4 py-2 bg-white/30 border border-blue-200/50 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-300"
              />
            </div>

            {/* Space Type Filter */}
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Space Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 bg-white/30 border border-blue-200/50 rounded-lg text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-300"
              >
                {getUniqueSpaceTypes().map((type) => (
                  <option key={type} value={type} className="bg-blue-800 text-white/50">
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>

            {/* Capacity Filter */}
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Capacity</label>
              <select
                value={selectedCapacity}
                onChange={(e) => setSelectedCapacity(e.target.value)}
                className="w-full px-4 py-2 bg-white/30 border border-blue-200/50 rounded-lg text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-300"
              >
                <option value="all" className="bg-blue-800 text-white/50">
                  All Sizes
                </option>
                <option value="small" className="bg-blue-800 text-white/50">
                  Small (≤20 seats)
                </option>
                <option value="medium" className="bg-blue-800 text-white/50">
                  Medium (21-40 seats)
                </option>
                <option value="large" className="bg-blue-800 text-white/50">
                  Large (&gt;40 seats)
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-blue-100 text-lg font-medium">
            Showing {filteredSpots.length} of {studySpots.length} study spots
          </p>
        </div>

        {/* Study Spots Grid */}
        {filteredSpots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSpots.map((spot, index) => (
              <StudySpotCard
                key={`${spot.Building}-${spot['Room Number']}`}
                spot={spot}
                overallRating={spot.rating.average}
                totalReviews={spot.rating.totalReviews}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-white mb-2">No study spots found</h3>
            <p className="text-blue-200">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Fetch all study spots with their ratings from Firebase
    const spotsWithRatings = await Promise.all(
      studySpotsData.study_spaces.map(async (spot) => {
        try {
          const ratingData = await average_rating(spot['Room Number']);
          return {
            ...spot,
            spotId: spot['Room Number'],
            rating: ratingData,
          };
        } catch (error) {
          console.error(`Error loading rating for spot ${spot['Room Number']}:`, error);
          // Return default rating if Firebase call fails
          return {
            ...spot,
            spotId: spot['Room Number'],
            rating: { average: 0, totalReviews: 0 },
          };
        }
      })
    );

    return {
      props: {
        initialSpots: spotsWithRatings,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    // Fallback to spots without ratings
    const fallbackSpots = studySpotsData.study_spaces.map((spot) => ({
      ...spot,
      spotId: spot['Room Number'],
      rating: { average: 0, totalReviews: 0 },
    }));

    return {
      props: {
        initialSpots: fallbackSpots,
      },
    };
  }
};
