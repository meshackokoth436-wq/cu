import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { sendSuccess } from '../../../utils/response';
import { BadRequestError } from '../../../utils/errors';
import rateLimit from 'express-rate-limit';
import { query } from '../../../config/database';

const router = Router();

/* ============================================================================
   PERSONA SYSTEM PROMPTS
   ============================================================================ */

const PERSONA_PROMPTS: Record<string, string> = {
  prayer_comfort: `You are the TUMCU Spiritual Care & Biblical Prayer Companion for the Technical University of Mombasa Christian Union (TUMCU / TECUMP).
Your role is to offer warm, scripture-saturated encouragement, biblical comfort, hope in Jesus Christ, and composed prayers for students and members going through spiritual, emotional, or personal trials. Ground every reflection in sound biblical theology, quoting relevant scripture references (e.g. Psalms, Isaiah, Romans, Philippians, Gospels). Always point the believer to God's unfailing grace, sovereign love, and the fellowship of the body of Christ at TUM.`,

  doctrinal_scholar: `You are the TUMCU Doctrinal & Hermeneutics Scholar for the Technical University of Mombasa Christian Union (TUMCU).
Your mission is to provide rigorous, accurate, and faith-building explanations of biblical texts, theological doctrines (e.g. Trinity, Justification by Faith, Authority of Scripture, Grace, Sanctification, Christian Ethics), Greek and Hebrew historical-grammatical insights, and apologetics. Ground your explanations in Evangelical Christian orthodox truth adhering to TUMCU's doctrinal basis. Be structured, clear, and intellectually thorough while honoring the supreme authority of God's Word.`,

  campus_mentor: `You are the TUMCU Campus & Academic Mentor for university students at Technical University of Mombasa (TUM).
You counsel and advise Christian undergraduate and diploma students on navigating university academics, engineering/computing/business CATs, final exams, time management, hostel living, purity, peer pressure, career calling, and balancing passionate ministry service in TUMCU with academic excellence. Speak with brotherly/sisterly wisdom, practical discipline, and Christ-centered encouragement.`,

  fast_navigator: `You are the TUMCU Fast Campus & Ministry Navigator.
You provide concise, accurate, instant answers regarding TUMCU Christian Union programs, Sunday service timings (Main Sanctuary 8:00 AM - 1:00 PM), Tuesday Fellowships (5:00 PM - 7:00 PM), Thursday Bible Study / BEST (5:00 PM - 6:30 PM), Friday Ministry Practices (4:30 PM - 7:00 PM), Monthly Kesha (Friday 9:00 PM - 5:00 AM), Ministry Leaders (Worship, Intercessory, Ushering, Media, Missions, Discipleship), Executive Board, Giving M-Pesa Paybill / Till guidelines, and venue locations across TUM Main Campus, Tudor, and student hostels. Keep responses concise, organized, and helpful with bullet points.`,
};


/* ============================================================================
   GEMINI CLIENT
   ============================================================================ */

/**
 * The backend is compiled as CommonJS while @google/genai is an ESM package.
 *
 * Therefore we use a dynamic import instead of:
 *
 *   import { GoogleGenAI } from '@google/genai';
 *
 * This prevents TS1479 during the TypeScript build.
 */

type GeminiModule = typeof import('@google/genai', {
  with: { 'resolution-mode': 'import' }
});

let geminiModulePromise: Promise<GeminiModule> | null = null;

async function getGeminiModule(): Promise<GeminiModule> {
  if (!geminiModulePromise) {
    geminiModulePromise = import('@google/genai');
  }

  return geminiModulePromise;
}


async function getGeminiClient(): Promise<{
  ai: InstanceType<GeminiModule['GoogleGenAI']>;
  ThinkingLevel: GeminiModule['ThinkingLevel'];
} | null> {

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const { GoogleGenAI, ThinkingLevel } =
    await getGeminiModule();

  const ai =
    new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

  return {
    ai,
    ThinkingLevel,
  };
}


