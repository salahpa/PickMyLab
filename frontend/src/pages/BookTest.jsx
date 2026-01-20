import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { testService } from '../services/testService';
import { addressService } from '../services/addressService';
import { createBooking } from '../store/slices/bookingSlice';

const BookTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.bookings);

  const [test, setTest] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedLab, setSelectedLab] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [collectionType, setCollectionType] = useState('home');
  const [preferredDate, setPreferredDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [error, setError] = useState('');

  const timeSlots = [
    '08:00-10:00',
    '10:00-12:00',
    '12:00-14:00',
    '14:00-16:00',
    '16:00-18:00',
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadTest();
    loadAddresses();
  }, [id, user]);

  const loadTest = async () => {
    try {
      const response = await testService.getTestById(id);
      setTest(response.data);
      if (response.data.pricing && response.data.pricing.length > 0) {
        setSelectedLab(response.data.pricing[0].lab_partner_id);
      }
    } catch (error) {
      console.error('Error loading test:', error);
      setError('Failed to load test details');
    }
  };

  const loadAddresses = async () => {
    try {
      const response = await addressService.getAddresses();
      setAddresses(response.data);
      const defaultAddress = response.data.find((a) => a.is_default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id);
      } else if (response.data.length > 0) {
        setSelectedAddress(response.data[0].id);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedLab) {
      setError('Please select a lab partner');
      return;
    }

    if (collectionType === 'home' && !selectedAddress) {
      setError('Please select a collection address');
      return;
    }

    if (!preferredDate) {
      setError('Please select a preferred date');
      return;
    }

    if (!timeSlot) {
      setError('Please select a time slot');
      return;
    }

    try {
      const bookingData = {
        tests: [{ test_id: id }],
        lab_partner_id: selectedLab,
        collection_type: collectionType,
        collection_address_id: collectionType === 'home' ? selectedAddress : null,
        preferred_date: preferredDate,
        preferred_time_slot: timeSlot,
        special_requirements: specialRequirements || null,
      };

      const result = await dispatch(createBooking(bookingData)).unwrap();

      if (result) {
        navigate(`/bookings/${result.id}/confirm`);
      }
    } catch (err) {
      setError(err || 'Failed to create booking');
    }
  };

  if (!test) {
    return (
      <div className="container">
        <div className="loading">Loading test details...</div>
      </div>
    );
  }

  const selectedLabPricing = test.pricing?.find(
    (p) => p.lab_partner_id === selectedLab
  );

  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="book-test-page">
      <div className="container">
        <h1>Book Test: {test.name}</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="booking-sections">
            {/* Lab Selection */}
            <section className="booking-section">
              <h2>Select Lab Partner</h2>
              <div className="lab-selection">
                {test.pricing?.map((price) => (
                  <div
                    key={price.lab_partner_id}
                    className={`lab-option ${
                      selectedLab === price.lab_partner_id ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedLab(price.lab_partner_id)}
                  >
                    <div className="lab-option-header">
                      <h3>{price.lab_partner_name}</h3>
                      <span className="lab-price">
                        AED {parseFloat(price.price).toFixed(2)}
                      </span>
                    </div>
                    <div className="lab-option-details">
                      {price.rating && (
                        <p>
                          ⭐ {price.rating} ({price.total_reviews} reviews)
                        </p>
                      )}
                      {price.turnaround_time_hours && (
                        <p>Turnaround: {price.turnaround_time_hours} hours</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Collection Type */}
            <section className="booking-section">
              <h2>Collection Type</h2>
              <div className="collection-type-selection">
                <label className="collection-option">
                  <input
                    type="radio"
                    value="home"
                    checked={collectionType === 'home'}
                    onChange={(e) => setCollectionType(e.target.value)}
                  />
                  <div>
                    <h3>Home Collection</h3>
                    <p>Our phlebotomist will visit you</p>
                  </div>
                </label>
                <label className="collection-option">
                  <input
                    type="radio"
                    value="walk_in"
                    checked={collectionType === 'walk_in'}
                    onChange={(e) => setCollectionType(e.target.value)}
                  />
                  <div>
                    <h3>Walk-in</h3>
                    <p>Visit the lab directly</p>
                  </div>
                </label>
              </div>
            </section>

            {/* Address Selection (for home collection) */}
            {collectionType === 'home' && (
              <section className="booking-section">
                <h2>Collection Address</h2>
                {addresses.length === 0 ? (
                  <div className="no-addresses">
                    <p>No addresses found. Please add an address first.</p>
                    <a href="/profile" className="btn btn-primary">
                      Add Address
                    </a>
                  </div>
                ) : (
                  <div className="address-selection">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`address-option ${
                          selectedAddress === address.id ? 'selected' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={selectedAddress === address.id}
                          onChange={(e) => setSelectedAddress(e.target.value)}
                        />
                        <div>
                          <h4>
                            {address.address_type}
                            {address.is_default && <span className="badge">Default</span>}
                          </h4>
                          <p>
                            {address.address_line1}
                            {address.address_line2 && `, ${address.address_line2}`}
                          </p>
                          <p>
                            {address.city}, {address.state} {address.postal_code}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Date and Time */}
            <section className="booking-section">
              <h2>Preferred Date & Time</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    min={minDate}
                    max={maxDateStr}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time Slot *</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    required
                  >
                    <option value="">Select time slot</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Special Requirements */}
            <section className="booking-section">
              <h2>Special Requirements (Optional)</h2>
              <div className="form-group">
                <textarea
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  placeholder="e.g., Difficult vein, fasting instructions, etc."
                  rows={3}
                />
              </div>
            </section>
          </div>

          {/* Summary */}
          {selectedLabPricing && (
            <div className="booking-summary">
              <h2>Booking Summary</h2>
              <div className="summary-item">
                <span>Test:</span>
                <span>{test.name}</span>
              </div>
              <div className="summary-item">
                <span>Lab Partner:</span>
                <span>{selectedLabPricing.lab_partner_name}</span>
              </div>
              <div className="summary-item">
                <span>Collection:</span>
                <span>{collectionType === 'home' ? 'Home Collection' : 'Walk-in'}</span>
              </div>
              <div className="summary-item">
                <span>Date:</span>
                <span>{preferredDate || 'Not selected'}</span>
              </div>
              <div className="summary-item">
                <span>Time:</span>
                <span>{timeSlot || 'Not selected'}</span>
              </div>
              <div className="summary-total">
                <span>Total Amount:</span>
                <span className="total-price">
                  AED {parseFloat(selectedLabPricing.price).toFixed(2)}
                </span>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-large"
                disabled={loading}
              >
                {loading ? 'Creating Booking...' : 'Confirm Booking'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default BookTest;
