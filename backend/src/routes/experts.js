const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const dummyExperts = [
    {
      id: 'exp1',
      name: 'Adv. Ananya Sharma',
      specialization: 'Corporate Law',
      rating: 4.9,
      reviews: 124,
      isOnline: true,
      experience: '10 Years',
      rate: '₹2,500/hr'
    },
    {
      id: 'exp2',
      name: 'Adv. Rajesh Kumar',
      specialization: 'Criminal Defense',
      rating: 4.8,
      reviews: 98,
      isOnline: false,
      experience: '15 Years',
      rate: '₹3,000/hr'
    },
    {
      id: 'exp3',
      name: 'Adv. Sneha Reddy',
      specialization: 'Family Law',
      rating: 4.7,
      reviews: 156,
      isOnline: true,
      experience: '8 Years',
      rate: '₹1,500/hr'
    },
    {
      id: 'exp4',
      name: 'Adv. Vikram Singh',
      specialization: 'Intellectual Property',
      rating: 4.9,
      reviews: 210,
      isOnline: true,
      experience: '12 Years',
      rate: '₹4,000/hr'
    },
    {
      id: 'exp5',
      name: 'Adv. Priya Patel',
      specialization: 'Tax Law',
      rating: 4.6,
      reviews: 87,
      isOnline: false,
      experience: '7 Years',
      rate: '₹2,000/hr'
    }
  ];

  res.json({ experts: dummyExperts });
});

module.exports = router;
