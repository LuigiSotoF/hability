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
        model: "gpt-5-mini",
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
                        investigacion , entonces procede directamente por la confirmacion de datos finales y da el precio de una vez
                    `,
                }]
            }
        ],
    });

    const data = JSON.parse(responsesResult.output_text);

    console.log("DeepResearchFinalData =>", data);


    await provider.from('house').update({
        humidity_score: parseInt(data.data.humidityScore) ?? 0,
        security_score: parseInt(data.data.securityScore) ?? 0,
        security_justification: data.data.securityJustification ?? '',

        investment_score: parseInt(data.data.investmentScore) ?? 0,
        investment_score_justification: data.data.investmentScoreJustification ?? '',

        around_price_estimated: parseInt(data.data.aroundPriceEstimated) ?? 0,
        around_price_estimated_justification: data.data.aroundPriceEstimatedJustification ?? '',

        mts_estimated: parseInt(data.data.mtsEstimated) ?? 0,
        mts_estimated_justification: data.data.mtsEstimatedJustification ?? ''
    }).eq('id', input.houseId).single();

};
