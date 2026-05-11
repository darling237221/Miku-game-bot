// ─── SERVICE QUIZ ──────────────────────────────────────────
// Gestion en mémoire des quiz en attente par utilisateur.

import { config } from '../config.js';
import { QUIZZES } from '../data/quizzes.js';
import { normalize } from '../utils/message.js';

// Map<phone, { q, answers, reward, expiresAt, timeout }>
const pending = new Map();

export function hasPending(phone) {
  return pending.has(phone);
}

export function getPending(phone) {
  return pending.get(phone);
}

export function cancelPending(phone) {
  const quiz = pending.get(phone);
  if (quiz) {
    clearTimeout(quiz.timeout);
    pending.delete(phone);
  }
}

export function startQuiz(phone, onTimeout) {
  cancelPending(phone);
  const base = QUIZZES[Math.floor(Math.random() * QUIZZES.length)];
  const timeout = setTimeout(() => {
    if (pending.has(phone)) {
      pending.delete(phone);
      onTimeout(base);
    }
  }, config.quizTimeoutMs);

  pending.set(phone, { ...base, timeout });
  return base;
}

// Vérifie une tentative de réponse. Si match → consomme le quiz et renvoie {correct: true, reward}.
export function tryAnswer(phone, text) {
  const quiz = pending.get(phone);
  if (!quiz) return null;
  const rep = normalize(text);
  const correct = quiz.answers.some((a) => rep.includes(normalize(a)));
  if (correct) {
    clearTimeout(quiz.timeout);
    pending.delete(phone);
    return { correct: true, reward: quiz.reward };
  }
  return { correct: false };
}

export function shouldTriggerSurprise() {
  return Math.random() < config.surpriseQuizChance;
}
