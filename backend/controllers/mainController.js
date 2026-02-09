import { get, save, set } from '../store/store.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SOURCE_FILE = path.join(__dirname, '../scripts/sheet.json');

// getting the fulll sheet details
export const getSheet = (req, res) => {
  res.json({ success: true, data: get() });
};

// adding topic , subtopic , question
export const addItem = (req, res) => {
  const { type, parentId, title, link, difficulty } = req.body;
  const db = get();
  const newId = uuidv4();

  if (type === 'topic') {
    db.topics[newId] = { id: newId, title, subTopicOrder: [] };
    db.sheet.topicOrder.push(newId);
  } else if (type === 'subTopic') {
    db.subTopics[newId] = { id: newId, title, questionOrder: [] };
    if (db.topics[parentId]) db.topics[parentId].subTopicOrder.push(newId);
  } else if (type === 'question') {
    db.questions[newId] = { id: newId, title, link, difficulty, isPinned: false };
    if (db.subTopics[parentId]) db.subTopics[parentId].questionOrder.push(newId);
  }

  save();
  res.json({ success: true, id: newId });
};

// editing Topic , SubTopic , Question
export const updateItem = (req, res) => {
  const { type, id, title, link, difficulty } = req.body;
  const db = get();

  if (type === 'topic') {
    if (db.topics[id]) db.topics[id].title = title;
  } else if (type === 'subTopic') {
    if (db.subTopics[id]) db.subTopics[id].title = title;
  } else if (type === 'question') {
    if (db.questions[id]) {
      db.questions[id].title = title || db.questions[id].title;
      if (link !== undefined) db.questions[id].link = link;
      if (difficulty !== undefined) db.questions[id].difficulty = difficulty;
    }
  }

  save();
  res.json({ success: true });
};

// deleting Topic , SubTopic , Question -- cascade delete system
export const deleteItem = (req, res) => {
  const { type, id, parentId } = req.body;
  const db = get();

  if (type === 'topic' && db.topics[id]) {
    const subTopicIds = db.topics[id].subTopicOrder || [];

    subTopicIds.forEach(subId => {
      const questionIds = db.subTopics[subId]?.questionOrder || [];

      questionIds.forEach(qid => {
        delete db.questions[qid];
      });

      delete db.subTopics[subId];
    });

    db.sheet.topicOrder = db.sheet.topicOrder.filter(tid => tid !== id);

    delete db.topics[id];
  }

  else if (type === 'subTopic' && db.subTopics[id]) {
    const questionIds = db.subTopics[id].questionOrder || [];

    questionIds.forEach(qid => {
      delete db.questions[qid];
    });

    if (db.topics[parentId]) {
      db.topics[parentId].subTopicOrder =
        db.topics[parentId].subTopicOrder.filter(sid => sid !== id);
    }

    delete db.subTopics[id];
  }

  else if (type === 'question' && db.questions[id]) {
    if (db.subTopics[parentId]) {
      db.subTopics[parentId].questionOrder =
        db.subTopics[parentId].questionOrder.filter(qid => qid !== id);
    }

    delete db.questions[id];
  }

  save();
  res.json({ success: true });
};

// pin question
export const togglePin = (req, res) => {
  const { id } = req.body;
  const db = get();
  if (db.questions[id]) {
    db.questions[id].isPinned = !db.questions[id].isPinned;
    save();
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Not found" });
  }
};

// reset all the changes
export const resetData = (req, res) => {
  try {
    if (!fs.existsSync(SOURCE_FILE)) {
      return res.status(500).json({ error: "Source file not found" });
    }

    const rawData = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf-8'));
    const sheetInfo = rawData.data.sheet;
    const questionsList = rawData.data.questions;

    // Rebuild clean state
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
      const qData = item.questionId || {};

      db.questions[qId] = {
        id: qId,
        title: item.title || qData.name || "Unknown Question",
        link: qData.problemUrl || "#",
        difficulty: qData.difficulty || "Medium",
        isPinned: false
      };
      db.subTopics[subTopicId].questionOrder.push(qId);
    });

    // Overwrite Database
    set(db);

    res.json({ success: true, message: "Sheet reset to default successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reset data" });
  }
};