### Deployment Link : https://client-three-alpha.vercel.app/


# Rescue Bite

Rescue Bite is a platform that connects individuals and organizations to share or sell leftover food. It reduces food waste by allowing users to list surplus food items for free or at discounted prices, while offering features like trust scores, swap history, chat functionality, and anonymous donations.

---

## Features

- **User Roles:**
  - **Individual Users:** List food items, send/accept requests, view swap history, and manage their trust score.
  - **Organizations:** Restaurants or businesses can list surplus food for free or at a discounted price.

- **Food Listing & Requests:**
  - Add food items with details such as name, quantity, optional price, and description.
  - Other users can request these items; uploaders can accept or decline requests.

- **Trust Score System:**
  - Calculated based on completed swaps and received ratings.
  - Displayed prominently on the user profile.

- **Swap History:**
  - Track completed, rejected, and pending swaps along with timestamps.

- **Chat Functionality:**
  - Coordinate pickup details once a request is accepted.

- **Secret Donor Section:**
  - Make anonymous monetary donations to support food-sharing initiatives.

- **Authentication:**
  - Secure login/signup using JWT-based authentication with optional Google OAuth.

---

## Tech Stack

### Frontend
- **React.js**
- **TailwindCSS** for responsive design

### Backend
- **Node.js with Express.js**
- **MongoDB with Mongoose** for data storage

### Payments & Authentication
- **Razorpay** for handling anonymous donations
- **Google OAuth** for seamless authentication

---

## How It Works

1. **User Registration & Authentication:**
   - Users sign up manually or via Google OAuth.
   - Individuals can add food items or browse listings.
   - Organizations list surplus food items directly.

2. **Food Listing & Requests:**
   - Users add food items with necessary details.
   - Others browse listings on the dashboard and send requests to claim or purchase items.

3. **Trust Score & Swap History:**
   - Trust scores are calculated based on completed swaps and ratings.
   - Swap history records all interactions (completed, rejected, pending).

4. **Chat Functionality:**
   - Facilitates coordination for pickup details after request acceptance.

5. **Secret Donor Section:**
   - Enables anonymous monetary donations via Razorpay to support the platform.

---

## Project Plan

### Week 1: Project Setup & Planning (5 days)
- Finalize project idea and name ("Rescue Bite").
- Create low-fidelity design (wireframes for both individual and organization flows).
- Develop high-fidelity designs (UI mockups for the dashboard, profile page, etc.).
- Set up GitHub repository (including README, issues, project board).
- Plan the database schema (users, food listings, swaps, ratings) and their relationships.

### Week 2: Backend Development (7 days)
- Set up the backend server and folder structure using Node.js/Express.js.
- Implement the database schema (e.g., MongoDB) and test CRUD operations.
- Create API routes for core functionalities (e.g., GET food items, POST new listing).
- Add basic username/password authentication.
- Implement JWT-based authentication for secure API access.

### Week 3: Frontend Development (7 days)
- Initialize the React app and set up the folder structure.
- Build core components: Dashboard (food listings), Profile (trust score and swap history), and Food Listing Form.
- Implement chat functionality for coordinating pickups after request acceptance.
- Connect frontend components to the backend APIs.
- Style components using TailwindCSS to match high-fidelity designs.

### Week 4: Feature Enhancements & Testing (7 days)
- Add update and delete functionalities for food listings.
- Integrate third-party authentication (Google login).
- Develop the secret donor section for anonymous donations.
- Implement the trust score calculation based on completed swaps and ratings.
- Thoroughly test all user flows for individuals and organizations.

### Week 5: Deployment & Finalization (4 days)
- Create a Dockerfile to containerize the application.
- Deploy the backend (e.g., Vercel) and frontend (e.g., Vercel).
- Test the production deployment and resolve any issues.
- Produce a demo video showcasing all app features and document the project in detail.

### Buffer Days (5 days)
- Address unexpected bugs or delays in development/testing.

---

## Future Enhancements

- **Advanced Analytics:** Provide insights into swap trends and donation statistics.
- **Community Features:** Enable users to share stories and tips on reducing food waste.
- **Mobile App Version:** Develop a mobile-friendly version of Rescue Bite.
- **Gamification Elements:** Introduce badges and rewards for active contributors.

---

## Contributors

- **Dinesh** - Lead Developer & Architect

Contributions are welcome! Feel free to submit pull requests.

---

## Contact

For queries or collaboration opportunities, please reach out via [GitHub Issues](https://github.com) or email at [Your Email Address].

Happy Sharing with Rescue Bite! 🚀