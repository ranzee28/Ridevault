import React, { createContext, useContext, useState, useEffect } from 'react';
import { showcaseBikes as initialBikes } from '../data/bikes';
import { supabase } from '../lib/supabase';

export interface Bike {
  id: number;
  brand: string;
  model: string;
  engine: string;
  power: string;
  price: number;
  status: string;
  image: string;
  topSpeed: string;
  torque: string;
  suspension: string;
  weight: string;
  gallery: string[];
}

interface BikeContextType {
  bikes: Bike[];
  addBike: (bike: Omit<Bike, 'id'>) => Promise<void>;
  updateBike: (id: number, bike: Partial<Bike>) => Promise<void>;
  updateBikeStatus: (id: number, status: string) => Promise<void>;
  deleteBike: (id: number) => Promise<void>;
  loading: boolean;
}

const BikeContext = createContext<BikeContextType | undefined>(undefined);

export const BikeProvider = ({ children }: { children: React.ReactNode }) => {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to map DB row keys to Bike model interface
  const mapDbRowToBike = (row: any): Bike => ({
    id: row.id,
    brand: row.brand,
    model: row.model,
    engine: row.engine,
    power: row.power,
    price: Number(row.price),
    status: row.status,
    image: row.image,
    topSpeed: row.top_speed,
    torque: row.torque,
    suspension: row.suspension,
    weight: row.weight,
    gallery: row.gallery || []
  });

  // Helper to map Bike model interface to DB row
  const mapBikeToDbRow = (bike: any) => ({
    brand: bike.brand,
    model: bike.model,
    engine: bike.engine,
    power: bike.power,
    price: bike.price,
    status: bike.status,
    image: bike.image,
    top_speed: bike.topSpeed,
    torque: bike.torque,
    suspension: bike.suspension,
    weight: bike.weight,
    gallery: bike.gallery
  });

  const loadBikes = async () => {
    try {
      const { data, error } = await supabase
        .from('bikes')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setBikes(data.map(mapDbRowToBike));
      } else {
        // Table is empty, seed with initial static bikes
        console.log('Bikes table is empty. Seeding database with initial fleet...');
        const seedPayload = initialBikes.map(b => ({
          brand: b.brand,
          model: b.model,
          engine: b.engine,
          power: b.power,
          price: b.price,
          status: b.status,
          image: b.image,
          top_speed: b.topSpeed,
          torque: b.torque,
          suspension: b.suspension,
          weight: b.weight,
          gallery: b.gallery
        }));

        const { data: seeded, error: seedErr } = await supabase
          .from('bikes')
          .insert(seedPayload)
          .select();

        if (seedErr) throw seedErr;

        if (seeded) {
          setBikes(seeded.map(mapDbRowToBike));
        }
      }
    } catch (error) {
      console.error('Error fetching bikes from Supabase:', error);
      // Fallback to static initialBikes if supabase call fails completely
      setBikes(initialBikes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBikes();
  }, []);

  const addBike = async (bikeData: Omit<Bike, 'id'>) => {
    try {
      const payload = mapBikeToDbRow(bikeData);
      const { data, error } = await supabase
        .from('bikes')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setBikes(prev => [...prev, mapDbRowToBike(data)]);
      }
    } catch (err) {
      console.error('Error adding bike to Supabase:', err);
      alert('Gagal menambahkan motor ke database.');
    }
  };

  const updateBike = async (id: number, updatedData: Partial<Bike>) => {
    try {
      // Create partial DB row payload
      const payload: any = {};
      if (updatedData.brand !== undefined) payload.brand = updatedData.brand;
      if (updatedData.model !== undefined) payload.model = updatedData.model;
      if (updatedData.engine !== undefined) payload.engine = updatedData.engine;
      if (updatedData.power !== undefined) payload.power = updatedData.power;
      if (updatedData.price !== undefined) payload.price = updatedData.price;
      if (updatedData.status !== undefined) payload.status = updatedData.status;
      if (updatedData.image !== undefined) payload.image = updatedData.image;
      if (updatedData.topSpeed !== undefined) payload.top_speed = updatedData.topSpeed;
      if (updatedData.torque !== undefined) payload.torque = updatedData.torque;
      if (updatedData.suspension !== undefined) payload.suspension = updatedData.suspension;
      if (updatedData.weight !== undefined) payload.weight = updatedData.weight;
      if (updatedData.gallery !== undefined) payload.gallery = updatedData.gallery;

      const { data, error } = await supabase
        .from('bikes')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setBikes(prev => prev.map(b => b.id === id ? mapDbRowToBike(data) : b));
      }
    } catch (err) {
      console.error('Error updating bike in Supabase:', err);
      alert('Gagal memperbarui data motor di database.');
    }
  };

  const updateBikeStatus = async (id: number, status: string) => {
    try {
      const { data, error } = await supabase
        .from('bikes')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setBikes(prev => prev.map(b => b.id === id ? mapDbRowToBike(data) : b));
      }
    } catch (err) {
      console.error('Error updating bike status in Supabase:', err);
    }
  };

  const deleteBike = async (id: number) => {
    try {
      const { error } = await supabase
        .from('bikes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setBikes(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('Error deleting bike in Supabase:', err);
      alert('Gagal menghapus motor dari database.');
    }
  };

  return (
    <BikeContext.Provider value={{ bikes, addBike, updateBike, updateBikeStatus, deleteBike, loading }}>
      {children}
    </BikeContext.Provider>
  );
};

export const useBikes = () => {
  const context = useContext(BikeContext);
  if (context === undefined) {
    throw new Error('useBikes must be used within a BikeProvider');
  }
  return context;
};
