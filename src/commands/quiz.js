import { startQuiz } from '../services/quiz.js';
import * as M from '../ui/messages.js';

export async function quiz({ sock, jid, phone }) {
  const q = startQuiz(phone, async (timed) => {
    try {
      await sock.sendMessage(jid, { text: M.quizTimeout(timed.answers[0]) });
    } catch {
      /* socket fermé — ignore */
    }
  });
  return M.quizStart(q.q, q.reward);
}
