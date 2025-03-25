import React from "react";

const IndividualDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Individual Dashboard</h1>
        
        {/* User Profile Section */}
        <div className="flex items-center space-x-4 border-b pb-4 mb-4">
          <img
            src="https://via.placeholder.com/80"
            alt="User Avatar"
            className="w-20 h-20 rounded-full"
          />
          <div>
            <h2 className="text-xl font-semibold">John Doe</h2>
            <p className="text-gray-500">johndoe@example.com</p>
          </div>
        </div>
        
        {/* Statistics Section */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-100 p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold">Projects</h3>
            <p className="text-xl font-bold">12</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold">Tasks</h3>
            <p className="text-xl font-bold">34</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold">Messages</h3>
            <p className="text-xl font-bold">7</p>
          </div>
        </div>
        
        {/* Recent Activity Section */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
          <ul className="list-disc pl-5 text-gray-600">
            <li>Completed task "Fix login issue"</li>
            <li>Joined new project "E-commerce Redesign"</li>
            <li>Received message from Sarah</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IndividualDashboard;
