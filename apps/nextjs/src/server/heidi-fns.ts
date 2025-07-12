import { TRPCError } from "@trpc/server";

export const HEIDI_API_URL =
  "https://registrar.api.heidihealth.com/api/v2/ml-scribe/open-api/";

export const READ_ONLY_EMAIL = "test@heidihealth.com";
export const TRANSCRIPTION_EMAIL = "hackathon@heidihealth.com";

export const getAuthSession = async () => {
  try {
    /* 
          Fetch JWT token from Heidi API
          This endpoint is used to get a JWT token for third party integrations
          The token is used to authenticate requests to the Heidi API
          The token expires after a certain time period
        */
    const response = await fetch(
      `${HEIDI_API_URL}jwt?email=test@heidihealth.com&third_party_internal_id=123`,
      {
        method: "GET",
        headers: {
          "Heidi-Api-Key": "MI0QanRHLm4ovFkBVqcBrx3LCiWLT8eu",
        },
      },
    );

    if (!response.ok) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch JWT token",
      });
    }

    const data = (await response.json()) as {
      token: string;
      expiration_time: string;
    };

    return {
      token: data.token,
      expirationTime: new Date(data.expiration_time),
    };
  } catch (error) {
    console.error("Error fetching JWT token:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch JWT token",
    });
  }
};

export const authenticateAndReturnAuthAndSessionId = async (
  sessionId?: string,
) => {
  const authSession = await getAuthSession();

  /* 
    If sessionId is provided, skip session creation and return existing sessionId
    This allows reusing existing sessions without creating new ones
  */
  if (sessionId) {
    return {
      authSession,
      sessionId,
    };
  }

  const response = await fetch(`${HEIDI_API_URL}sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authSession.token}`,
    },
  });

  if (!response.ok) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to authenticate and return auth and session id",
    });
  }

  const data = (await response.json()) as {
    session_id: string;
  };

  return {
    authSession,
    sessionId: data.session_id,
  };
};

export const getHeidiSession = async (passedSessionId?: string) => {
  /* 
    This function combines getAuthSession and authenticateAndReturnAuthAndSessionId
    to fetch a complete Heidi session with patient and consultation details.
    All dates are handled in UTC to maintain timezone consistency.
  */
  const props = await authenticateAndReturnAuthAndSessionId(passedSessionId);

  const { authSession, sessionId } = props;

  const response = await fetch(`${HEIDI_API_URL}sessions/${sessionId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authSession.token}`,
    },
  });

  if (!response.ok) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch Heidi session details",
    });
  }

  const data = (await response.json()) as SessionResponse;

  return {
    ...data.session,
    created_at: new Date(data.session.created_at).toISOString(),
    updated_at: new Date(data.session.updated_at).toISOString(),
  };
};

export const getConsultNote = async (sessionId: string) => {
  const session = await getAuthSession();
  /**
GET /sessions/1234567890/consult-note HTTP/1.1
Authorization: Bearer <your_token>
Content-Type: application/json
{
    "generation_method":"TEMPLATE",
    "addition":"",
    "template_id":"659b8042fe093d6592b41ef7",
    "voice_style":"GOLDILOCKS",
    "brain":"LEFT"
}
   */

  const response = await fetch(
    `${HEIDI_API_URL}sessions/${sessionId}/consult-note`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    },
  );

  if (!response.ok) {
    console.log(response);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to fetch consult note: ${response.statusText}`,
    });
  }

  const data = (await response.json()) as {
    consult_note: {
      result: string;
    };
  };

  return data;
};

export type SessionResponse = {
  session: {
    session_id: string;
    session_name: string;
    patient: {
      name: string;
      gender: string | null;
      dob: string | null;
    };
    audio: unknown[];
    clinician_notes: unknown[];
    consult_note: {
      status: string;
      result: string;
      heading: string;
      brain: string;
      voice_style: string | null;
      generation_method: string;
      template_id: string | null;
      ai_command_id: string | null;
      ai_command_text: string | null;
      feedback: string | null;
      dictation_cleanup_mode: string | null;
    };
    duration: number;
    created_at: string;
    updated_at: string;
    language_code: string;
    output_language_code: string;
    documents: unknown | null;
    ehr_appt_id: string | null;
    ehr_provider: string;
    ehr_patient_id: string | null;
  };
};
