import React from 'react';
import { Home, Map, User, Heart, Settings, LogOut, Bell, Search, Filter, Star, Plus } from 'lucide-react';

export default function TabDashboardContent() {
  return (
    <div className="w-full h-full bg-[#F7F7FA] flex overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-14 bg-white flex flex-col items-center py-4 border-r border-gray-100">
        <div className="h-8 w-8 rounded-full flex items-center justify-center mb-8">
          <img src="/vite.svg" alt="RescueBite Logo" className="h-7 w-7" />
        </div>
        <nav className="flex-1 flex flex-col gap-6 items-center">
          <Home className="h-5 w-5 text-gray-800" />
          <Map className="h-5 w-5 text-gray-400" />
          <User className="h-5 w-5 text-gray-400" />
          <Heart className="h-5 w-5 text-gray-400" />
          <Settings className="h-5 w-5 text-gray-400" />
        </nav>
        <LogOut className="h-5 w-5 text-gray-400 mt-6" />
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Header */}
        <header className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-medium">Welcome back, k</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
              <img 
                src="https://randomuser.me/api/portraits/men/32.jpg" 
                alt="Profile" 
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </header>
        
        {/* Main Dashboard Area */}
        <div className="p-6 flex-1 overflow-auto">
          {/* Top Row - Food Sharing Balance + Food Exchange Stats */}
          <div className="flex gap-6 mb-6">
            {/* Food Sharing Balance - Reduced height */}
            <div className="bg-black text-white rounded-xl p-5 flex-1">
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm font-medium">Food Sharing Balance</div>
                <button className="bg-white text-black text-sm px-4 py-2 rounded-md flex items-center gap-2 font-medium">
                  <Plus className="h-4 w-4" />
                  Add Food Item
                </button>
              </div>
              <div className="text-2xl font-bold mb-1">14 items</div>
              <div className="text-sm text-gray-300">Items Shared So Far</div>
            </div>
            
            {/* Food Exchange Stats */}
            <div className="bg-white rounded-xl p-5 w-80">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-bold">Food Exchange Stats</div>
                <div className="text-xs text-gray-400">Monthly</div>
              </div>
              
              <div className="flex justify-center mb-4">
                <div className="relative w-20 h-20">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke="#000" 
                      strokeWidth="8" 
                      strokeDasharray="251" 
                      strokeDashoffset="18" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-base font-bold">93%</div>
                    <div className="text-[8px] text-gray-500">Trust Score</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div>
                  <div className="text-base font-bold">1</div>
                  <div className="text-xs text-gray-500">Daily</div>
                </div>
                <div>
                  <div className="text-base font-bold">1</div>
                  <div className="text-xs text-gray-500">Weekly</div>
                </div>
                <div>
                  <div className="text-base font-bold">1</div>
                  <div className="text-xs text-gray-500">Monthly</div>
                </div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
                  <span>Received</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 border border-gray-400 rounded-full mr-2"></span>
                  <span>Sent</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Cards Row - Fixed width issue */}
          <div className="flex gap-4 mb-6">
            {/* Trust Score */}
            <div className="bg-white rounded-xl p-4 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-base">📊</div>
                <div className="text-sm font-medium">Trust Score</div>
              </div>
              <div className="text-xs text-gray-500 mb-3">Your community trust rating is growing daily</div>
              <div className="text-lg font-bold">93%</div>
            </div>
            
            {/* Items Received */}
            <div className="bg-white rounded-xl p-4 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-base">🍽️</div>
                <div className="text-sm font-medium">Items Received</div>
              </div>
              <div className="text-xs text-gray-500 mb-3">Foods you've received from the community</div>
              <div className="text-lg font-bold">4</div>
            </div>
            
            {/* Food Categories */}
            <div className="bg-white rounded-xl p-4 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-base">🍎</div>
                <div className="text-sm font-medium">Food Categories</div>
              </div>
              <div className="text-xs text-gray-500 mb-3">Most common foods you share & receive</div>
              <div className="text-lg font-bold">Vegetables</div>
            </div>
            
            {/* Your Rating */}
            <div className="bg-white rounded-xl p-4 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-base">⭐</div>
                <div className="text-sm font-medium">Your Rating</div>
              </div>
              <div className="text-xs text-gray-500 mb-3">How the community rates your interactions</div>
              <div className="text-lg font-bold">5.0/5</div>
            </div>
          </div>
          
          {/* Bottom Row */}
          <div className="flex gap-6">
            {/* Available Food Nearby */}
            <div className="bg-white rounded-xl p-6 flex-1">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-bold">Available Food Nearby</div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  View All <span>→</span>
                </div>
              </div>
              
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search for food..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                  />
                </div>
                <button className="p-2 rounded-lg border border-gray-200 bg-gray-50">
                  <Filter className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Food Item 1 */}
                <div className="border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                  <img 
                    src="https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?auto=format&fit=crop&w=400&q=80" 
                    alt="Watermelons" 
                    className="w-full h-28 object-cover"
                  />
                  <div className="p-3">
                    <div className="text-sm font-medium mb-1">Watermelons</div>
                    <div className="text-xs text-gray-500 mb-2">Fresh</div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                      <span>MVP</span>
                      <span>•</span>
                      <span>Just now</span>
                      <span>•</span>
                      <span>Meal</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img 
                          src="https://randomuser.me/api/portraits/men/32.jpg" 
                          alt="User" 
                          className="h-5 w-5 rounded-full object-cover"
                        />
                        <span className="text-xs">k dinesh</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs">5.0</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Food Item 2 */}
                <div className="border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                  <img 
                    src="https://images.unsplash.com/photo-1595614006017-33f9e518f63a?auto=format&fit=crop&w=400&q=80" 
                    alt="Strawberry Juice" 
                    className="w-full h-28 object-cover"
                  />
                  <div className="p-3">
                    <div className="text-sm font-medium mb-1">Strawberry Juice</div>
                    <div className="text-xs text-gray-500 mb-2">Home made</div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                      <span>Lawsons Bay Co...</span>
                      <span>•</span>
                      <span>Just now</span>
                      <span>•</span>
                      <span>Meal</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img 
                          src="https://randomuser.me/api/portraits/men/32.jpg" 
                          alt="User" 
                          className="h-5 w-5 rounded-full object-cover"
                        />
                        <span className="text-xs">k dinesh</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs">5.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-4 text-sm text-gray-500 py-2">
                Load more
              </button>
            </div>
            
            {/* Most Frequent Swap Partners */}
            <div className="bg-white rounded-xl p-6 w-72">
              <div className="text-sm font-bold mb-4">Most Frequent Swap Partners</div>
              <div className="flex items-center gap-3">
                <img 
                  src="https://randomuser.me/api/portraits/men/85.jpg" 
                  alt="User" 
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-sm font-medium">vereo man</div>
                  <div className="text-xs text-gray-500">Local user</div>
                </div>
                <div className="ml-auto text-lg font-bold">7</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
