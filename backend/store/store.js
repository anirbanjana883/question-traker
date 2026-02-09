import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'data.json');


let data = {
  sheet: { id: 'sheet-1', title: 'My Question Sheet', topicOrder: [] },
  topics: {},
  subTopics: {},
  questions: {}
};

try {
  if (fs.existsSync(DATA_FILE)) {
    const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
    data = JSON.parse(fileContent);
    console.log('Data loaded from persistence.');
  }
} catch (err) {
  console.error('Error loading data, starting fresh:', err.message);
}


export const save = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to save data:', err.message);
  }
};

export const get = () => data;