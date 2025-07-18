import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { tables } from '@/lib/db';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inquiry, conversation = [], chatId }: { 
      inquiry: string; 
      conversation?: ConversationMessage[];
      chatId?: string;
    } = body;

    if (!inquiry?.trim()) {
      return NextResponse.json(
        { error: 'Inquiry content is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { manuals: manualsDb, products: productsDb, scenarios: scenariosDb, precedents: precedentsDb, lineMessages } = tables(supabase);
    
    // 全ての基本データを取得
    const [manuals, products, scenarios, precedents] = await Promise.all([
      manualsDb.findByUserId(user.id),
      productsDb.findByUserId(user.id),
      scenariosDb.findByUserId(user.id),
      precedentsDb.findByUserId(user.id)
    ]);

    // チャットIDが提供されている場合、全ての会話履歴を取得
    let fullConversation: ConversationMessage[] = conversation;
    if (chatId) {
      try {
        const allMessages = await lineMessages.findByChatId(chatId);
        fullConversation = allMessages.map(msg => ({
          role: (msg.is_from_user ? 'user' : 'assistant') as 'user' | 'assistant',
          content: msg.message_text || '',
          timestamp: msg.timestamp || undefined
        })).reverse(); // 時系列順に並び替え
      } catch (error) {
        console.error('Error fetching conversation history:', error);
        // エラーの場合は提供された会話履歴を使用
      }
    }

    const conversationContext = fullConversation.length > 0 
      ? `\n\nFull Conversation History (chronological order):\n${fullConversation.map((msg, index) => 
          `${index + 1}. ${msg.role === 'user' ? 'Customer' : 'Support'}: ${msg.content}${msg.timestamp ? ` (${new Date(msg.timestamp).toLocaleString()})` : ''}`
        ).join('\n')}\n\nCurrent Customer Message: ${inquiry}`
      : `\n\nCurrent Customer Message: ${inquiry}`;

    const systemPrompt = `You are our Customer Support AI. Based on the following comprehensive information and rules, please propose multiple response scenarios for the customer's inquiry. Avoid hallucinations. Provide appropriate responses based on the given information and conversation context. Do not answer things that are not requested. This project assumes a copilot (AI collaboration) approach. You are an AI that helps support staff create final response messages.

Please refer to the following comprehensive information:

Manual Information (Strictly follow these rules - HIGHEST PRIORITY):
${manuals.map((m: { content: string }) => `STRICT RULE: ${m.content}`).join('\n\n')}

Product Information (Reference for accurate product details):
${products.map((p: { content: string }) => p.content).join('\n\n')}

Predefined Scenarios (Use these as templates when applicable):
${scenarios.map((s: { title: string; prompt: string }) => `[${s.title}]\n${s.prompt}`).join('\n\n')}

Precedent Information (Past successful responses for reference):
${precedents.map((p: { content: unknown }) => {
  if (typeof p.content === 'object' && p.content !== null) {
    const content = p.content as { inquiry?: string; response?: string };
    return `Previous Case - Question: ${content.inquiry || ''}\nSuccessful Answer: ${content.response || ''}`;
  }
  return String(p.content);
}).join('\n\n')}

${conversationContext}

Instructions:
1. Analyze the FULL conversation context and the customer's communication pattern
2. Utilize predefined scenarios when they match the situation and present them first
3. Provide 3 additional AI-suggested scenarios with different emotional tones (positive, neutral, negative/apologetic)
4. For each scenario, provide:
   - Specific reply message (reply) - tailored to the conversation context
   - Scenario type (scenarioType): predefined scenario title or "[AI Suggestion] descriptive title"
   - Explanation of why this scenario is appropriate given the conversation history (notes)
   - Emotional tone (sentiment): positive, negative, or neutral
5. STRICTLY follow manual rules - they override all other considerations
6. Keep responses practical, specific, and maintain professional customer service tone
7. Consider the customer's communication style and previous interactions
8. Reference specific details from the conversation history when relevant
9. Ensure continuity with previous support responses in this conversation

Please propose multiple scenarios that are contextually appropriate for this ongoing conversation.`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: inquiry },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "customer_support_response",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  scenarios: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        reply: {
                          type: "string",
                          description: "Specific reply message",
                        },
                        scenarioType: {
                          type: "string",
                          description: "Scenario type (predefined scenario title or AI suggestion)",
                        },
                        notes: {
                          type: "string",
                          description: "Reason for scenario selection or additional information",
                        },
                        sentiment: {
                          type: "string",
                          enum: ["positive", "negative", "neutral"],
                          description: "Emotional tone of the reply",
                        },
                      },
                      required: ["reply", "scenarioType", "notes", "sentiment"],
                    },
                  },
                },
                required: ["scenarios"],
                additionalProperties: false,
              },
            },
          },
        }),
      },
    );

    if (!response.ok) {
      console.error('OpenRouter API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to generate AI response' },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid response format from OpenRouter:', data);
      return NextResponse.json(
        { error: 'Invalid AI response format' },
        { status: 500 }
      );
    }

    const content = data.choices[0].message.content;
    const parsedContent = JSON.parse(content);

    return NextResponse.json(parsedContent);

  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'Server error occurred' },
      { status: 500 }
    );
  }
}