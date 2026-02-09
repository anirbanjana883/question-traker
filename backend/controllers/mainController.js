import { get, save } from '../store/store.js';
import { v4 as uuidv4 } from 'uuid';

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

// deleting Topic , SubTopic , Question
export const deleteItem = (req, res) => {
  const { type, id, parentId } = req.body;
  const db = get();

  if (type === 'topic') {
    db.sheet.topicOrder = db.sheet.topicOrder.filter(tid => tid !== id);
    delete db.topics[id];
  } 
  else if (type === 'subTopic') {
    if (db.topics[parentId]) {
      db.topics[parentId].subTopicOrder = db.topics[parentId].subTopicOrder.filter(sid => sid !== id);
    }
    delete db.subTopics[id];
  } 
  else if (type === 'question') {
    if (db.subTopics[parentId]) {
      db.subTopics[parentId].questionOrder = db.subTopics[parentId].questionOrder.filter(qid => qid !== id);
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