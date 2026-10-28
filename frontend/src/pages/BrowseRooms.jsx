import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import RoomCard from '../components/RoomCard';
import { Filter, Search, RotateCcw, Calendar, Users, MapPin, SlidersHorizontal } from 'lucide-react';

const BrowseRooms = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [hotelId, setHotelId] = useState(searchParams.get('hotelId') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(searchParams.get('guests') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '50000');
  const [sort, setSort] = useState(searchParams.get('sort') || 'price_asc');
  const [selectedAmenity, setSelectedAmenity] = useState('');

  // Initial load of categories and hotels
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, hotelRes] = await Promise.all([
          api.get('/categories'),
          api.get('/hotels'),
        ]);
        if (catRes.data.success) setCategories(catRes.data.data);
        if (hotelRes.data.success) setHotels(hotelRes.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch rooms whenever filters change
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (city) params.append('city', city);
        if (hotelId) params.append('hotelId', hotelId);
        if (categoryId) params.append('categoryId', categoryId);
        if (checkIn) params.append('checkIn', checkIn);
        if (checkOut) params.append('checkOut', checkOut);
        if (guests) params.append('guests', guests);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (selectedAmenity) params.append('amenity', selectedAmenity);
        if (sort) params.append('sort', sort);

        const res = await api.get(`/rooms?${params.toString()}`);
        if (res.data.success) {
          setRooms(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [city, hotelId, categoryId, checkIn, checkOut, guests, maxPrice, selectedAmenity, sort]);

  const handleResetFilters = () => {
    setCity('');
    setHotelId('');
    setCategoryId('');
    setCheckIn('');
    setCheckOut('');
    setGuests('');
    setMaxPrice('50000');
    setSelectedAmenity('');
    setSort('price_asc');
    setSearchParams({});
  };

  return (
    <div className="py-5" style={{ backgroundColor: '#faf9f6' }}>
      <div className="container">
        {/* Header Banner */}
        <div className="mb-4">
          <span className="badge badge-gold px-3 py-1 mb-2">Accommodations</span>
          <h1 className="font-serif fw-bold display-6">Explore Luxury Rooms & Suites</h1>
          <p className="text-muted m-0">
            Select dates to verify real-time room availability and discover bespoke private sanctuaries.
          </p>
        </div>

        <div className="row g-4">
          {/* Left Sidebar Filter Column */}
          <div className="col-lg-3">
            <div className="card luxury-card p-4 border-0 sticky-top" style={{ top: '90px' }}>
              <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
                <div className="d-flex align-items-center gap-2">
                  <SlidersHorizontal size={18} className="text-warning" />
                  <h6 className="m-0 fw-bold">Refine Stay</h6>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="btn btn-sm btn-link text-decoration-none text-muted p-0 small d-flex align-items-center gap-1"
                >
                  <RotateCcw size={13} /> Reset
                </button>
              </div>

              {/* Destination Filter */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Destination</label>
                <select className="form-select form-select-sm" value={city} onChange={(e) => setCity(e.target.value)}>
                  <option value="">All Destinations</option>
                  <option value="Udaipur">Udaipur</option>
                  <option value="Goa">Goa</option>
                  <option value="Mumbai">Mumbai</option>
                </select>
              </div>

              {/* Check-In & Out */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Check-In</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Check-Out</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={checkOut}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>

              {/* Guests */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Guest Count</label>
                <select className="form-select form-select-sm" value={guests} onChange={(e) => setGuests(e.target.value)}>
                  <option value="">Any Guests</option>
                  <option value="1">1+ Guest</option>
                  <option value="2">2+ Guests</option>
                  <option value="3">3+ Guests</option>
                  <option value="4">4+ Guests</option>
                </select>
              </div>

              {/* Category */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Room Category</label>
                <select
                  className="form-select form-select-sm"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Max Price Slider */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-bold text-muted m-0">Max Nightly Rate</label>
                  <span className="small fw-bold text-dark">₹{Number(maxPrice).toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  className="form-range"
                  min="5000"
                  max="50000"
                  step="2500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>

              {/* Amenities */}
              <div className="mb-2">
                <label className="form-label small fw-bold text-muted">Special Amenity</label>
                <select
                  className="form-select form-select-sm"
                  value={selectedAmenity}
                  onChange={(e) => setSelectedAmenity(e.target.value)}
                >
                  <option value="">Any Amenity</option>
                  <option value="Lake View">Lake View</option>
                  <option value="Direct Ocean View">Direct Ocean View</option>
                  <option value="Private Plunge Pool">Private Plunge Pool</option>
                  <option value="Jacuzzi">Jacuzzi</option>
                  <option value="Personal Butler">Personal Butler</option>
                  <option value="Bathtub">Bathtub</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Rooms Grid Column */}
          <div className="col-lg-9">
            {/* Toolbar */}
            <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 bg-white p-3 rounded border">
              <span className="small text-muted mb-2 mb-sm-0">
                Found <strong className="text-dark">{rooms.length}</strong> available luxury accommodations
              </span>

              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted flex-shrink-0">Sort By:</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: '190px' }}
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="capacity_desc">Highest Capacity</option>
                </select>
              </div>
            </div>

            {/* Room Cards Grid */}
            {loading ? (
              <div className="row g-4">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="col-md-6">
                    <div className="skeleton-box" style={{ height: '360px' }}></div>
                  </div>
                ))}
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-5 bg-white rounded border p-4">
                <div
                  className="rounded-circle bg-light d-inline-flex p-3 mb-3 text-warning"
                  style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Search size={32} />
                </div>
                <h4 className="font-serif fw-bold">No Accommodations Found</h4>
                <p className="text-muted small mx-auto" style={{ maxWidth: '440px' }}>
                  No suites currently match your chosen destination or date filters. Please try modifying your check-in dates
                  or resetting filters.
                </p>
                <button onClick={handleResetFilters} className="btn btn-outline-gold btn-sm mt-2">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {rooms.map((room) => (
                  <div key={room._id} className="col-md-6">
                    <RoomCard room={room} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseRooms;
