import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BillboardCharacter = ({ message }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const dialogTimeoutRef = useRef(null);
  const DIALOG_DURATION = 3000; // 3秒

  useEffect(() => {
    // 当收到新消息时，立即显示新对话，旧对话消失
    if (message) {
      // 清除之前的定时器
      if (dialogTimeoutRef.current) {
        clearTimeout(dialogTimeoutRef.current);
      }
      
      setCurrentMessage(message);
      setShowDialog(true);
      
      // 设置3秒后自动消失
      dialogTimeoutRef.current = setTimeout(() => {
        setShowDialog(false);
      }, DIALOG_DURATION);
    }
    
    return () => {
      if (dialogTimeoutRef.current) {
        clearTimeout(dialogTimeoutRef.current);
      }
    };
  }, [message]);

  return (
    <div className="relative w-full h-full">
      {/* 看板郎背景 */}
      <img
        src="/images/main/看板郎.png"
        alt="看板郎"
        className="absolute inset-0 w-full h-full object-contain"
      />
      
      {/* 对话框 - 使用AnimatePresence实现旧对话消失动画 */}
      <AnimatePresence mode="wait">
        {showDialog && currentMessage && (
          <motion.div
            key={currentMessage}
            className="absolute top-[60%] left-[5%] right-[5%]"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* 对话框背景 */}
            <div className="bg-memory-card/95 backdrop-blur-sm rounded-xl p-4 border border-memory-accent/30 shadow-lg">
              <div className="relative">
                {/* 对话框尖角 */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-memory-card/95" />
                
                {/* 对话内容 */}
                <p className="text-memory-glow text-sm text-center leading-relaxed">
                  {currentMessage}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BillboardCharacter;