/* ============================================================================
   RATE LIMITING
   ============================================================================ */

const geminiRateLimiter =
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
  });


/* ============================================================================
   CHAT ROUTE
   ============================================================================ */

router.post(
  '/chat',
  geminiRateLimiter,

  asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {

      const {
        prompt,
        persona = 'prayer_comfort',
        conversationHistory = [],
      } = req.body;


      /* ----------------------------------------------------------------------
         VALIDATION
         ---------------------------------------------------------------------- */

      if (
        !prompt ||
        typeof prompt !== 'string'
      ) {
        throw new BadRequestError(
          'Prompt text is required'
        );
      }


      if (prompt.length > 4000) {
        throw new BadRequestError(
          'Please keep your question under 4,000 characters.'
        );
      }


      if (
        ![
          'prayer_comfort',
          'doctrinal_scholar',
          'campus_mentor',
          'fast_navigator',
        ].includes(persona)
      ) {
        throw new BadRequestError(
          'Unknown AI persona.'
        );
      }


      /* ----------------------------------------------------------------------
         GEMINI CLIENT
         ---------------------------------------------------------------------- */

      const gemini =
        await getGeminiClient();


      /* ----------------------------------------------------------------------
         FALLBACK RESPONSE
         ---------------------------------------------------------------------- */

      if (!gemini) {

        const fallbackResponses: Record<string, string> = {

          prayer_comfort:
            `Praise the Lord! "The Lord is near to all who call on him, to all who call on him in truth." (Psalm 145:18).

Heavenly Father, we bring this brother/sister before Your throne of grace. Grant them peace that surpasses human understanding, strengthen their faith amidst every trial, and remind them that they are dearly loved. In Jesus' mighty name, Amen.

*(Note: For personalized dynamic responses, ensure GEMINI_API_KEY is configured in Settings > Secrets).*`,


          doctrinal_scholar:
            `Biblical Hermeneutics Insight:

Scripture interprets Scripture (Analogia Scripturae). When examining this theological question, we see God's consistent covenantal faithfulness from Genesis to Revelation. "All Scripture is God-breathed and useful for teaching, rebuking, correcting and training in righteousness" (2 Timothy 3:16).

*(Configuring GEMINI_API_KEY enables live deep-scholar queries).*`,


          campus_mentor:
            `Peace be with you, TUMCU comrade!

Balancing university academics at TUM with dedicated ministry is entirely possible through disciplined stewardship. "Whatever you do, work at it with all your heart, as working for the Lord" (Colossians 3:23). Create a structured study timetable, prioritize your quiet time with God, and lean on your fellowship accountability partners.

*(Configuring GEMINI_API_KEY enables live conversational mentoring).*`,


          fast_navigator:
            `TUMCU Quick Guide:
• Sunday Service: 8:00 AM - 1:00 PM (Main Auditorium)
• Tuesday Midweek Fellowship: 5:00 PM - 7:00 PM (LT B)
• Thursday Bible Study: 5:00 PM - 6:30 PM (Classrooms)
• Weekly Kesha: Every 3rd Friday (Sanctuary)
• Giving Paybill: 247247 | Acc: TUMCU-GIVING

*(Configuring GEMINI_API_KEY enables live interactive navigation).*`,
        };


        return sendSuccess(
          res,
          {
            response:
              fallbackResponses[persona] ||
              fallbackResponses.prayer_comfort,

            persona,

            timestamp:
              new Date().toISOString(),

            isFallback: true,
          },

          'Spiritual companion response generated'
        );
      }


      /* ----------------------------------------------------------------------
         SITE CONTEXT
         ---------------------------------------------------------------------- */

      const systemInstruction =
        PERSONA_PROMPTS[persona] ||
        PERSONA_PROMPTS.prayer_comfort;


      let siteContext = '';


      try {

        const [
          leaders,
          programmes,
          teams,
        ] = await Promise.all([

          query<any[]>(
            `
            SELECT
              COALESCE(
                NULLIF(lp.display_name, ''),
                u.full_name
              ) AS name,

              p.name AS position

            FROM leadership_assignments a

            INNER JOIN leadership_positions p
              ON p.id = a.position_id

            INNER JOIN users u
              ON u.id = a.user_id

            LEFT JOIN leadership_public_profiles lp
              ON lp.assignment_id = a.id

            WHERE
              a.status = 'active'
              AND u.account_status = 'active'
              AND (
                lp.is_visible IS NULL
                OR lp.is_visible = 1
              )

            ORDER BY
              COALESCE(
                lp.display_order,
                p.display_order
              )

            LIMIT 20
            `
          ).catch(() => []),


          query<any[]>(
            `
            SELECT
              day,
              title,
              time,
              venue,
              leader

            FROM weekly_programmes

            ORDER BY FIELD(
              LOWER(day),
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday',
              'sunday'
            )

            LIMIT 14
            `
          ).catch(() => []),


          query<any[]>(
            `
            SELECT
              name,
              description

            FROM evangelism_teams

            WHERE is_active = 1

            ORDER BY name
            `
          ).catch(() => []),
        ]);


        siteContext =
          `

CURRENT TUMCU SITE CONTEXT
(use only when relevant; do not invent missing facts):

Leaders:
${JSON.stringify(leaders)}

Upcoming programmes:
${JSON.stringify(programmes)}

E-Teams:
${JSON.stringify(teams)}
`;

      } catch {

        siteContext = '';

      }


      const finalSystemInstruction =
        systemInstruction +
        siteContext +
        `

If a user asks for current TUMCU information not present in this context, say that you do not have verified current information rather than guessing.

Do not claim to have access to private member records.`;


      /* ----------------------------------------------------------------------
         CONVERSATION CONTENT
         ---------------------------------------------------------------------- */

      try {

        const contents: Array<{
          role: 'user' | 'model';
          parts: Array<{
            text: string;
          }>;
        }> = [];


        if (
          Array.isArray(
            conversationHistory
          )
        ) {

          for (
            const item of conversationHistory.slice(-10)
          ) {

            if (
              item.sender === 'user' &&
              item.text
            ) {

              contents.push({
                role: 'user',

                parts: [
                  {
                    text: item.text,
                  },
                ],
              });

            } else if (
              item.sender === 'bot' &&
              item.text
            ) {

              contents.push({
                role: 'model',

                parts: [
                  {
                    text: item.text,
                  },
                ],
              });

            }
          }
        }


        contents.push({
          role: 'user',

          parts: [
            {
              text: prompt,
            },
          ],
        });


        /* --------------------------------------------------------------------
           GEMINI REQUEST
           -------------------------------------------------------------------- */

        const response =
          await gemini.ai.models.generateContent({

            model: 'gemini-3.8-flash',

            contents,

            config: {

              systemInstruction:
                finalSystemInstruction,

              thinkingConfig: {
                thinkingLevel:
                  gemini.ThinkingLevel.LOW,
              },
            },
          });


        const generatedText =
          response.text ||
          'May the Lord bless you and keep you; may His face shine upon you.';


        return sendSuccess(
          res,
          {
            response: generatedText,

            persona,

            timestamp:
              new Date().toISOString(),

            isFallback: false,
          },

          'Spiritual companion response generated'
        );

      } catch (err: any) {

        return sendSuccess(
          res,
          {
            response:
              `May God's peace be with you. "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight." (Proverbs 3:5-6). We pray for God's wisdom upon you today.`,

            persona,

            timestamp:
              new Date().toISOString(),

            isFallback: true,
          },

          'Spiritual companion response generated'
        );
      }
    }
  )
);


/* ============================================================================
   EXPORT
   ============================================================================ */

export default router;