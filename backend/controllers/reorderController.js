import { get, save } from '../store/store.js';

export const reorderItems = (req, res) => {
  const { type, sourceParentId, destParentId, sourceIndex, destIndex } = req.body;
  const db = get();

  let sourceList, destList;

  if (type === 'topic') {
    sourceList = db.sheet.topicOrder;
    destList = db.sheet.topicOrder;
  } else if (type === 'subTopic') {
    sourceList = db.topics[sourceParentId]?.subTopicOrder;
    destList = db.topics[destParentId]?.subTopicOrder;
  } else if (type === 'question') {
    sourceList = db.subTopics[sourceParentId]?.questionOrder;
    destList = db.subTopics[destParentId]?.questionOrder;
  }

  if (!sourceList || !destList) return res.status(400).json({ error: "Invalid Request" });

  const [movedItem] = sourceList.splice(sourceIndex, 1);
  destList.splice(destIndex, 0, movedItem);

  save();
  res.json({ success: true });
};