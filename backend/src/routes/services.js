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
