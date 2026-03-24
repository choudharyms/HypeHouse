import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import * as auth from '../lib/auth';
import * as api from '../lib/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [pgs, setPgs] = useState([]);
  const [savedPGIds, setSavedPGIds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth & Data
  useEffect(() => {
    let subscription;

    async function init() {
      try {
        // Always fetch PGs first
        const allPgs = await api.fetchPGs();
        setPgs(allPgs);

        const session = await auth.getSession();
        if (session) {
          const profile = await auth.getMyProfile();
          setUser(profile);
          const savedIds = await api.fetchSavedPGIds();
          setSavedPGIds(savedIds);
          const myBookings = await api.fetchMyBookings();
          setBookings(myBookings);

          // Real-time listener for booking updates
          subscription = supabase
            .channel('student-bookings')
            .on('postgres_changes', {
              event: 'UPDATE',
              schema: 'public',
              table: 'bookings',
              filter: `student_id=eq.${session.user.id}`
            }, (payload) => {
              setBookings(prev => 
                prev.map(b => b.id === payload.new.id ? { ...b, ...payload.new } : b)
              );
            })
            .subscribe();
        }
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    init();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  const toggleSaved = async (pgId) => {
    if (!user) return;
    try {
      if (savedPGIds.includes(pgId)) {
        await api.unsavePG(pgId);
        setSavedPGIds(prev => prev.filter(id => id !== pgId));
      } else {
        await api.savePG(pgId);
        setSavedPGIds(prev => [...prev, pgId]);
      }
    } catch (error) {
      console.error('Toggle save error:', error);
    }
  };

  const isSaved = (pgId) => savedPGIds.includes(pgId);

  const addBooking = async (bookingData) => {
    try {
      const newBooking = await api.createBooking(bookingData);
      setBookings((prev) => [newBooking, ...prev]);
      return newBooking;
    } catch (error) {
      console.error('Add booking error:', error);
      throw error;
    }
  };

  const cancelBooking = async (id) => {
    try {
      await api.cancelBooking(id);
      setBookings((prev) => 
        prev.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b)
      );
    } catch (error) {
      console.error('Cancel booking error:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        pgs,
        savedPGIds,
        toggleSaved,
        isSaved,
        bookings,
        addBooking,
        cancelBooking,
        addReview: api.addReview,
        isLoading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
