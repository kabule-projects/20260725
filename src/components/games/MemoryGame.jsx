import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { IMAGE_BASE_URL } from '../../config/imageConfig';

const SYMBOLS = [
  { id: 1, image: `${IMAGE_BASE_URL}memory/1.png` },
  { id: 2, image: `${IMAGE_BASE_URL}memory/2.png` },
  { id: 3, image: `${IMAGE_BASE_URL}memory/3.png` },
  { id: 4, image: `${IMAGE_BASE_URL}memory/4.png` },
  { id: 5, image: `${IMAGE_BASE_URL}memory/5.png` },
  { id: 6, image: `${IMAGE_BASE_URL}memory/6.png` },
  { id: 7, image: `${IMAGE_BASE_URL}memory/7.png` },
  { id: 8, image: `${IMAGE_BASE_URL}memory/8.png` },
];

const FLIP_DURATION = 600; // 翻牌动画时长（毫秒）
const MATCH_DELAY = 800; // 匹配成功后的延迟

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const createCards = () => {
  const cards = [];
  SYMBOLS.forEach((symbol) => {
    cards.push({ ...symbol, uniqueId: `${symbol.id}-a`, isFlipped: false, isMatched: false });
    cards.push({ ...symbol, uniqueId: `${symbol.id}-b`, isFlipped: false, isMatched: false });
  });
  return shuffleArray(cards);
};

const MemoryGame = ({ onComplete }) => {
  const [cards, setCards] = useState(createCards);
  const [selectedCards, setSelectedCards] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [gameState, setGameState] = useState('playing');

  // 检查是否全部配对成功
  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.isMatched)) {
      setGameState('win');
      onComplete();
    }
  }, [cards, onComplete]);

  // 处理卡牌点击
  const handleCardClick = useCallback((uniqueId) => {
    if (isChecking) return;
    
    const cardIndex = cards.findIndex(c => c.uniqueId === uniqueId);
    if (cardIndex === -1) return;
    
    const card = cards[cardIndex];
    if (card.isFlipped || card.isMatched) return;
    
    // 翻开卡牌
    const newCards = [...cards];
    newCards[cardIndex] = { ...card, isFlipped: true };
    setCards(newCards);
    
    const newSelected = [...selectedCards, { uniqueId, cardIndex }];
    setSelectedCards(newSelected);
    
    // 如果选中了2张卡，检查是否匹配
    if (newSelected.length === 2) {
      setIsChecking(true);
      
      const [first, second] = newSelected;
      const firstCard = newCards[first.cardIndex];
      const secondCard = newCards[second.cardIndex];
      
      setTimeout(() => {
        if (firstCard.id === secondCard.id) {
          // 匹配成功，消除卡牌
          const matchedCards = newCards.map((c, idx) => {
            if (idx === first.cardIndex || idx === second.cardIndex) {
              return { ...c, isMatched: true };
            }
            return c;
          });
          setCards(matchedCards);
        } else {
          // 匹配失败，翻回卡牌
          const flippedCards = newCards.map((c, idx) => {
            if (idx === first.cardIndex || idx === second.cardIndex) {
              return { ...c, isFlipped: false };
            }
            return c;
          });
          setCards(flippedCards);
        }
        
        setSelectedCards([]);
        setIsChecking(false);
      }, FLIP_DURATION + MATCH_DELAY);
    }
  }, [cards, selectedCards, isChecking]);

  // 游戏完成界面
  if (gameState === 'win') {
    return
  }

  return (
    <div className="relative w-full max-w-[400px] mx-auto bg-memory-dark/50 rounded-lg p-4 select-none">
      {/* 标题 */}
      <div className="flex justify-center mb-4">
        <h2 className="text-memory-glow text-lg">记忆配对</h2>
      </div>

      {/* 剩余卡牌数 */}
      <div className="text-center mb-4">
        <p className="text-memory-accent text-sm">
          剩余 {cards.filter(c => !c.isMatched).length} 张卡牌
        </p>
      </div>

      {/* 卡牌网格 */}
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => {
          const isFaceUp = card.isFlipped || card.isMatched;
          return (
            <motion.div
              key={card.uniqueId}
              className="aspect-[3/4] cursor-pointer"
              onClick={() => handleCardClick(card.uniqueId)}
              whileHover={!isFaceUp && !isChecking ? { scale: 1.05 } : {}}
              whileTap={!isFaceUp && !isChecking ? { scale: 0.95 } : {}}
              animate={{
                rotateY: isFaceUp ? 180 : 0,
              }}
              transition={{
                duration: FLIP_DURATION / 1000,
                ease: 'easeInOut'
              }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* 卡片背面（默认显示） */}
              <div
                className="absolute inset-0 rounded-lg border border-memory-accent/30 flex items-center justify-center"
                style={{ backfaceVisibility: 'hidden', background: 'linear-gradient(135deg, rgba(233, 213, 175, 0.3), rgba(175, 220, 233, 0.3))' }}
              >
                <span className="text-memory-glow/60 text-2xl">?</span>
              </div>
              
              {/* 卡片正面（翻转后显示） */}
              <div
                className={`absolute inset-0 rounded-lg border border-white/20 flex items-center justify-center bg-memory-dark/80 ${
                  card.isMatched ? 'opacity-50' : ''
                }`}
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <img src={card.image} alt="" className="w-full h-full object-cover rounded-lg" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MemoryGame;