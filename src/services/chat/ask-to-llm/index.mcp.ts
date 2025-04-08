import { env } from "@/config/env";
import { OpenAI } from "openai";
import { EventEmitter } from "stream";

export class AskToLLM {
  client: OpenAI;
  thread: OpenAI.Beta.Threads.Thread | null = null;
  assistant: OpenAI.Beta.Assistants.Assistant | null = null;

  constructor() {
    this.client = new OpenAI({ apiKey: env.OPENAI_KEY });
  }

  private async createThread() {
    const thread = await this.client.beta.threads.create({});

    this.thread = thread;
  }

  private async createAssistant() {
    const assistant = await this.client.beta.assistants.create({
      name: "Math Tutor",
      instructions:
        "You are a personal math tutor. Write and run code to answer math questions.",
      tools: [
        { type: "code_interpreter" },
        // {
        //   type: "function",
        //   function: {
        //     name: "add",
        //     description: "Add two numbers.",
        //     parameters: {
        //       type: "object",
        //       properties: {
        //         num1: {
        //           type: "number",
        //           description: "The first number to add.",
        //         },
        //         num2: {
        //           type: "number",
        //           description: "The second number to add.",
        //         },
        //       },
        //       required: ["num1", "num2"],
        //     },
        //   },
        // },
      ],
      model: "gpt-4o-mini",
    });

    this.assistant = assistant;
  }

  private async addMessage(message: {
    role: "user" | "assistant";
    content: string;
  }) {
    if (!this.thread) return;

    await this.client.beta.threads.messages.create(this.thread.id, message);
  }

  private async createStream() {
    if (!this.thread || !this.assistant?.id) return;

    const run = this.client.beta.threads.runs
      .stream(this.thread.id, {
        assistant_id: this.assistant.id,
      })
      .on("textCreated", (text) => process.stdout.write("\nassistant > "))
      .on("textDelta", (textDelta: any, snapshot) =>
        process.stdout.write(textDelta.value)
      )
      .on("toolCallCreated", (toolCall) =>
        process.stdout.write(`\nassistant > ${toolCall.type}\n\n`)
      )
      .on("toolCallDelta", (toolCallDelta: any, snapshot) => {
        if (toolCallDelta.type === "code_interpreter") {
          if (toolCallDelta.code_interpreter.input) {
            process.stdout.write(toolCallDelta.code_interpreter.input);
          }
          if (toolCallDelta.code_interpreter.outputs) {
            process.stdout.write("\noutput >\n");
            toolCallDelta.code_interpreter.outputs.forEach((output: any) => {
              if (output.type === "logs") {
                process.stdout.write(`\n${output.logs}\n`);
              }
            });
          }
        }
      });

    // for await (const event of run) {
    //   console.log(event.data as any);
    // }
  }

  async makeQuestion(question: string) {
    await this.createThread();
    await this.createAssistant();

    await this.addMessage({ role: "user", content: question });
    await this.createStream();
    console.log(this.thread);
  }
}

const askToLLM = new AskToLLM();

askToLLM.makeQuestion("2 + 21");

const tools: any = {
  add: (num1: number, num2: number) => {
    return `Esse é o resultado da soma da minha função customizada: ${
      num1 + num2
    }`;
  },
};

// class EventHandler extends EventEmitter {
//   constructor(client) {
//     super();
//     this.client = client;
//   }

//   async onEvent(event) {
//     try {
//       console.log(event);
//       // Retrieve events that are denoted with 'requires_action'
//       // since these will have our tool_calls
//       if (event.event === "thread.run.requires_action") {
//         await this.handleRequiresAction(
//           event.data,
//           event.data.id,
//           event.data.thread_id
//         );
//       }
//     } catch (error) {
//       console.error("Error handling event:", error);
//     }
//   }

//   async handleRequiresAction(data, runId, threadId) {
//     try {
//       const toolOutputs =
//         data.required_action.submit_tool_outputs.tool_calls.map((toolCall) => {
//           if (toolCall.function.name === "getCurrentTemperature") {
//             return {
//               tool_call_id: toolCall.id,
//               output: "57",
//             };
//           } else if (toolCall.function.name === "getRainProbability") {
//             return {
//               tool_call_id: toolCall.id,
//               output: "0.06",
//             };
//           }
//         });
//       // Submit all the tool outputs at the same time
//       await this.submitToolOutputs(toolOutputs, runId, threadId);
//     } catch (error) {
//       console.error("Error processing required action:", error);
//     }
//   }

//   async submitToolOutputs(toolOutputs, runId, threadId) {
//     try {
//       // Use the submitToolOutputsStream helper
//       const stream = this.client.beta.threads.runs.submitToolOutputsStream(
//         threadId,
//         runId,
//         { tool_outputs: toolOutputs }
//       );
//       for await (const event of stream) {
//         this.emit("event", event);
//       }
//     } catch (error) {
//       console.error("Error submitting tool outputs:", error);
//     }
//   }
// }

// const stream = await client.beta.threads.runs.stream(
//   threadId,
//   { assistant_id: assistantId },
//   eventHandler
// );
