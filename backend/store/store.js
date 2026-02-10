import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const DATA_FILE = path.join(__dirname, 'data.json');
const SOURCE_FILE = path.join(__dirname, '../scripts/sheet.json'); 

// V1 LOGIC to load data 

// let data = { 
//   sheet: { id: 'sheet-1', title: 'My Sheet', topicOrder: [] }, 
//   topics: {}, 
//   subTopics: {}, 
//   questions: {} 
// };

// try {
//   if (fs.existsSync(DATA_FILE)) {
//     data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
//   }
// } catch (err) {
//   console.error("Error loading data", err);
// }

// export const save = () => {
//   fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
// };

// export const get = () => data;


// export const set = (newData) => {
//   data = newData;
//   save(); 
// };


// V2 LOGIC to load data (done due to auto loss data when server get sleep on free deployment)

const generateInitialData = () => {
  try {
    if (!fs.existsSync(SOURCE_FILE)) {
      console.error("Source sheet.json not found! Starting empty.");
      return { sheet: { topicOrder: [] }, topics: {}, subTopics: {}, questions: {} };
    }

    const rawData = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf-8'));
    const sheetInfo = rawData.data.sheet;
    const questionsList = rawData.data.questions;

    const db = {
      sheet: {
        id: sheetInfo._id || "sheet-1",
        title: sheetInfo.name || "Striver's SDE Sheet",
        topicOrder: []
      },
      topics: {},
      subTopics: {},
      questions: {}
    };

    const topicMap = {}; 
    const subTopicMap = {}; 

    questionsList.forEach((item) => {
      const topicName = item.topic || "Uncategorized";
      const subTopicName = item.subTopic || "General";
      
      // Topic
      if (!topicMap[topicName]) {
        const newTopicId = `topic-${Object.keys(topicMap).length + 1}`;
        topicMap[topicName] = newTopicId;
        db.topics[newTopicId] = { id: newTopicId, title: topicName, subTopicOrder: [] };
        db.sheet.topicOrder.push(newTopicId);
      }
      const topicId = topicMap[topicName];

      // SubTopic
      const subKey = `${topicName}:${subTopicName}`;
      if (!subTopicMap[subKey]) {
        const newSubId = `sub-${Object.keys(subTopicMap).length + 1}`;
        subTopicMap[subKey] = newSubId;
        db.subTopics[newSubId] = { id: newSubId, title: subTopicName, questionOrder: [] };
        db.topics[topicId].subTopicOrder.push(newSubId);
      }
      const subTopicId = subTopicMap[subKey];

      // Question
      let rawId = item._id || uuidv4();
      const qId = rawId.startsWith('q-') ? rawId : `q-${rawId}`;
      
      db.questions[qId] = {
        id: qId,
        title: item.title || item.questionId?.name || "Unknown",
        link: item.questionId?.problemUrl || "#",
        difficulty: item.questionId?.difficulty || "Medium",
        isPinned: false
      };
      db.subTopics[subTopicId].questionOrder.push(qId);
    });

    console.log("Auto-Seeded Data successfully!");
    return db;

  } catch (error) {
    console.error("Error auto-seeding:", error);
    return { sheet: { topicOrder: [] }, topics: {}, subTopics: {}, questions: {} };
  }
};



let data;

if (fs.existsSync(DATA_FILE)) {
  // If file exists (Localhost), load it
  try {
    data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch (err) {
    console.log("Corrupt data file. Re-seeding...");
    data = generateInitialData();
  }
} else {
  console.log("Fresh start detected. Generating data from source...");
  data = generateInitialData();
  try { fs.writeFileSync(DATA_FILE, JSON.stringify(data)); } catch (e) {} 
}

export const save = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error saving data (might be ephemeral):", err);
  }
};

export const get = () => data;

export const set = (newData) => {
  data = newData;
  save();
};