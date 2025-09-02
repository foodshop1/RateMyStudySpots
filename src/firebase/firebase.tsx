import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, Timestamp, doc, setDoc, getDoc, query, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface Review {
    text: string;
    rating: number;
    author: string;
    timestamp: Timestamp;
}


// path: collection/{spotID}/reviews/{uniqueReviewId}
const add_review = async (review: Omit<Review, 'timestamp'>, spotId: string) => {
    // Create reference to the reviews sub-collection under the spot
    const reviewsCollectionRef = collection(db, "collection", spotId, "reviews");
    
    const reviewData = {
        text: review.text, 
        rating: review.rating,
        author: review.author,
        timestamp: Timestamp.now()
    };
    
    const newReviewDoc = await addDoc(reviewsCollectionRef, reviewData);
    
    return newReviewDoc;
};

// get a specific user's review for a spot
const get_user_review = async (spotId: string, userId: string) => {
    const userReviewDocRef = doc(db, "collection", spotId, "reviews", userId);
    const userReviewDoc = await getDoc(userReviewDocRef);
    
    if (userReviewDoc.exists()) {
        return userReviewDoc.data() as Review;
    }
    return null;
};

// get all reviews for a specific spot
const get_spot_reviews = async (spotId: string) => {
    const reviewsCollectionRef = collection(db, "collection", spotId, "reviews");
    const reviewsSnapshot = await getDocs(reviewsCollectionRef);
    
    const reviews: { [userId: string]: Review } = {};
    reviewsSnapshot.forEach((doc) => {
        reviews[doc.id] = doc.data() as Review;
    });
    
    return reviews;
};

// Calculate average rating for a spot
const average_rating = async (spotId: string) => {
    const reviews = await get_spot_reviews(spotId);
    
    if (Object.keys(reviews).length === 0) {
        return { average: 0, totalReviews: 0 };
    }
    
    const totalRating = Object.values(reviews).reduce((sum, review) => sum + review.rating, 0);
    const totalReviews = Object.keys(reviews).length;
    const average = totalRating / totalReviews;
    
    return { average, totalReviews };
};

// Delete a user's review for a spot
const delete_user_review = async (spotId: string, userId: string) => {
    const userReviewDocRef = doc(db, "collection", spotId, "reviews", userId);
    // You'll need to import deleteDoc if you want to implement this
    // await deleteDoc(userReviewDocRef);
};

export { 
    add_review, 
    get_user_review, 
    get_spot_reviews, 
    average_rating,
    delete_user_review 
};
