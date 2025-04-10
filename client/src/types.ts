export interface DonationListing {
    id: string;
    restaurantName: string;
    location: string;
    foodType: string;
    quantity: string;
    expiryTime: string;
    image: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  }