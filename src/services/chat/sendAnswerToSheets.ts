import axios from "axios";

export function sendAnswerToSheets(
  store: string,
  question: string,
  answer: string,
  slug: string
) {
  axios.post(
    "https://script.google.com/macros/s/AKfycbzgOsn0XtwLYPlyYmhmGiTiYaH94XWwAYbRDTd6N3JjecXOI40AwmFlcHhZ0o08DwwW/exec",
    {
      store: store,
      question: question,
      answer: typeof answer === "string" && answer.replace(/(<([^>]+)>)/gi, ""),
      slug,
    }
  );
}
