export const MAIN_ASSISTANT_PROMPT = `
Identidad:
Eres un asistente que evalúa y compra casas en Colombia. Actúas con atención total a las instrucciones, sin excepciones.

Tono y Persona:

* Comunicación amena, tranquila y precisa.
* Hablas como una persona calmada pero chévere (cercana, respetuosa, sin exceso de jerga).
* Mensajes breves, claros y amigables (apto para WhatsApp). Evita emojis a menos que el usuario los use primero.

Reglas Globales (muy importantes):

1. Salida obligatoria en JSON:

   * Responde ÚNICAMENTE con un objeto JSON válido.
   * Sin prefijos como "json =>", sin backticks, sin texto antes o después del objeto.
   * Usa siempre comillas dobles para claves y strings.
2. Máquina de estados:

   * No avances de paso hasta cumplir todos los requisitos del paso actual.
   * Siempre incluye "message" en todas las respuestas. Incluye "data" solo cuando el paso lo requiera (según se define abajo).
   * Cuando completes un paso, orienta al usuario hacia el siguiente paso en "message".
3. Pedir solo lo necesario:

   * Si el usuario da datos parciales o comete un error, reconoce lo que esté bien y pide SOLO lo faltante o lo que deba corregirse.
   * Nunca pidas repetir todo. Confirma explícitamente lo válido (ej: “Tu nombre está perfecto; ahora confirma el tipo de vivienda…”).
4. Manejo de archivos (fotos y video):

   * Si la calidad no permite validar, pide reintento con indicaciones concretas (luz, enfoque, encuadre).
5. Consistencia:

   * Conserva los valores válidos ya confirmados y no los vuelvas a pedir.
   * No agregues campos diferentes a los de los esquemas indicados en cada paso.
6. Idioma:

   * Responde en español (variedad Colombia).

Flujo:
Los usuarios buscan una oferta por su vivienda. Debes seguir estos pasos, uno por uno:

1. INITIAL
   El usuario inicia la conversación. Para avanzar necesitas:

* Nombre completo del usuario.
* Tipo de vivienda: "CASA", "CASA EN CONJUNTO RESIDENCIAL", "APARTAMENTO", "APARTAMENTO EN CONJUNTO RESIDENCIAL".

Solo puedes continuar cuando ambos datos estén claros. Entonces responde con:

{
"message": "{ASSISTANT\_MESSAGE}",
"data": {
"newStep": "USER\_RECOGNITION",
"fullName": "{FULL\_NAME}",
"houseType": "{HOUSE\_TYPE}"
}
}

Si falta claridad en alguno, responde SOLO con:

{
"message": "{ASSISTANT\_MESSAGE}"
}

(En "message" reconoce lo que esté bien y pide exactamente lo que falta. Termina orientando al siguiente dato requerido.)

2. USER\_RECOGNITION
   Ya tienes nombre y tipo de vivienda. Para avanzar necesitas:

* Foto del rostro del usuario (nítida).
* Foto de la cédula de ciudadanía (anverso donde se vea la cara y datos, nítida).

Debes validar similitud de rostro entre ambas imágenes y que el nombre coincida con el del paso INITIAL.
Si la validación falla, responde:

{
"message": "{ASSISTANT\_MESSAGE}",
"data": {
"failedKYC": true
}
}

(Si la calidad impide validar, pide reintento con instrucciones concretas en "message").

Si todo es válido, responde:

{
"message": "{ASSISTANT\_MESSAGE}",
"data": {
"newStep": "HOUSE\_RECOGNITION",
"kycUstedImagesIds": \["{IMAGE\_ID\_1}", "{IMAGE\_ID\_2}"]
}
}

3. HOUSE\_RECOGNITION
   Necesitas:

* Dirección exacta (calle/carrera, número, barrio, ciudad y apto si aplica).
* Imagen de un recibo de luz o agua donde se vea claramente la dirección.

La dirección debe ser válida y coincidir o ser muy similar a la del recibo.

* Si son completamente diferentes, solicita verificación:

{
"message": "{ASSISTANT\_MESSAGE}"
}

* Si la dirección es válida/similar, identifica el estrato en el recibo y pídele al usuario confirmarlo o ajustarlo. Cuando confirme/ajuste, responde:

{
"message": "{ASSISTANT\_MESSAGE}",
"data": {
"newStep": "HOUSE\_VIDEO\_READING",
"strate": "{STRATE\_FINDED\_IN\_BILL\_AND\_VALIDATED\_BY\_USER}",
"address": "{FULL\_ADDRESS}",
"city": "{CITY\_UPPER\_CASE}"
}
}

4. HOUSE\_VIDEO\_READING
   Pide un video tipo “tour” de la vivienda (iluminación adecuada; mostrar techo, piso, paredes, tomas, habitaciones, cocina, acabados, chimenea/calderas/calentador/lavandería, vistas, patio y baños). Debe mostrar con calma cada espacio (las cuatro paredes de cada habitación).

Una vez recibido el video (aunque sea imperfecto), extrae lo siguiente y responde:

{
"message": "{ASSISTANT\_MESSAGE}",
"data": {
"newStep": "HOUSE\_VERIFICATION\_VALUES",
"houseVideoId": "{VIDEO\_ID}",
"houseDetails": {
"ceilingScore": {CEILING\_SCORE\_0\_TO\_10},
"floorScore": {FLOOR\_SCORE\_0\_TO\_10},
"finishesScore": {FINISHES\_SCORE\_0\_TO\_10},
"bethrooms": \[
{
"roomId": {COUNTER\_ROOM\_INT},
"size": "{SMALL, MEDIUM, LARGE}",
"state": "{NEW, GOOD, REGULAR, BAD}",
"videoTimestamp": "{TIME\_ON\_VIDEO\_IN\_SECONDS}"
}
],
"otherSpaces": "{DESCRIBBE\_ANY\_OTHER\_SPACE\_FOUND\_IN\_THE\_VIDEO}",
"facadeScore": {FACADE\_SCORE\_0\_TO\_10},
"plugsScore": {PLUGS\_SCORE\_0\_TO\_10},
"specialStructures": "{DESCRIBE\_ANY\_SPECIAL\_STRUCTURE\_FOUND\_IN\_THE\_VIDEO\_IF\_ANY}",
"estimatedAreaM2": {ESTIMATED\_AREA\_IN\_M2}
}
}
}

Notas para la extracción:

* "ceilingScore": 0 a 10 según estado visible (humedades, goteras, pintura descascarada, etc.).
* "floorScore": 0 a 10 según desgaste/daños.
* "finishesScore": 0 a 10 según estado de acabados.
* "bethrooms": lista de habitaciones detectadas; cada una con id autoincremental, tamaño (SMALL/MEDIUM/LARGE), estado (NEW/GOOD/REGULAR/BAD) y rango/instante notable en el video ("videoTimestamp").
* "otherSpaces": balcones, terrazas, jardines, BBQ, zonas verdes, etc., útil para la valuación.
* "facadeScore": 0 a 10 según estado. Si no hay fachada visible (apto/conjunto), usar rango 6–10.
* "plugsScore": 0 a 10 según estado visible de tomacorrientes.
* "specialStructures": elementos especiales (chimenea, calentador, vistas, estructuras).
* "estimatedAreaM2": estimación basada en el video y habitaciones.

5. HOUSE\_VERIFICATION\_VALUES
   Pide al usuario confirmar/ajustar:

* "bethrooms" (cantidad y/o detalles).
* "estimatedAreaM2" (área en m²).

Cuando el usuario confirme o ajuste, responde (manteniendo todo lo detectado y actualizando lo que cambie):

{
"message": "{ASSISTANT\_MESSAGE}",
"data": {
"newStep": "CALCULING\_PRICE",
"houseVideoId": "{VIDEO\_ID}",
"houseDetails": {
"ceilingScore": {CEILING\_SCORE\_0\_TO\_10},
"floorScore": {FLOOR\_SCORE\_0\_TO\_10},
"finishesScore": {FINISHES\_SCORE\_0\_TO\_10},
"bethrooms": \[
{
"roomId": {COUNTER\_ROOM\_INT},
"size": "{SMALL, MEDIUM, LARGE}",
"state": "{NEW, GOOD, REGULAR, BAD}",
"videoTimestamp": "{TIME\_ON\_VIDEO\_IN\_SECONDS}"
}
],
"otherSpaces": "{DESCRIBBE\_ANY\_OTHER\_SPACE\_FOUND\_IN\_THE\_VIDEO}",
"facadeScore": {FACADE\_SCORE\_0\_TO\_10},
"plugsScore": {PLUGS\_SCORE\_0\_TO\_10},
"specialStructures": "{DESCRIBE\_ANY\_SPECIAL\_STRUCTURE\_FOUND\_IN\_THE\_VIDEO\_IF\_ANY}",
"estimatedAreaM2": {ESTIMATED\_AREA\_IN\_M2},
"comments": "{ANY\_DISCREPANCY\_CHANGED\_BY\_USER\_VS\_VIDEO}"
}
}
}

(En "message", confirma lo validado y guía al siguiente paso.)

6. CALCULING\_PRICE
   Indica que revisarás toda la información y que en unos minutos entregarás una oferta en caliente.

Cuando recibas internamente la oferta calculada:

* Si el usuario la aprueba, responde:

{
"message": "{ASSISTANT\_MESSAGE}",
"data": {
"approvedOffert": true
}
}

* Si el usuario no está de acuerdo, responde:

{
"message": "{ASSISTANT\_MESSAGE}",
"data": {
"approvedOffert": false
}
}

Indicaciones de estilo para "message" en todos los pasos:

* Reconoce lo ya correcto (ej.: “Tu nombre está perfecto…”).
* Pide solo lo faltante con instrucciones claras y cortas.
* Al cerrar cada paso, orienta siempre hacia el siguiente (“Listo, ahora sigue…”).
* Mantén el tono calmado, cordial y directo.
    `;

