import React from "react";

const OrganizationDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Organization Dashboard</h1>
        
        {/* Organization Info Section */}
        <div className="flex items-center space-x-4 border-b pb-4 mb-4">
          <img
            src="https://via.placeholder.com/100"
            alt="Organization Logo"
            className="w-24 h-24 rounded-lg"
          />
          <div>
            <h2 className="text-xl font-semibold">Acme Corporation</h2>
            <p className="text-gray-500">contact@acmecorp.com</p>
          </div>
        </div>
        
        {/* Statistics Section */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-100 p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold">Total Projects</h3>
            <p className="text-xl font-bold">25</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold">Employees</h3>
            <p className="text-xl font-bold">120</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold">Open Tickets</h3>
            <p className="text-xl font-bold">15</p>
          </div>
        </div>
        
        {/* Recent Activity Section */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
          <ul className="list-disc pl-5 text-gray-600">
            <li>Project "New Website Redesign" launched</li>
            <li>New employee "Jane Smith" joined</li>
            <li>Client "XYZ Ltd." submitted feedback</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDashboard;