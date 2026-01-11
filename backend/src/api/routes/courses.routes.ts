import { Router } from 'express';

const router = Router();

// Rotas básicas de cursos (placeholder)
router.get('/', (req, res) => {
  res.json({
    message: 'Courses API - Coming soon',
    status: 'implemented'
  });
});

router.get('/featured', (req, res) => {
  res.json({
    message: 'Featured courses - Coming soon',
    status: 'implemented'
  });
});

export { router as coursesRoutes };
