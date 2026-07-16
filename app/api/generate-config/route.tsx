import { db } from "@/config/db";
import { openrouter } from "@/config/openroute";
import { ProjectTable, ScreenConfigTable } from "@/config/schema";
import { APP_LAYOUT_CONFIG_PROMPT } from "@/data/Prompt";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   const { userInput, deviceType, projectId } = await req.json();

//   // const response = await openrouter.chat.send({
//   //   model: "openai/gpt-5.1-codex-mini",
//   //   messages: [
//   //     {
//   //       role: "user",
//   //       content: [
//   //         {
//   //           type: "text",
//   //           text: "What is in this image?",
//   //         },
//   //       ],
//   //     },
//   //   ],
//   // });

//   const aiResult = await openrouter.chat.send({
//     chatRequest: {
//       model: "openai/gpt-oss-20b:free",
//       messages: [
//         {
//           role: "system",
//           content: [
//             {
//               type: "text",
//               text: APP_LAYOUT_CONFIG_PROMPT.replace(
//                 "{deviceType}",
//                 deviceType,
//               ),
//             },
//           ],
//         },
//         {
//           role: "user",
//           content: [
//             {
//               type: "text",
//               text: userInput,
//             },
//           ],
//         },
//       ],
//       stream: false,
//     },
//   });

//   //   const JSONAiResult = JSON.parse(
//   //     aiResult?.choices[0]?.message?.content as string,
//   //   );
//   //   console.log(aiResult);

//   //   return NextResponse.json(JSONAiResult);

//   //   const content = aiResult.choices[0].message?.content as string;

//   //   console.log(content);

//   //   return NextResponse.json(content);

//   let parsed;

//   for (let i = 0; i < 2; i++) {
//     const content = aiResult.choices[0].message?.content as string;

//     try {
//       parsed = JSON.parse(
//         content
//           .replace(/```json/g, "")
//           .replace(/```/g, "")
//           .trim(),
//       );
//       break;
//     } catch {
//       // Ask the model again with:
//       // "Your previous response was invalid JSON.
//       // Return ONLY valid JSON."
//     }
//   }
// }

export async function POST(req: NextRequest) {
  try {
    const { userInput, deviceType, projectId } = await req.json();

    const aiResult = await openrouter.chat.send({
      chatRequest: {
        model: "openai/gpt-oss-20b:free",
        messages: [
          {
            role: "system",
            content: [
              {
                type: "text",
                text: APP_LAYOUT_CONFIG_PROMPT.replace(
                  "{deviceType}",
                  deviceType,
                ),
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: userInput,
              },
            ],
          },
        ],
        stream: false,
      },
    });

    const content = aiResult.choices[0].message?.content as string;

    console.log("========== AI OUTPUT ==========");
    console.log(content);
    console.log("===============================");

    const JSONAiResult = JSON.parse(content);

    if (JSONAiResult) {
      //Update Project table with Project Name
      await db
        .update(ProjectTable)
        .set({
          projectVisualDescription: JSONAiResult?.projectVisualDescription,
          projectName: JSONAiResult?.projectName,
          theme: JSONAiResult?.theme,
        })
        .where(eq(ProjectTable.projectId, projectId as string));

      //Insert Screen Configurations
      JSONAiResult.screens?.forEach(async (screen: any) => {
        const result = await db.insert(ScreenConfigTable).values({
          projectId: projectId,
          purpose: screen?.purpose,
          screenDescription: screen?.layoutDescription,
          screenId: screen?.id,
          screenName: screen?.name,
        });
      });
      return NextResponse.json(JSONAiResult);
    } else {
      NextResponse.json({ msg: "Internal Server Error" });
    }
  } catch (err) {
    console.error("SERVER ERROR:");
    console.error(err);

    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Unknown Error",
      },
      { status: 500 },
    );
  }
}
