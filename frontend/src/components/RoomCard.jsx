import React from 'react';
import { Link } from 'react-router-dom';
import { Users, MapPin, Sparkles, Bed, ArrowRight } from 'lucide-react';

const RoomCard = ({ room }) => {
  const defaultImage =
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80';
  const displayImage = room.images && room.images.length > 0 ? room.images[0] : defaultImage;

  const discountedPrice = room.discountPercentage
    ? Math.round(room.price * (1 - room.discountPercentage / 100))
    : room.price;

  return (
    <div className="card luxury-card luxury-card-hover h-100 border-0">
      <div className="position-relative overflow-hidden" style={{ height: '240px' }}>
        <img
          src={displayImage}
          alt={room.categoryId?.name || `Room ${room.roomNumber}`}
          className="w-100 h-100"
          style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultImage;
          }}
        />

        {room.discountPercentage > 0 && (
          <span
            className="position-absolute top-0 start-0 m-3 badge bg-danger fw-semibold px-2 py-1 shadow-sm"
            style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}
          >
            {room.discountPercentage}% OFF SPECIAL
          </span>
        )}

        <span
          className="position-absolute top-0 end-0 m-3 badge bg-dark bg-opacity-75 text-white fw-normal px-2 py-1"
          style={{ fontSize: '0.75rem' }}
        >
          Room #{room.roomNumber}
        </span>
      </div>

      <div className="card-body p-4 d-flex flex-column justify-content-between">
        <div>
          {/* Hotel & City */}
          <div className="d-flex align-items-center gap-1 text-muted small mb-1">
            <MapPin size={14} className="text-warning flex-shrink-0" />
            <span className="text-truncate">
              {room.hotelId?.name || 'Hotelier Flagship'} • {room.hotelId?.city || 'India'}
            </span>
          </div>

          {/* Category Name */}
          <h5 className="card-title font-serif fw-bold mb-2 text-dark">
            {room.categoryId?.name || 'Luxury Suite'}
          </h5>

          {/* Capacity and Floor */}
          <div className="d-flex align-items-center gap-3 text-secondary small mb-3">
            <div className="d-flex align-items-center gap-1">
              <Users size={14} />
              <span>
                {room.capacity?.adults || 2} Adults
                {room.capacity?.children ? `, ${room.capacity?.children} Ch.` : ''}
              </span>
            </div>
            <span>•</span>
            <div className="d-flex align-items-center gap-1">
              <Bed size={14} />
              <span>Floor {room.floor || 1}</span>
            </div>
          </div>

          {/* Amenities Chips */}
          <div className="d-flex flex-wrap gap-1 mb-4">
            {(room.amenities || []).slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="badge bg-light text-secondary border px-2 py-1 fw-normal"
                style={{ fontSize: '0.72rem' }}
              >
                {amenity}
              </span>
            ))}
            {(room.amenities?.length || 0) > 3 && (
              <span className="badge bg-light text-muted border px-2 py-1 fw-normal" style={{ fontSize: '0.72rem' }}>
                +{room.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="border-top pt-3 d-flex align-items-center justify-content-between">
          <div>
            <div className="d-flex align-items-baseline gap-1">
              <span className="fs-5 fw-bold text-dark">₹{discountedPrice.toLocaleString('en-IN')}</span>
              {room.discountPercentage > 0 && (
                <span className="text-muted text-decoration-line-through small" style={{ fontSize: '0.8rem' }}>
                  ₹{room.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
              per night + taxes
            </span>
          </div>

          <Link to={`/rooms/${room._id}`} className="btn btn-outline-gold btn-sm d-flex align-items-center gap-1">
            <span>Explore</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