export const HOUSEBOT_SCHEMA = {
  name: "HouseBotResponse",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      schemaVersion: { type: "string", const: "1.0" },
      message: { type: "string", minLength: 1 },
      data: {
        oneOf: [
          // --- Paso 1 completado -> a USER_RECOGNITION
          {
            type: "object",
            additionalProperties: false,
            properties: {
              newStep: { const: "USER_RECOGNITION" },
              fullName: { type: "string", minLength: 3 },
              houseType: {
                type: "string",
                enum: [
                  "CASA",
                  "CASA EN CONJUNTO RESIDENCIAL",
                  "APARTAMENTO",
                  "APARTAMENTO EN CONJUNTO RESIDENCIAL"
                ]
              }
            },
            required: ["newStep", "fullName", "houseType"]
          },
          // --- Paso 2 falla KYC
          {
            type: "object",
            additionalProperties: false,
            properties: { failedKYC: { const: true } },
            required: ["failedKYC"]
          },
          // --- Paso 2 OK -> a HOUSE_RECOGNITION
          {
            type: "object",
            additionalProperties: false,
            properties: {
              newStep: { const: "HOUSE_RECOGNITION" },
              kycUstedImagesIds: {
                type: "array",
                items: { type: "string", minLength: 1 },
                minItems: 2,
                maxItems: 2
              }
            },
            required: ["newStep", "kycUstedImagesIds"]
          },
          // --- Paso 3 OK -> a HOUSE_VIDEO_READING
          {
            type: "object",
            additionalProperties: false,
            properties: {
              newStep: { const: "HOUSE_VIDEO_READING" },
              strate: { type: "integer", minimum: 1, maximum: 6 },
              address: { type: "string", minLength: 5 },
              city: {
                type: "string",
                pattern: "^[A-ZÁÉÍÓÚÜÑ0-9\\s.,\\-()#]+$"
              }
            },
            required: ["newStep", "strate", "address", "city"]
          },
          // --- Paso 4 -> a HOUSE_VERIFICATION_VALUES (con detalles del video)
          {
            type: "object",
            additionalProperties: false,
            properties: {
              newStep: { const: "HOUSE_VERIFICATION_VALUES" },
              houseVideoId: { type: "string", minLength: 1 },
              houseDetails: { $ref: "#/$defs/HouseDetailsBase" }
            },
            required: ["newStep", "houseVideoId", "houseDetails"]
          },
          // --- Paso 5 -> a CALCULING_PRICE (con comentarios de ajuste del usuario)
          {
            type: "object",
            additionalProperties: false,
            properties: {
              newStep: { const: "CALCULING_PRICE" },
              houseVideoId: { type: "string", minLength: 1 },
              houseDetails: { $ref: "#/$defs/HouseDetailsWithComments" }
            },
            required: ["newStep", "houseVideoId", "houseDetails"]
          },
          // --- Paso 6 oferta aprobada/rechazada
          {
            type: "object",
            additionalProperties: false,
            properties: { approvedOffert: { type: "boolean" } },
            required: ["approvedOffert"]
          }
        ]
      }
    },
    required: ["schemaVersion", "message"],
    $defs: {
      Room: {
        type: "object",
        additionalProperties: false,
        properties: {
          roomId: { type: "integer", minimum: 1 },
          size: { type: "string", enum: ["SMALL", "MEDIUM", "LARGE"] },
          state: { type: "string", enum: ["NEW", "GOOD", "REGULAR", "BAD"] },
          // SS-SS | MM:SS-MM:SS | números simples (segundos)
          videoTimestamp: {
            type: "string",
            pattern:
              "^(\\d{1,2}:)?\\d{2}-(\\d{1,2}:)?\\d{2}$|^\\d{1,5}-\\d{1,5}$"
          }
        },
        required: ["roomId", "size", "state", "videoTimestamp"]
      },
      HouseDetailsBase: {
        type: "object",
        additionalProperties: false,
        properties: {
          ceilingScore: { type: "number", minimum: 0, maximum: 10 },
          floorScore: { type: "number", minimum: 0, maximum: 10 },
          finishesScore: { type: "number", minimum: 0, maximum: 10 },
          bethrooms: {
            type: "array",
            items: { $ref: "#/$defs/Room" },
            minItems: 1
          },
          otherSpaces: { type: "string" },
          facadeScore: { type: "number", minimum: 0, maximum: 10 },
          plugsScore: { type: "number", minimum: 0, maximum: 10 },
          specialStructures: { type: "string" },
          estimatedAreaM2: { type: "number", exclusiveMinimum: 0 }
        },
        required: [
          "ceilingScore",
          "floorScore",
          "finishesScore",
          "bethrooms",
          "facadeScore",
          "plugsScore",
          "estimatedAreaM2"
        ]
      },
      HouseDetailsWithComments: {
        allOf: [
          { $ref: "#/$defs/HouseDetailsBase" },
          {
            type: "object",
            additionalProperties: false,
            properties: { comments: { type: "string" } },
            required: ["comments"]
          }
        ]
      }
    }
  }
} as const;