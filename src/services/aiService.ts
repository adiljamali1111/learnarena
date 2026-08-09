import { DashboardData, APIProvider } from '../types';
import { generateDashboard as generateDashboardOpenRouter, generateDuelQuestions as generateDuelQuestionsOpenRouter, generateChatResponse as generateChatResponseOpenRouter } from './openRouterService';
import { generateDashboard as generateDashboardGoogle, generateDuelQuestions as generateDuelQuestionsGoogle, generateChatResponse as generateChatResponseGoogle } from './googleAIService';

export async function generateDashboard(
  provider: APIProvider,
  apiKey: string,
  textContent: string,
  images: string[] = []
): Promise<DashboardData> {
  if (provider === 'google') {
    return generateDashboardGoogle(apiKey, textContent, images);
  }
  return generateDashboardOpenRouter(apiKey, textContent, images);
}

export async function generateDuelQuestions(
  provider: APIProvider,
  apiKey: string,
  moduleTitle: string,
  synthesisSummary: string,
  coreConcepts: string,
  seenQuestions: string[],
  totalQuestions: number = 10
): Promise<Array<{ question: string; options: string[]; correctIndex: number; explanation: string }>> {
  if (provider === 'google') {
    return generateDuelQuestionsGoogle(apiKey, moduleTitle, synthesisSummary, coreConcepts, seenQuestions, totalQuestions);
  }
  return generateDuelQuestionsOpenRouter(apiKey, moduleTitle, synthesisSummary, coreConcepts, seenQuestions, totalQuestions);
}

export async function generateChatResponse(
  provider: APIProvider,
  apiKey: string,
  moduleTitle: string,
  synthesisSummary: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  if (provider === 'google') {
    return generateChatResponseGoogle(apiKey, moduleTitle, synthesisSummary, messages);
  }
  return generateChatResponseOpenRouter(apiKey, moduleTitle, synthesisSummary, messages);
}
