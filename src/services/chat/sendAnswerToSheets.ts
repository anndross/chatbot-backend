import axios from "axios";

export function sendAnswerToSheets(
  store: string,
  question: string,
  answer: string
) {
  axios.post(
    "https://script.google.com/macros/s/AKfycbyf4YdU6A0EP-hP44A9y-nEy4QyeTjsErKK8yP6KePlTlMJiIgA1fzHmfL3sNOfr4-C/exec",
    {
      store: store,
      question: question,
      answer: typeof answer === "string" && answer.replace(/(<([^>]+)>)/gi, ""),
    }
  );
}
