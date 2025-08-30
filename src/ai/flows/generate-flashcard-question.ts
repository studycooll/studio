'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating flashcard questions based on a given set name.
 *
 * The flow takes a set name as input and returns a suggested question related to that set.
 * It exports:
 * - `generateFlashcardQuestion`: The main function to trigger the flashcard question generation.
 * - `GenerateFlashcardQuestionInput`: The input type for the `generateFlashcardQuestion` function.
 * - `GenerateFlashcardQuestionOutput`: The output type for the `generateFlashcardQuestion` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the flow
const GenerateFlashcardQuestionInputSchema = z.object({
  setName: z.string().describe('The name of the flashcard set (e.g., Math, Science).'),
});
export type GenerateFlashcardQuestionInput = z.infer<typeof GenerateFlashcardQuestionInputSchema>;

// Define the output schema for the flow
const GenerateFlashcardQuestionOutputSchema = z.object({
  suggestedQuestion: z.string().describe('A suggested flashcard question related to the set name.'),
});
export type GenerateFlashcardQuestionOutput = z.infer<typeof GenerateFlashcardQuestionOutputSchema>;

// Define the main function that will be called to generate a flashcard question
export async function generateFlashcardQuestion(input: GenerateFlashcardQuestionInput): Promise<GenerateFlashcardQuestionOutput> {
  return generateFlashcardQuestionFlow(input);
}

// Define the prompt for generating the flashcard question
const generateFlashcardQuestionPrompt = ai.definePrompt({
  name: 'generateFlashcardQuestionPrompt',
  input: {schema: GenerateFlashcardQuestionInputSchema},
  output: {schema: GenerateFlashcardQuestionOutputSchema},
  prompt: `You are an AI assistant designed to help students study. Your task is to suggest a flashcard question based on the set they are studying.

  Set Name: {{{setName}}}

  Suggested Question:`,
});

// Define the Genkit flow
const generateFlashcardQuestionFlow = ai.defineFlow(
  {
    name: 'generateFlashcardQuestionFlow',
    inputSchema: GenerateFlashcardQuestionInputSchema,
    outputSchema: GenerateFlashcardQuestionOutputSchema,
  },
  async input => {
    const {output} = await generateFlashcardQuestionPrompt(input);
    return output!;
  }
);
