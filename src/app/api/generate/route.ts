export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

// URL do Ollama — por padrão roda em localhost:11434
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
// Modelo a usar — llama3.2 é leve e muito bom em português
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

export async function POST(req: Request) {
  try {
    const { situation, category } = await req.json();

    if (!situation || situation.trim().length < 5) {
      return NextResponse.json(
        { message: 'Por favor, descreva melhor a sua situação.' },
        { status: 400 }
      );
    }

    const systemPrompt = `Você é um especialista em criar desculpas criativas, convincentes e naturais em português brasileiro.
Crie desculpas que soem realistas e apropriadas ao contexto.
A desculpa deve ser uma única frase ou parágrafo curto (no máximo 2 frases).
NÃO use aspas, NÃO inclua prefácios como "Aqui está uma desculpa:" ou "Desculpa:".
Retorne APENAS a desculpa, sem nenhuma explicação adicional.
O tom deve ser adequado para o contexto (formal para trabalho, casual para amigos, etc.).`;

    const userPrompt = `Crie uma desculpa para a seguinte situação, no contexto de "${category}":

Situação: ${situation}

Lembre-se: retorne APENAS a desculpa, nada mais.`;

    const ollamaRes = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt },
        ],
        stream: false,
        options: {
          temperature: 0.85,
          num_predict: 150,
        },
      }),
      // timeout de 60s — modelos locais podem ser um pouco mais lentos
      signal: AbortSignal.timeout(60_000),
    });

    if (!ollamaRes.ok) {
      const text = await ollamaRes.text();
      console.error('Ollama error response:', text);

      if (ollamaRes.status === 404) {
        return NextResponse.json(
          { message: `Modelo "${OLLAMA_MODEL}" não encontrado. Execute: ollama pull ${OLLAMA_MODEL}` },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { message: 'Erro ao conectar com o Ollama. Verifique se ele está rodando.' },
        { status: 503 }
      );
    }

    const data = await ollamaRes.json();
    const excuse = data?.message?.content?.trim();

    if (!excuse) {
      return NextResponse.json(
        { message: 'Não foi possível gerar uma desculpa. Tente novamente.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ excuse }, { status: 200 });

  } catch (error: unknown) {
    console.error('Generate error:', error);

    const isConnectionError =
      error instanceof TypeError ||
      (error as { name?: string })?.name === 'TimeoutError' ||
      (error as { code?: string })?.code === 'ECONNREFUSED';

    if (isConnectionError) {
      return NextResponse.json(
        {
          message: 'Ollama não está rodando. Inicie com: ollama serve',
          help: 'Instale em https://ollama.ai e execute: ollama pull llama3.2',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: 'Erro inesperado ao gerar desculpa.' },
      { status: 500 }
    );
  }
}
