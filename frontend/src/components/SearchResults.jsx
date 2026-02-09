import React from 'react';
import { useSheetStore } from '../store/useSheetStore';
import { ExternalLink, ArrowRight } from 'lucide-react';

const difficultyColors = {
  Easy: 'text-green-400 bg-green-400/10 border-green-400/20',
  Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Hard: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const SearchResults = () => {
  const searchQuery = useSheetStore(state => state.searchQuery);
  const questions = useSheetStore(state => state.questions);
  const subTopics = useSheetStore(state => state.subTopics);
  const topics = useSheetStore(state => state.topics);
  const sheet = useSheetStore(state => state.sheet);

  // --- LOGIC: Flatten and Filter ---
  // We need to find the Question -> SubTopic -> Topic relationship
  
  const results = [];
  const lowerQuery = searchQuery.toLowerCase();

  // Iterate through the hierarchy to maintain order, but flatten it
  sheet.topicOrder.forEach(topicId => {
    const topic = topics[topicId];
    if (!topic) return;

    topic.subTopicOrder.forEach(subId => {
      const sub = subTopics[subId];
      if (!sub) return;

      sub.questionOrder.forEach(qId => {
        const q = questions[qId];
        if (!q) return;

        // Check Match
        const matchTitle = q.title.toLowerCase().includes(lowerQuery);
        const matchDiff = q.difficulty?.toLowerCase().includes(lowerQuery);
        
        if (matchTitle || matchDiff) {
          results.push({
            ...q,
            topicName: topic.title,
            subTopicName: sub.title
          });
        }
      });
    });
  });

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-tuf-muted">
        <p className="text-lg">No questions found matching "{searchQuery}"</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-tuf-card border border-tuf-border rounded-lg overflow-hidden">
      <div className="bg-[#252525] px-4 py-3 border-b border-tuf-border flex justify-between items-center">
        <h2 className="text-white font-medium">Search Results</h2>
        <span className="text-xs text-tuf-muted">{results.length} matches found</span>
      </div>

      <div className="divide-y divide-tuf-border">
        {results.map((q) => (
          <div key={q.id} className="p-4 hover:bg-white/5 transition flex items-center justify-between group">
            
            {/* Left: Path & Title */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs text-tuf-muted mb-1">
                <span>{q.topicName}</span>
                <ArrowRight size={10} />
                <span>{q.subTopicName}</span>
              </div>
              
              <a 
                href={q.link} 
                target="_blank" 
                rel="noreferrer" 
                className="text-lg font-medium text-tuf-text group-hover:text-tuf-red group-hover:underline flex items-center gap-2"
              >
                {q.title}
                <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>

            {/* Right: Difficulty Badge */}
            <span className={`text-xs px-3 py-1 rounded-full border ${difficultyColors[q.difficulty] || difficultyColors.Medium}`}>
              {q.difficulty}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;