import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { getProfile, updateProfile } from '../store/slices/authSlice';
import { addressService } from '../services/addressService';

const Profile = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    blood_type: '',
    allergies: '',
    medications: '',
    chronic_conditions: '',
  });

  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    address_type: 'home',
    is_default: false,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProfile();
    loadAddresses();
  }, []);

  const loadProfile = async () => {
    try {
      const result = await dispatch(getProfile()).unwrap();
      setProfileData({
        first_name: result.first_name || '',
        last_name: result.last_name || '',
        email: result.email || '',
        phone: result.phone || '',
        date_of_birth: result.date_of_birth || '',
        gender: result.gender || '',
        blood_type: result.blood_type || '',
        allergies: result.medical_info?.allergies || '',
        medications: result.medical_info?.medications || '',
        chronic_conditions: result.medical_info?.chronic_conditions || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadAddresses = async () => {
    try {
      const response = await addressService.getAddresses();
      setAddresses(response.data);
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile(profileData)).unwrap();
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile: ' + error);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await addressService.createAddress(newAddress);
      alert('Address added successfully!');
      setShowAddressForm(false);
      setNewAddress({
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        address_type: 'home',
        is_default: false,
      });
      loadAddresses();
    } catch (error) {
      alert('Failed to add address: ' + error);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h2>My Profile</h2>
          <Link to="/notifications/preferences" className="btn btn-outline">
            Notification Preferences
          </Link>
        </div>

        <div className="profile-section">
          <h3>Personal Information</h3>
          <form onSubmit={handleProfileUpdate}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={profileData.first_name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, first_name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={profileData.last_name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, last_name: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={profileData.email} disabled />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" value={profileData.phone} disabled />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={profileData.date_of_birth}
                  onChange={(e) =>
                    setProfileData({ ...profileData, date_of_birth: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select
                  value={profileData.gender}
                  onChange={(e) =>
                    setProfileData({ ...profileData, gender: e.target.value })
                  }
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Blood Type</label>
                <input
                  type="text"
                  value={profileData.blood_type}
                  onChange={(e) =>
                    setProfileData({ ...profileData, blood_type: e.target.value })
                  }
                  placeholder="e.g., O+"
                />
              </div>
            </div>
            <h4>Medical Information</h4>
            <div className="form-group">
              <label>Allergies</label>
              <textarea
                value={profileData.allergies}
                onChange={(e) =>
                  setProfileData({ ...profileData, allergies: e.target.value })
                }
                placeholder="List any allergies"
              />
            </div>
            <div className="form-group">
              <label>Medications</label>
              <textarea
                value={profileData.medications}
                onChange={(e) =>
                  setProfileData({ ...profileData, medications: e.target.value })
                }
                placeholder="Current medications"
              />
            </div>
            <div className="form-group">
              <label>Chronic Conditions</label>
              <textarea
                value={profileData.chronic_conditions}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    chronic_conditions: e.target.value,
                  })
                }
                placeholder="Any chronic conditions"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Update Profile
            </button>
          </form>
        </div>

        <div className="profile-section">
          <h3>Addresses</h3>
          {addresses.map((address) => (
            <div key={address.id} className="address-card">
              <p>
                <strong>{address.address_type}</strong>
                {address.is_default && <span className="badge">Default</span>}
              </p>
              <p>
                {address.address_line1}
                {address.address_line2 && `, ${address.address_line2}`}
              </p>
              <p>
                {address.city}, {address.state} {address.postal_code}
              </p>
            </div>
          ))}
          <button
            onClick={() => setShowAddressForm(!showAddressForm)}
            className="btn btn-outline"
          >
            {showAddressForm ? 'Cancel' : 'Add New Address'}
          </button>
          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="address-form">
              <div className="form-group">
                <label>Address Type</label>
                <select
                  value={newAddress.address_type}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, address_type: e.target.value })
                  }
                >
                  <option value="home">Home</option>
                  <option value="office">Office</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Address Line 1 *</label>
                <input
                  type="text"
                  value={newAddress.address_line1}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, address_line1: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Address Line 2</label>
                <input
                  type="text"
                  value={newAddress.address_line2}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, address_line2: e.target.value })
                  }
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, city: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={newAddress.state}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, state: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Postal Code</label>
                  <input
                    type="text"
                    value={newAddress.postal_code}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, postal_code: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newAddress.is_default}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, is_default: e.target.checked })
                    }
                  />
                  Set as default address
                </label>
              </div>
              <button type="submit" className="btn btn-primary">
                Add Address
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
