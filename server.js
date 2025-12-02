// require('dotenv').config();
// const fastify = require('fastify')({ logger: true });
// const cors = require('@fastify/cors');

// fastify.register(cors, {
//     origin: true 
// });

// // --- BANCO DE DADOS EM MEMÓRIA ---
// const lista_usuarios = []; // Armazena { username, password }
// const chatSessions = new Map(); // Armazena o histórico por usuário (username -> history[])

// // --- ENDPOINT: CADASTRO ---
// fastify.post('/api/register', async (request, reply) => {
//     const { username, password } = request.body;

//     if (!username || !password) {
//         return reply.status(400).send({ error: 'Username e senha são obrigatórios' });
//     }

//     // Verifica se já existe
//     const usuarioExistente = lista_usuarios.find(u => u.username === username);
//     if (usuarioExistente) {
//         return reply.status(409).send({ error: 'Usuário já existe' });
//     }

//     // Adiciona na lista (Push)
//     lista_usuarios.push({ username, password });
    
//     return { message: 'Usuário cadastrado com sucesso!' };
// });

// // --- ENDPOINT: LOGIN ---
// fastify.post('/api/login', async (request, reply) => {
//     const { username, password } = request.body;
//     let usuarioEncontrado = null;

//     // Loop para verificar usuário e senha (conforme solicitado)
//     for (let i = 0; i < lista_usuarios.length; i++) {
//         const u = lista_usuarios[i];
//         if (u.username === username && u.password === password) {
//             usuarioEncontrado = u;
//             break;
//         }
//     }

//     if (!usuarioEncontrado) {
//         return reply.status(401).send({ error: 'Usuário ou senha incorretos' });
//     }

//     // Retorna sucesso e o username para o front salvar
//     return { message: 'Login realizado', username: usuarioEncontrado.username };
// });

// // --- ENDPOINT: CHAT (PSICÓLOGO) ---
// fastify.post('/api/generate', async (request, reply) => {
//     const { prompt, username } = request.body;

//     if (!prompt) return reply.status(400).send({ error: 'Prompt é obrigatório' });
//     if (!username) return reply.status(401).send({ error: 'Usuário não identificado. Faça login.' });

//     // 1. Recupera ou cria histórico do usuário
//     let userHistory = chatSessions.get(username) || [];

//     // 2. Define a Persona
//     const contextoDoAgente = `
//         Você é um psicólogo empático, profissional e acolhedor.
//         Sua abordagem é baseada na Terapia Cognitivo-Comportamental (TCC).
        
//         Diretrizes:
//         1. Valide sempre os sentimentos do usuário primeiro.
//         2. Faça perguntas abertas para encorajar a reflexão.
//         3. Nunca dê diagnósticos médicos; sugira procurar ajuda profissional presencial se for grave.
//         4. Mantenha respostas concisas e reconfortantes.
//         5. Se o usuário falar de autolesão, forneça imediatamente contatos de emergência (como o CVV 188).
//     `;

//     // 3. Monta o payload para o Gemini (Histórico + Prompt Atual)
//     // Adiciona o prompt atual ao histórico temporário para envio
//     const contentsParaEnvio = [
//         ...userHistory,
//         { role: "user", parts: [{ text: prompt }] }
//     ];

//     const apiKey = process.env.GEMINI_API_KEY;
//     const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
//     const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

//     const dataEnvio = {
//         systemInstruction: {
//             parts: [{ text: contextoDoAgente }]
//         },
//         contents: contentsParaEnvio
//     };

//     try {
//         const response = await fetch(url, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(dataEnvio)
//         });

//         const result = await response.json();

//         if (!response.ok) {
//             fastify.log.error(result);
//             return reply.status(response.status).send({ error: result.error?.message || 'Erro na API do Google' });
//         }

//         const textoResposta = result.candidates[0].content.parts[0].text;

//         // 4. Atualiza a memória do servidor
//         // Salvamos a pergunta do usuário e a resposta do modelo
//         const novoHistorico = [
//             ...userHistory,
//             { role: "user", parts: [{ text: prompt }] },
//             { role: "model", parts: [{ text: textoResposta }] }
//         ];
//         chatSessions.set(username, novoHistorico);

//         return { response: textoResposta };

//     } catch (error) {
//         fastify.log.error(error);
//         return reply.status(500).send({ error: 'Erro interno no servidor' });
//     }
// });

// fastify.listen({ port: 3000 }, (err, address) => {
//     if (err) {
//         fastify.log.error(err);
//         process.exit(1);
//     }
//     console.log(`Servidor rodando em ${address}`);
// });

















// ISSO É SIMPLESAO

// require('dotenv').config();
// const fastify = require('fastify')({ logger: true });
// const cors = require('@fastify/cors');

// fastify.register(cors, {
//     origin: true 
// });

// fastify.post('/api/generate', async (request, reply) => {
//     const { prompt } = request.body;

//     if (!prompt) {
//         return reply.status(400).send({ error: 'Prompt é obrigatório' });
//     }

//     const apiKey = process.env.GEMINI_API_KEY;
//     const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    
//     const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

//     const contextoDoAgente = `
//         Você é um psicólogo empático, profissional e acolhedor.
//         Sua abordagem é baseada na Terapia Cognitivo-Comportamental (TCC).
        
