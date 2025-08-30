'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';

import type { FlashcardSet } from '@/lib/types';
import useLocalStorage from '@/hooks/use-local-storage';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from '@/components/ui/carousel';
import Flashcard from '@/components/flashcard';
import { Card, CardContent } from '@/components/ui/card';

export default function StudyPage() {
  const params = useParams();
  const setId = params.id as string;

  const [sets] = useLocalStorage<FlashcardSet[]>('flashlearn-sets', []);
  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    setIsMounted(true);
    const currentSet = sets.find((s) => s.id === setId);
    if (currentSet) {
      setSet(currentSet);
    }
  }, [setId, sets]);
  
  useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  if (!isMounted) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  if (!set) {
    notFound();
  }

  if (set.cards.length === 0) {
    return (
      <>
        <Header />
        <main className="container py-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Study: {set.name}</h1>
          <p>This set has no cards to study.</p>
          <Button asChild className="mt-4">
            <Link href={`/sets/${set.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Link>
          </Button>
        </main>
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 flex flex-col container py-8">
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" asChild>
            <Link href={`/sets/${set.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Set
            </Link>
          </Button>
          <h1 className="text-2xl font-bold font-headline text-center">
            {set.name}
          </h1>
          <div className="text-muted-foreground font-medium w-28 text-right">Card {current} of {count}</div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <Carousel setApi={setApi} className="w-full max-w-xl">
            <CarouselContent>
              {set.cards.map((card, index) => (
                <CarouselItem key={index}>
                    <Flashcard question={card.question} answer={card.answer} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </div>
      </main>
    </div>
  );
}
