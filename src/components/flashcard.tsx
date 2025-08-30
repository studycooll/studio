'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';

interface FlashcardProps {
  question: string;
  answer: string;
}

export default function Flashcard({ question, answer }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => setIsFlipped(!isFlipped);

  return (
    <div
      className="group h-96 w-full cursor-pointer [perspective:1000px]"
      onClick={handleFlip}
      role="button"
      tabIndex={0}
      aria-label="Flip card"
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          handleFlip();
        }
      }}
    >
      <div
        className={cn(
          'relative h-full w-full rounded-xl shadow-lg transition-transform duration-700 [transform-style:preserve-3d]',
          isFlipped && '[transform:rotateY(180deg)]'
        )}
      >
        {/* Front of card */}
        <div className="absolute flex h-full w-full flex-col justify-center items-center rounded-xl bg-card p-6 text-center [backface-visibility:hidden]">
          <p className="text-xs text-muted-foreground font-semibold">QUESTION</p>
          <p className="text-2xl font-bold mt-4">{question}</p>
          <div className="absolute bottom-4 right-4 flex items-center gap-2 text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            <RefreshCw className="h-4 w-4" />
            Click to flip
          </div>
        </div>
        {/* Back of card */}
        <div className="absolute flex h-full w-full flex-col justify-center items-center rounded-xl bg-accent p-6 text-center text-accent-foreground [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <p className="text-xs font-semibold">ANSWER</p>
          <p className="text-2xl font-bold mt-4">{answer}</p>
          <div className="absolute bottom-4 right-4 flex items-center gap-2 text-sm text-accent-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity">
            <RefreshCw className="h-4 w-4" />
            Click to flip
          </div>
        </div>
      </div>
    </div>
  );
}
