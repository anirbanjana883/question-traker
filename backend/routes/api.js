import express from 'express';
import { 
  getSheet, 
  addItem, 
  updateItem, 
  deleteItem, 
  togglePin, 
  resetData 
} from '../controllers/mainController.js';
import { reorderItems } from '../controllers/reorderController.js';

const router = express.Router();

router.get('/sheet', getSheet);
router.post('/add', addItem);
router.put('/update', updateItem);
router.post('/delete', deleteItem);
router.post('/pin', togglePin);
router.put('/reorder', reorderItems);
router.post('/reset', resetData); 

export default router;