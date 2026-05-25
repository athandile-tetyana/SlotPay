import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// GET /api/services
router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    const { data, error } = await supabase.from('services').select('*').eq('is_active', true);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/services
router.post('/', async (req, res) => {
  try {
    const { name, description, price, deposit_amount, duration_minutes, category } = req.body;
    const { data, error } = await supabase
      .from('services')
      .insert({ name, description, price, deposit_amount, duration_minutes, category, is_active: true })
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/services/:id
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('services').update({ is_active: false }).eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Service deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
import express from 'express';
import { getServices, getServiceById } from '../services/supabase.js';

const router = express.Router();

/**
 * GET /api/services
 * Get all active services
 */
router.get('/', async (req, res) => {
  try {
    const services = await getServices();

    res.json({
      services: services.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        category: service.category,
        imageUrl: service.image_url,
        active: service.active
      }))
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to get services' });
  }
});

/**
 * GET /api/services/:id
 * Get a specific service by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const serviceId = req.params.id;
    const service = await getServiceById(serviceId);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({
      service: {
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        category: service.category,
        imageUrl: service.image_url,
        features: service.features,
        active: service.active,
        createdAt: service.created_at,
        updatedAt: service.updated_at
      }
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: 'Failed to get service' });
  }
});

/**
 * GET /api/services/category/:category
 * Get services by category
 */
router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const services = await getServices();
    
    const filteredServices = services.filter(
      service => service.category?.toLowerCase() === category.toLowerCase()
    );

    res.json({
      category,
      services: filteredServices.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        category: service.category,
        imageUrl: service.image_url
      }))
    });
  } catch (error) {
    console.error('Get services by category error:', error);
    res.status(500).json({ error: 'Failed to get services by category' });
  }
});

export default router;

// Made with Bob
