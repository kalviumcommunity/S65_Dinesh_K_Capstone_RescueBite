import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Shield, Bell, Trash2, Moon, LogOut, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Settings() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [activeSection, setActiveSection] = useState('account');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        swapUpdates: true,
        marketingEmails: false
    });
    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: 'public',
        locationPrecision: 'city',
        showTrustScore: true,
        shareActivity: true
    });
    const [darkMode, setDarkMode] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);

    useEffect(() => {
        const fetchUserSettings = async () => {
            try {
                const headers = {
                    'x-auth-token': localStorage.getItem('token')
                };
                
                const savedDarkMode = localStorage.getItem('darkMode') === 'true';
                setDarkMode(savedDarkMode);
                
                if (savedDarkMode) {
                    document.documentElement.classList.add('dark-mode');
                }
                
            } catch (error) {
                console.error('Error fetching user settings:', error);
            }
        };
        
        fetchUserSettings();
    }, []);

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: 20, transition: { duration: 0.3 } }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'DELETE') {
            toast.error('Please type DELETE to confirm account deletion');
            return;
        }

        try {
            setLoadingDelete(true);
            const headers = {
                'x-auth-token': localStorage.getItem('token')
            };
            
            const response = await axios.delete(
                `${API_BASE_URL}/api/users/account`,
                { headers }
            );
            
            if (response.data.success) {
                toast.success('Your account has been deleted');
                logout();
                navigate('/auth/login');
            } else {
                throw new Error(response.data.message || 'Failed to delete account');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            toast.error(error.response?.data?.message || 'Failed to delete account');
        } finally {
            setLoadingDelete(false);
            setDeleteModalOpen(false);
        }
    };
    
    const handleSaveNotifications = async () => {
        try {
            setLoadingSave(true);
            const headers = {
                'x-auth-token': localStorage.getItem('token')
            };
            
            const response = await axios.put(
                `${API_BASE_URL}/api/users/settings/notifications`,
                notificationSettings,
                { headers }
            );
            
            if (response.data.success) {
                toast.success('Notification settings updated');
            } else {
                throw new Error(response.data.message || 'Failed to update notification settings');
            }
        } catch (error) {
            console.error('Error updating notification settings:', error);
            toast.error('Failed to update notification settings');
        } finally {
            setLoadingSave(false);
        }
    };
    
    const handleSavePrivacy = async () => {
        try {
            setLoadingSave(true);
            const headers = {
                'x-auth-token': localStorage.getItem('token'),
                'Content-Type': 'application/json'
            };
            
            const updatedSettings = {
                ...privacySettings,
                trustScore: {
                    visible: privacySettings.showTrustScore
                }
            };
            
            const response = await axios.put(
                `${API_BASE_URL}/api/users/settings/privacy`,
                updatedSettings,
                { headers }
            );
            
            if (response.data.success) {
                toast.success('Privacy settings updated');
            } else {
                throw new Error(response.data.message || 'Failed to update privacy settings');
            }
        } catch (error) {
            let errorMessage = 'Failed to update privacy settings';
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            toast.error(errorMessage);
        } finally {
            setLoadingSave(false);
        }
    };
    
    const handleToggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        
        localStorage.setItem('darkMode', String(newDarkMode));
        
        if (newDarkMode) {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
        
        toast.success(`${newDarkMode ? 'Dark' : 'Light'} mode enabled`);
    };

    const handleLogout = () => {
        logout();
        navigate('/auth/login');
    };

    return (
        <div className={`${deleteModalOpen ? 'overflow-hidden' : ''}`}>
            <motion.div 
                initial="initial" 
                animate="animate" 
                exit="exit" 
                variants={pageVariants}
                className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${deleteModalOpen ? 'blur-sm' : ''}`}
            >
                <div className="mb-8">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="flex items-center text-gray-600 hover:text-black"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        <span>Back</span>
                    </button>
                    <h1 className="text-3xl font-bold mt-4">Settings</h1>
                    <p className="text-gray-600">Manage your account preferences and settings</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="md:flex">
                        <div className="md:w-1/4 bg-gray-50 p-6 border-r">
                            <nav className="space-y-2">
                                <button 
                                    onClick={() => setActiveSection('account')}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${
                                        activeSection === 'account' 
                                            ? 'bg-black text-white' 
                                            : 'hover:bg-gray-100'
                                    }`}
                                >
                                    <User className="h-5 w-5 mr-3" />
                                    <span>Account</span>
                                </button>
                                <button 
                                    onClick={() => setActiveSection('privacy')}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${
                                        activeSection === 'privacy' 
                                            ? 'bg-black text-white' 
                                            : 'hover:bg-gray-100'
                                    }`}
                                >
                                    <Shield className="h-5 w-5 mr-3" />
                                    <span>Privacy</span>
                                </button>
                                <button 
                                    onClick={() => setActiveSection('notifications')}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${
                                        activeSection === 'notifications' 
                                            ? 'bg-black text-white' 
                                            : 'hover:bg-gray-100'
                                    }`}
                                >
                                    <Bell className="h-5 w-5 mr-3" />
                                    <span>Notifications</span>
                                </button>
                                <div className="pt-4 mt-4 border-t">
                                    <button 
                                        onClick={handleLogout} 
                                        className="w-full text-left px-4 py-3 rounded-lg flex items-center text-red-600 hover:bg-red-50"
                                    >
                                        <LogOut className="h-5 w-5 mr-3" />
                                        <span>Log Out</span>
                                    </button>
                                </div>
                            </nav>
                        </div>

                        <div className="md:w-3/4 p-6">
                            {activeSection === 'account' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
                                    
                                    <div className="border-t pt-6 mt-6">
                                        <h3 className="text-lg font-medium mb-4 text-red-600">Danger Zone</h3>
                                        <p className="text-gray-600 mb-4">
                                            Once you delete your account, there is no going back. Please be certain.
                                        </p>
                                        <button 
                                            onClick={() => setDeleteModalOpen(true)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Account
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                            
                            {/* Privacy Settings */}
                            {activeSection === 'privacy' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-semibold">Privacy Settings</h2>
                                        <button 
                                            onClick={handleSavePrivacy}
                                            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center"
                                            disabled={loadingSave}
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {loadingSave ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-6 max-w-lg">
                                        <div>
                                            <h3 className="text-md font-medium mb-2">Profile Visibility</h3>
                                            <p className="text-sm text-gray-600 mb-3">
                                                Control who can see your profile information
                                            </p>
                                            <select 
                                                value={privacySettings.profileVisibility}
                                                onChange={(e) => setPrivacySettings({
                                                    ...privacySettings, 
                                                    profileVisibility: e.target.value
                                                })}
                                                className="w-full p-2 border rounded-md bg-white"
                                            >
                                                <option value="public">Public (Everyone can see)</option>
                                                <option value="contacts">Contacts Only (Only users you've swapped with)</option>
                                                <option value="private">Private (Hidden from search)</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <h3 className="text-md font-medium mb-2">Location Precision</h3>
                                            <p className="text-sm text-gray-600 mb-3">
                                                Control the precision of your location shown to others
                                            </p>
                                            <select 
                                                value={privacySettings.locationPrecision}
                                                onChange={(e) => setPrivacySettings({
                                                    ...privacySettings, 
                                                    locationPrecision: e.target.value
                                                })}
                                                className="w-full p-2 border rounded-md bg-white"
                                            >
                                                <option value="exact">Exact Location</option>
                                                <option value="neighborhood">Neighborhood Level</option>
                                                <option value="city">City Level Only</option>
                                            </select>
                                        </div>
                                        
                                        <div className="flex items-center justify-between py-2">
                                            <div>
                                                <h3 className="text-md font-medium">Show Trust Score</h3>
                                                <p className="text-sm text-gray-600">
                                                    Let others see your trust score on your profile
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer" 
                                                    checked={privacySettings.showTrustScore}
                                                    onChange={() => setPrivacySettings({
                                                        ...privacySettings,
                                                        showTrustScore: !privacySettings.showTrustScore
                                                    })}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                                            </label>
                                        </div>
                                        
                                        <div className="flex items-center justify-between py-2">
                                            <div>
                                                <h3 className="text-md font-medium">Share Activity</h3>
                                                <p className="text-sm text-gray-600">
                                                    Allow your swap activities to be shared with other users
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer" 
                                                    checked={privacySettings.shareActivity}
                                                    onChange={() => setPrivacySettings({
                                                        ...privacySettings,
                                                        shareActivity: !privacySettings.shareActivity
                                                    })}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                                            </label>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            
                            {/* Notification Settings */}
                            {activeSection === 'notifications' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-semibold">Notification Settings</h2>
                                        <button 
                                            onClick={handleSaveNotifications}
                                            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center"
                                            disabled={loadingSave}
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {loadingSave ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-4 max-w-lg">
                                        <div className="flex items-center justify-between py-2 border-b">
                                            <div>
                                                <h3 className="text-md font-medium">Email Notifications</h3>
                                                <p className="text-sm text-gray-600">
                                                    Receive notifications via email
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer" 
                                                    checked={notificationSettings.emailNotifications}
                                                    onChange={() => setNotificationSettings({
                                                        ...notificationSettings,
                                                        emailNotifications: !notificationSettings.emailNotifications
                                                    })}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                                            </label>
                                        </div>
                                        
                                        <div className="flex items-center justify-between py-2 border-b">
                                            <div>
                                                <h3 className="text-md font-medium">Push Notifications</h3>
                                                <p className="text-sm text-gray-600">
                                                    Receive notifications on your device
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer" 
                                                    checked={notificationSettings.pushNotifications}
                                                    onChange={() => setNotificationSettings({
                                                        ...notificationSettings,
                                                        pushNotifications: !notificationSettings.pushNotifications
                                                    })}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                                            </label>
                                        </div>
                                        
                                        <div className="flex items-center justify-between py-2 border-b">
                                            <div>
                                                <h3 className="text-md font-medium">Swap Updates</h3>
                                                <p className="text-sm text-gray-600">
                                                    Notifications about your food swap requests and status
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer" 
                                                    checked={notificationSettings.swapUpdates}
                                                    onChange={() => setNotificationSettings({
                                                        ...notificationSettings,
                                                        swapUpdates: !notificationSettings.swapUpdates
                                                    })}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                                            </label>
                                        </div>
                                        
                                        <div className="flex items-center justify-between py-2 border-b">
                                            <div>
                                                <h3 className="text-md font-medium">Marketing Emails</h3>
                                                <p className="text-sm text-gray-600">
                                                    Receive updates about new features and promotions
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer" 
                                                    checked={notificationSettings.marketingEmails}
                                                    onChange={() => setNotificationSettings({
                                                        ...notificationSettings,
                                                        marketingEmails: !notificationSettings.marketingEmails
                                                    })}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                                            </label>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
            
            {/* Delete Account Modal */}
            <AnimatePresence>
                {deleteModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-lg p-6 max-w-md w-full m-4 relative shadow-xl border border-gray-200"
                        >
                            <h3 className="text-xl font-bold text-red-600 mb-4">Delete Account</h3>
                            <p className="text-gray-700 mb-4">
                                This action cannot be undone. This will permanently delete your account, all your data, food listings, and swap history.
                            </p>
                            <p className="font-medium mb-4">
                                Please type "DELETE" to confirm:
                            </p>
                            <input 
                                type="text" 
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                className="w-full p-2 border rounded-md mb-4"
                                placeholder="Type DELETE to confirm"
                            />
                            <div className="flex justify-end space-x-3">
                                <button 
                                    onClick={() => setDeleteModalOpen(false)}
                                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleDeleteAccount}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                                    disabled={loadingDelete}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {loadingDelete ? 'Deleting...' : 'Delete My Account'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}




    