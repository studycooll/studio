'use client';

import { useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  BookCopy,
  Plus,
  Trash2,
  ArrowRight,
  BookOpen,
  LayoutGrid,
} from 'lucide-react';

import type { FlashcardSet } from '@/lib/types';
import useLocalStorage from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
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
import Header from '@/components/header';

const newSetSchema = z.object({
  name: z.string().min(1, 'Set name is required.'),
});

export default function Home() {
  const [sets, setSets] = useLocalStorage<FlashcardSet[]>('flashlearn-sets', []);
  const [showInput, setShowInput] = useState(false);

  const form = useForm<z.infer<typeof newSetSchema>>({
    resolver: zodResolver(newSetSchema),
    defaultValues: {
      name: '',
    },
  });

  function handleAddSet(values: z.infer<typeof newSetSchema>) {
    const newSet: FlashcardSet = {
      id: crypto.randomUUID(),
      name: values.name,
      cards: [],
    };
    setSets([...sets, newSet]);
    form.reset();
    setShowInput(false);
  }

  function handleDeleteSet(setId: string) {
    setSets(sets.filter((set) => set.id !== setId));
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="py-12 md:py-20 text-center">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight text-foreground">
              Welcome to FlashLearn
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Your personal study companion. Create, organize, and master your
              subjects with interactive flashcards.
            </p>
          </div>
        </section>

        <section className="container pb-12 md:pb-24">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold font-headline flex items-center gap-2">
              <LayoutGrid className="w-8 h-8 text-primary" />
              My Flashcard Sets
            </h2>
            {!showInput && (
              <Button onClick={() => setShowInput(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create New Set
              </Button>
            )}
          </div>

          {showInput && (
            <Card className="mb-8 bg-card/80">
              <CardContent className="p-4">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleAddSet)}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <Input
                              placeholder="e.g. Science, Math, History..."
                              {...field}
                              className="text-base"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2 self-end sm:self-center">
                      <Button type="submit">
                        <Plus className="mr-2 h-4 w-4" /> Add Set
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowInput(false);
                          form.reset();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {sets.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-xl font-semibold">No sets yet</h3>
              <p className="mt-1 text-muted-foreground">
                Create a set to start adding flashcards.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sets.map((set) => (
                <Card
                  key={set.id}
                  className="flex flex-col hover:shadow-lg transition-shadow duration-300"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="p-2 bg-secondary rounded-md">
                        <BookCopy className="w-6 h-6 text-secondary-foreground" />
                      </span>
                      {set.name}
                    </CardTitle>
                    <CardDescription>
                      {set.cards.length} card
                      {set.cards.length !== 1 && 's'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow"></CardContent>
                  <CardFooter className="flex justify-between">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the "{set.name}" set and
                            all its cards. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSet(set.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button asChild variant="default">
                      <Link href={`/sets/${set.id}`}>
                        View Set <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
