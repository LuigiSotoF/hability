import { MAIN_ASSISTANT_PROMPT } from "@/lib/constants";
import { createServerDBProvider } from "@/lib/providers/db.provider";
import { getIAProvider } from "@/lib/providers/ia.provider";

export const addDeepResearchResultAction = async (input: {
    conversationId: string;
    content: string;
    houseId: string;
}): Promise<void> => {
    const provider = await createServerDBProvider();
    const iaProvider = getIAProvider();

    const responsesResult = await iaProvider.responses.create({
        model: "gpt-5",
        conversation: input.conversationId,
        store: true,
        instructions: MAIN_ASSISTANT_PROMPT,
        input: [
            {
                role: 'system',
                content: [{
                    type: 'input_text',
                    text: `
                        Te envio el "CONSOLIDADO DE INFORMACION DE RIESGO", responde de acuerdo a los criterios definidos anteriormente 

                        "CONSOLIDADO DE INFORMACION DE RIESGO"
                        ${input.content}

                         IMPORTANTE: Si detectas en esta etapa que ya todos los pasos fueron ejecutados, inclusive los pasos de la 
                        investigacion entonces procede directamente con la oferta (OFFERT) , responde en tu mensaje con esta sin pausas
                    `,
                }]
            }
        ],
    });

    const data = JSON.parse(responsesResult.output_text);

    await provider.from('house').update({
        security_score: data.data.securityScore ?? '',
        security_justification: data.data.securityJustification ?? '',

        investment_score: data.data.investmentScore ?? '',
        investment_score_justification: data.data.investmentScoreJustification ?? '',

        around_price_estimated: data.data.aroundPriceEstimated ?? '',
        around_price_estimated_justification: data.data.aroundPriceEstimatedJustification ?? '',

        mts_estimated: data.data.mtsEstimated ?? '',
        mts_estimated_justification: data.data.mtsEstimatedJustification ?? ''
    }).eq('id', input.houseId).single();

};
