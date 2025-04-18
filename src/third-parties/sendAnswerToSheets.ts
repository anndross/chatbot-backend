import axios from "axios";

export async function sendAnswerToSheets(
  store: string,
  question: string,
  answer: string,
  slug: string,
  deviceType: string,
  browserNameWithVersion: string,
  osNameWithVersion: string
) {
  const data = await axios.post(
    "https://script.google.com/macros/s/AKfycbwmCHP4VEW8Osa6krhLGKoSImC1oRJ_BWNTHuDDfcnvmvrEfLwFcatZNxxETyH5QZFQ/exec",
    {
      store: store,
      question: question,
      answer: typeof answer === "string" && answer.replace(/(<([^>]+)>)/gi, ""),
      slug,
      deviceType,
      browserNameWithVersion,
      osNameWithVersion,
    }
  );

  return { ok: data.status === 200 };
}