//         Diretrizes:
//         1. Valide sempre os sentimentos do usuário primeiro.
//         2. Faça perguntas abertas para encorajar a reflexão.
//         3. Nunca dê diagnósticos médicos; sugira procurar ajuda profissional presencial se for grave.
//         4. Mantenha respostas concisas e reconfortantes.
//         5. Se o usuário falar de autolesão, forneça imediatamente contatos de emergência (como o CVV 188).
//     `;

//     const dataEnvio = {
//         systemInstruction: {
//             parts: [{ text: contextoDoAgente }]
//         },
//         contents: [
//             {
//                 parts: [{ text: prompt }]
//             }
//         ]
//     };

//     try {
//         const response = await fetch(url, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(dataEnvio)
//         });

//         const result = await response.json();

//         if (!response.ok) {
//             fastify.log.error(result);
//             return reply.status(response.status).send({ error: result.error?.message || 'Erro na API do Google' });
//         }

//         return {response: result.candidates[0].content.parts[0].text};

//     } catch (error) {
//         fastify.log.error(error);
//         return reply.status(500).send({ error: 'Erro interno no servidor' });
//     }
// });

// fastify.listen({ port: 3000 });










// AQUI É COM SAFEGAURD

require('dotenv').config();
const fastify = require('fastify')({ logger: false });
const cors = require('@fastify/cors');

fastify.register(cors, {
    origin: true
});

// --- Configurações e Prompts ---

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

// 1. Prompt do SAFEGUARD (Raciocinador)
const SAFEGUARD_INSTRUCTION = `
Você é um sistema de segurança e refinamento de prompts (Safeguard & Refiner).
Sua tarefa é analisar a entrada do usuário e agir como um filtro inteligente.

REGRAS DE ANÁLISE:
1. SEGURANÇA: Verifique se o conteúdo é ofensivo, perigoso, ilegal ou viola políticas éticas.
2. CLAREZA: Verifique se a pergunta faz sentido ou se é apenas ruído.
3. REFINAMENTO: Se o input for seguro, reescreva-o para ser detalhado e otimizado para uma IA Psicológica.

SAÍDA OBRIGATÓRIA (JSON):
Você deve retornar APENAS um objeto JSON neste formato:
{
  "ok": boolean,
  "message": "Mensagem de erro explicativa (se false) OU o prompt refinado (se true)"
}
`;

// 2. Prompt do AGENTE PRINCIPAL (Psicólogo)
const PSYCHOLOGIST_INSTRUCTION = `
Você é um psicólogo empático, profissional e acolhedor.
Sua abordagem é baseada na Terapia Cognitivo-Comportamental (TCC).

Diretrizes:
1. Valide sempre os sentimentos do usuário primeiro.
2. Faça perguntas abertas para encorajar a reflexão.
3. Nunca dê diagnósticos médicos.
4. Mantenha respostas concisas e reconfortantes.
5. Se o usuário falar de autolesão, forneça imediatamente contatos de emergência (como o CVV 188).
`;

// --- Função Auxiliar para chamar o Gemini ---
async function callGemini(systemPrompt, userPrompt, jsonMode = false) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
    
    const payload = {
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
        contents: [
            { parts: [{ text: userPrompt }] }
        ]
    };

    // Se for o Safeguard, forçamos a resposta em JSON
    if (jsonMode) {
        payload.generationConfig = {
            responseMimeType: "application/json"
        };
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error?.message || 'Erro na API do Google');
    }

    return result.candidates[0].content.parts[0].text;
}

// --- Rota Principal ---
fastify.post('/api/generate', async (request, reply) => {
    const { prompt } = request.body;

    if (!prompt) {
        return reply.status(400).send({ error: 'Prompt é obrigatório' });
    }

    try {
        // --- PASSO 1: SAFEGUARD ---
        // Chamamos a IA pedindo JSON (jsonMode = true)
        const safeguardRaw = await callGemini(SAFEGUARD_INSTRUCTION, prompt, true);
        console.log('AAAAAAAAAAAa',safeguardRaw);
        
        let safeguardResult;
        try {
            safeguardResult = JSON.parse(safeguardRaw);
        } catch (e) {
            // Caso a IA falhe em gerar JSON (raro com jsonMode, mas possível)
            fastify.log.error('Erro ao parsear JSON do Safeguard', safeguardRaw);
            return reply.status(500).send({ error: 'Falha na verificação de segurança.' });
        }

        // --- PASSO 2: LÓGICA DE DECISÃO ---
        
        // Se o Safeguard disse que NÃO é seguro ou válido:
        if (safeguardResult.ok === false) {
            fastify.log.warn(`Safeguard bloqueou: ${prompt}`);
            // Retornamos a mensagem explicativa do safeguard direto para o usuário
            return { response: safeguardResult.message };
        }

        // Se passou, usamos o prompt REFINADO (safeguardResult.message)
        // para chamar o Psicólogo.
        const refinedPrompt = safeguardResult.message;
        fastify.log.info(`Prompt Original: "${prompt}" -> Refinado: "${refinedPrompt}"`);

        const finalResponse = await callGemini(PSYCHOLOGIST_INSTRUCTION, refinedPrompt, false);

        return { response: finalResponse };

    } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: error.message || 'Erro interno no servidor' });
    }
});

fastify.listen({ port: 3000 }, (err) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    console.log('Servidor rodando na porta 3000 com Safeguard ativo!');
});