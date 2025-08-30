'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowLeft,
  Edit,
  FilePlus2,
  Lightbulb,
  Loader2,
  Play,
  Trash2,
} from 'lucide-react';

import type { Flashcard, FlashcardSet } from '@/lib/types';
import useLocalStorage from '@/hooks/use-local-storage';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { generateFlashcardQuestion } from '@/ai/flows/generate-flashcard-question';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const cardSchema = z.object({
  question: z.string().min(1, 'Question is required.'),
  answer: z.string().min(1, 'Answer is required.'),
});

type CardFormData = z.infer<typeof cardSchema>;

export default function SetPage() {
  const params = useParams();
  const setId = params.id as string;
  const { toast } = useToast();

  const [sets, setSets] = useLocalStorage<FlashcardSet[]>('flashlearn-sets', []);
  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editCard, setEditCard] = useState<Flashcard | null>(null);
  const [suggestDialogOpen, setSuggestDialogOpen] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);


  useEffect(() => {
    setIsMounted(true);
    const currentSet = sets.find((s) => s.id === setId);
    if (currentSet) {
      setSet(currentSet);
    }
  }, [setId, sets]);

  const form = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: { question: '', answer: '' },
  });

  useEffect(() => {
    if (editCard) {
      form.reset({ question: editCard.question, answer: editCard.answer });
    } else {
      form.reset({ question: '', answer: '' });
    }
  }, [editCard, form]);

  useEffect(() => {
    if(suggestion) {
      form.reset({ question: suggestion, answer: '' });
    }
  }, [suggestion, form]);

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

  const handleSaveCard = (data: CardFormData) => {
    const updatedSets = sets.map((s) => {
      if (s.id === setId) {
        const newCards = editCard
          ? s.cards.map((c) =>
              c.id === editCard.id ? { ...c, ...data } : c
            )
          : [...s.cards, { id: crypto.randomUUID(), ...data }];
        return { ...s, cards: newCards };
      }
      return s;
    });
    setSets(updatedSets);
    setEditCard(null);
    setAddDialogOpen(false);
    setSuggestDialogOpen(false);
    setSuggestion('');
    form.reset();
  };

  const handleDeleteCard = (cardId: string) => {
    const updatedSets = sets.map((s) => {
      if (s.id === setId) {
        return { ...s, cards: s.cards.filter((c) => c.id !== cardId) };
      }
      return s;
    });
    setSets(updatedSets);
  };
  
  const handleSuggestQuestion = async () => {
    setIsSuggesting(true);
    try {
        const result = await generateFlashcardQuestion({ setName: set.name });
        if (result?.suggestedQuestion) {
            setSuggestion(result.suggestedQuestion);
            setSuggestDialogOpen(true);
        }
    } catch (error) {
        console.error("Failed to generate question:", error);
        toast({
            title: "Suggestion Failed",
            description: "Could not generate a question. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsSuggesting(false);
    }
  };


  return (
    <>
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sets
            </Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center mb-8">
          <h1 className="text-4xl font-bold font-headline">{set.name}</h1>
          <div className="flex gap-2 flex-wrap">
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button><FilePlus2 className="mr-2 h-4 w-4"/>Add Card</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a New Card</DialogTitle>
                </DialogHeader>
                <CardForm form={form} onSubmit={handleSaveCard} />
              </DialogContent>
            </Dialog>

            <Button onClick={handleSuggestQuestion} disabled={isSuggesting}>
                {isSuggesting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Lightbulb className="mr-2 h-4 w-4" />
                )}
                Suggest a question
            </Button>

            <Dialog open={suggestDialogOpen} onOpenChange={(open) => {
                if (!open) setSuggestion('');
                setSuggestDialogOpen(open);
            }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>AI Suggested Card</DialogTitle>
                  <DialogDescription>Here's a question suggested by our AI. Add an answer to save it.</DialogDescription>
                </DialogHeader>
                <CardForm form={form} onSubmit={handleSaveCard} />
              </DialogContent>
            </Dialog>
            
            <Button asChild variant="secondary" disabled={set.cards.length === 0}>
              <Link href={`/sets/${setId}/study`}>
                <Play className="mr-2 h-4 w-4" /> Study this set
              </Link>
            </Button>
          </div>
        </div>

        {set.cards.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="mt-2 text-xl font-semibold">No cards in this set</h3>
            <p className="mt-1 text-muted-foreground">
              Add a card to start studying.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {set.cards.map((card) => (
              <Card key={card.id}>
                <CardContent className="p-4 flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-lg">{card.question}</p>
                    <Separator className="my-2"/>
                    <p className="text-muted-foreground">{card.answer}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => setEditCard(card)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Card</DialogTitle>
                        </DialogHeader>
                        <CardForm form={form} onSubmit={handleSaveCard} onDone={() => setEditCard(null)} />
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this card?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteCard(card.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

interface CardFormProps {
  form: any;
  onSubmit: (data: CardFormData) => void;
  onDone?: () => void;
}

function CardForm({ form, onSubmit, onDone }: CardFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g. What is the powerhouse of the cell?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="answer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Answer</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g. Mitochondria" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
            {onDone && <DialogClose asChild><Button type="button" variant="ghost" onClick={onDone}>Cancel</Button></DialogClose>}
            <Button type="submit">Save Card</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
