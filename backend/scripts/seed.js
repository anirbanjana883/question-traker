import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_FILE = path.join(__dirname, 'sheet.json');
const OUTPUT_FILE = path.join(__dirname, '../store/data.json');

const run = () => {
  try {
    if (!fs.existsSync(SOURCE_FILE)) {
      console.error("Error: 'backend/scripts/sheet.json' not found.");
      return;
    }

    const rawData = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf-8'));
    console.log("Normalizing Raw Data...");

    const sheetInfo = rawData.data.sheet;
    const questionsList = rawData.data.questions;

    // Initialization
    const db = {
      sheet: {
        id: sheetInfo._id || "sheet-1",
        title: sheetInfo.name || "Striver's Sheet",
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
      const subTopicName = item.subTopic || "General Problems";
      
      if (!topicMap[topicName]) {
        const newTopicId = `topic-${Object.keys(topicMap).length + 1}`;
        topicMap[topicName] = newTopicId;
        
        db.topics[newTopicId] = {
          id: newTopicId,
          title: topicName,
          subTopicOrder: []
        };
        db.sheet.topicOrder.push(newTopicId);
      }
      const topicId = topicMap[topicName];

      const subKey = `${topicName}:${subTopicName}`;
      if (!subTopicMap[subKey]) {
        const newSubId = `sub-${Object.keys(subTopicMap).length + 1}`;
        subTopicMap[subKey] = newSubId;

        db.subTopics[newSubId] = {
          id: newSubId,
          title: subTopicName,
          questionOrder: []
        };
        db.topics[topicId].subTopicOrder.push(newSubId);
      }
      const subTopicId = subTopicMap[subKey];

      const qData = item.questionId || {};
      
      let rawId = item._id || uuidv4();
      const qId = rawId.startsWith('q-') ? rawId : `q-${rawId}`; 

      db.questions[qId] = {
        id: qId,
        title: item.title || qData.name || "Unknown Question",
        link: qData.problemUrl || "#",
        difficulty: qData.difficulty || "Medium",
        isPinned: false
      };

      db.subTopics[subTopicId].questionOrder.push(qId);
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(db, null, 2));
    console.log(`Database seeded! Created ${Object.keys(db.topics).length} topics and ${Object.keys(db.questions).length} questions.`);

  } catch (err) {
    console.error("Seeding failed:", err.message);
  }
};

run();