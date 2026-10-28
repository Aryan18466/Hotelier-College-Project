import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import RoomCard from '../components/RoomCard';
import {
  Search,
  Calendar,
  Users,
  MapPin,
  ShieldCheck,
  Award,
  Sparkles,
  Coffee,
  CheckCircle2,
  ArrowRight,
  Star,
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search Bar State
  const [city, setCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hotelsRes, roomsRes, categoriesRes] = await Promise.all([
          api.get('/hotels'),
          api.get('/rooms?limit=4'),
          api.get('/categories'),
        ]);

        if (hotelsRes.data.success) setHotels(hotelsRes.data.data);
        if (roomsRes.data.success) setFeaturedRooms(roomsRes.data.data);
        if (categoriesRes.data.success) setCategories(categoriesRes.data.data);
      } catch (err) {
        console.error('Error loading homepage data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (checkIn) params.append('checkIn', checkIn);
    if (checkOut) params.append('checkOut', checkOut);
    if (guests) params.append('guests', guests);

    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <div>
      {/* 1. Hero Section */}
      <section
        className="hero-wrapper"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80")',
        }}
      >
        <div className="hero-overlay"></div>
        <div className="container hero-content py-5">
          <div className="row justify-content-center text-center">
            <div className="col-lg-10">
              <span
                className="badge badge-gold px-3 py-2 mb-3 text-uppercase"
                style={{ letterSpacing: '2px', fontSize: '0.75rem' }}
              >
                Welcome to Hotelier Hospitality
              </span>
              <h1 className="display-3 fw-bold text-white mb-3 font-serif">
                Experience Luxury. <br />
                <span style={{ color: '#c5a880' }}>Stay Exceptional.</span>
              </h1>
              <p className="lead text-light opacity-90 mx-auto mb-4" style={{ maxWidth: '680px' }}>
                Immerse yourself in world-class palatial suites, tranquil beachfront villas, and bespoke concierge
                services tailored to the most discerning traveler.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Link to="/rooms" className="btn btn-gold px-4 py-2">
                  Browse All Suites
                </Link>
                <Link to="/services" className="btn btn-outline-light px-4 py-2">
                  Discover Experiences
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Floating Search Form */}
      <div className="container">
        <div className="search-floating-card">
          <form onSubmit={handleSearch}>
            <div className="row g-3 align-items-center">
              {/* Destination */}
              <div className="col-lg-3 col-md-6">
                <label className="form-label small fw-bold text-muted mb-1 d-flex align-items-center gap-1">
                  <MapPin size={14} className="text-warning" /> Destination / Hotel
                </label>
                <select className="form-select" value={city} onChange={(e) => setCity(e.target.value)}>
                  <option value="">All Destinations</option>
                  <option value="Udaipur">Udaipur – Grand Palace</option>
                  <option value="Goa">Goa – Oceanview Resort</option>
                  <option value="Mumbai">Mumbai – Royal Pavilion</option>
                </select>
              </div>

              {/* Check-In */}
              <div className="col-lg-2 col-md-6">
                <label className="form-label small fw-bold text-muted mb-1 d-flex align-items-center gap-1">
                  <Calendar size={14} className="text-warning" /> Check-in Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>

              {/* Check-Out */}
              <div className="col-lg-2 col-md-6">
                <label className="form-label small fw-bold text-muted mb-1 d-flex align-items-center gap-1">
                  <Calendar size={14} className="text-warning" /> Check-out Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={checkOut}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>

              {/* Guests */}
              <div className="col-lg-2 col-md-6">
                <label className="form-label small fw-bold text-muted mb-1 d-flex align-items-center gap-1">
                  <Users size={14} className="text-warning" /> Guests
                </label>
                <select className="form-select" value={guests} onChange={(e) => setGuests(e.target.value)}>
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4+ Guests</option>
                </select>
              </div>

              {/* Search Button */}
              <div className="col-lg-3 col-md-12 d-flex align-items-end">
                <button type="submit" className="btn btn-gold w-100 py-2 d-flex align-items-center justify-content-center gap-2">
                  <Search size={18} />
                  <span>Check Availability</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* 3. Featured Rooms & Suites */}
      <section className="py-5 mt-4">
        <div className="container">
          <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-4">
            <div>
              <span className="text-uppercase small fw-bold" style={{ color: '#c5a880', letterSpacing: '1px' }}>
                Curated Accommodations
              </span>
              <h2 className="font-serif fw-bold text-dark mt-1">Featured Rooms & Signature Suites</h2>
            </div>
            <Link to="/rooms" className="text-decoration-none fw-semibold text-warning mt-2 mt-md-0 d-inline-flex align-items-center gap-1">
              <span>View All Accommodations</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="row g-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="col-md-6 col-lg-3">
                  <div className="skeleton-box" style={{ height: '340px' }}></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="row g-4">
              {featuredRooms.map((room) => (
                <div key={room._id} className="col-md-6 col-lg-3">
                  <RoomCard room={room} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Luxury Hotel Destinations */}
      <section className="py-5" style={{ backgroundColor: '#f4f1ea' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-uppercase small fw-bold" style={{ color: '#ab8d64', letterSpacing: '1.5px' }}>
              Our Distinctive Flagships
            </span>
            <h2 className="font-serif fw-bold text-dark mt-1">Iconic Hotels Across India</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
              From Udaipur's royal lakefront palaces to Goa's pristine shoreline cabanas and Mumbai's cosmopolitan heart.
            </p>
          </div>

          <div className="row g-4">
            {hotels.map((hotel) => (
              <div key={hotel._id} className="col-lg-4 col-md-6">
                <div className="luxury-card h-100 bg-white">
                  <div style={{ height: '220px', overflow: 'hidden' }}>
                    <img
                      src={hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                      alt={hotel.name}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="p-4 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge bg-light text-dark border">{hotel.city}</span>
                        <div className="d-flex align-items-center text-warning small">
                          <Star size={14} fill="#c5a880" stroke="#c5a880" />
                          <span className="ms-1 fw-bold text-dark">5.0 Star Luxury</span>
                        </div>
                      </div>
                      <h5 className="font-serif fw-bold mb-2">{hotel.name}</h5>
                      <p className="text-muted small mb-3">{hotel.tagline}</p>
                    </div>
                    <Link
                      to={`/rooms?city=${hotel.city}`}
                      className="btn btn-outline-dark btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                    >
                      <span>Explore Suites in {hotel.city}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why Choose Hotelier */}
      <section className="py-5">
        <div className="container py-4">
          <div className="row g-4 align-items-center">
            <div className="col-lg-5">
              <span className="text-uppercase small fw-bold" style={{ color: '#c5a880', letterSpacing: '1px' }}>
                The Hotelier Distinction
              </span>
              <h2 className="font-serif fw-bold display-6 mb-4">Unrivaled Hospitality and Personal Touches</h2>
              <p className="text-muted leading-relaxed mb-4">
                We believe genuine luxury lies in the anticipation of needs before they arise. Every stay is crafted to
                create lasting impressions with flawless comfort and warmth.
              </p>

              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 rounded bg-light border text-warning flex-shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">24/7 Dedicated Butler Care</h6>
                    <p className="text-muted small m-0">Personalized packing, unpacking, reservations, and private in-suite dining.</p>
                  </div>
                </div>
                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 rounded bg-light border text-warning flex-shrink-0">
                    <Award size={20} />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Best Rate & Flexible Cancellation</h6>
                    <p className="text-muted small m-0">Direct booking privilege with guaranteed free cancellation up to 48 hours prior.</p>
                  </div>
                </div>
                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 rounded bg-light border text-warning flex-shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Seamless Instant Confirmation</h6>
                    <p className="text-muted small m-0">Secure verified payment gateway with instant booking invoices and voucher access.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="row g-3">
                <div className="col-6">
                  <img
                    src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80"
                    alt="Hotel Interior"
                    className="img-fluid rounded shadow-sm"
                    style={{ height: '300px', width: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className="col-6">
                  <img
                    src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80"
                    alt="Hotel Pool"
                    className="img-fluid rounded shadow-sm mt-4"
                    style={{ height: '300px', width: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Special Offers Banner */}
      <section className="py-5" style={{ backgroundColor: '#1e2022', color: '#ffffff' }}>
        <div className="container py-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <span className="badge badge-gold px-3 py-1 mb-2">Seasonal Privileges</span>
              <h2 className="font-serif text-white display-6 mb-2">Book Your Summer Retreat & Save 15%</h2>
              <p className="text-secondary m-0">
                Reserve 3 or more nights in any Executive Suite or Heritage Villa and enjoy complimentary airport transfers and daily champagne breakfast.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link to="/rooms" className="btn btn-gold btn-lg px-4">
                Claim Special Offer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Guest Testimonials */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="text-uppercase small fw-bold" style={{ color: '#c5a880', letterSpacing: '1px' }}>
              Memorable Stays
            </span>
            <h2 className="font-serif fw-bold text-dark mt-1">What Our Discerning Guests Say</h2>
            <p className="text-muted small mt-2 mb-0">Illustrative guest stories for this project demo.</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="p-4 rounded border h-100 bg-light d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex text-warning mb-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={16} fill="#c5a880" stroke="#c5a880" />
                    ))}
                  </div>
                  <p className="text-dark fst-italic mb-3">
                    "Our anniversary at Hotelier Grand Palace Udaipur was sheer perfection. Arriving by private boat at twilight and having our own lakefront plunge pool made it unforgettable."
                  </p>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                    alt="Rohan S."
                    className="rounded-circle"
                    style={{ width: 42, height: 42, objectFit: 'cover' }}
                  />
                  <div>
                    <h6 className="m-0 fw-bold small">Rohan Sharma</h6>
                    <small className="text-muted">Stayed in Udaipur Grand Palace</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-4 rounded border h-100 bg-light d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex text-warning mb-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={16} fill="#c5a880" stroke="#c5a880" />
                    ))}
                  </div>
                  <p className="text-dark fst-italic mb-3">
                    "The Oceanview Resort in Goa gave our family the most peaceful escape. The private cabana dining and attentive concierge made traveling with children effortlessly enjoyable."
                  </p>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80"
                    alt="Aarti M."
                    className="rounded-circle"
                    style={{ width: 42, height: 42, objectFit: 'cover' }}
                  />
                  <div>
                    <h6 className="m-0 fw-bold small">Aarti Mehta</h6>
                    <small className="text-muted">Stayed in Goa Oceanview Resort</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-4 rounded border h-100 bg-light d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex text-warning mb-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={16} fill="#c5a880" stroke="#c5a880" />
                    ))}
                  </div>
                  <p className="text-dark fst-italic mb-3">
                    "As a frequent business traveler, the Royal Pavilion in Mumbai is second to none. High-speed executive lounge, swift check-in, and great views over the Arabian Sea."
                  </p>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
                    alt="Devendra K."
                    className="rounded-circle"
                    style={{ width: 42, height: 42, objectFit: 'cover' }}
                  />
                  <div>
                    <h6 className="m-0 fw-bold small">Devendra Kapoor</h6>
                    <small className="text-muted">Stayed in Mumbai Royal Pavilion</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
