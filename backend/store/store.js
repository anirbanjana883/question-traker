import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data.json');

// Initial State
let data = { 
  sheet: { id: 'sheet-1', title: 'My Sheet', topicOrder: [] }, 
  topics: {}, 
  subTopics: {}, 
  questions: {} 
};

try {
  if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  }
} catch (err) {
  console.error("Error loading data", err);
}

export const save = () => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

export const get = () => data;


export const set = (newData) => {
  data = newData;
  save(); 
};