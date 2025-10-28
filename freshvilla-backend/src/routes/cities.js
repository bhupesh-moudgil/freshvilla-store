const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load cities data
const citiesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/indianCities.json'), 'utf-8')
);

// @route   GET /api/cities
// @desc    Get all Indian states, cities and districts
// @access  Public
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: citiesData.states
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/cities/states
// @desc    Get all states only
// @access  Public
router.get('/states', (req, res) => {
  try {
    const states = citiesData.states.map(s => ({
      state: s.state,
      code: s.code
    }));
    
    res.json({
      success: true,
      data: states
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/cities/districts/:stateCode
// @desc    Get districts for a specific state
// @access  Public
router.get('/districts/:stateCode', (req, res) => {
  try {
    const { stateCode } = req.params;
    const state = citiesData.states.find(s => s.code === stateCode.toUpperCase());
    
    if (!state) {
      return res.status(404).json({
        success: false,
        message: 'State not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        state: state.state,
        code: state.code,
        districts: state.districts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/cities/search
// @desc    Search cities/districts by name
// @access  Public
router.get('/search', (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }
    
    const results = [];
    const query = q.toLowerCase();
    
    citiesData.states.forEach(state => {
      state.districts.forEach(district => {
        if (district.name.toLowerCase().includes(query)) {
          results.push({
            district: district.name,
            districtCode: district.code,
            state: state.state,
            stateCode: state.code
          });
        }
      });
    });
    
    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
