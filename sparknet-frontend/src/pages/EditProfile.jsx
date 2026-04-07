import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../api/profileApi';
import toast from 'react-hot-toast';

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    location: '',
    interests: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await profileApi.getMyProfile();
        const { profile } = data.data;
        setFormData({
          displayName: profile.displayName || '',
          bio: profile.bio || '',
          location: profile.location || '',
          interests: profile.interests?.join(', ') || '',
        });
        if (profile.avatar) {
          setPreview(`${import.meta.env.VITE_API_URL}${profile.avatar}`);
        }
      } catch (err) {
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    data.append('displayName', formData.displayName);
    data.append('bio', formData.bio);
    data.append('location', formData.location);
    // Convert comma string to array
    const interestsArr = formData.interests.split(',').map(i => i.trim()).filter(i => i);
    interestsArr.forEach(int => data.append('interests', int));
    
    if (avatar) data.append('avatar', avatar);

    try {
      await profileApi.updateProfile(data);
      toast.success('Profile updated successfully!');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-spark-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 page-enter pb-10">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-dark-800 text-gray-400 hover:text-white transition-colors">
          <span className="text-xl">←</span>
        </button>
        <div>
          <h1 className="font-display font-800 text-3xl text-white">Edit Profile</h1>
          <p className="text-gray-500 mt-1">Customize your presence on Spark</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload */}
        <div className="spark-card p-8 flex flex-col items-center">
          <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-input').click()}>
            <div className="w-32 h-32 rounded-3xl bg-dark-700 flex items-center justify-center overflow-hidden border-2 border-dark-600 transition-all group-hover:border-spark-500">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl">👤</span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-2xl">
                📷
              </div>
            </div>
            <input 
              id="avatar-input" 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden" 
            />
          </div>
          <p className="text-xs text-gray-500 mt-4 uppercase tracking-widest font-mono">Change Avatar</p>
        </div>

        {/* Basic Info */}
        <div className="spark-card p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-mono text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <span>👤</span> Display Name
            </label>
            <input 
              type="text" 
              name="displayName" 
              value={formData.displayName} 
              onChange={handleChange} 
              placeholder="What should we call you?"
              className="spark-input w-full bg-dark-800 border-dark-700 text-white focus:border-spark-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <span>📝</span> Bio
            </label>
            <textarea 
              name="bio" 
              value={formData.bio} 
              onChange={handleChange} 
              rows="3"
              placeholder="Tell the community something about yourself..."
              className="spark-input w-full bg-dark-800 border-dark-700 text-white focus:border-spark-500 py-3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-mono text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <span>📍</span> Location
              </label>
              <input 
                type="text" 
                name="location" 
                value={formData.location} 
                onChange={handleChange} 
                placeholder="Where are you based?"
                className="spark-input w-full bg-dark-800 border-dark-700 text-white focus:border-spark-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <span>🎯</span> Interests
              </label>
              <input 
                type="text" 
                name="interests" 
                value={formData.interests} 
                onChange={handleChange} 
                placeholder="Gaming, Coding, Sports..."
                className="spark-input w-full bg-dark-800 border-dark-700 text-white focus:border-spark-500"
              />
              <p className="text-[10px] text-gray-600 font-mono italic">Separate with commas</p>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className={`spark-btn-primary w-full py-4 rounded-2xl font-display font-800 text-lg flex items-center justify-center gap-3 transition-all ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-spark-500/20'}`}
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span>✅</span>
              Save Profile Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;