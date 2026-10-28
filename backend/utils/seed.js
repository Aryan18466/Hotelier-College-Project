const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Hotel = require('../models/Hotel');
const RoomCategory = require('../models/RoomCategory');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Service = require('../models/Service');
const HousekeepingTask = require('../models/HousekeepingTask');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotelpro';
    await mongoose.connect(mongoUri);
    console.log('[Seeder] Connected to database...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany(),
      Hotel.deleteMany(),
      RoomCategory.deleteMany(),
      Room.deleteMany(),
      Booking.deleteMany(),
      Payment.deleteMany(),
      Review.deleteMany(),
      Service.deleteMany(),
      HousekeepingTask.deleteMany(),
      Notification.deleteMany(),
      AuditLog.deleteMany(),
    ]);
    console.log('[Seeder] Cleared previous records.');

    // 1. Create Safe Demo Users
    const adminUser = await User.create({
      name: 'Alexander Vance (Admin)',
      email: 'admin@hotelpro.com',
      passwordHash: 'Admin@123',
      role: 'admin',
      phone: '+91 98765 00001',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    });

    const staffUser = await User.create({
      name: 'Sarah Jenkins (Concierge)',
      email: 'staff@hotelpro.com',
      passwordHash: 'Staff@123',
      role: 'staff',
      phone: '+91 98765 00002',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    });

    const guestUser = await User.create({
      name: 'Rohan Sharma',
      email: 'guest@hotelpro.com',
      passwordHash: 'Guest@123',
      role: 'guest',
      phone: '+91 98765 00003',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    });

    console.log('[Seeder] Created demo users (Admin, Staff, Guest).');

    // 2. Create Hotels
    const hotels = await Hotel.insertMany([
      {
        name: 'HotelPro Grand Palace & Spa',
        tagline: 'Timeless Royal Splendor on Lake Pichola',
        description: 'Set along tranquil waters, HotelPro Grand Palace offers authentic royal hospitality, marble courtyards, opulent spa sanctuaries, and bespoke butler service.',
        address: '1 Lake Palace Road, Pichola',
        city: 'Udaipur',
        state: 'Rajasthan',
        country: 'India',
        starRating: 5,
        amenities: ['Infinity Lake Pool', 'Signature Ayurvedic Spa', 'Fine Dining Rooftop', 'Private Boat Arrival', '24/7 Butler Service', 'Valet Parking', 'High-Speed Wi-Fi'],
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
        ],
        contactDetails: {
          phone: '+91 294 242 8800',
          email: 'udaipur@hotelpro.com',
          website: 'https://hotelpro.com/udaipur',
        },
        policies: {
          checkInTime: '14:00',
          checkOutTime: '11:00',
          cancellationPolicy: 'Free cancellation up to 48 hours prior to arrival. 100% refund.',
          refundDays: 2,
        },
      },
      {
        name: 'HotelPro Oceanview Resort & Suites',
        tagline: 'Private Beach Haven & Tropical Serenity',
        description: 'An idyllic beachfront sanctuary featuring panoramic views of the Arabian Sea, private white sand beach cabanas, open-air seafood pavilion, and luxury sunset cruises.',
        address: '88 Calangute Oceanfront Way',
        city: 'Goa',
        state: 'Goa',
        country: 'India',
        starRating: 5,
        amenities: ['Private Beachfront Access', 'Sea-Facing Infinity Pool', 'Beach Cabanas', 'Water Sports Club', 'Sunset Lounge Bar', 'Spa & Jacuzzi', 'Complimentary Breakfast'],
        images: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
        ],
        contactDetails: {
          phone: '+91 832 278 9900',
          email: 'goa@hotelpro.com',
          website: 'https://hotelpro.com/goa',
        },
        policies: {
          checkInTime: '15:00',
          checkOutTime: '12:00',
          cancellationPolicy: 'Free cancellation up to 48 hours before check-in. Partial refund within 24 hours.',
          refundDays: 2,
        },
      },
      {
        name: 'HotelPro Royal Pavilion',
        tagline: 'Modern Cosmopolitan Elegance in the Metropolis',
        description: 'Located in the heart of the business and cultural district, HotelPro Royal Pavilion blends modern architectural grandeur with intuitive business services and rooftop dining.',
        address: '45 Marine Lines Boulevard',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        starRating: 5,
        amenities: ['Helipad & Chauffeur Fleet', 'Executive Club Lounge', 'Michelin-Starred Dining', 'Rooftop Heated Pool', 'Fitness Center & Sauna', 'Conference Hub'],
        images: [
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
        ],
        contactDetails: {
          phone: '+91 22 6633 4400',
          email: 'mumbai@hotelpro.com',
          website: 'https://hotelpro.com/mumbai',
        },
        policies: {
          checkInTime: '14:00',
          checkOutTime: '11:00',
          cancellationPolicy: 'Standard cancellation policy applies: 48 hours notification required.',
          refundDays: 2,
        },
      },
    ]);

    console.log('[Seeder] Created 3 flagship luxury hotels.');

    // 3. Create Room Categories
    const categories = await RoomCategory.insertMany([
      {
        name: 'Deluxe King Room',
        description: 'Spacious 450 sq.ft room with plush California King bed, Italian marble bathroom, work desk, and lush garden views.',
        amenities: ['King Bed', 'Rain Shower', 'Complimentary High-Speed Wi-Fi', 'Smart TV 55"', 'Nespresso Coffee Machine', 'Mini Bar'],
        capacity: { adults: 2, children: 1 },
        basePrice: 6500,
        images: [
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80',
        ],
      },
      {
        name: 'Executive Club Suite',
        description: 'Expansive 750 sq.ft suite with separate living area, balcony with panoramic views, and exclusive access to the Club Lounge.',
        amenities: ['King Bed', 'Club Lounge Access', 'Balcony / Terrace', 'Soaking Bathtub', 'Walk-in Wardrobe', 'High-Speed Wi-Fi', 'Express Check-in'],
        capacity: { adults: 2, children: 2 },
        basePrice: 12000,
        images: [
          'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80',
        ],
      },
      {
        name: 'Presidential Penthouse Suite',
        description: 'Ultimate 1,800 sq.ft luxury with master bedroom, private infinity plunge pool, dining room, and dedicated 24-hour butler service.',
        amenities: ['Private Plunge Pool', 'Dedicated Butler', 'Panoramic Skyline View', 'Jacuzzi', 'Bespoke Bar', 'Dine-in Kitchen', 'Luxury Toiletries'],
        capacity: { adults: 4, children: 2 },
        basePrice: 28000,
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
        ],
      },
      {
        name: 'Royal Heritage Villa',
        description: 'Standalone private villa surrounded by serene botanical gardens with private swimming pool, outdoor courtyard, and personal chef.',
        amenities: ['Private Swimming Pool', 'Personal Chef Service', 'Private Garden Courtyard', 'Alfresco Dining', 'Fireplace', 'Valet & Chauffeur'],
        capacity: { adults: 4, children: 3 },
        basePrice: 38000,
        images: [
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80',
        ],
      },
    ]);

    console.log('[Seeder] Created 4 room categories.');

    // 4. Create Rooms across Hotels
    const rooms = await Room.insertMany([
      // Udaipur Hotel Rooms
      {
        hotelId: hotels[0]._id,
        roomNumber: '101',
        categoryId: categories[0]._id,
        floor: 1,
        capacity: { adults: 2, children: 1 },
        price: 6500,
        discountPercentage: 10,
        images: [
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
        ],
        amenities: ['Lake View', 'King Bed', 'Marble Bathroom', 'Wi-Fi', 'Mini Bar', 'Breakfast Included'],
        status: 'available',
      },
      {
        hotelId: hotels[0]._id,
        roomNumber: '201',
        categoryId: categories[1]._id,
        floor: 2,
        capacity: { adults: 2, children: 2 },
        price: 12500,
        discountPercentage: 15,
        images: [
          'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
        ],
        amenities: ['Lakefront Balcony', 'Club Lounge Access', 'Bathtub', 'High-Speed Wi-Fi', '24/7 Room Dining'],
        status: 'available',
      },
      {
        hotelId: hotels[0]._id,
        roomNumber: '501',
        categoryId: categories[2]._id,
        floor: 5,
        capacity: { adults: 4, children: 2 },
        price: 29500,
        discountPercentage: 0,
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80',
        ],
        amenities: ['Private Infinity Plunge Pool', 'Personal Butler', 'Palace View', 'Jacuzzi', 'Champagne on Arrival'],
        status: 'available',
      },

      // Goa Hotel Rooms
      {
        hotelId: hotels[1]._id,
        roomNumber: '102',
        categoryId: categories[0]._id,
        floor: 1,
        capacity: { adults: 2, children: 1 },
        price: 7200,
        discountPercentage: 5,
        images: [
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80',
        ],
        amenities: ['Direct Garden Access', 'King Bed', 'Rain Shower', 'Espresso Machine', 'Wi-Fi'],
        status: 'available',
      },
      {
        hotelId: hotels[1]._id,
        roomNumber: '302',
        categoryId: categories[1]._id,
        floor: 3,
        capacity: { adults: 3, children: 1 },
        price: 13800,
        discountPercentage: 10,
        images: [
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
        ],
        amenities: ['Direct Ocean View', 'Private Sundeck', 'Cocktail Bar', 'Jacuzzi', 'Club Access'],
        status: 'available',
      },
      {
        hotelId: hotels[1]._id,
        roomNumber: 'V-01',
        categoryId: categories[3]._id,
        floor: 1,
        capacity: { adults: 4, children: 3 },
        price: 42000,
        discountPercentage: 10,
        images: [
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80',
        ],
        amenities: ['Private Swimming Pool', 'Private Beach Access', 'Personal Chef', 'Outdoor Gazebo', 'Golf Cart'],
        status: 'available',
      },

      // Mumbai Hotel Rooms
      {
        hotelId: hotels[2]._id,
        roomNumber: '801',
        categoryId: categories[0]._id,
        floor: 8,
        capacity: { adults: 2, children: 0 },
        price: 8500,
        discountPercentage: 0,
        images: [
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80',
        ],
        amenities: ['City Skyline View', 'Ergonomic Work Station', 'Soundproof Windows', 'High-Speed Wi-Fi'],
        status: 'available',
      },
      {
        hotelId: hotels[2]._id,
        roomNumber: '1401',
        categoryId: categories[1]._id,
        floor: 14,
        capacity: { adults: 3, children: 1 },
        price: 15500,
        discountPercentage: 15,
        images: [
          'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80',
        ],
        amenities: ['Marine Drive View', 'Executive Lounge Access', 'Express Laundry', 'Luxury Bathrobe'],
        status: 'available',
      },
    ]);

    console.log('[Seeder] Created 8 luxury rooms across hotels.');

    // 5. Create Hotel Services
    const services = await Service.insertMany([
      {
        hotelId: hotels[0]._id,
        name: 'Royal Heritage Ayurvedic Spa (90 mins)',
        description: 'Signature therapeutic herbal oils and royal rejuvenation body treatment.',
        price: 4500,
        category: 'wellness',
        icon: 'Sparkles',
        availability: true,
      },
      {
        hotelId: hotels[0]._id,
        name: 'Private Romantic Lake Boat Dining',
        description: 'Candlelit four-course gourmet dinner aboard a traditional royal boat.',
        price: 8500,
        category: 'dining',
        icon: 'Utensils',
        availability: true,
      },
      {
        hotelId: hotels[0]._id,
        name: 'Luxury Airport Chauffeur Transfer',
        description: 'Chauffeured Mercedes-Benz transfer between airport and hotel with Wi-Fi.',
        price: 2500,
        category: 'transport',
        icon: 'Car',
        availability: true,
      },
      {
        hotelId: hotels[1]._id,
        name: 'Private Beach Sunset Cabana & Champagne',
        description: 'Reserved seaside cabana with Moët & Chandon champagne and chef canapés.',
        price: 6000,
        category: 'dining',
        icon: 'Wine',
        availability: true,
      },
      {
        hotelId: hotels[1]._id,
        name: 'Deep Sea Snorkeling & Dolphin Cruise',
        description: 'Guided private motorboat cruise to secluded reefs with full equipment.',
        price: 5500,
        category: 'wellness',
        icon: 'Compass',
        availability: true,
      },
    ]);

    console.log('[Seeder] Created hotel services.');

    // 6. Create Completed Past Booking & Review for Guest
    const pastCheckIn = new Date();
    pastCheckIn.setDate(pastCheckIn.getDate() - 10);
    const pastCheckOut = new Date();
    pastCheckOut.setDate(pastCheckOut.getDate() - 7);

    const pastBooking = await Booking.create({
      bookingReference: 'HP-PREV01',
      userId: guestUser._id,
      hotelId: hotels[0]._id,
      roomId: rooms[0]._id,
      checkIn: pastCheckIn,
      checkOut: pastCheckOut,
      guestCount: { adults: 2, children: 0 },
      guestDetails: {
        name: guestUser.name,
        email: guestUser.email,
        phone: guestUser.phone,
        specialRequests: 'Quiet room facing the inner lake courtyard.',
      },
      pricing: {
        roomPricePerNight: 6500,
        nights: 3,
        discountAmount: 1950,
        subtotal: 17550,
        taxAmount: 2106,
        currency: 'INR',
        totalAmount: 19656,
      },
      bookingStatus: 'checked_out',
      paymentStatus: 'paid',
      checkInActual: pastCheckIn,
      checkOutActual: pastCheckOut,
    });

    const pastPayment = await Payment.create({
      bookingId: pastBooking._id,
      userId: guestUser._id,
      provider: 'razorpay',
      providerOrderId: 'order_seed_001',
      providerPaymentId: 'pay_seed_001',
      amount: 19656,
      currency: 'INR',
      status: 'captured',
    });

    await Review.create({
      userId: guestUser._id,
      hotelId: hotels[0]._id,
      roomId: rooms[0]._id,
      bookingId: pastBooking._id,
      rating: 5,
      comment: 'An extraordinary royal experience from start to finish! The lake views at dawn are unforgettable, and the staff treated us with unmatched warmth.',
      isVerifiedStay: true,
    });

    // 7. Create an Upcoming Confirmed Booking for Guest
    const upcomingCheckIn = new Date();
    upcomingCheckIn.setDate(upcomingCheckIn.getDate() + 5);
    const upcomingCheckOut = new Date();
    upcomingCheckOut.setDate(upcomingCheckOut.getDate() + 8);

    const upcomingBooking = await Booking.create({
      bookingReference: 'HP-CONF88',
      userId: guestUser._id,
      hotelId: hotels[1]._id,
      roomId: rooms[4]._id, // Goa Room 302
      checkIn: upcomingCheckIn,
      checkOut: upcomingCheckOut,
      guestCount: { adults: 2, children: 1 },
      guestDetails: {
        name: guestUser.name,
        email: guestUser.email,
        phone: guestUser.phone,
        specialRequests: 'Late arrival expected at 7 PM.',
      },
      pricing: {
        roomPricePerNight: 13800,
        nights: 3,
        discountAmount: 4140,
        subtotal: 37260,
        taxAmount: 4471,
        currency: 'INR',
        totalAmount: 41731,
      },
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
    });

    await Payment.create({
      bookingId: upcomingBooking._id,
      userId: guestUser._id,
      provider: 'test_mode',
      providerOrderId: 'order_test_upcoming_01',
      providerPaymentId: 'pay_test_upcoming_01',
      amount: 41731,
      currency: 'INR',
      status: 'captured',
    });

    // 8. Create Housekeeping Tasks for Staff
    await HousekeepingTask.create({
      hotelId: hotels[0]._id,
      roomId: rooms[1]._id,
      assignedStaffId: staffUser._id,
      status: 'pending',
      priority: 'high',
      taskType: 'daily_refresh',
      notes: 'Prepare suite for VIP guest arrival. Check mini-bar and fresh roses.',
    });

    // 9. Create Notifications
    await Notification.create({
      userId: guestUser._id,
      title: 'Upcoming Stay at Oceanview Resort',
      message: 'Your stay in Goa begins in 5 days! View your booking confirmation & invoice details.',
      type: 'booking',
      link: `/bookings/${upcomingBooking._id}`,
    });

    await Notification.create({
      userId: guestUser._id,
      title: 'Special Privileges Unlocked',
      message: 'Enjoy complimentary high-speed Wi-Fi and 10% off on all Spa & Dining packages.',
      type: 'system',
      link: '/services',
    });

    // 10. Initial Audit Logs
    await AuditLog.create({
      actorId: adminUser._id,
      action: 'SYSTEM_INITIALIZATION',
      entityType: 'System',
      entityId: 'seed',
      details: { message: 'HotelPro initial seed database setup completed' },
    });

    console.log('[Seeder] Seed process successfully finished! All models and demo records loaded.');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

seedData();
